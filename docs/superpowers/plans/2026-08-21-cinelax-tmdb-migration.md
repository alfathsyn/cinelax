# Migrasi Katalog Live TMDB — Rencana Implementasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti katalog statis 389 judul dan pemutar embed pihak ketiga di Cinelax dengan metadata TMDB live lewat proxy serverless, ditambah trailer resmi dan panel ketersediaan layanan streaming.

**Architecture:** Situs tetap statis dengan classic script tanpa framework. Satu serverless function di `api/tmdb/` memegang API key dan mem-proxy JSON TMDB di balik allowlist. Modul `js/tmdb-map.js` berisi fungsi murni yang memetakan respons TMDB ke bentuk objek film yang sudah dipakai fungsi render sekarang, sehingga `js/main.js` tidak perlu diubah strukturnya. Modul `js/tmdb.js` mengurus fetch dan cache.

**Tech Stack:** JavaScript vanilla (classic script), Vercel Serverless Functions (CommonJS), `node --test` bawaan Node 24, TMDB API v3.

**Spec:** `docs/superpowers/specs/2026-08-21-cinelax-tmdb-migration-design.md`

## Global Constraints

- **Tanpa dependency runtime baru.** Pengujian memakai `node --test` bawaan Node 24. Tidak ada framework test, tidak ada bundler.
- **API key hanya di environment.** Nama variabel `TMDB_API_KEY`. Tidak pernah masuk kode, tidak pernah sampai ke browser.
- **Bahasa bawaan `id-ID`.** Klien hanya boleh mengirim `lang=id` atau `lang=en`; nilai lain diperlakukan sebagai bawaan.
- **`region=ID` dan `include_adult=false` dipaksa proxy** dan tidak dapat ditimpa klien.
- **Video tidak pernah lewat server.** Proxy hanya meneruskan JSON.
- **UI, router, filter, dan pagination yang ada dipertahankan.** Bentuk objek film tidak berubah.
- **Atribusi TMDB wajib** tampil di footer sebelum pekerjaan dianggap selesai.
- **Basis kode berbahasa Indonesia** untuk teks yang dilihat pengguna; nama fungsi dan variabel tetap bahasa Inggris mengikuti gaya `js/main.js` sekarang.

---

## File Structure

| Berkas | Tanggung jawab |
|--------|----------------|
| `api/tmdb/allowlist.js` | Fungsi murni: validasi path, penyaringan parameter, penyusunan URL upstream, penentuan header cache. Tidak menyentuh jaringan sehingga dapat diuji langsung. |
| `api/tmdb/[...path].js` | Handler serverless: baca env, panggil allowlist, teruskan ke TMDB, petakan error. |
| `js/tmdb-map.js` | Fungsi murni pemetaan respons TMDB ke objek film. Dual export agar dapat di-`require` dari test sekaligus dipakai sebagai classic script. |
| `js/tmdb.js` | Lapisan jaringan: fetch ke proxy, cache sesi, fungsi tingkat tinggi (`searchTitles`, `getDetail`, `getRow`). |
| `js/main.js` | Diubah: sumber data menjadi async, pemutar diganti panel provider, badge diganti rating. |
| `index.html` | Diubah: tag script, markup panel provider, atribusi footer. |
| `test/tmdb-allowlist.test.js` | Uji allowlist proxy. |
| `test/tmdb-handler.test.js` | Uji handler dengan `fetch` yang di-stub. |
| `test/tmdb-map.test.js` | Uji fungsi pemetaan memakai fixture. |
| `test/fixtures/*.json` | Potongan respons TMDB yang ditulis tangan, deterministik, tanpa jaringan. |
| `package.json` | Dibuat: skrip `npm test`. Repo belum punya. |
| `vercel.json` | Diubah: pola rewrite tidak boleh mencakup `/api`. |

Pemisahan `allowlist.js` dari handler dan `tmdb-map.js` dari `tmdb.js` mengikuti satu prinsip: logika murni dipisah dari I/O supaya bisa diuji tanpa jaringan.

---

## Task 1: Scaffolding Pengujian dan Allowlist Proxy

**Files:**
- Create: `package.json`
- Create: `api/tmdb/allowlist.js`
- Test: `test/tmdb-allowlist.test.js`

**Interfaces:**
- Consumes: tidak ada, ini tugas pertama.
- Produces:
  - `isAllowedPath(path: string) => boolean`
  - `resolveLanguage(lang: string|undefined) => 'id-ID' | 'en-US'`
  - `filterQuery(query: object) => object`
  - `cacheControlFor(path: string) => string`
  - `buildUpstreamUrl(path: string, query: object, apiKey: string) => string`

- [ ] **Step 1: Buat `package.json`**

Repo belum punya `package.json`. Berkas ini hanya untuk menjalankan test; tidak ada dependency.

```json
{
  "name": "cinelax",
  "version": "1.0.0",
  "private": true,
  "description": "Website streaming film dan serial TV",
  "scripts": {
    "test": "node --test test/"
  }
}
```

- [ ] **Step 2: Tulis test yang gagal**

Buat `test/tmdb-allowlist.test.js`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert');

const {
  isAllowedPath,
  resolveLanguage,
  filterQuery,
  cacheControlFor,
  buildUpstreamUrl
} = require('../api/tmdb/allowlist');

test('isAllowedPath menerima endpoint yang terdaftar', () => {
  assert.strictEqual(isAllowedPath('search/multi'), true);
  assert.strictEqual(isAllowedPath('discover/movie'), true);
  assert.strictEqual(isAllowedPath('trending/all/week'), true);
  assert.strictEqual(isAllowedPath('movie/550'), true);
  assert.strictEqual(isAllowedPath('tv/1399/season/2'), true);
  assert.strictEqual(isAllowedPath('movie/550/credits'), true);
  assert.strictEqual(isAllowedPath('tv/1399/watch/providers'), true);
  assert.strictEqual(isAllowedPath('genre/movie/list'), true);
});

test('isAllowedPath menolak endpoint di luar daftar', () => {
  assert.strictEqual(isAllowedPath('account/123/favorite'), false);
  assert.strictEqual(isAllowedPath('authentication/token/new'), false);
  assert.strictEqual(isAllowedPath('movie/550/rating'), false);
  assert.strictEqual(isAllowedPath(''), false);
  assert.strictEqual(isAllowedPath(undefined), false);
});

test('isAllowedPath menolak upaya path traversal', () => {
  assert.strictEqual(isAllowedPath('movie/../account'), false);
  assert.strictEqual(isAllowedPath('../secret'), false);
});

test('resolveLanguage hanya mengenal id dan en', () => {
  assert.strictEqual(resolveLanguage(undefined), 'id-ID');
  assert.strictEqual(resolveLanguage('id'), 'id-ID');
  assert.strictEqual(resolveLanguage('en'), 'en-US');
  assert.strictEqual(resolveLanguage('ja'), 'id-ID');
  assert.strictEqual(resolveLanguage('en-US'), 'id-ID');
});

test('filterQuery hanya meneruskan parameter yang diizinkan', () => {
  const result = filterQuery({
    query: 'batman',
    page: '2',
    api_key: 'bocor',
    include_adult: 'true',
    language: 'ja-JP',
    with_genres: '28'
  });
  assert.deepStrictEqual(result, { query: 'batman', page: '2', with_genres: '28' });
});

test('filterQuery membuang nilai kosong', () => {
  assert.deepStrictEqual(filterQuery({ query: '', page: '1' }), { page: '1' });
});

test('cacheControlFor memberi umur berbeda per jenis endpoint', () => {
  assert.match(cacheControlFor('search/multi'), /s-maxage=600/);
  assert.match(cacheControlFor('discover/movie'), /s-maxage=1800/);
  assert.match(cacheControlFor('trending/all/week'), /s-maxage=1800/);
  assert.match(cacheControlFor('movie/550'), /s-maxage=3600/);
});

test('buildUpstreamUrl memaksa parameter yang tidak boleh ditimpa klien', () => {
  const url = new URL(buildUpstreamUrl('search/multi', {
    query: 'batman',
    include_adult: 'true',
    region: 'US',
    api_key: 'palsu'
  }, 'RAHASIA'));

  assert.strictEqual(url.origin + url.pathname, 'https://api.themoviedb.org/3/search/multi');
  assert.strictEqual(url.searchParams.get('query'), 'batman');
  assert.strictEqual(url.searchParams.get('include_adult'), 'false');
  assert.strictEqual(url.searchParams.get('region'), 'ID');
  assert.strictEqual(url.searchParams.get('language'), 'id-ID');
  assert.strictEqual(url.searchParams.get('api_key'), 'RAHASIA');
});

test('buildUpstreamUrl menghormati lang=en untuk fallback sinopsis', () => {
  const url = new URL(buildUpstreamUrl('movie/550', { lang: 'en' }, 'RAHASIA'));
  assert.strictEqual(url.searchParams.get('language'), 'en-US');
});
```

- [ ] **Step 3: Jalankan test, pastikan gagal**

Run: `npm test`
Expected: FAIL dengan `Cannot find module '../api/tmdb/allowlist'`

- [ ] **Step 4: Tulis implementasi minimal**

Buat `api/tmdb/allowlist.js`:

```js
'use strict';

const ALLOWED_PATTERNS = [
  /^search\/multi$/,
  /^discover\/(movie|tv)$/,
  /^trending\/(all|movie|tv)\/(day|week)$/,
  /^(movie|tv)\/\d+$/,
  /^tv\/\d+\/season\/\d+$/,
  /^(movie|tv)\/\d+\/credits$/,
  /^(movie|tv)\/\d+\/videos$/,
  /^(movie|tv)\/\d+\/watch\/providers$/,
  /^(movie|tv)\/\d+\/recommendations$/,
  /^genre\/(movie|tv)\/list$/
];

const ALLOWED_PARAMS = [
  'query',
  'page',
  'with_genres',
  'sort_by',
  'primary_release_year',
  'year',
  'vote_count.gte'
];

function isAllowedPath(path) {
  if (typeof path !== 'string' || path === '') return false;
  if (path.includes('..')) return false;
  return ALLOWED_PATTERNS.some((pattern) => pattern.test(path));
}

