import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { BASE_URL, DEFAULT_HEADERS, SLEEP_DURATION } from '../../config/config.js';
import { createPostPayload } from '../../utils/helpers.js';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const soakResponseTime = new Trend('soak_response_time', true);
const soakErrorRate    = new Rate('soak_error_rate');
const totalIterations  = new Counter('soak_total_iterations');

// ─── Test Options ─────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '2m',  target: 20 },
    { duration: '30m', target: 20 },
    { duration: '2m',  target: 0  },
  ],
  thresholds: {
    http_req_duration:  ['p(95)<500', 'p(99)<800'],
    http_req_failed:    ['rate<0.01'],
    soak_error_rate:    ['rate<0.02'],
    soak_response_time: ['p(95)<500'],
  },
};

// ─── Main Test ────────────────────────────────────────────────────────────────
export default function () {
  totalIterations.add(1);

  group('Soak - Full Journey', () => {
    // 1. Get all posts
    let start = Date.now();
    const postsRes = http.get(`${BASE_URL}/posts`, { headers: DEFAULT_HEADERS });
    soakResponseTime.add(Date.now() - start);

    const postsOk = check(postsRes, {
      'soak posts: status 200':   (r) => r.status === 200,
      'soak posts: has items':    (r) => r.json().length > 0,
      'soak posts: time < 500ms': (r) => r.timings.duration < 500,
    });
    soakErrorRate.add(!postsOk);
    sleep(SLEEP_DURATION);

    // 2. Get single post
    start = Date.now();
    const singleRes = http.get(`${BASE_URL}/posts/1`, { headers: DEFAULT_HEADERS });
    soakResponseTime.add(Date.now() - start);
    check(singleRes, {
      'soak single: status 200': (r) => r.status === 200,
      'soak single: has title':  (r) => r.json('title') !== undefined,
    });
    sleep(SLEEP_DURATION);

    // 3. Get users
    start = Date.now();
    const usersRes = http.get(`${BASE_URL}/users`, { headers: DEFAULT_HEADERS });
    soakResponseTime.add(Date.now() - start);
    check(usersRes, {
      'soak users: status 200': (r) => r.status === 200,
    });
    sleep(SLEEP_DURATION);

    // 4. Create post
    start = Date.now();
    const createRes = http.post(
      `${BASE_URL}/posts`,
      JSON.stringify(createPostPayload()),
      { headers: DEFAULT_HEADERS }
    );
    soakResponseTime.add(Date.now() - start);
    const createOk = check(createRes, {
      'soak create: status 201': (r) => r.status === 201,
      'soak create: has id':     (r) => r.json('id') !== undefined,
    });
    soakErrorRate.add(!createOk);
  });

  sleep(SLEEP_DURATION);
}

export function setup() {
  console.log('🏊 Soak Test — Endurance run (30 minutes)');
}

export function teardown() {
  console.log('✅ Soak Test completed');
}