import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { BASE_URL, DEFAULT_HEADERS, SLEEP_DURATION } from '../../config/config.js';
import { createPostPayload } from '../../utils/helpers.js';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const responseTime = new Trend('stress_response_time', true);
const errorRate    = new Rate('stress_error_rate');

// ─── Test Options ─────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '1m',  target: 50  },
    { duration: '1m',  target: 100 },
    { duration: '2m',  target: 100 },
    { duration: '1m',  target: 200 },
    { duration: '2m',  target: 200 },
    { duration: '1m',  target: 0   },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed:   ['rate<0.10'],
    stress_error_rate: ['rate<0.15'],
  },
};

// ─── Main Test ────────────────────────────────────────────────────────────────
export default function () {
  group('Stress - Get Posts', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/posts`, { headers: DEFAULT_HEADERS });
    responseTime.add(Date.now() - start);

    const ok = check(res, {
      'stress: status 200':        (r) => r.status === 200,
      'stress: response under 2s': (r) => r.timings.duration < 2000,
      'stress: body not empty':    (r) => r.body.length > 0,
    });
    errorRate.add(!ok);
  });

  sleep(SLEEP_DURATION * 0.5);

  group('Stress - Create Post', () => {
    const res = http.post(
      `${BASE_URL}/posts`,
      JSON.stringify(createPostPayload()),
      { headers: DEFAULT_HEADERS }
    );
    const ok = check(res, {
      'stress create: status 201': (r) => r.status === 201,
    });
    errorRate.add(!ok);
  });

  sleep(SLEEP_DURATION * 0.5);
}

export function setup() {
  console.log('💪 Stress Test — Finding breaking point');
}

export function teardown() {
  console.log('✅ Stress Test completed');
}