import { Actor } from 'apify';

await Actor.init();

const input = (await Actor.getInput()) as { orchestrateUrl?: string } | null;
const url = input?.orchestrateUrl ?? process.env.ORCHESTRATE_URL;

if (!url) {
    console.error('No orchestrateUrl provided in input or ORCHESTRATE_URL env var');
    await Actor.fail('Missing orchestrateUrl');
    await Actor.exit();
    throw new Error('unreachable');
}

console.log(`Pinging orchestrate endpoint: ${url.replace(/secret=[^&]+/, 'secret=***')}`);

try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Orchestrate result (${res.status}):`, JSON.stringify(data));

    if (!res.ok) {
        await Actor.fail(`Orchestrate failed: ${res.status}`);
    } else {
        const msg = `dispatched=${data.dispatched ?? 0} reconciled=${data.reconciled ?? 0} cascaded=${data.cascaded ?? 0} errors=${data.errors?.length ?? 0}`;
        console.log(msg);
        await Actor.exit({ statusMessage: msg });
    }
} catch (err) {
    console.error('Orchestrate fetch failed:', err);
    await Actor.fail(err instanceof Error ? err.message : String(err));
}

await Actor.exit();
