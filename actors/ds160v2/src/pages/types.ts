// Common types for page modules.

import type { Page } from 'playwright';
import type { DS160Applicant } from '../schema/types.js';
import type { PageId } from '../schema/pageOrder.js';

export interface PageContext {
    page: Page;
    data: DS160Applicant;
    dryRun: boolean;
    applicationId?: string;
}

export interface PageHandlerResult {
    navigated: boolean;
    applicationIdCaptured?: string;
    validationErrors: Array<{ message: string; fieldId?: string }>;
    fieldsFilled: number;
    fieldsTotal: number;
    durationMs: number;
    attempts: number;
}

export interface PageModule {
    id: PageId;
    detect(page: Page): Promise<boolean>;
    run(ctx: PageContext): Promise<PageHandlerResult>;
}