function resolveLanguage(lang) {
  return lang === 'en' ? 'en-US' : 'id-ID';
}

function filterQuery(query) {
  const source = query || {};
  const result = {};
  for (const key of ALLOWED_PARAMS) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== '') {
      result[key] = String(value);
    }
  }
  return result;
}

function cacheControlFor(path) {
  if (/^search\//.test(path)) {
    return 'public, s-maxage=600, stale-while-revalidate=3600';
  }
  if (/^(discover|trending)\//.test(path)) {
    return 'public, s-maxage=1800, stale-while-revalidate=86400';
  }
  return 'public, s-maxage=3600, stale-while-revalidate=86400';
}

function buildUpstreamUrl(path, query, apiKey) {
  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  const filtered = filterQuery(query);

  for (const [key, value] of Object.entries(filtered)) {
    url.searchParams.set(key, value);
  }

  url.searchParams.set('language', resolveLanguage((query || {}).lang));
  url.searchParams.set('region', 'ID');
  url.searchParams.set('include_adult', 'false');
  url.searchParams.set('api_key', apiKey);

  return url.toString();
}

module.exports = {
  isAllowedPath,
  resolveLanguage,
  filterQuery,
  cacheControlFor,
  buildUpstreamUrl,
  ALLOWED_PARAMS
};
```

- [ ] **Step 5: Jalankan test, pastikan lulus**

Run: `npm test`
Expected: PASS, 8 test lulus

- [ ] **Step 6: Commit**

```bash
git add package.json api/tmdb/allowlist.js test/tmdb-allowlist.test.js
git commit -m "feat: add TMDB proxy allowlist with endpoint and parameter validation"
```

---

## Task 2: Handler Serverless Proxy

**Files:**
- Create: `api/tmdb/[...path].js`
- Modify: `vercel.json`
- Test: `test/tmdb-handler.test.js`

**Interfaces:**
- Consumes: `isAllowedPath`, `cacheControlFor`, `buildUpstreamUrl` dari Task 1.
- Produces: `module.exports = async function handler(req, res)` — handler gaya Vercel Node. Membaca `req.query.path` (array segmen dari catch-all route) dan `process.env.TMDB_API_KEY`.

- [ ] **Step 1: Tulis test yang gagal**

Buat `test/tmdb-handler.test.js`. Test ini men-stub `globalThis.fetch` sehingga tidak ada trafik jaringan sungguhan.

```js
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
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npm test`
Expected: FAIL dengan `Cannot find module '../api/tmdb/[...path].js'`

- [ ] **Step 3: Tulis implementasi minimal**

Buat `api/tmdb/[...path].js`:

```js
'use strict';

const { isAllowedPath, cacheControlFor, buildUpstreamUrl } = require('./allowlist');

module.exports = async function handler(req, res) {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'TMDB_API_KEY belum dikonfigurasi di environment' });
    return;
  }

  const query = req.query || {};
  const rawPath = query.path;
  const path = Array.isArray(rawPath) ? rawPath.join('/') : String(rawPath || '');

  if (!isAllowedPath(path)) {
    res.status(400).json({ error: 'Endpoint tidak diizinkan' });
    return;
  }

  let response;
  try {
    response = await fetch(buildUpstreamUrl(path, query, apiKey), {
      headers: { accept: 'application/json' }
    });
  } catch (error) {
    res.status(502).json({ error: 'Gagal menghubungi TMDB' });
    return;
  }

  if (response.status === 404) {
    res.status(404).json({ error: 'Judul tidak ditemukan' });
    return;
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get('retry-after');
    if (retryAfter) res.setHeader('Retry-After', retryAfter);
    res.status(429).json({ error: 'Terlalu banyak permintaan, coba lagi sebentar lagi' });
    return;
  }

  if (!response.ok) {
    res.status(502).json({ error: 'TMDB mengembalikan galat' });
    return;
  }

  try {
    const data = await response.json();
    res.setHeader('Cache-Control', cacheControlFor(path));
    res.status(200).json(data);
  } catch (error) {
    res.status(502).json({ error: 'Respons TMDB tidak dapat dibaca' });
  }
};
```

Perhatikan: pesan error tidak pernah menyertakan URL upstream, karena URL itu memuat `api_key`.

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `npm test`
Expected: PASS, seluruh test Task 1 dan Task 2 lulus

- [ ] **Step 5: Perbaiki `vercel.json` agar rewrite tidak menelan `/api`**

Ganti seluruh isi `vercel.json` dengan:

```json
{
  "version": 2,
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

Pola `((?!api/).*)` adalah negative lookahead: cocok dengan semua path **kecuali** yang diawali `api/`.

- [ ] **Step 6: Verifikasi routing secara manual**

Buat `.env.local` di root berisi API key milik pemilik proyek:

```
TMDB_API_KEY=isi_dengan_key_asli
```

Pastikan `.env.local` terabaikan git. Periksa isi `.gitignore`, tambahkan barisnya bila belum ada:

```bash
grep -q '^\.env' .gitignore || echo '.env*.local' >> .gitignore
```

Jalankan dev server Vercel:

```bash
npx vercel dev
```

Lalu di terminal lain, pastikan proxy hidup dan allowlist bekerja:

```bash
curl -s "http://localhost:3000/api/tmdb/search/multi?query=batman" | head -c 200
```

Expected: JSON berisi `"results"`. Bila yang keluar HTML, berarti rewrite masih menelan `/api` dan pola pada Step 5 perlu diperiksa ulang.

```bash
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/tmdb/authentication/token/new"
```

Expected: `400`

- [ ] **Step 7: Commit**

```bash
git add api/tmdb/ test/tmdb-handler.test.js vercel.json .gitignore
git commit -m "feat: add TMDB serverless proxy handler and fix api routing"
```

---

## Task 3: Fungsi Murni Pemetaan TMDB

**Files:**
- Create: `js/tmdb-map.js`
- Create: `test/fixtures/movie-detail.json`
- Create: `test/fixtures/tv-detail.json`
- Create: `test/fixtures/search-multi.json`
- Create: `test/fixtures/watch-providers.json`
- Test: `test/tmdb-map.test.js`

**Interfaces:**
- Consumes: tidak ada dari task sebelumnya.
- Produces, semuanya lewat `window.TmdbMap` di browser dan `module.exports` di Node:
  - `slugify(text: string) => string`
  - `imageUrl(path: string|null, size: string) => string|null`
  - `formatRuntime(minutes: number|null) => string|null`
  - `yearOf(dateStr: string|null) => number|null`
  - `ratingOf(vote: number|null) => string|null`
  - `pickTrailer(videos: object|null) => string|null`
  - `pickDirector(credits: object|null, createdBy: array|null) => string|null`
  - `pickCast(credits: object|null, limit?: number) => string|null`
  - `detectType(raw: object) => 'movie' | 'series'`
  - `mapProviders(raw: object|null, region?: string) => { link, flatrate, rent, buy }`
  - `mapTitle(raw: object, extras?: object) => MovieObject`

`MovieObject` memakai medan yang sama dengan objek yang dihasilkan `generateMovies()` sekarang, ditambah `gradientIndex` dan `emojiIndex` berupa angka. `js/main.js` yang menerjemahkan kedua angka itu menjadi nilai `gradient` dan `emoji`, sehingga modul ini tidak bergantung pada global milik `main.js`.

- [ ] **Step 1: Buat fixture**

Fixture ditulis tangan, bukan hasil unduhan, supaya deterministik. Buat `test/fixtures/movie-detail.json`:

```json
{
  "id": 550,
  "title": "Contoh Film",
  "original_title": "Example Film",
  "overview": "Sinopsis contoh untuk pengujian.",
  "release_date": "2024-03-15",
  "vote_average": 7.86,
  "runtime": 139,
  "poster_path": "/poster.jpg",
  "backdrop_path": "/backdrop.jpg",
  "genres": [{ "id": 18, "name": "Drama" }, { "id": 53, "name": "Thriller" }],
  "production_countries": [{ "iso_3166_1": "US", "name": "United States of America" }]
}
```

Buat `test/fixtures/tv-detail.json`:

```json
{
  "id": 1399,
  "name": "Contoh Serial",
  "original_name": "Example Series",
  "overview": "Sinopsis serial contoh.",
  "first_air_date": "2022-04-17",
  "vote_average": 8.44,
  "number_of_seasons": 3,
  "poster_path": "/tv-poster.jpg",
  "backdrop_path": "/tv-backdrop.jpg",
  "genres": [{ "id": 10765, "name": "Sci-Fi & Fantasy" }],
  "origin_country": ["KR"],
  "created_by": [{ "id": 9, "name": "Nama Kreator" }]
}
```

Buat `test/fixtures/search-multi.json`:

```json
{
  "page": 1,
  "results": [
    {
      "id": 550,
      "media_type": "movie",
      "title": "Contoh Film",
      "release_date": "2024-03-15",
      "vote_average": 7.86,
      "poster_path": "/poster.jpg",
      "genre_ids": [18, 53]
    },
    {
      "id": 1399,
      "media_type": "tv",
      "name": "Contoh Serial",
      "first_air_date": "2022-04-17",
      "vote_average": 8.44,
      "poster_path": "/tv-poster.jpg",
      "genre_ids": [10765]
    },
    {
      "id": 77,
      "media_type": "person",
      "name": "Nama Aktor"
    }
  ],
  "total_pages": 1
}
```

Buat `test/fixtures/watch-providers.json`:

```json
{
  "id": 550,
  "results": {
    "ID": {
      "link": "https://www.themoviedb.org/movie/550/watch?locale=ID",
      "flatrate": [
        { "provider_id": 8, "provider_name": "Netflix", "logo_path": "/netflix.jpg" }
      ],
      "rent": [
        { "provider_id": 3, "provider_name": "Google Play Movies", "logo_path": "/gplay.jpg" }
      ]
    },
    "US": {
      "link": "https://www.themoviedb.org/movie/550/watch?locale=US",
      "flatrate": [
        { "provider_id": 15, "provider_name": "Hulu", "logo_path": "/hulu.jpg" }
      ]
    }
  }
}
```

- [ ] **Step 2: Tulis test yang gagal**

Buat `test/tmdb-map.test.js`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert');

const map = require('../js/tmdb-map.js');

const movieDetail = require('./fixtures/movie-detail.json');
const tvDetail = require('./fixtures/tv-detail.json');
const searchMulti = require('./fixtures/search-multi.json');
const watchProviders = require('./fixtures/watch-providers.json');

test('slugify menghasilkan slug bersih', () => {
  assert.strictEqual(map.slugify('Contoh Film: Bagian 2'), 'contoh-film-bagian-2');
  assert.strictEqual(map.slugify('  Spasi   Ganda  '), 'spasi-ganda');
});

test('imageUrl menyusun URL gambar dan menoleransi path kosong', () => {
  assert.strictEqual(map.imageUrl('/a.jpg', 'w500'), 'https://image.tmdb.org/t/p/w500/a.jpg');
  assert.strictEqual(map.imageUrl(null, 'w500'), null);
});

test('formatRuntime memakai format jam dan menit Indonesia', () => {
  assert.strictEqual(map.formatRuntime(139), '2j 19m');
  assert.strictEqual(map.formatRuntime(120), '2j');
  assert.strictEqual(map.formatRuntime(45), '45m');
  assert.strictEqual(map.formatRuntime(0), null);
  assert.strictEqual(map.formatRuntime(null), null);
});

test('yearOf mengambil tahun dari tanggal rilis', () => {
  assert.strictEqual(map.yearOf('2024-03-15'), 2024);
  assert.strictEqual(map.yearOf(''), null);
  assert.strictEqual(map.yearOf(null), null);
});

test('ratingOf membulatkan ke satu desimal', () => {
  assert.strictEqual(map.ratingOf(7.86), '7.9');
  assert.strictEqual(map.ratingOf(0), null);
  assert.strictEqual(map.ratingOf(null), null);
});

test('pickTrailer memilih trailer resmi YouTube', () => {
  const videos = {
    results: [
      { site: 'Vimeo', type: 'Trailer', key: 'salah' },
      { site: 'YouTube', type: 'Teaser', key: 'teaser1' },
      { site: 'YouTube', type: 'Trailer', key: 'trailer1', official: true }
    ]
  };
  assert.strictEqual(map.pickTrailer(videos), 'https://www.youtube-nocookie.com/embed/trailer1');
});

test('pickTrailer jatuh ke teaser bila tidak ada trailer', () => {
  const videos = { results: [{ site: 'YouTube', type: 'Teaser', key: 'teaser1' }] };
  assert.strictEqual(map.pickTrailer(videos), 'https://www.youtube-nocookie.com/embed/teaser1');
});

test('pickTrailer mengembalikan null bila tidak ada video', () => {
  assert.strictEqual(map.pickTrailer({ results: [] }), null);
  assert.strictEqual(map.pickTrailer(null), null);
});

test('pickDirector mengambil sutradara film dan kreator serial', () => {
  const credits = { crew: [{ job: 'Editor', name: 'Bukan Ini' }, { job: 'Director', name: 'Sang Sutradara' }] };
  assert.strictEqual(map.pickDirector(credits, null), 'Sang Sutradara');
  assert.strictEqual(map.pickDirector(credits, [{ name: 'Sang Kreator' }]), 'Sang Kreator');
  assert.strictEqual(map.pickDirector(null, null), null);
});

test('pickCast menggabungkan nama teratas', () => {
  const credits = { cast: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }, { name: 'E' }] };
  assert.strictEqual(map.pickCast(credits), 'A, B, C, D');
  assert.strictEqual(map.pickCast(credits, 2), 'A, B');
  assert.strictEqual(map.pickCast(null), null);
});

