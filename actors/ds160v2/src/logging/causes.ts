// Canonical error causes — single source of truth, derived from spec/actors/ceac_ds160/logging_rules.md.
// Every failure must be classified with one of these causes before being logged.

export type CauseSeverity = 'system' | 'operational' | 'data' | 'unknown';

export type ErrorType = 'A' | 'B'; // A = Data, B = Engine

export interface CanonicalCause {
    id: string;
    type: ErrorType;
    severity: CauseSeverity;
    autoRetry: boolean;
    pattern?: RegExp;
    description: string;
    discardSession?: boolean;
}

export const CAUSE_CATALOG: CanonicalCause[] = [
    // A — Data
    {
        id: 'missing_data',
        type: 'A',
        severity: 'data',
        autoRetry: false,
        pattern: /missing.*data|dados.*faltantes|campo faltante/i,
        description: 'Required field absent from payload',
    },
    {
        id: 'validation_error',
        type: 'A',
        severity: 'data',
        autoRetry: false,
        pattern: /validation.*error|required.*field|campo.*obrigat/i,
        description: 'Field rejected by schema or portal',
    },
    {
        id: 'invalid_field_value',
        type: 'A',
        severity: 'data',
        autoRetry: false,
        pattern: /is invalid|cannot be|not allowed|invalid.*character/i,
        description: 'Value not accepted by CEAC for the given field',
    },
    {
        id: 'select_mismatch',
        type: 'A',
        severity: 'system',
        autoRetry: false,
        pattern: /field_error:select|no option matching/i,
        description: 'Dropdown value not found in options',
    },

    // B — Engine / System
    {
        id: 'dropdown_changed',
        type: 'B',
        severity: 'system',
        autoRetry: false,
        pattern: /no option matching/i,
        description: 'CEAC changed dropdown options — update field map',
    },
    {
        id: 'field_missing',
        type: 'B',
        severity: 'system',
        autoRetry: false,
        pattern: /element not found.*(tbx|ddl|rbl)/i,
        description: 'CEAC changed the ID — update regex in field map',
    },
    {
        id: 'postback_stuck',
        type: 'B',
        severity: 'system',
        autoRetry: true,
        pattern: /postback.*(timeout|stuck)/i,
        description: 'New postback trigger not mapped',
    },
    {
        id: 'page_stuck',
        type: 'B',
        severity: 'system',
        autoRetry: true,
        pattern: /page didn.*advance|stuck.*same page/i,
        description: 'Page did not advance — check validation via screenshot',
    },
    {
        id: 'null_value',
        type: 'B',
        severity: 'system',
        autoRetry: false,
        pattern: /null.*value|undefined.*value|Cannot read prop/i,
        description: 'Normalizer failed upstream — data error',
    },
    {
        id: 'unknown_page',
        type: 'B',
        severity: 'system',
        autoRetry: false,
        pattern: /identifyPage.*unknown|page.*not recognized/i,
        description: 'CEAC added/changed page layout — requires mapping',
    },

    // B — Engine / Operational (transient)
    {
        id: 'captcha_failed',
        type: 'B',
        severity: 'operational',
        autoRetry: true,
        pattern: /captcha.*(failed|timeout|balance)/i,
        description: 'CapMonster failed to solve — check balance or config',
    },
    {
        id: 'browser_closed',
        type: 'B',
        severity: 'operational',
        autoRetry: true,
        pattern: /browser.*closed|target.*closed|context.*destroyed/i,
        description: 'Browser crashed — retry with new instance',
    },
    {
        id: 'network_error',
        type: 'B',
        severity: 'operational',
        autoRetry: true,
        pattern: /net::ERR_|ECONNREFUSED|timeout.*navigation/i,
        description: 'Network failure — check proxy and retry',
    },
    {
        id: 'session_expired',
        type: 'B',
        severity: 'operational',
        autoRetry: true,
        pattern: /session.*(expired|timeout)|please start over/i,
        description: 'DS-160 session expired — new browser required',
        discardSession: true,
    },
    {
        id: 'challenge_detected',
        type: 'B',
        severity: 'system',
        autoRetry: false,
        pattern: /challenge|TSPD|akamai/i,
        description: 'CEAC detected automation — session lost',
        discardSession: true,
    },
    {
        id: 'dom_mismatch',
        type: 'B',
        severity: 'system',
        autoRetry: false,
        description: 'Expected DOM element not found — CEAC may have changed',
        discardSession: true,
    },
    {
        id: 'timeout',
        type: 'B',
        severity: 'operational',
        autoRetry: true,
        pattern: /timeout/i,
        description: 'Server or element did not respond within timeout',
    },
    {
        id: 'unknown_error',
        type: 'B',
        severity: 'unknown',
        autoRetry: false,
        description: 'Unclassifiable — generate alert, never silence',
    },
];

export function classifyError(messageOrError: unknown, explicitCause?: string): CanonicalCause {
    if (explicitCause) {
        const hit = CAUSE_CATALOG.find((c) => c.id === explicitCause);
        if (hit) return hit;
    }
    const message =
        messageOrError instanceof Error
            ? `${messageOrError.message}\n${messageOrError.stack ?? ''}`
            : typeof messageOrError === 'string'
              ? messageOrError
              : JSON.stringify(messageOrError);
    for (const cause of CAUSE_CATALOG) {
        if (cause.pattern && cause.pattern.test(message)) return cause;
    }
    return CAUSE_CATALOG.find((c) => c.id === 'unknown_error')!;
}
