import type { Page } from 'playwright';
import { runWorkEducation3Page } from './fill.js';
import type { PageModule } from '../types.js';

export const WORK_EDU3_MODULE: PageModule = {
    id: '18_work_education3',
    async detect(page: Page) {
        return /complete_workeducation3|WorkEducation3|workEdu3/i.test(page.url());
    },
    run: runWorkEducation3Page,
};