test('detectType membedakan film dan serial', () => {
  assert.strictEqual(map.detectType({ media_type: 'tv' }), 'series');
  assert.strictEqual(map.detectType({ media_type: 'movie' }), 'movie');
  assert.strictEqual(map.detectType({ first_air_date: '2020-01-01' }), 'series');
  assert.strictEqual(map.detectType({ release_date: '2020-01-01' }), 'movie');
});

test('mapTitle memetakan detail film ke bentuk objek yang dipakai UI', () => {
  const result = map.mapTitle(movieDetail, {
    type: 'movie',
    credits: { crew: [{ job: 'Director', name: 'Sang Sutradara' }], cast: [{ name: 'Aktor A' }] },
    videos: { results: [{ site: 'YouTube', type: 'Trailer', key: 'abc123' }] }
  });

  assert.strictEqual(result.tmdbId, 550);
  assert.strictEqual(result.title, 'Contoh Film');
  assert.strictEqual(result.year, 2024);
  assert.strictEqual(result.rating, '7.9');
  assert.strictEqual(result.type, 'movie');
  assert.strictEqual(result.duration, '2j 19m');
  assert.strictEqual(result.genre, 'Drama');
  assert.deepStrictEqual(result.genres, ['Drama', 'Thriller']);
  assert.strictEqual(result.country, 'United States of America');
  assert.strictEqual(result.director, 'Sang Sutradara');
  assert.strictEqual(result.cast, 'Aktor A');
  assert.strictEqual(result.poster, 'https://image.tmdb.org/t/p/w500/poster.jpg');
  assert.strictEqual(result.backdrop, 'https://image.tmdb.org/t/p/w1280/backdrop.jpg');
  assert.strictEqual(result.slug, 'contoh-film-2024');
  assert.strictEqual(result.id, 'movie-contoh-film-2024');
  assert.strictEqual(result.trailerUrl, 'https://www.youtube-nocookie.com/embed/abc123');
});

test('mapTitle memetakan serial beserta jumlah season', () => {
  const result = map.mapTitle(tvDetail, { type: 'series' });

  assert.strictEqual(result.type, 'series');
  assert.strictEqual(result.title, 'Contoh Serial');
  assert.strictEqual(result.seasonCount, 3);
  assert.strictEqual(result.duration, '3 Season');
  assert.strictEqual(result.director, 'Nama Kreator');
  assert.strictEqual(result.country, 'KR');
});

test('mapTitle menghasilkan gradientIndex dan emojiIndex yang stabil', () => {
  const first = map.mapTitle(movieDetail, { type: 'movie' });
  const second = map.mapTitle(movieDetail, { type: 'movie' });

  assert.strictEqual(first.gradientIndex, second.gradientIndex);
  assert.strictEqual(first.emojiIndex, second.emojiIndex);
  assert.ok(Number.isInteger(first.gradientIndex) && first.gradientIndex >= 0);
  assert.ok(Number.isInteger(first.emojiIndex) && first.emojiIndex >= 0);
});

test('mapTitle memetakan genre_ids lewat tabel pencarian', () => {
  const raw = searchMulti.results[0];
  const result = map.mapTitle(raw, { genreLookup: { 18: 'Drama', 53: 'Thriller' } });

  assert.deepStrictEqual(result.genres, ['Drama', 'Thriller']);
  assert.strictEqual(result.genre, 'Drama');
});

test('mapTitle bertahan saat medan penting kosong', () => {
  const result = map.mapTitle({ id: 1 }, {});

  assert.strictEqual(result.tmdbId, 1);
  assert.strictEqual(result.poster, null);
  assert.strictEqual(result.year, null);
  assert.strictEqual(result.rating, null);
  assert.deepStrictEqual(result.genres, []);
});

test('mapProviders mengambil region Indonesia saja', () => {
  const result = map.mapProviders(watchProviders);

  assert.strictEqual(result.link, 'https://www.themoviedb.org/movie/550/watch?locale=ID');
  assert.strictEqual(result.flatrate.length, 1);
  assert.strictEqual(result.flatrate[0].name, 'Netflix');
  assert.strictEqual(result.flatrate[0].logo, 'https://image.tmdb.org/t/p/original/netflix.jpg');
  assert.strictEqual(result.rent.length, 1);
  assert.deepStrictEqual(result.buy, []);
});

test('mapProviders mengembalikan struktur kosong bila region tidak ada', () => {
  const result = map.mapProviders({ results: {} });

  assert.strictEqual(result.link, null);
  assert.deepStrictEqual(result.flatrate, []);
  assert.strictEqual(map.mapProviders(null).link, null);
});

