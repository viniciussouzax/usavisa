// CapMonster client. HTTP-only (no SDK dependency — package.json stays untouched).
// Supports the 3 CAPTCHA types used by CEAC:
//   - ImageToText (BotDetect)         — default for landing/recovery/sign-and-submit
//   - ImageToText with preserveCase   — TSPD/Akamai challenge (case-sensitive)
//   - HCaptchaTaskProxyless            — auxiliary hCaptcha pages (120s timeout)

const BASE_URL = 'https://api.capmonster.cloud';
const CREATE_TASK_URL = `${BASE_URL}/createTask`;
const GET_RESULT_URL = `${BASE_URL}/getTaskResult`;
const DEFAULT_POLL_INTERVAL_MS = 2_000;

export type CapmonsterTaskType = 'ImageToTextTask' | 'HCaptchaTaskProxyless';

export interface SolveImageToTextOptions {
    body: string;           // base64
    preserveCase?: boolean; // true for TSPD, false (default) for BotDetect
    minLength?: number;
    maxLength?: number;
    timeoutMs?: number;
}

export interface SolveHCaptchaOptions {
    websiteURL: string;
    websiteKey: string;
    timeoutMs?: number;
}

export interface CapmonsterClient {
    solveBotDetectImage(opts: SolveImageToTextOptions): Promise<string>;
    solveTSPDImage(opts: SolveImageToTextOptions): Promise<string>;
    solveHCaptcha(opts: SolveHCaptchaOptions): Promise<string>;
}

export function createCapmonster(clientKey?: string): CapmonsterClient {
    const key = clientKey ?? process.env.CAPMONSTER_CLIENT_KEY;
    if (!key) throw new Error('CAPMONSTER_CLIENT_KEY is not set');

    return {
        async solveBotDetectImage(opts) {
            const raw = await imageToText(key, {
                ...opts,
                preserveCase: false,
                minLength: opts.minLength ?? 1,
                maxLength: opts.maxLength ?? 16,
            });
            return normalizeBotDetect(raw, opts.minLength ?? 1, opts.maxLength ?? 16);
        },

        async solveTSPDImage(opts) {
            return imageToText(key, {
                ...opts,
                preserveCase: true,
                minLength: opts.minLength ?? 4,
                maxLength: opts.maxLength ?? 8,
            });
        },

        async solveHCaptcha(opts) {
            const taskId = await createTask(key, {
                type: 'HCaptchaTaskProxyless',
                websiteURL: opts.websiteURL,
                websiteKey: opts.websiteKey,
            });
            const result = await pollResult<{ gRecaptchaResponse: string }>(
                key,
                taskId,
                opts.timeoutMs ?? 120_000,
            );
            return result.gRecaptchaResponse;
        },
    };
}

async function imageToText(key: string, opts: SolveImageToTextOptions & { preserveCase: boolean }): Promise<string> {
    const body: Record<string, unknown> = {
        type: 'ImageToTextTask' as CapmonsterTaskType,
        body: opts.body,
    };
    if (opts.preserveCase) body.preserveCase = true;
    if (opts.minLength) body.minLength = opts.minLength;
    if (opts.maxLength) body.maxLength = opts.maxLength;

    const taskId = await createTask(key, body);
    const result = await pollResult<{ text: string }>(key, taskId, opts.timeoutMs ?? 60_000);
    return result.text;
}

async function createTask(key: string, task: Record<string, unknown>): Promise<number> {
    // Transient errors — the CapMonster endpoint occasionally serves an HTML
    // Cloudflare/rate-limit page instead of JSON. Retry a few times before giving up.
    const MAX_TRIES = 4;
    let lastErr: unknown;
    for (let i = 1; i <= MAX_TRIES; i += 1) {
        try {
            const res = await fetch(CREATE_TASK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ clientKey: key, task }),
            });
            const text = await res.text();
            const trimmed = text.trim();
            if (!trimmed.startsWith('{')) {
                throw new Error(
                    `CapMonster createTask: non-JSON response (status ${res.status}): ${trimmed.slice(0, 120)}`,
                );
            }
            const json = JSON.parse(trimmed) as {
                errorId: number;
                taskId?: number;
                errorCode?: string;
                errorDescription?: string;
            };
            if (json.errorId !== 0 || typeof json.taskId !== 'number') {
                throw new Error(
                    `CapMonster createTask failed: ${json.errorCode ?? 'unknown'} — ${json.errorDescription ?? ''}`,
                );
            }
            return json.taskId;
        } catch (err) {
            lastErr = err;
            if (i < MAX_TRIES) await new Promise((r) => setTimeout(r, 500 * i));
        }
    }
    throw lastErr instanceof Error ? lastErr : new Error('CapMonster createTask: exhausted retries');
}

async function pollResult<T>(key: string, taskId: number, timeoutMs: number): Promise<T> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const res = await fetch(GET_RESULT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ clientKey: key, taskId }),
            });
            const text = await res.text();
            const trimmed = text.trim();
            if (!trimmed.startsWith('{')) {
                // transient non-JSON — keep polling until deadline
                await new Promise((r) => setTimeout(r, DEFAULT_POLL_INTERVAL_MS));
                continue;
            }
            const json = JSON.parse(trimmed) as {
                errorId: number;
                status?: 'ready' | 'processing';
                solution?: T;
                errorCode?: string;
                errorDescription?: string;
            };
            if (json.errorId !== 0) {
                throw new Error(
                    `CapMonster getTaskResult failed: ${json.errorCode ?? 'unknown'} — ${json.errorDescription ?? ''}`,
                );
            }
            if (json.status === 'ready' && json.solution) return json.solution;
        } catch (err) {
            if (Date.now() + DEFAULT_POLL_INTERVAL_MS >= deadline) throw err;
        }
        await new Promise((r) => setTimeout(r, DEFAULT_POLL_INTERVAL_MS));
    }
    throw new Error('CapMonster pollResult: timed out');
}

function normalizeBotDetect(raw: string, minLength: number, maxLength: number): string {
    const cleaned = raw.replace(/\s+/g, '').replace(/[^A-Za-z0-9]/g, '').slice(0, maxLength);
    if (cleaned.length < minLength) {
        throw new Error(`CapMonster BotDetect result too short: "${cleaned}"`);
    }
    return cleaned;
}
