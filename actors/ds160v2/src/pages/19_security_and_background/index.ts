import type { Page } from 'playwright';
import { runSecurityBackgroundPage } from './fill.js';
import type { PageModule } from '../types.js';

export const SECURITY_BACKGROUND_MODULE: PageModule = {
    id: '19_security_and_background',
    async detect(page: Page) {
        return /complete_securityandbackground|securityandbackground/i.test(page.url());
    },
    run: runSecurityBackgroundPage,
};
