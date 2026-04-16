import type { Page } from 'playwright';
import { runFamily1Page } from './fill.js';
import type { PageModule } from '../types.js';

export const FAMILY1_MODULE: PageModule = {
    id: '12_family1',
    async detect(page: Page) {
        return /complete_family1\.aspx|node=Relatives/i.test(page.url());
    },
    run: runFamily1Page,
};
