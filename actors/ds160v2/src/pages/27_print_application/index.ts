import type { Page } from 'playwright';
import { runPrintApplicationPage } from './fill.js';
import type { PageModule } from '../types.js';

export const PRINT_APPLICATION_MODULE: PageModule = {
    id: '27_print_application',
    async detect(page: Page) {
        return /Print_Application|printapplication/i.test(page.url());
    },
    run: runPrintApplicationPage,
};
