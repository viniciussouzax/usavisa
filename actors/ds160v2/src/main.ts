// CEAC DS-160 actor — entry point.
// Orchestrates: input parse → DoR gate → proxy setup → crawler with router → graceful shutdown.
// See spec/actors/ceac_ds160/ for full architectural rules.

// Load .env first (must be imported before anything else touches process.env)
import './lib/env.js';

import { PlaywrightCrawler } from '@crawlee/playwright';
import { Actor } from 'apify';

import { buildRouter } from './routes.js';
import { APPLY_URL } from './pages/01_apply/index.js';
import type { ActorInput, DS160Applicant } from './schema/types.js';
import { checkDefinitionOfReady } from './worker/dor.js';
import { claimTask, releaseTask } from './worker/claim.js';
import { installGracefulShutdown, onShutdown } from './worker/shutdown.js';
import { recordErrorLog, logInfo, logWarning } from './logging/logger.js';
import { EngineError } from './logging/errors.js';

await Actor.init();
installGracefulShutdown();

const input = ((await Actor.getInput()) ?? {}) as ActorInput & { startUrls?: unknown };

// Accept both the real DS160 payload and the stock template fields (the latter are ignored).
const applicant: DS160Applicant | undefined = input.applicant;
const dryRun = input.mode === 'dry_run';
const workerId = process.env.APIFY_ACTOR_RUN_ID ?? `local-${process.pid}`;

// Hoist runtime credentials delivered by the dispatcher (read from the DB's integracoes
// table on the Next.js side) into the actor's env before any page touches them.
if (input.credentials?.capmonsterApiKey && !process.env.CAPMONSTER_CLIENT_KEY) {
    process.env.CAPMONSTER_CLIENT_KEY = input.credentials.capmonsterApiKey;
    logInfo('credentials.capmonsterApiKey → CAPMONSTER_CLIENT_KEY (from dispatcher)');
}

// DoR — fail fast if mandatory fields are missing. No browser opened.
const dorFailures = checkDefinitionOfReady(applicant);
if (dorFailures.length > 0) {
    const err = new EngineError(
        `DoR failed: ${dorFailures.map((f) => `${f.field}(${f.reason})`).join(', ')}`,
        { cause: 'missing_data' },
    );
    await recordErrorLog(err, { workerId, applicantName: '—' });
    logWarning(`Exiting without browser — ${dorFailures.length} DoR failure(s)`);
    await Actor.fail(err.message);
    await Actor.exit();
    throw err; // unreachable, keeps the type system happy
}

const claim = await claimTask({ taskId: input.taskId, applicationId: input.applicationId });
logInfo(`Claimed task — workerId=${claim.workerId} taskId=${input.taskId ?? '—'} dryRun=${dryRun}`);

onShutdown(async () => {
    await releaseTask({ taskId: input.taskId, applicationId: input.applicationId }, 'todo', {
        reason: 'graceful_shutdown',
    });
});

// Proxy — RESIDENTIAL é o default (stealth, plano atual contempla).
// Overrides via env:
//   DS160_PROXY_DISABLE=true         → sem proxy (smoke tests locais)
//   DS160_PROXY_GROUPS=BUYPROXIES94952 → datacenter US (fallback mais barato)
const proxyDisabled = process.env.DS160_PROXY_DISABLE === 'true';
const proxyGroupsEnv = process.env.DS160_PROXY_GROUPS;
const proxyGroups = proxyGroupsEnv
    ? proxyGroupsEnv.split(',').map((g) => g.trim()).filter(Boolean)
    : ['RESIDENTIAL'];
const proxyConfiguration = proxyDisabled
    ? undefined
    : await Actor.createProxyConfiguration({
        groups: proxyGroups,
        countryCode: 'US',
    });
logInfo(
    proxyDisabled
        ? 'Proxy DISABLED (DS160_PROXY_DISABLE=true)'
        : `Proxy groups=${proxyGroups.join(',')}`,
);

const router = buildRouter({
    applicant: applicant!,
    dryRun,
    applicationId: input.applicationId,
    workerId,
});

const debugMode = process.env.DS160_DEBUG === 'true';
const slowMo = Number(process.env.DS160_SLOW_MO ?? (debugMode ? 150 : 0));
if (debugMode) {
    logInfo(`DEBUG mode ON — retries disabled, slow-motion ${slowMo}ms`);
}

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl: 60,
    maxRequestRetries: debugMode ? 0 : 3,
    requestHandlerTimeoutSecs: debugMode ? 1_800 : 600,
    navigationTimeoutSecs: 60,
    maxConcurrency: 1,
    requestHandler: router,
    launchContext: {
        launchOptions: {
            args: ['--disable-gpu'],
            ...(slowMo > 0 ? { slowMo } : {}),
        },
    },
});

try {
    await crawler.run([APPLY_URL]);
    await releaseTask({ taskId: input.taskId, applicationId: input.applicationId }, 'done');
    logInfo('DS-160 run finished');
} catch (err) {
    await recordErrorLog(err, { workerId, applicationId: input.applicationId });
    await releaseTask({ taskId: input.taskId, applicationId: input.applicationId }, 'error', {
        errorMessage: err instanceof Error ? err.message : String(err),
    });
    throw err;
} finally {
    await Actor.exit();
}
