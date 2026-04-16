import type { Page } from 'playwright';
import { runFamily2SpousePage } from './fill.js';
import type { PageModule } from '../types.js';

export const FAMILY2_SPOUSE_MODULE: PageModule = {
    id: '13_family2_spouse',
    async detect(page: Page) {
        return /complete_family2|family2|[?&]node=Spouse(\b|&)/i.test(page.url());
    },
    run: runFamily2SpousePage,
};
