import type { Page } from 'playwright';
import { runWorkEducation2Page } from './fill.js';
import type { PageModule } from '../types.js';

export const WORK_EDU2_MODULE: PageModule = {
    id: '17_work_education2',
    async detect(page: Page) {
        return /complete_workeducation2|WorkEducation2|workEdu2/i.test(page.url());
    },
    run: runWorkEducation2Page,
};
