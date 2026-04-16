import type { Page } from 'playwright';
import { runPrintConfirmationPage } from './fill.js';
import type { PageModule } from '../types.js';

export const PRINT_CONFIRMATION_MODULE: PageModule = {
    id: '28_print_confirmation',
    async detect(page: Page) {
        return /Print_Confirmation|printconfirmation/i.test(page.url());
    },
    run: runPrintConfirmationPage,
};
