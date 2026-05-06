// ─── API Configuration ─────────────────────────────────────────────────────
export const BASE_URL = __ENV.BASE_URL || 'https://jsonplaceholder.typicode.com';

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept:         'application/json',
};

// ─── Test Behavior ─────────────────────────────────────────────────────────
export const SLEEP_DURATION = parseFloat(__ENV.SLEEP_DURATION) || 1;

// ─── Environment Tags ──────────────────────────────────────────────────────
export const ENV_TAGS = {
  environment: __ENV.ENVIRONMENT || 'staging',
  team:        'qa-performance',
  project:     'k6-performance-testing',
};