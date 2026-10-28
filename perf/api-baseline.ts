// NFR3 (API performance) baseline for the Toolshop API. Run with: npm run perf:api
// Light by default: Toolshop is a shared public site we don't own. Raise VUS/DURATION only against a self-hosted copy.
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import type { Options } from 'k6/options';

const API = __ENV.API_URL || 'https://api.practicesoftwaretesting.com';
const json = { headers: { 'Content-Type': 'application/json' } };

export const options: Options = {
  scenarios: {
    baseline: {
      executor: 'constant-vus',
      vus: Number(__ENV.VUS || 3),
      duration: __ENV.DURATION || '30s',
    },
  },
  // The NFR gate: k6 exits non-zero when any threshold fails.
  thresholds: {
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
    http_req_duration: ['p(95)<1000'],
    'http_req_duration{name:list-products}': ['p(95)<1000'],
    'http_req_duration{name:product-detail}': ['p(95)<800'],
    'http_req_duration{name:search}': ['p(95)<1000'],
    'http_req_duration{name:me}': ['p(95)<800'],
  },
};

// One throwaway account per run (not per VU). JWTs live 5 minutes, so keep DURATION under that.
export function setup() {
  const user = {
    first_name: 'K6',
    last_name: 'Baseline',
    dob: '1990-01-01',
    phone: '0612345678',
    email: `k6-${Date.now()}@example.com`,
    password: 'K6-Baseline-Pw1!',
    address: { street: 'Main', house_number: '1', city: 'Vienna', state: 'Vienna', country: 'AT', postal_code: '1010' },
  };
  const reg = http.post(`${API}/users/register`, JSON.stringify(user), json);
  check(reg, { 'register 201': (r) => r.status === 201 });
  const login = http.post(`${API}/users/login`, JSON.stringify({ email: user.email, password: user.password }), json);
  check(login, { 'login 200': (r) => r.status === 200 });
  return { token: login.json('access_token') as string };
}

export default function ({ token }: { token: string }) {
  group('browse', () => {
    const list = http.get(`${API}/products?page=${1 + (__ITER % 3)}`, { tags: { name: 'list-products' } });
    check(list, { 'list 200': (r) => r.status === 200, 'list has products': (r) => { const data = r.json('data'); return Array.isArray(data) && data.length > 0; } });

    const id = list.json('data.0.id') as string;
    const detail = http.get(`${API}/products/${id}`, { tags: { name: 'product-detail' } });
    check(detail, { 'detail 200': (r) => r.status === 200, 'detail matches id': (r) => r.json('id') === id });
  });

  group('search', () => {
    const res = http.get(`${API}/products/search?q=hammer`, { tags: { name: 'search' } });
    check(res, { 'search 200': (r) => r.status === 200 });
  });

  group('account', () => {
    const res = http.get(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` }, tags: { name: 'me' } });
    check(res, { 'me 200': (r) => r.status === 200 });
  });

  sleep(1); // think time: keeps request rate realistic and polite
}
