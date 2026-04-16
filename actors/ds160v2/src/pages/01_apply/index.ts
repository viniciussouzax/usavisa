import type { Page } from 'playwright';
import { runApplyPage } from './fill.js';
import { detectPageState } from '../../engine/state.js';
import type { PageModule } from '../types.js';

export const APPLY_MODULE: PageModule = {
    id: '01_apply',
    async detect(page: Page) {
        const state = await detectPageState(page);
        return state === 'landing_ready' || state === 'landing_partial';
    },
    run: runApplyPage,
};

export { APPLY_SELECTORS, APPLY_URL } from './selectors.js';
