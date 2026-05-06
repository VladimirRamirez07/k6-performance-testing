import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL, DEFAULT_HEADERS, SLEEP_DURATION } from '../../config/config.js';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const spikeErrorRate   = new Rate('spike_error_rate');
const spikeDuration    = new Trend('spike_response_time', true);
const recoveryDuration = new Trend('recovery_response_time', true);

// ─── Test Options ─────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '10s', target: 5   },
    { duration: '10s', target: 500 },
    { duration: '1m',  target: 500 },
    { duration: '10s', target: 5   },
    { duration: '1m',  target: 5   },
  ],
  thresholds: {
    http_req_failed:  ['rate<0.20'],
    spike_error_rate: ['rate<0.25'],
  },
};

// ─── Main Test ────────────────────────────────────────────────────────────────
export default function () {
  const isSpikePhase = __VU > 10;

  group('Spike - GET Posts', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/posts`, { headers: DEFAULT_HEADERS });
    const elapsed = Date.now() - start;

    if (isSpikePhase) {
      spikeDuration.add(elapsed);
    } else {
      recoveryDuration.add(elapsed);
    }

    const ok = check(res, {
      'spike: got a response':   (r) => r.status !== 0,
      'spike: not server error': (r) => r.status < 500,
      'spike: status 200':       (r) => r.status === 200,
    });
    spikeErrorRate.add(!ok);
  });

  sleep(SLEEP_DURATION);
}

export function setup() {
  console.log('⚡ Spike Test — Simulating sudden traffic burst');
}

export function teardown() {
  console.log('✅ Spike Test done');
}