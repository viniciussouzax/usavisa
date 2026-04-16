import type { Page } from 'playwright';
import { runSignAndSubmitPage } from './fill.js';
import type { PageModule } from '../types.js';

export const SIGN_MODULE: PageModule = {
    id: '25_sign_and_submit',
    async detect(page: Page) {
        return /signtheapplication|sign_and_submit|signandsubmit/i.test(page.url());
    },
    run: runSignAndSubmitPage,
};

export { SIGN_URL, SIGN_SELECTORS } from './selectors.js';
