import type { Page } from 'playwright';
import { runPassportPage } from './fill.js';
import type { PageModule } from '../types.js';

export const PASSPORT_MODULE: PageModule = {
    id: '10_passport',
    async detect(page: Page) {
        return /complete_pptvisa|passport/i.test(page.url());
    },
    run: runPassportPage,
};
