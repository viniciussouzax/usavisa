// Graceful shutdown on SIGTERM / platform timeout / Actor.aborting.
// AGENTS.md requires this for cost-conscious PPU/PPE+U actors.

import { Actor } from 'apify';
import { setTimeout as wait } from 'node:timers/promises';

export type ShutdownHandler = () => Promise<void> | void;

const handlers: ShutdownHandler[] = [];

export function onShutdown(handler: ShutdownHandler): void {
    handlers.push(handler);
}

export function installGracefulShutdown(): void {
    Actor.on('aborting', async () => {
        await runHandlers();
        await wait(1_000); // let Crawlee persist internal state
        await Actor.exit();
    });

    Actor.on('exit', async () => {
        await runHandlers();
    });
}

async function runHandlers(): Promise<void> {
    for (const h of [...handlers].reverse()) {
        try {
            await h();
        } catch {
            // swallow — shutdown is best-effort
        }
    }
}
