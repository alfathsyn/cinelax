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
