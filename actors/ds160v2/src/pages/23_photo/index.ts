import type { Page } from 'playwright';
import { runPhotoPage } from './fill.js';
import type { PageModule } from '../types.js';

export const PHOTO_MODULE: PageModule = {
    id: '23_photo',
    async detect(page: Page) {
        return /photo_uploadthephoto|uploadthephoto|photo|upload/i.test(page.url());
    },
    run: runPhotoPage,
};