test('mapTitle membawa popularity untuk keperluan pemeringkatan', () => {
  assert.strictEqual(map.mapTitle({ id: 1, popularity: 42.5 }, {}).popularity, 42.5);
  assert.strictEqual(map.mapTitle({ id: 2 }, {}).popularity, 0);
});
```

- [ ] **Step 3: Jalankan test, pastikan gagal**

Run: `npm test`
Expected: FAIL dengan `Cannot find module '../js/tmdb-map.js'`

- [ ] **Step 4: Tulis implementasi minimal**

Buat `js/tmdb-map.js`. Pembungkus di awal dan akhir membuatnya berfungsi sebagai classic script di browser sekaligus modul CommonJS di test.

```js
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.TmdbMap = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const IMAGE_BASE = 'https://image.tmdb.org/t/p/';
  const GRADIENT_COUNT = 12;
  const EMOJI_COUNT = 40;

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function imageUrl(path, size) {
    return path ? `${IMAGE_BASE}${size}${path}` : null;
  }

  function formatRuntime(minutes) {
    const total = Number(minutes);
    if (!total || total <= 0) return null;
    const hours = Math.floor(total / 60);
    const rest = total % 60;
    if (hours === 0) return `${rest}m`;
    if (rest === 0) return `${hours}j`;
    return `${hours}j ${rest}m`;
  }

  function yearOf(dateStr) {
    if (!dateStr || String(dateStr).length < 4) return null;
    const year = parseInt(String(dateStr).slice(0, 4), 10);
    return Number.isNaN(year) ? null : year;
  }

  function ratingOf(vote) {
    const value = Number(vote);
    if (!value || Number.isNaN(value)) return null;
    return value.toFixed(1);
  }

  function pickTrailer(videos) {
    const list = (videos && videos.results) || [];
    const youtube = list.filter((v) => v.site === 'YouTube');
    const chosen =
      youtube.find((v) => v.type === 'Trailer' && v.official) ||
      youtube.find((v) => v.type === 'Trailer') ||
      youtube.find((v) => v.type === 'Teaser');
    return chosen ? `https://www.youtube-nocookie.com/embed/${chosen.key}` : null;
  }

  function pickDirector(credits, createdBy) {
    if (Array.isArray(createdBy) && createdBy.length > 0) return createdBy[0].name;
    const crew = (credits && credits.crew) || [];
    const director = crew.find((member) => member.job === 'Director');
    return director ? director.name : null;
  }

  function pickCast(credits, limit) {
    const cast = (credits && credits.cast) || [];
    const names = cast.slice(0, limit || 4).map((member) => member.name);
    return names.length > 0 ? names.join(', ') : null;
  }

  function detectType(raw) {
    if (raw.media_type === 'tv') return 'series';
    if (raw.media_type === 'movie') return 'movie';
    if (raw.first_air_date || raw.number_of_seasons || raw.name) return 'series';
    return 'movie';
  }

  function genreNames(raw, genreLookup) {
    if (Array.isArray(raw.genres) && raw.genres.length > 0) {
      return raw.genres.map((genre) => genre.name);
    }
    if (Array.isArray(raw.genre_ids) && genreLookup) {
      return raw.genre_ids.map((id) => genreLookup[id]).filter(Boolean);
    }
    return [];
  }

  function countryOf(raw) {
    if (Array.isArray(raw.production_countries) && raw.production_countries.length > 0) {
      return raw.production_countries[0].name;
    }
    if (Array.isArray(raw.origin_country) && raw.origin_country.length > 0) {
      return raw.origin_country[0];
    }
    return null;
  }

  function mapProviders(raw, region) {
    const entry = (raw && raw.results && raw.results[region || 'ID']) || null;
    const normalise = (list) =>
      (list || []).map((provider) => ({
        id: provider.provider_id,
        name: provider.provider_name,
        logo: imageUrl(provider.logo_path, 'original')
      }));

    if (!entry) return { link: null, flatrate: [], rent: [], buy: [] };

    return {
      link: entry.link || null,
      flatrate: normalise(entry.flatrate),
      rent: normalise(entry.rent),
      buy: normalise(entry.buy)
    };
  }

  function mapTitle(raw, extras) {
    const options = extras || {};
    const type = options.type || detectType(raw);
    const isSeries = type === 'series';

    const title = raw.title || raw.name || '';
    const year = yearOf(raw.release_date || raw.first_air_date);
    const genres = genreNames(raw, options.genreLookup);
    const slug = year ? `${slugify(title)}-${year}` : slugify(title);

    const duration = isSeries
      ? (raw.number_of_seasons ? `${raw.number_of_seasons} Season` : null)
      : formatRuntime(raw.runtime);

    return {
      id: `${type}-${slug}`,
      tmdbId: raw.id,
      title,
      originalTitle: raw.original_title || raw.original_name || title,
      year,
      rating: ratingOf(raw.vote_average),
      type,
      duration,
      genre: genres[0] || null,
      genres,
      country: countryOf(raw),
      director: pickDirector(options.credits, raw.created_by),
      cast: pickCast(options.credits),
      description: raw.overview || null,
      poster: imageUrl(raw.poster_path, 'w500'),
      backdrop: imageUrl(raw.backdrop_path, 'w1280'),
      slug,
      seasonCount: raw.number_of_seasons || null,
      episode: null,
      episodes: null,
      trailerUrl: pickTrailer(options.videos),
      providers: options.providers ? mapProviders(options.providers) : null,
      popularity: raw.popularity || 0,
      gradientIndex: Math.abs(Number(raw.id) || 0) % GRADIENT_COUNT,
      emojiIndex: Math.abs(Number(raw.id) || 0) % EMOJI_COUNT
    };
  }

  return {
    slugify,
    imageUrl,
    formatRuntime,
    yearOf,
    ratingOf,
    pickTrailer,
    pickDirector,
    pickCast,
    detectType,
    mapProviders,
    mapTitle
  };
});
```

- [ ] **Step 5: Jalankan test, pastikan lulus**

Run: `npm test`
Expected: PASS, seluruh test dari tiga task lulus

- [ ] **Step 6: Commit**

```bash
git add js/tmdb-map.js test/tmdb-map.test.js test/fixtures/
git commit -m "feat: add pure TMDB response mapping module with fixtures"
```

---

## Task 4: Lapisan Data dan Cache

**Files:**
- Create: `js/tmdb.js`
- Test: `test/tmdb-data.test.js`

**Interfaces:**
- Consumes: `window.TmdbMap` dari Task 3, endpoint proxy dari Task 2.
- Produces, lewat `window.Tmdb` di browser dan `module.exports` di Node:
  - `fetchTmdb(path: string, params?: object) => Promise<object>`
  - `getGenreLookup(mediaType: 'movie'|'tv') => Promise<object>`
  - `searchTitles(query: string, page?: number) => Promise<MovieObject[]>`
  - `getDetail(type: 'movie'|'series', tmdbId: number) => Promise<MovieObject>`
  - `getProviders(type: 'movie'|'series', tmdbId: number) => Promise<{ link, flatrate, rent, buy }>`
  - `getRow(kind: string, options?: object) => Promise<MovieObject[]>`
  - `findBySlug(slug: string) => Promise<MovieObject|null>`
  - `clearCache() => void`

`getRow` menerima `kind` bernilai `'trending'`, `'top_rated'`, atau `'genre'`. Untuk `'genre'`, `options.genreId` wajib diisi.

- [ ] **Step 1: Tulis test yang gagal**

Buat `test/tmdb-data.test.js`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert');

const tmdb = require('../js/tmdb.js');
const searchMulti = require('./fixtures/search-multi.json');
const movieDetail = require('./fixtures/movie-detail.json');

function stubFetch(handler) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    const payload = handler(String(url));
    return {
      ok: true,
      status: 200,
      json: async () => payload
    };
  };
  return { calls, restore: () => { globalThis.fetch = original; } };
}

test('fetchTmdb memanggil proxy lokal, bukan TMDB langsung', async () => {
  tmdb.clearCache();
  const stub = stubFetch(() => ({ ok: true }));

  await tmdb.fetchTmdb('movie/550');
  stub.restore();

  assert.strictEqual(stub.calls.length, 1);
  assert.ok(stub.calls[0].startsWith('/api/tmdb/movie/550'));
  assert.ok(!stub.calls[0].includes('themoviedb.org'));
});

test('fetchTmdb menyusun query string dari params', async () => {
  tmdb.clearCache();
  const stub = stubFetch(() => ({ ok: true }));

  await tmdb.fetchTmdb('search/multi', { query: 'batman', page: 2 });
  stub.restore();

  assert.ok(stub.calls[0].includes('query=batman'));
  assert.ok(stub.calls[0].includes('page=2'));
});

test('fetchTmdb menggunakan cache untuk permintaan identik', async () => {
  tmdb.clearCache();
  const stub = stubFetch(() => ({ ok: true }));

  await tmdb.fetchTmdb('movie/550');
  await tmdb.fetchTmdb('movie/550');
  stub.restore();

  assert.strictEqual(stub.calls.length, 1);
});

test('searchTitles membuang hasil bertipe person', async () => {
  tmdb.clearCache();
  const stub = stubFetch((url) => {
    if (url.includes('genre/')) return { genres: [{ id: 18, name: 'Drama' }] };
    return searchMulti;
  });

  const results = await tmdb.searchTitles('contoh');
  stub.restore();

  assert.strictEqual(results.length, 2);
  assert.ok(results.every((item) => item.type === 'movie' || item.type === 'series'));
});

test('getDetail menggabungkan detail, credits, dan videos', async () => {
  tmdb.clearCache();
  const stub = stubFetch((url) => {
    if (url.includes('/credits')) return { crew: [{ job: 'Director', name: 'Sang Sutradara' }], cast: [{ name: 'Aktor A' }] };
    if (url.includes('/videos')) return { results: [{ site: 'YouTube', type: 'Trailer', key: 'abc123' }] };
    return movieDetail;
  });

  const detail = await tmdb.getDetail('movie', 550);
  stub.restore();

  assert.strictEqual(detail.title, 'Contoh Film');
  assert.strictEqual(detail.director, 'Sang Sutradara');
  assert.strictEqual(detail.trailerUrl, 'https://www.youtube-nocookie.com/embed/abc123');
});

test('getDetail mengulang dengan lang=en bila sinopsis kosong', async () => {
  tmdb.clearCache();
  const stub = stubFetch((url) => {
    if (url.includes('/credits')) return { crew: [], cast: [] };
    if (url.includes('/videos')) return { results: [] };
    if (url.includes('lang=en')) return Object.assign({}, movieDetail, { overview: 'Sinopsis bahasa Inggris.' });
    return Object.assign({}, movieDetail, { overview: '' });
  });

  const detail = await tmdb.getDetail('movie', 550);
  stub.restore();

  assert.strictEqual(detail.description, 'Sinopsis bahasa Inggris.');
  assert.ok(stub.calls.some((url) => url.includes('lang=en')));
});

test('getRow mengambil trending, rating tertinggi, dan genre', async () => {
  tmdb.clearCache();
  const stub = stubFetch((url) => {
    if (url.includes('genre/')) return { genres: [{ id: 18, name: 'Drama' }] };
    return { results: [movieDetail] };
  });

  const trending = await tmdb.getRow('trending');
  const topRated = await tmdb.getRow('top_rated');
  const byGenre = await tmdb.getRow('genre', { genreId: 28 });
  stub.restore();

  assert.strictEqual(trending.length, 1);
  assert.strictEqual(topRated.length, 1);
  assert.strictEqual(byGenre.length, 1);
  assert.ok(stub.calls.some((url) => url.includes('trending/all/week')));
  assert.ok(stub.calls.some((url) => url.includes('vote_count.gte')));
  assert.ok(stub.calls.some((url) => url.includes('with_genres=28')));
});

test('findBySlug memilih kecocokan slug beserta tahun lebih dulu', async () => {
  tmdb.clearCache();
  const stub = stubFetch((url) => {
    if (url.includes('genre/')) return { genres: [] };
    return {
      results: [
        { id: 2, media_type: 'movie', title: 'Contoh Film', release_date: '1999-01-01', popularity: 99 },
        { id: 1, media_type: 'movie', title: 'Contoh Film', release_date: '2024-03-15', popularity: 10 }
      ]
    };
  });

  const found = await tmdb.findBySlug('contoh-film-2024');
  stub.restore();

  assert.strictEqual(found.tmdbId, 1);
});

test('findBySlug jatuh ke popularity tertinggi bila tahun tidak cocok', async () => {
  tmdb.clearCache();
  const stub = stubFetch((url) => {
    if (url.includes('genre/')) return { genres: [] };
    return {
      results: [
        { id: 2, media_type: 'movie', title: 'Judul Lain', release_date: '1999-01-01', popularity: 5 },
        { id: 3, media_type: 'movie', title: 'Judul Beda', release_date: '2001-01-01', popularity: 88 }
      ]
    };
  });

  const found = await tmdb.findBySlug('contoh-film-2024');
  stub.restore();

  assert.strictEqual(found.tmdbId, 3);
});

test('findBySlug mengembalikan null bila tidak ada hasil', async () => {
  tmdb.clearCache();
  const stub = stubFetch(() => ({ results: [] }));

  const found = await tmdb.findBySlug('tidak-ada-2030');
  stub.restore();

  assert.strictEqual(found, null);
});

test('fetchTmdb melempar error dengan status saat proxy gagal', async () => {
  tmdb.clearCache();
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 500,
    headers: { get: () => null },
    json: async () => ({})
  });

  await assert.rejects(() => tmdb.fetchTmdb('movie/550'), (error) => error.status === 500);

  globalThis.fetch = original;
});

test('fetchTmdb mencoba ulang saat 429 lalu berhasil', async () => {
  tmdb.clearCache();
  const original = globalThis.fetch;
  let calls = 0;

  globalThis.fetch = async () => {
    calls += 1;
    if (calls === 1) {
      return {
        ok: false,
        status: 429,
        headers: { get: (name) => (name === 'retry-after' ? '0' : null) },
        json: async () => ({})
      };
    }
    return { ok: true, status: 200, headers: { get: () => null }, json: async () => ({ ok: true }) };
  };

  const data = await tmdb.fetchTmdb('movie/550');
  globalThis.fetch = original;

  assert.strictEqual(calls, 2);
  assert.deepStrictEqual(data, { ok: true });
});

test('fetchTmdb menyerah setelah batas percobaan 429 terlampaui', async () => {
  tmdb.clearCache();
  const original = globalThis.fetch;
  let calls = 0;

  globalThis.fetch = async () => {
    calls += 1;
    return {
      ok: false,
      status: 429,
      headers: { get: (name) => (name === 'retry-after' ? '0' : null) },
      json: async () => ({})
    };
  };

  await assert.rejects(() => tmdb.fetchTmdb('movie/550'), (error) => error.status === 429);
  globalThis.fetch = original;

  // satu percobaan awal ditambah dua percobaan ulang
  assert.strictEqual(calls, 3);
});
```

