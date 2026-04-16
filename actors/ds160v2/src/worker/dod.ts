// Definition of Done — a run is truly complete only when we have captured the
// government-issued applicationId (AA... code). Without it, mark done but raise an audit alert.

const APPLICATION_ID_PATTERN = /^AA[A-Z0-9]{8,10}$/i;

export function isValidApplicationId(value: string | undefined): boolean {
    if (!value) return false;
    return APPLICATION_ID_PATTERN.test(value.trim());
}

export interface DoDResult {
    done: boolean;
    applicationId?: string;
    alertReason?: string;
}

export function evaluateDefinitionOfDone(applicationId: string | undefined): DoDResult {
    if (!applicationId) {
        return { done: false, alertReason: 'applicationId not captured' };
    }
    if (!isValidApplicationId(applicationId)) {
        return {
            done: true,
            applicationId,
            alertReason: `applicationId format unexpected: ${applicationId}`,
        };
    }
    return { done: true, applicationId };
}
