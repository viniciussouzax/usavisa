import type { Page } from 'playwright';
import { runPersonal1Page } from './fill.js';
import type { PageModule } from '../types.js';

export const PERSONAL1_MODULE: PageModule = {
    id: '04_personal1',
    async detect(page: Page) {
        return /complete_personal\.aspx\?node=Personal1|personal1/i.test(page.url());
    },
    run: runPersonal1Page,
};
