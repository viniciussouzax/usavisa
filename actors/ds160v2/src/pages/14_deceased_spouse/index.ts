import type { Page } from 'playwright';
import { runDeceasedSpousePage } from './fill.js';
import type { PageModule } from '../types.js';

export const DECEASED_SPOUSE_MODULE: PageModule = {
    id: '14_deceased_spouse',
    async detect(page: Page) {
        return /complete_family5|DeceasedSpouse|deceased/i.test(page.url());
    },
    run: runDeceasedSpousePage,
};
