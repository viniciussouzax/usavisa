import type { Page } from 'playwright';
import { runTravelCompanionsPage } from './fill.js';
import type { PageModule } from '../types.js';

export const TRAVEL_COMPANIONS_MODULE: PageModule = {
    id: '07_travel_companions',
    async detect(page: Page) {
        return /travelcompanions|travelCompanions/i.test(page.url());
    },
    run: runTravelCompanionsPage,
};
