// Claim stub. Turso integration comes later — for now, the Actor trusts its input
// (orchestrator is responsible for not firing duplicate runs) and records the attempted
// claim in Apify Key-Value Store for idempotency.

import { Actor } from 'apify';
import { ACTIVE_STATUS, type FillStatus } from './state.js';

export interface ClaimContext {
    taskId?: string;
    applicationId?: string;
}

export interface ClaimRecord {
    taskId?: string;
    applicationId?: string;
    status: FillStatus;
    workerId: string;
    startedAt: string;
}

const CLAIM_STORE_KEY = 'ds160:claims';

export async function claimTask(ctx: ClaimContext): Promise<ClaimRecord> {
    const key = ctx.taskId ?? ctx.applicationId ?? `run:${process.env.APIFY_ACTOR_RUN_ID ?? Date.now()}`;
    const record: ClaimRecord = {
        taskId: ctx.taskId,
        applicationId: ctx.applicationId,
        status: ACTIVE_STATUS,
        workerId: process.env.APIFY_ACTOR_RUN_ID ?? `local-${process.pid}`,
        startedAt: new Date().toISOString(),
    };
    await Actor.setValue(`${CLAIM_STORE_KEY}:${key}`, record);
    return record;
}

export async function releaseTask(
    ctx: ClaimContext,
    finalStatus: FillStatus,
    extras: Record<string, unknown> = {},
): Promise<void> {
    const key = ctx.taskId ?? ctx.applicationId ?? `run:${process.env.APIFY_ACTOR_RUN_ID ?? Date.now()}`;
    const existing = (await Actor.getValue(`${CLAIM_STORE_KEY}:${key}`)) as ClaimRecord | null;
    await Actor.setValue(`${CLAIM_STORE_KEY}:${key}`, {
        ...(existing ?? {}),
        ...extras,
        status: finalStatus,
        finishedAt: new Date().toISOString(),
    });
}
