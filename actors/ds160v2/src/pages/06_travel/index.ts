import type { Page } from 'playwright';
import { runTravelPage } from './fill.js';
import type { PageModule } from '../types.js';

export const TRAVEL_MODULE: PageModule = {
    id: '06_travel',
    async detect(page: Page) {
        return /complete_travel\.aspx|travel_info/i.test(page.url());
    },
    run: runTravelPage,
};
