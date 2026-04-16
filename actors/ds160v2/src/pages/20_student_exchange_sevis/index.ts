import type { Page } from 'playwright';
import { runStudentSevisPage } from './fill.js';
import type { PageModule } from '../types.js';

export const STUDENT_SEVIS_MODULE: PageModule = {
    id: '20_student_exchange_sevis',
    async detect(page: Page) {
        return /student_exchange|sevis/i.test(page.url());
    },
    run: runStudentSevisPage,
};
