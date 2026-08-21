'use strict';

const test = require('node:test');
const assert = require('node:assert');

const handler = require('../api/tmdb/[...path].js');

function createRes() {
  return {
    statusCode: null,
    body: null,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; }
  };
}

function stubFetch(impl) {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  return () => { globalThis.fetch = original; };
}

function jsonResponse(status, payload, headers) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => (headers || {})[name.toLowerCase()] || null },
    json: async () => payload
  };
}

test('mengembalikan 500 bila TMDB_API_KEY tidak ada', async () => {
  const previous = process.env.TMDB_API_KEY;
  delete process.env.TMDB_API_KEY;

  const res = createRes();
  await handler({ query: { path: ['search', 'multi'] } }, res);

  assert.strictEqual(res.statusCode, 500);
  assert.match(res.body.error, /TMDB_API_KEY/);

  if (previous !== undefined) process.env.TMDB_API_KEY = previous;
});

test('menolak path di luar allowlist dengan 400', async () => {
  process.env.TMDB_API_KEY = 'kunci-uji';
  const res = createRes();

  await handler({ query: { path: ['authentication', 'token', 'new'] } }, res);

  assert.strictEqual(res.statusCode, 400);
});

test('meneruskan data dan memasang header cache saat sukses', async () => {
  process.env.TMDB_API_KEY = 'kunci-uji';
  const restore = stubFetch(async () => jsonResponse(200, { results: [{ id: 1 }] }));
  const res = createRes();

  await handler({ query: { path: ['search', 'multi'], query: 'batman' } }, res);
  restore();

  assert.strictEqual(res.statusCode, 200);
  assert.deepStrictEqual(res.body, { results: [{ id: 1 }] });
  assert.match(res.headers['cache-control'], /s-maxage=600/);
});

test('meneruskan 404 dari TMDB', async () => {
  process.env.TMDB_API_KEY = 'kunci-uji';
  const restore = stubFetch(async () => jsonResponse(404, {}));
  const res = createRes();

  await handler({ query: { path: ['movie', '999999999'] } }, res);
  restore();

  assert.strictEqual(res.statusCode, 404);
});

test('meneruskan 429 beserta header Retry-After', async () => {
  process.env.TMDB_API_KEY = 'kunci-uji';
  const restore = stubFetch(async () => jsonResponse(429, {}, { 'retry-after': '7' }));
  const res = createRes();

  await handler({ query: { path: ['search', 'multi'], query: 'batman' } }, res);
  restore();

  assert.strictEqual(res.statusCode, 429);
  assert.strictEqual(res.headers['retry-after'], '7');
});

test('memetakan error TMDB lain menjadi 502', async () => {
  process.env.TMDB_API_KEY = 'kunci-uji';
  const restore = stubFetch(async () => jsonResponse(500, {}));
  const res = createRes();

  await handler({ query: { path: ['movie', '550'] } }, res);
  restore();

  assert.strictEqual(res.statusCode, 502);
});

test('memetakan kegagalan jaringan menjadi 502', async () => {
  process.env.TMDB_API_KEY = 'kunci-uji';
  const restore = stubFetch(async () => { throw new Error('ECONNREFUSED'); });
  const res = createRes();

  await handler({ query: { path: ['movie', '550'] } }, res);
  restore();

  assert.strictEqual(res.statusCode, 502);
});

test('tidak membocorkan API key ke dalam pesan error', async () => {
  process.env.TMDB_API_KEY = 'KUNCI-SANGAT-RAHASIA';
  const restore = stubFetch(async () => { throw new Error('gagal'); });
  const res = createRes();

  await handler({ query: { path: ['movie', '550'] } }, res);
  restore();

  assert.ok(!JSON.stringify(res.body).includes('KUNCI-SANGAT-RAHASIA'));
});
