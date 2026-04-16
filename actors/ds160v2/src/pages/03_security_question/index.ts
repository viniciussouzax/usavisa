import type { Page } from 'playwright';
import { runSecurityQuestionPage } from './fill.js';
import type { PageModule } from '../types.js';

export const SECURITY_QUESTION_MODULE: PageModule = {
    id: '03_security_question',
    async detect(page: Page) {
        return /SecureQuestion|ConfirmApplicationID/i.test(page.url());
    },
    run: runSecurityQuestionPage,
};

export { SECURITY_QUESTION_SELECTORS } from './selectors.js';