Catatan untuk pelaksana: test di atas berjalan di Node, tempat `sessionStorage` tidak ada. Fungsi `hasSessionStorage()` menutup kasus itu, sehingga jalur cache sesi otomatis tidak aktif selama pengujian dan hanya hidup di peramban. Perilaku itu ikut teruji lewat test `fetchTmdb menggunakan cache untuk permintaan identik`, yang mengandalkan cache memori.

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npm test`
Expected: FAIL dengan `Cannot find module '../js/tmdb.js'`

- [ ] **Step 3: Tulis implementasi minimal**

Buat `js/tmdb.js`:

```js
(function (root, factory) {
  'use strict';
  const mapper = (typeof module !== 'undefined' && module.exports)
    ? require('./tmdb-map.js')
    : root.TmdbMap;
  const api = factory(mapper);
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.Tmdb = api;
  }
})(typeof self !== 'undefined' ? self : this, function (map) {
  'use strict';

  const BASE = '/api/tmdb/';
  const MIN_VOTES = 300;
  const SESSION_PREFIX = 'cinelax:tmdb:';
  const MAX_RETRY = 2;
  const cache = new Map();

  // Hanya detail judul yang layak bertahan lintas navigasi mundur-maju
  const SESSION_CACHEABLE = /^(movie|tv)\/\d+/;

  function hasSessionStorage() {
    try {
      return typeof sessionStorage !== 'undefined' && sessionStorage !== null;
    } catch (error) {
      return false;
    }
  }

  function readSession(key) {
    if (!hasSessionStorage() || !SESSION_CACHEABLE.test(key)) return null;
    try {
      const raw = sessionStorage.getItem(SESSION_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeSession(key, value) {
    if (!hasSessionStorage() || !SESSION_CACHEABLE.test(key)) return;
    try {
      sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      // Kuota penuh atau mode privat: cache sesi memang opsional, abaikan
    }
  }

  function clearCache() {
    cache.clear();
    if (!hasSessionStorage()) return;
    try {
      const doomed = [];
      for (let i = 0; i < sessionStorage.length; i += 1) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(SESSION_PREFIX)) doomed.push(key);
      }
      doomed.forEach((key) => sessionStorage.removeItem(key));
    } catch (error) {
      // Abaikan, cache sesi bersifat opsional
    }
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function buildKey(path, params) {
    const search = new URLSearchParams();
    const entries = Object.entries(params || {}).sort((a, b) => (a[0] < b[0] ? -1 : 1));
    for (const [key, value] of entries) {
      if (value !== undefined && value !== null && value !== '') {
        search.set(key, String(value));
      }
    }
    const qs = search.toString();
    return qs ? `${path}?${qs}` : path;
  }

  async function requestWithBackoff(key) {
    let attempt = 0;

    for (;;) {
      const response = await fetch(BASE + key);

      if (response.ok) return response.json();

      // 429 layak dicoba ulang; sisanya langsung menyerah
      if (response.status === 429 && attempt < MAX_RETRY) {
        const header = Number(response.headers.get('retry-after'));
        const waitMs = Number.isFinite(header) && header > 0
          ? header * 1000
          : 1000 * Math.pow(2, attempt);
        attempt += 1;
        await delay(waitMs);
        continue;
      }

      const error = new Error(`Permintaan TMDB gagal: ${response.status}`);
      error.status = response.status;
      throw error;
    }
  }

  async function fetchTmdb(path, params) {
    const key = buildKey(path, params);
    if (cache.has(key)) return cache.get(key);

    const stored = readSession(key);
    if (stored) {
      const resolved = Promise.resolve(stored);
      cache.set(key, resolved);
      return resolved;
    }

    const promise = requestWithBackoff(key);
    cache.set(key, promise);

    try {
      const data = await promise;
      writeSession(key, data);
      return data;
    } catch (error) {
      cache.delete(key);
      throw error;
    }
  }

  async function getGenreLookup(mediaType) {
    const data = await fetchTmdb(`genre/${mediaType || 'movie'}/list`);
    const lookup = {};
    for (const genre of (data.genres || [])) {
      lookup[genre.id] = genre.name;
    }
    return lookup;
  }

  async function searchTitles(query, page) {
    if (!query || query.trim().length < 2) return [];

    const [data, genreLookup] = await Promise.all([
      fetchTmdb('search/multi', { query: query.trim(), page: page || 1 }),
      getGenreLookup('movie')
    ]);

    return (data.results || [])
      .filter((item) => item.media_type !== 'person')
      .map((item) => map.mapTitle(item, { genreLookup }));
  }

  async function getDetail(type, tmdbId) {
    const mediaType = type === 'series' ? 'tv' : 'movie';

    const [detail, credits, videos] = await Promise.all([
      fetchTmdb(`${mediaType}/${tmdbId}`),
      fetchTmdb(`${mediaType}/${tmdbId}/credits`).catch(() => null),
      fetchTmdb(`${mediaType}/${tmdbId}/videos`).catch(() => null)
    ]);

    let source = detail;
    if (!source.overview) {
      const fallback = await fetchTmdb(`${mediaType}/${tmdbId}`, { lang: 'en' }).catch(() => null);
      if (fallback && fallback.overview) source = fallback;
    }

    return map.mapTitle(source, { type: type === 'series' ? 'series' : 'movie', credits, videos });
  }

  async function getProviders(type, tmdbId) {
    const mediaType = type === 'series' ? 'tv' : 'movie';
    const raw = await fetchTmdb(`${mediaType}/${tmdbId}/watch/providers`).catch(() => null);
    return map.mapProviders(raw);
  }

  async function getRow(kind, options) {
    const settings = options || {};
    let path;
    let params;

    if (kind === 'trending') {
      path = 'trending/all/week';
      params = { page: settings.page || 1 };
    } else if (kind === 'top_rated') {
      path = 'discover/movie';
      params = { sort_by: 'vote_average.desc', 'vote_count.gte': MIN_VOTES, page: settings.page || 1 };
    } else if (kind === 'genre') {
      path = 'discover/movie';
      params = { with_genres: settings.genreId, sort_by: 'popularity.desc', page: settings.page || 1 };
    } else {
      throw new Error(`Jenis baris tidak dikenal: ${kind}`);
    }

    const [data, genreLookup] = await Promise.all([
      fetchTmdb(path, params),
      getGenreLookup('movie')
    ]);

    return (data.results || [])
      .filter((item) => item.media_type !== 'person')
      .map((item) => map.mapTitle(item, { genreLookup }));
  }

  async function findBySlug(slug) {
    const parts = String(slug || '').split('-');
    const lastPart = parts[parts.length - 1];
    const hasYear = /^\d{4}$/.test(lastPart);
    const year = hasYear ? parseInt(lastPart, 10) : null;
    const titleGuess = (hasYear ? parts.slice(0, -1) : parts).join(' ');

    if (!titleGuess) return null;

    const results = await searchTitles(titleGuess);
    if (results.length === 0) return null;

    const exactWithYear = results.find((item) => item.slug === slug);
    if (exactWithYear) return exactWithYear;

    const targetSlug = map.slugify(titleGuess);
    const exactTitle = results.find((item) => map.slugify(item.title) === targetSlug);
    if (exactTitle) return exactTitle;

    return results.slice().sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0] || results[0];
  }

  return {
    fetchTmdb,
    getGenreLookup,
    searchTitles,
    getDetail,
    getProviders,
    getRow,
    findBySlug,
    clearCache
  };
});
```

`findBySlug` mengurutkan berdasarkan `popularity`, medan yang sudah disediakan `mapTitle` di Task 3.

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `npm test`
Expected: PASS, seluruh test dari empat task lulus

- [ ] **Step 5: Commit**

```bash
git add js/tmdb.js test/tmdb-data.test.js
git commit -m "feat: add TMDB data layer with session cache and slug lookup"
```

---

## Task 5: Alihkan Homepage dan Hero ke TMDB

**Files:**
- Modify: `index.html` — tag script menjelang `</body>`
- Modify: `js/main.js` — `renderContentSection`, `renderAllSections`, `initRegistry`, `renderHeroSlider`

**Interfaces:**
- Consumes: `window.Tmdb.getRow` dan `window.TmdbMap` dari Task 3 dan 4.
- Produces: `decorateMovie(movie) => movie` — melengkapi `gradient` dan `emoji` dari indeks, lalu mendaftarkan objek ke `movieRegistry`. Dipakai Task 6 dan 7.

- [ ] **Step 1: Muat modul baru di `index.html`**

Pada baris 1133–1134 sekarang tertulis:

```html
  <script src="js/movies-data.js"></script>
  <script src="js/main.js"></script>
```

Ganti menjadi:

```html
  <script src="js/movies-data.js"></script>
  <script src="js/tmdb-map.js"></script>
  <script src="js/tmdb.js"></script>
  <script src="js/main.js"></script>
```

`js/movies-data.js` sengaja dibiarkan dulu supaya situs tetap hidup selama peralihan. Berkas itu dihapus di Task 9.

- [ ] **Step 2: Tambahkan `decorateMovie` di `js/main.js`**

Sisipkan tepat sesudah definisi `initRegistry()`:

```js
// Melengkapi objek hasil TMDB dengan gradient dan emoji, lalu mendaftarkannya
function decorateMovie(movie) {
  if (!movie) return movie;

  movie.gradient = GRADIENTS[movie.gradientIndex % GRADIENTS.length];
  movie.emoji = EMOJIS[movie.emojiIndex % EMOJIS.length];

  movieRegistry.set(movie.id, movie);
  movieRegistry.set(movie.slug, movie);
  movieRegistry.set(slugify(movie.title), movie);

  return movie;
}
```

- [ ] **Step 3: Jadikan `renderContentSection` async dan berbasis TMDB**

Ganti seluruh fungsi `renderContentSection` dan `renderAllSections`:

```js
function renderSkeletonRow(container, count) {
  container.innerHTML = Array.from({ length: count || 8 }, () => `
    <div class="movie-card skeleton-card">
      <div class="card-poster skeleton-block"></div>
      <div class="card-info">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `).join('');
}

async function renderContentSection(containerId, rowKind, options) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const settings = options || {};
  renderSkeletonRow(container, 8);

  try {
    const movies = await Tmdb.getRow(rowKind, settings);
    const decorated = movies.map(decorateMovie);

    if (decorated.length === 0) {
      container.closest('.content-section')?.classList.add('hidden');
      return;
    }

    container.innerHTML = decorated.map((m) => renderMovieCard(m)).join('');
  } catch (error) {
    container.closest('.content-section')?.classList.add('hidden');
    console.warn(`Baris ${containerId} gagal dimuat:`, error.message);
  }
}

