import type { Page } from 'playwright';
import { runAddressAndPhonePage } from './fill.js';
import type { PageModule } from '../types.js';

export const ADDRESS_PHONE_MODULE: PageModule = {
    id: '09_address_and_phone',
    async detect(page: Page) {
        return /complete_contact|addressphone/i.test(page.url());
    },
    run: runAddressAndPhonePage,
};
