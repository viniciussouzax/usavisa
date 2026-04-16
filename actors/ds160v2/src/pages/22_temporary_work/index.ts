import type { Page } from 'playwright';
import { runTemporaryWorkPage } from './fill.js';
import type { PageModule } from '../types.js';

export const TEMPORARY_WORK_MODULE: PageModule = {
    id: '22_temporary_work',
    async detect(page: Page) {
        return /temporary_work|tempwork/i.test(page.url());
    },
    run: runTemporaryWorkPage,
};
