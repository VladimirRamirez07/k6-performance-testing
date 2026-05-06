import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { BASE_URL, DEFAULT_HEADERS, SLEEP_DURATION } from '../../config/config.js';
import { createPostPayload } from '../../utils/helpers.js';

// ─── Custom Metrics ───────────────────────────────────────────────────────────
const getPostsDuration   = new Trend('get_posts_duration', true);
const getUsersDuration   = new Trend('get_users_duration', true);
const createPostDuration = new Trend('create_post_duration', true);
const errorRate          = new Rate('error_rate');
const totalRequests      = new Counter('total_requests');

// ─── Test Options ─────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m',  target: 10 },
    { duration: '30s', target: 20 },
    { duration: '1m',  target: 20 },
    { duration: '30s', target: 0  },
  ],
  thresholds: {
    http_req_duration:  ['p(95)<500', 'p(99)<1000'],
    http_req_failed:    ['rate<0.01'],
    error_rate:         ['rate<0.05'],
    get_posts_duration: ['p(95)<400'],
    get_users_duration: ['p(95)<400'],
  },
};

// ─── Main Test ────────────────────────────────────────────────────────────────
export default function () {
  group('Get Posts', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/posts`, { headers: DEFAULT_HEADERS });
    getPostsDuration.add(Date.now() - start);
    totalRequests.add(1);

    const ok = check(res, {
      'get posts: status 200':     (r) => r.status === 200,
      'get posts: has items':      (r) => r.json().length > 0,
      'get posts: time OK':        (r) => r.timings.duration < 500,
    });
    errorRate.add(!ok);
  });

  sleep(SLEEP_DURATION);

  group('Get Single Post', () => {
    const postId = Math.floor(Math.random() * 100) + 1;
    const res = http.get(`${BASE_URL}/posts/${postId}`, { headers: DEFAULT_HEADERS });
    totalRequests.add(1);

    const ok = check(res, {
      'single post: status 200': (r) => r.status === 200,
      'single post: has title':  (r) => r.json('title') !== undefined,
    });
    errorRate.add(!ok);
  });

  sleep(SLEEP_DURATION);

  group('Get Users', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/users`, { headers: DEFAULT_HEADERS });
    getUsersDuration.add(Date.now() - start);
    totalRequests.add(1);

    const ok = check(res, {
      'get users: status 200':  (r) => r.status === 200,
      'get users: has items':   (r) => r.json().length > 0,
    });
    errorRate.add(!ok);
  });

  sleep(SLEEP_DURATION);

  group('Create Post', () => {
    const start = Date.now();
    const res = http.post(
      `${BASE_URL}/posts`,
      JSON.stringify(createPostPayload()),
      { headers: DEFAULT_HEADERS }
    );
    createPostDuration.add(Date.now() - start);
    totalRequests.add(1);

    const ok = check(res, {
      'create post: status 201': (r) => r.status === 201,
      'create post: has id':     (r) => r.json('id') !== undefined,
    });
    errorRate.add(!ok);
  });

  sleep(SLEEP_DURATION);
}

export function setup() {
  console.log(`🚀 Load Test — Target: ${BASE_URL}`);
}

export function teardown() {
  console.log('✅ Load Test completed');
}