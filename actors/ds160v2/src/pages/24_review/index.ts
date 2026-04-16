import type { Page } from 'playwright';
import { runReviewPage } from './fill.js';
import type { PageModule } from '../types.js';

export const REVIEW_MODULE: PageModule = {
    id: '24_review',
    async detect(page: Page) {
        return /review/i.test(page.url());
    },
    run: runReviewPage,
};
