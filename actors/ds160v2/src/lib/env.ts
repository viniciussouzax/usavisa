// Minimal .env loader. Apify CLI does not always forward .env to the child process,
// and we cannot add `dotenv` as a dependency (package.json is untouched). Reads
// `<actorRoot>/.env` once at import time, merges into process.env without overriding
// values that are already set.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ENV_FILES = ['.env', '.env.local'];

function parseLine(line: string): [string, string] | undefined {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return undefined;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return undefined;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
    }
    return [key, value];
}

function loadFile(path: string): void {
    let content: string;
    try {
        content = readFileSync(path, 'utf8');
    } catch {
        return;
    }
    for (const line of content.split(/\r?\n/)) {
        const parsed = parseLine(line);
        if (!parsed) continue;
        const [key, value] = parsed;
        if (process.env[key] === undefined || process.env[key] === '') {
            process.env[key] = value;
        }
    }
}

const cwd = process.cwd();
for (const file of ENV_FILES) {
    loadFile(resolve(cwd, file));
}
