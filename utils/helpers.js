import http from 'k6/http';
import { BASE_URL, DEFAULT_HEADERS } from '../config/config.js';

// ─── Data Factories ────────────────────────────────────────────────────────
const JOB_TITLES = [
  'QA Engineer', 'Software Developer', 'DevOps Engineer',
  'Product Manager', 'Backend Developer', 'Frontend Developer',
];

const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley'];
const LAST_NAMES  = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];

export function createUserPayload() {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName  = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const job       = JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)];
  return {
    name:     `${firstName} ${lastName}`,
    username: firstName.toLowerCase(),
    email:    `${firstName.toLowerCase()}@test.com`,
    job,
  };
}

export function createPostPayload() {
  return {
    title:  'Performance Test Post',
    body:   'This post was created during a k6 performance test.',
    userId: Math.floor(Math.random() * 10) + 1,
  };
}

// ─── Utilities ─────────────────────────────────────────────────────────────
export function safeJsonParse(body) {
  try { return JSON.parse(body); } catch { return null; }
}

export function randomSleep(min = 0.5, max = 2.0) {
  return Math.random() * (max - min) + min;
}