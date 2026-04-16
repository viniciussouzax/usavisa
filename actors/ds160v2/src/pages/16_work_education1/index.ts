import type { Page } from 'playwright';
import { runWorkEducation1Page } from './fill.js';
import type { PageModule } from '../types.js';

export const WORK_EDU1_MODULE: PageModule = {
    id: '16_work_education1',
    async detect(page: Page) {
        return /complete_workeducation1\.aspx|node=WorkEducation1/i.test(page.url());
    },
    run: runWorkEducation1Page,
};
