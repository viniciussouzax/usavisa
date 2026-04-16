// Thin wrapper over apify/log. Uses Apify Dataset for fill_logs and error_logs equivalents
// so the observability surface works even before Turso integration is wired up.

import { Actor, log as apifyLog } from 'apify';
import { classifyError, type CanonicalCause } from './causes.js';

export interface FillLogRecord {
    kind: 'fill_log';
    applicationId?: string;
    applicantId?: string;
    pageName: string;
    fieldsFilled: number;
    fieldsTotal: number;
    fieldsUnmatched: string[];
    validationErrors: Array<{ message: string; fieldId?: string }>;
    navigated: boolean;
    attempts: number;
    durationMs: number;
    workerId: string;
    createdAt: string;
}

export interface ErrorLogRecord {
    kind: 'error_log';
    workerId: string;
    applicationId?: string;
    applicantName?: string;
    errorMessage: string;
    errorStack?: string;
    pageName?: string;
    retryNumber: number;
    softwareVersion: string;
    fieldName?: string;
    errorCause: string;
    severity: CanonicalCause['severity'];
    autoRetry: boolean;
    screenshotKey?: string;
    createdAt: string;
}

export const log = apifyLog;

export function logInfo(message: string, data?: Record<string, unknown>): void {
    apifyLog.info(message, data);
}

export function logWarning(message: string, data?: Record<string, unknown>): void {
    apifyLog.warning(message, data);
}

export function logDebug(message: string, data?: Record<string, unknown>): void {
    apifyLog.debug(message, data);
}

export async function recordFillLog(record: Omit<FillLogRecord, 'kind' | 'createdAt'>): Promise<void> {
    const full: FillLogRecord = {
        kind: 'fill_log',
        ...record,
        createdAt: new Date().toISOString(),
    };
    apifyLog.info(`fill_log ${full.pageName} filled=${full.fieldsFilled}/${full.fieldsTotal}`);
    await Actor.pushData(full);
}

export async function recordErrorLog(
    err: unknown,
    ctx: { pageName?: string; fieldName?: string; retryNumber?: number; applicationId?: string; applicantName?: string; workerId?: string },
): Promise<void> {
    const cause = classifyError(err);
    const base: Partial<ErrorLogRecord> = {
        kind: 'error_log',
        workerId: ctx.workerId ?? process.env.APIFY_ACTOR_RUN_ID ?? 'unknown',
        applicationId: ctx.applicationId,
        applicantName: ctx.applicantName,
        pageName: ctx.pageName,
        fieldName: ctx.fieldName,
        retryNumber: ctx.retryNumber ?? 0,
        softwareVersion: process.env.DS160_VERSION ?? '0.1.0',
        errorCause: cause.id,
        severity: cause.severity,
        autoRetry: cause.autoRetry,
        createdAt: new Date().toISOString(),
    };
    if (err instanceof Error) {
        base.errorMessage = err.message;
        base.errorStack = err.stack;
    } else {
        base.errorMessage = String(err);
    }
    apifyLog.error(`error_log cause=${cause.id} page=${ctx.pageName ?? '-'} — ${base.errorMessage}`);
    await Actor.pushData(base as ErrorLogRecord);
}
