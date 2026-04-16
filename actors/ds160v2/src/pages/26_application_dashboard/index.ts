import type { Page } from 'playwright';
import { runApplicationDashboardPage } from './fill.js';
import type { PageModule } from '../types.js';

export const APPLICATION_DASHBOARD_MODULE: PageModule = {
    id: '26_application_dashboard',
    async detect(page: Page) {
        return /Complete_Done_Confirmation|complete\.aspx|dashboard/i.test(page.url());
    },
    run: runApplicationDashboardPage,
};
