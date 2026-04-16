import type { Page } from 'playwright';
import { runUSContactPage } from './fill.js';
import type { PageModule } from '../types.js';

export const US_CONTACT_MODULE: PageModule = {
    id: '11_us_contact',
    async detect(page: Page) {
        return /complete_uscontact/i.test(page.url());
    },
    run: runUSContactPage,
};