// ID genre TMDB
const GENRE_IDS = { action: 28, horror: 27, animation: 16, drama: 18 };

function renderAllSections() {
  renderContentSection('topview-row', 'trending');
  renderContentSection('trending-row', 'trending', { page: 2 });
  renderContentSection('latest-row', 'top_rated');
  renderContentSection('popular-row', 'genre', { genreId: GENRE_IDS.action });
  renderContentSection('series-row', 'genre', { genreId: GENRE_IDS.drama });
  renderContentSection('kdrama-row', 'genre', { genreId: GENRE_IDS.horror });
  renderContentSection('anime-row', 'genre', { genreId: GENRE_IDS.animation });
  renderContentSection('indonesia-row', 'top_rated', { page: 2 });
}
```

Tiap baris dipanggil tanpa `await` supaya berjalan paralel; kegagalan satu baris hanya menyembunyikan baris itu.

- [ ] **Step 4: Tambahkan gaya skeleton dan kelas `hidden` di `css/style.css`**

Sisipkan di akhir berkas:

```css
/* Skeleton pemuatan baris konten */
.skeleton-card { pointer-events: none; }

.skeleton-block,
.skeleton-line {
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.10) 37%, rgba(255,255,255,0.04) 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
  border-radius: 8px;
}

.skeleton-block { width: 100%; aspect-ratio: 2 / 3; }

.skeleton-line { height: 12px; margin-top: 10px; }
.skeleton-line.short { width: 60%; }

@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.content-section.hidden { display: none; }
```

- [ ] **Step 5: Lepaskan `initRegistry` dari katalog statis**

Ganti isi `initRegistry()` menjadi hanya memuat hero slide:

```js
function initRegistry() {
  heroSlides.forEach((slide) => {
    movieRegistry.set(slide.id, slide);
    movieRegistry.set(slide.slug, slide);
    movieRegistry.set(slugify(slide.title), slide);
  });
}
```

- [ ] **Step 6: Verifikasi di peramban**

Jalankan `npx vercel dev`, buka `http://localhost:3000`.

Yang harus terlihat: skeleton muncul sesaat, lalu delapan baris terisi poster asli dari TMDB. Buka DevTools tab Network, pastikan seluruh permintaan menuju `/api/tmdb/...` dan tidak ada satu pun ke `api.themoviedb.org`. Tab Console harus bersih dari error.

- [ ] **Step 7: Commit**

```bash
git add index.html js/main.js css/style.css
git commit -m "feat: drive homepage rows and registry from live TMDB data"
```

---

## Task 6: Alihkan Pencarian ke TMDB

**Files:**
- Modify: `js/main.js` — blok autocomplete di dalam `initSearch()`

**Interfaces:**
- Consumes: `Tmdb.searchTitles` dari Task 4, `decorateMovie` dari Task 5.
- Produces: tidak ada antarmuka baru.

- [ ] **Step 1: Ganti handler `input` di `initSearch()`**

Blok `input?.addEventListener('input', ...)` sekarang memfilter `movieRegistry`. Ganti seluruh blok itu dengan versi berdebounce yang memanggil TMDB:

```js
  // Live autocomplete lewat TMDB
  let searchTimer = null;
  let searchSequence = 0;

  input?.addEventListener('input', (e) => {
    const raw = e.target.value;
    const query = raw.trim();

    clearTimeout(searchTimer);

    if (query.length < 2) {
      suggestions?.classList.remove('active');
      return;
    }

    const sequence = ++searchSequence;

    searchTimer = setTimeout(async () => {
      if (!suggestions) return;

      suggestions.classList.add('active');
      suggestions.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 14px;">
          Mencari "${raw}"...
        </div>
      `;

      try {
        const results = await Tmdb.searchTitles(query);

        // Abaikan respons yang sudah kedaluwarsa
        if (sequence !== searchSequence) return;

        const top = results.slice(0, 6).map(decorateMovie);

        if (top.length === 0) {
          suggestions.innerHTML = `
            <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 14px;">
              Tidak ditemukan judul untuk "${raw}"
            </div>
          `;
          return;
        }

        suggestions.innerHTML = top.map((m) => `
          <div class="suggestion-item" onclick="openPlayer('${m.id}'); document.getElementById('search-close').click();">
            <div class="suggestion-poster">
              ${m.poster
                ? `<img src="${m.poster}" alt="${m.title}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">`
                : `<div style="width:100%;height:100%;background:${m.gradient};border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:16px;">${m.emoji}</div>`}
            </div>
            <div class="suggestion-info">
              <h4>${m.title}</h4>
              <span>${m.year || '—'} · ${m.genre || 'Film'} · ⭐ ${m.rating || '—'}</span>
            </div>
          </div>
        `).join('');
      } catch (error) {
        if (sequence !== searchSequence) return;
        suggestions.innerHTML = `
          <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 14px;">
            Pencarian gagal. Periksa koneksi lalu coba lagi.
          </div>
        `;
      }
    }, 300);
  });
```

Penjaga `searchSequence` mencegah respons lambat menimpa hasil ketikan yang lebih baru.

- [ ] **Step 2: Verifikasi di peramban**

Jalankan `npx vercel dev`, tekan `Ctrl+K`, ketik `batman` perlahan.

Yang harus terjadi: dropdown menampilkan "Mencari...", lalu hasil TMDB asli dengan poster. Di tab Network, jumlah permintaan `search/multi` jauh lebih sedikit daripada jumlah huruf yang diketik — itu bukti debounce bekerja. Ketik judul acak seperti `zzzzqqq` dan pastikan muncul pesan tidak ditemukan, bukan dropdown kosong.

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: replace local search filter with debounced TMDB search"
```

---

## Task 7: Alihkan Listing dan Halaman Detail

**Files:**
- Modify: `js/main.js` — `getFilteredMovies`, `updateListingGrid`, `handleRoute`, `renderDedicatedDetailView`, `openPlayer`

**Interfaces:**
- Consumes: `Tmdb.getRow`, `Tmdb.searchTitles`, `Tmdb.findBySlug`, `Tmdb.getDetail` dari Task 4; `decorateMovie` dari Task 5.
- Produces: `resolveMovie(idOrSlug: string) => Promise<MovieObject|null>` — dipakai Task 8 untuk memuat panel provider.

- [ ] **Step 1: Tambahkan `resolveMovie`**

Sisipkan sesudah `decorateMovie` di `js/main.js`:

```js
// Mencari objek film dari registry, lalu dari TMDB bila belum ada
async function resolveMovie(idOrSlug) {
  if (!idOrSlug) return null;

  const cached = movieRegistry.get(idOrSlug);
  if (cached && cached.tmdbId) {
    // Lengkapi detail bila objek berasal dari daftar ringkas
    if (!cached.description || !cached.director) {
      try {
        const full = await Tmdb.getDetail(cached.type, cached.tmdbId);
        return decorateMovie(Object.assign({}, cached, full));
      } catch (error) {
        return cached;
      }
    }
    return cached;
  }

  if (cached) return cached;

  const slug = String(idOrSlug).replace(/^(movie|series)-/, '');

  try {
    const found = await Tmdb.findBySlug(slug);
    if (!found) return null;

    const full = await Tmdb.getDetail(found.type, found.tmdbId);
    return decorateMovie(Object.assign({}, found, full));
  } catch (error) {
    return null;
  }
}
```

