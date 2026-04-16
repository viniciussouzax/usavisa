// Typed error classes. Carry the canonical cause so upstream classification becomes a lookup.

import { classifyError, type CanonicalCause } from './causes.js';

export class EngineError extends Error {
    readonly cause: CanonicalCause;
    readonly step?: string;
    readonly fieldId?: string;
    readonly pageName?: string;

    constructor(
        message: string,
        opts: { cause?: string | CanonicalCause; step?: string; fieldId?: string; pageName?: string } = {},
    ) {
        super(message);
        this.name = 'EngineError';
        this.cause = typeof opts.cause === 'object' && opts.cause !== null ? opts.cause : classifyError(message, opts.cause);
        this.step = opts.step;
        this.fieldId = opts.fieldId;
        this.pageName = opts.pageName;
    }
}

export class DataError extends EngineError {
    constructor(message: string, opts: { cause: string; step?: string; fieldId?: string; pageName?: string }) {
        super(message, opts);
        this.name = 'DataError';
    }
}

export class FatalError extends EngineError {
    constructor(message: string, opts: { cause?: string; step?: string; pageName?: string } = {}) {
        super(message, opts);
        this.name = 'FatalError';
    }
}
