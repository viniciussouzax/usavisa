// Helper for scaffolded page modules. Each scaffolded page throws "not_implemented"
// until its module is filled in. This keeps the registry complete and type-safe.

import type { Page } from 'playwright';
import type { PageId } from '../schema/pageOrder.js';
import { PAGE_ORDER } from '../schema/pageOrder.js';
import { EngineError } from '../logging/errors.js';
import type { PageModule, PageContext, PageHandlerResult } from './types.js';

export function scaffoldedModule(id: PageId): PageModule {
    return {
        id,
        async detect(page: Page): Promise<boolean> {
            const descriptor = PAGE_ORDER.find((p) => p.id === id);
            if (!descriptor) return false;
            const url = page.url();
            return descriptor.urlPatterns.some((re) => re.test(url));
        },
        async run(_ctx: PageContext): Promise<PageHandlerResult> {
            throw new EngineError(`Page module ${id} is not implemented yet`, {
                cause: 'unknown_page',
                pageName: id,
            });
        },
    };
}