- [ ] **Step 2: Jadikan `getFilteredMovies` async dan berbasis TMDB**

Fungsi ini sekarang menyaring `movieRegistry`. Ganti seluruh badannya:

```js
async function getFilteredMovies() {
  const state = listingState;

  // Halaman hasil pencarian
  if (state.searchQuery) {
    const results = await Tmdb.searchTitles(state.searchQuery, state.page || 1);
    return results.map(decorateMovie);
  }

  // Halaman genre
  if (state.genreId) {
    const results = await Tmdb.getRow('genre', { genreId: state.genreId, page: state.page || 1 });
    return results.map(decorateMovie);
  }

  // Halaman kategori umum
  const results = await Tmdb.getRow(state.rowKind || 'trending', { page: state.page || 1 });
  return results.map(decorateMovie);
}
```

Sesuaikan `listingState` agar memuat medan baru. Ganti deklarasinya:

```js
let listingState = {
  view: 'listing',
  title: '',
  subtitle: '',
  breadcrumbName: '',
  searchQuery: '',
  genreId: null,
  rowKind: 'trending',
  page: 1,
  totalPages: 1
};
```

Medan `genreId` dan `rowKind` tidak akan pernah terisi kalau router tidak mengisinya. Di dalam `handleRoute()`, tiap cabang yang membuka tampilan listing harus menetapkan ketiga medan sumber data secara eksplisit sebelum memanggil `renderListingView()`.

Tambahkan tabel pemetaan nama genre pada URL ke ID TMDB, letakkan tepat di atas `handleRoute()`:

```js
// Nama genre pada URL dipetakan ke ID genre TMDB
const GENRE_SLUG_TO_ID = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  horror: 27,
  mystery: 9648,
  romance: 10749,
  'sci-fi': 878,
  thriller: 53,
  war: 10752
};
```

Pada cabang rute pencarian, ganti pengisian state menjadi:

```js
    listingState.searchQuery = query;
    listingState.genreId = null;
    listingState.rowKind = null;
    listingState.page = 1;
```

Pada cabang rute genre, isi dengan:

```js
    listingState.searchQuery = '';
    listingState.genreId = GENRE_SLUG_TO_ID[genreSlug] || null;
    listingState.rowKind = null;
    listingState.page = 1;
```

Bila `GENRE_SLUG_TO_ID[genreSlug]` bernilai `null`, panggil `renderNotFoundView()` dan hentikan pemrosesan rute — genre yang tidak dikenal tidak boleh diam-diam berubah menjadi baris trending.

Pada cabang rute kategori umum seperti film, serial, dan halaman terbaru, isi dengan:

```js
    listingState.searchQuery = '';
    listingState.genreId = null;
    listingState.rowKind = 'trending'; // atau 'top_rated' sesuai halaman
    listingState.page = 1;
```

- [ ] **Step 3: Jadikan `updateListingGrid` menunggu data**

Tambahkan `async` pada deklarasinya dan `await` pada pemanggilan `getFilteredMovies()`:

```js
async function updateListingGrid() {
  const grid = document.getElementById('listing-grid');
  if (!grid) return;

  renderSkeletonRow(grid, 12);

  try {
    const movies = await getFilteredMovies();

    if (movies.length === 0) {
      grid.innerHTML = `
        <div class="listing-empty">
          <p>Tidak ada judul yang cocok dengan filter ini.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = movies.map((m) => renderMovieCard(m)).join('');
  } catch (error) {
    grid.innerHTML = `
      <div class="listing-empty">
        <p>Gagal memuat daftar. Periksa koneksi lalu coba lagi.</p>
        <button class="btn-retry" onclick="updateListingGrid()">Coba Lagi</button>
      </div>
    `;
  }
}

window.updateListingGrid = updateListingGrid;
```

Setiap pemanggil `updateListingGrid()` di dalam `changeListingPage`, `removeFilter`, `resetListingFilters`, dan `initListingFilterEvents` tidak perlu diubah — memanggil fungsi async tanpa `await` tetap sah karena hasilnya tidak dipakai.

- [ ] **Step 4: Jadikan `openPlayer` menunggu resolusi film**

Ubah baris pembuka `openPlayer(movieId, ...)`. Yang sekarang berbunyi:

```js
function openPlayer(movieId, episodeIndex = 0, seasonIndex = 0) {
  const movie = movieRegistry.get(movieId);
  if (!movie) return;
```

Ganti menjadi:

```js
async function openPlayer(movieId, episodeIndex = 0, seasonIndex = 0) {
  const movie = await resolveMovie(movieId);
  if (!movie) {
    showToast('Judul tidak ditemukan.', 'error');
    return;
  }
```

Sisa badan fungsi tidak berubah.

- [ ] **Step 5: Jadikan rute detail menunggu resolusi film**

Di dalam `handleRoute()`, bagian yang mencari film dari `movieRegistry` untuk rute detail memanggil `renderDedicatedDetailView(movie)`. Ubah menjadi:

```js
      const movie = await resolveMovie(slug);
      if (!movie) {
        renderNotFoundView();
        return;
      }
      renderDedicatedDetailView(movie);
```

Tambahkan `async` pada deklarasi `handleRoute`:

```js
async function handleRoute() {
```

Pemanggil `handleRoute()` pada listener `popstate` dan `DOMContentLoaded` tidak perlu diubah.

- [ ] **Step 6: Verifikasi di peramban**

Jalankan `npx vercel dev`, lalu periksa berurutan:

1. Klik satu kartu di homepage — modal terbuka dengan judul, sinopsis, sutradara, dan pemeran asli.
2. Buka halaman genre lewat menu — grid terisi, pagination bekerja.
3. Salin URL halaman detail, buka di tab baru — halaman tetap termuat lewat jalur `findBySlug`.
4. Buka URL detail karangan seperti `/movie/judul-tidak-ada-2030` — muncul tampilan tidak ditemukan, bukan halaman kosong.

- [ ] **Step 7: Commit**

```bash
git add js/main.js
git commit -m "feat: resolve listing, detail, and player views from TMDB"
```

---

## Task 8: Ganti Pemutar dengan Panel "Nonton di"

**Files:**
- Modify: `index.html` — blok pemutar modal dan blok pemutar detail
- Modify: `js/main.js` — hapus `STREAM_SERVERS` dan `getStreamEmbedUrl`, ganti fungsi pemuat iframe, ganti badge kualitas
- Modify: `css/style.css` — gaya panel provider

**Interfaces:**
- Consumes: `Tmdb.getProviders` dari Task 4; objek film hasil `resolveMovie` yang sudah dipegang `openPlayer` dan `renderDedicatedDetailView` sejak Task 7.
- Produces: `renderProviderPanel(containerId, movie) => Promise<void>`

- [ ] **Step 1: Hapus generator embed**

Hapus seluruh blok dari komentar `STREAMING CONTROLLER & EMBED GENERATOR` sampai akhir fungsi `getStreamEmbedUrl` — yaitu konstanta `STREAM_SERVERS` beserta fungsi `getStreamEmbedUrl`. Keduanya tidak lagi dipakai.

Hapus juga fungsi `renderModalServerButtons`, `renderDetailServerButtons`, `switchPlayerServer`, `switchDetailServer`, dan `tryAlternateServer`, berikut variabel `activeServerIndex` dan `detailServerIndex`.

- [ ] **Step 2: Ganti markup tombol server di `index.html`**

Pada baris 1027 terdapat:

```html
          <div class="server-buttons-grid" id="player-server-buttons">
```

Ganti seluruh elemen itu beserta isinya dengan:

```html
          <div class="provider-panel" id="player-provider-panel"></div>
```

Lakukan hal yang sama pada baris 731 untuk tampilan detail:

```html
          <div class="provider-panel" id="detail-provider-panel"></div>
```

- [ ] **Step 3: Tulis `renderProviderPanel`**

Sisipkan di `js/main.js` menggantikan blok generator embed yang dihapus:

```js
// ==========================================
// PANEL KETERSEDIAAN LAYANAN STREAMING
// ==========================================

function renderProviderGroup(label, list) {
  if (!list || list.length === 0) return '';

  return `
    <div class="provider-group">
      <h4 class="provider-group-title">${label}</h4>
      <div class="provider-logos">
        ${list.map((p) => `
          <div class="provider-logo" title="${p.name}">
            <img src="${p.logo}" alt="${p.name}" loading="lazy">
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function renderProviderPanel(containerId, movie) {
  const container = document.getElementById(containerId);
  if (!container || !movie) return;

  container.innerHTML = `<p class="provider-loading">Memeriksa ketersediaan...</p>`;

  if (!movie.tmdbId) {
    container.innerHTML = `<p class="provider-empty">Data ketersediaan tidak tersedia untuk judul ini.</p>`;
    return;
  }

  let providers;
  try {
    providers = await Tmdb.getProviders(movie.type, movie.tmdbId);
  } catch (error) {
    container.innerHTML = `
      <p class="provider-empty">Gagal memuat ketersediaan.</p>
      <button class="btn-retry" onclick="renderProviderPanel('${containerId}', movieRegistry.get('${movie.id}'))">Coba Lagi</button>
    `;
    return;
  }

  const groups = [
    renderProviderGroup('Langganan', providers.flatrate),
    renderProviderGroup('Sewa', providers.rent),
    renderProviderGroup('Beli', providers.buy)
  ].join('');

  if (!groups) {
    container.innerHTML = `
      <p class="provider-empty">
        "${movie.title}" belum tersedia di layanan streaming Indonesia.
      </p>
    `;
    return;
  }

  container.innerHTML = `
    <h3 class="provider-heading">Nonton di</h3>
    ${groups}
    ${providers.link ? `
      <a class="provider-cta" href="${providers.link}" target="_blank" rel="noopener noreferrer">
        Buka opsi menonton
      </a>
    ` : ''}
    <p class="provider-note">Data ketersediaan disediakan JustWatch melalui TMDB.</p>
  `;
}

window.renderProviderPanel = renderProviderPanel;
```

- [ ] **Step 4: Jadikan pemutar hanya memutar trailer**

Ganti seluruh badan `loadPlayerIframe()`:

```js
function loadPlayerIframe() {
  if (!activeMovie) return;

  const iframe = document.getElementById('video-player-iframe');
  const loader = document.getElementById('player-iframe-loader');
  const overlay = document.getElementById('player-unavailable-overlay');
  const overlayMsg = document.getElementById('modal-unavailable-msg');

  if (!iframe) return;

  if (!activeMovie.trailerUrl) {
    if (loader) loader.classList.add('hidden');
    iframe.src = 'about:blank';
    if (overlay) {
      overlay.style.display = 'flex';
      if (overlayMsg) {
        overlayMsg.textContent = `Trailer resmi untuk "${activeMovie.title}" belum tersedia. Silakan lihat opsi menonton di bawah.`;
      }
    }
    return;
  }

  if (overlay) overlay.style.display = 'none';
  if (loader) loader.classList.remove('hidden');

  iframe.src = activeMovie.trailerUrl;

  iframe.onload = () => {
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
    }, 400);
  };

  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
  }, 2200);
}
```

Ganti pula seluruh badan `loadDetailPlayerIframe()`. Fungsi ini memakai elemen dan variabel state yang berbeda, jadi kodenya ditulis penuh di sini:

```js
function loadDetailPlayerIframe() {
  if (!detailActiveMovie) return;

  const iframe = document.getElementById('detail-player-iframe');
  const loader = document.getElementById('detail-iframe-loader');
  const overlay = document.getElementById('detail-unavailable-overlay');
  const overlayMsg = document.getElementById('detail-unavailable-msg');

  if (!iframe) return;

  if (!detailActiveMovie.trailerUrl) {
    if (loader) loader.classList.add('hidden');
    iframe.src = 'about:blank';
    if (overlay) {
      overlay.style.display = 'flex';
      if (overlayMsg) {
        overlayMsg.textContent = `Trailer resmi untuk "${detailActiveMovie.title}" belum tersedia. Silakan lihat opsi menonton di bawah.`;
      }
    }
    return;
  }

  if (overlay) overlay.style.display = 'none';
  if (loader) loader.classList.remove('hidden');

  iframe.src = detailActiveMovie.trailerUrl;

  iframe.onload = () => {
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
    }, 400);
  };

  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
  }, 2200);
}
```

Variabel `detailPlayingTrailer` dan `modalPlayingTrailer` kini tidak punya arti — pemutar hanya pernah memutar trailer. Hapus keduanya beserta fungsi `playOfficialTrailer()` yang mengatur keduanya, lalu hapus juga tombol pemicunya di `index.html` bila ada.

- [ ] **Step 5: Panggil panel provider saat modal dan detail dibuka**

Di dalam `openPlayer()`, sesudah `loadPlayerIframe()` dipanggil, tambahkan:

```js
  renderProviderPanel('player-provider-panel', movie);
