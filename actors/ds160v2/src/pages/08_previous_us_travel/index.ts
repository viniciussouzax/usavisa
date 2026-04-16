import type { Page } from 'playwright';
import { runPreviousUSTravelPage } from './fill.js';
import type { PageModule } from '../types.js';

export const PREV_US_TRAVEL_MODULE: PageModule = {
    id: '08_previous_us_travel',
    async detect(page: Page) {
        return /previous_travel|previousTravel|previousustravel/i.test(page.url());
    },
    run: runPreviousUSTravelPage,
};
