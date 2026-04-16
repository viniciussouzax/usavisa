import type { Page } from 'playwright';
import { runPreviousSpousePage } from './fill.js';
import type { PageModule } from '../types.js';

export const PREV_SPOUSE_MODULE: PageModule = {
    id: '15_previous_spouse',
    async detect(page: Page) {
        return /complete_family4|PrevSpouse|previous_spouse/i.test(page.url());
    },
    run: runPreviousSpousePage,
};