```

Di dalam `renderDedicatedDetailView()`, sesudah pemutar detail disiapkan, tambahkan:

```js
  renderProviderPanel('detail-provider-panel', movie);
```

- [ ] **Step 6: Ganti badge kualitas menjadi rating**

Di `renderMovieCard()`, baris berikut memakai medan `quality` yang sudah tidak ada:

```js
        <span class="card-badge-quality">${movie.quality}</span>
```

Ganti menjadi:

```js
        ${movie.rating ? `<span class="card-badge-quality">⭐ ${movie.rating}</span>` : ''}
```

Baris `card-badge-rating` di bawahnya kini menduplikasi informasi yang sama. Hapus baris itu:

```js
        <span class="card-badge-rating"><span class="star">⭐</span> ${movie.rating}</span>
```

- [ ] **Step 7: Tambahkan gaya panel provider di `css/style.css`**

Sisipkan di akhir berkas:

```css
/* Panel ketersediaan layanan streaming */
.provider-panel { padding: 20px 0; }

.provider-heading {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.provider-group { margin-bottom: 18px; }

.provider-group-title {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.provider-logos { display: flex; flex-wrap: wrap; gap: 12px; }

.provider-logo {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
}

.provider-logo img { width: 100%; height: 100%; object-fit: cover; }

.provider-cta {
  display: inline-block;
  margin-top: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  background: var(--accent, #e50914);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
}

.provider-note,
.provider-empty,
.provider-loading {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 12px;
}

.btn-retry {
  margin-top: 10px;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
```

- [ ] **Step 8: Verifikasi di peramban**

Jalankan `npx vercel dev`, lalu periksa:

1. Buka judul populer — trailer resmi diputar, di bawahnya muncul logo provider berkelompok.
2. Klik "Buka opsi menonton" — tab baru terbuka ke JustWatch.
3. Buka judul lama atau obscure yang tidak tersedia di Indonesia — muncul pesan belum tersedia, bukan panel kosong.
4. Cari di seluruh kode, pastikan tidak ada sisa host embed:

```bash
grep -rn "vidsrc\|autoembed\|2embed" js/ index.html
```

Expected: tidak ada keluaran.

- [ ] **Step 9: Commit**

```bash
git add index.html js/main.js css/style.css
git commit -m "feat: replace embed players with official trailer and provider panel"
```

---

## Task 9: Hapus Katalog Statis, Tambah Atribusi, Verifikasi Akhir

**Files:**
- Delete: `js/movies-data.js`, `idlix_movies_db.json`, `download_all_posters.js`, `download_helper.js`, `fetch_posters.js`, `get_wiki_posters.js`, `test_candidates.js`, `test_remaining.js`, `wiki_posters.json`, `scraped_posters.json`
- Modify: `index.html` — tag script dan footer
- Modify: `js/main.js` — bersihkan sisa rujukan katalog statis

**Interfaces:**
- Consumes: seluruh task sebelumnya.
- Produces: tidak ada antarmuka baru.

- [ ] **Step 1: Hapus rujukan katalog statis dari `js/main.js`**

Cari seluruh rujukan yang tersisa:

```bash
grep -n "IDLIX_DATABASE\|TOP_VIEW_DATABASE\|MOVIE_POSTER_MAP\|getPosterForMovie\|generateMovies\|idlixUrl" js/main.js
```

Hapus konstanta `TOP_VIEW_DATABASE`, `MOVIE_POSTER_MAP`, fungsi `getPosterForMovie`, dan fungsi `generateMovies` seluruhnya. Keempatnya hanya melayani katalog statis.

Konstanta `rickAndMorty` dan `rickAndMortySeasons` juga merupakan data contoh yang ditanam manual — hapus keduanya, berikut cabang di `generateMovies` yang merujuknya.

`heroSlides` tetap dipertahankan karena memakai gambar lokal di `assets/hero/` dan tidak bergantung TMDB.

- [ ] **Step 2: Hapus tag script katalog statis di `index.html`**

Hapus baris:

```html
  <script src="js/movies-data.js"></script>
```

Sisakan tiga tag: `js/tmdb-map.js`, `js/tmdb.js`, `js/main.js`.

- [ ] **Step 3: Tambahkan atribusi TMDB di footer**

Di dalam elemen `<footer class="footer">`, tepat sebelum `</footer>`, sisipkan:

```html
    <div class="tmdb-attribution">
      <img
        src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
        alt="The Movie Database"
        width="130"
        height="12"
        loading="lazy">
      <p>
        Produk ini memakai API TMDB namun tidak didukung maupun disertifikasi oleh TMDB.
      </p>
    </div>
```

Tambahkan gayanya di akhir `css/style.css`:

```css
.tmdb-attribution {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 24px 0 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 24px;
}

.tmdb-attribution p {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  margin: 0;
}
```

- [ ] **Step 4: Hapus berkas katalog dan skrip scraper**

```bash
git rm js/movies-data.js idlix_movies_db.json download_all_posters.js download_helper.js fetch_posters.js get_wiki_posters.js test_candidates.js test_remaining.js wiki_posters.json scraped_posters.json
```

- [ ] **Step 5: Jalankan seluruh test**

Run: `npm test`
Expected: PASS, seluruh test dari lima berkas test lulus

- [ ] **Step 6: Verifikasi menyeluruh di peramban**

Jalankan `npx vercel dev` lalu telusuri secara berurutan:

1. Homepage — delapan baris terisi, hero slider berjalan.
2. Pencarian `Ctrl+K` — hasil TMDB muncul, judul tak dikenal memunculkan pesan kosong.
3. Halaman genre — grid dan pagination bekerja.
4. Halaman detail lewat klik kartu, lalu lewat URL langsung di tab baru.
5. Modal pemutar — trailer diputar, panel provider terisi.
6. Footer — logo dan pernyataan atribusi TMDB terlihat.
7. Tab Console bersih dari error.
8. Tab Network — seluruh permintaan data menuju `/api/tmdb/`, tidak ada satu pun ke `api.themoviedb.org`.

Pastikan tidak ada sisa rujukan katalog statis:

```bash
grep -rn "IDLIX_DATABASE\|idlix_movies_db\|movies-data" js/ index.html
```

Expected: tidak ada keluaran.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: remove static catalog and scrapers, add required TMDB attribution"
```

- [ ] **Step 8: Siapkan environment produksi**

Sebelum deploy, pemilik proyek menambahkan `TMDB_API_KEY` di dashboard Vercel pada Project Settings, Environment Variables, untuk environment Production dan Preview. Tanpa itu, proxy mengembalikan 500 dengan pesan konfigurasi.

---

## Catatan Verifikasi Akhir

Pekerjaan dianggap selesai hanya bila seluruh butir berikut terbukti, bukan diasumsikan:

- `npm test` lulus seluruhnya.
- `grep -rn "vidsrc\|autoembed\|2embed" js/ index.html` tidak menghasilkan keluaran.
- `grep -rn "IDLIX_DATABASE\|movies-data" js/ index.html` tidak menghasilkan keluaran.
- Tab Network menunjukkan nol permintaan langsung ke `api.themoviedb.org`.
- Atribusi TMDB terlihat di footer.
- Halaman detail dapat dibuka langsung lewat URL di tab baru.
