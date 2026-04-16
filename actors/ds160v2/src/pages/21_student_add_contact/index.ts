import type { Page } from 'playwright';
import { runStudentAddContactPage } from './fill.js';
import type { PageModule } from '../types.js';

export const STUDENT_ADD_CONTACT_MODULE: PageModule = {
    id: '21_student_add_contact',
    async detect(page: Page) {
        return /student_add_contact|studentaddcontact/i.test(page.url());
    },
    run: runStudentAddContactPage,
};
