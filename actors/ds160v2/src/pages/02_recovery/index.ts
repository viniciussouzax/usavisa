import type { Page } from 'playwright';
import { runRecoveryPage } from './fill.js';
import type { PageModule } from '../types.js';

export const RECOVERY_MODULE: PageModule = {
    id: '02_recovery',
    async detect(page: Page) {
        return /Recovery|Retrieve|ConfirmApplicationID/i.test(page.url());
    },
    run: runRecoveryPage,
};

export { RECOVERY_URL, RECOVERY_SELECTORS } from './selectors.js';
