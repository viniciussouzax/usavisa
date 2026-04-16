import type { Page } from 'playwright';
import { runPersonal2Page } from './fill.js';
import type { PageModule } from '../types.js';

export const PERSONAL2_MODULE: PageModule = {
    id: '05_personal2',
    async detect(page: Page) {
        return /complete_personalcont\.aspx|personal2/i.test(page.url());
    },
    run: runPersonal2Page,
};
