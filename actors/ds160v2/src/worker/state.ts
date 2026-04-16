// Application fill_status machine — worker_rules §9.
// The Actor only owns the transitions made from inside the process; external layers
// (orchestrator, dashboard) are responsible for reset and manual interventions.

export type FillStatus = 'todo' | 'doing' | 'done' | 'error' | 'standby' | 'fail' | 'retry';

export const CLAIMABLE_STATUSES: FillStatus[] = ['todo', 'retry', 'standby'];
export const ACTIVE_STATUS: FillStatus = 'doing';
export const BLOCKING_STATUSES: FillStatus[] = ['error', 'fail', 'done'];

export const STANDBY_COOLDOWN_SECONDS = 1_800;
export const MAX_RETRIES = 3;
export const STALE_DOING_THRESHOLD_MS = 10 * 60 * 1_000;
