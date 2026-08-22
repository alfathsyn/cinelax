'use strict';

const test = require('node:test');
const assert = require('node:assert');

const {
  isAllowedPath,
  resolveLanguage,
  filterQuery,
  cacheControlFor,
  buildUpstreamUrl,
  isTrustedOrigin
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

test('filterQuery meneruskan with_origin_country dan with_original_language, membuang parameter tak dikenal', () => {
  const result = filterQuery({
    with_origin_country: 'KR',
    with_original_language: 'id',
    with_unknown_param: 'harus-hilang',
    api_key: 'bocor'
  });
  assert.deepStrictEqual(result, { with_origin_country: 'KR', with_original_language: 'id' });
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

test('filterQuery meneruskan parameter filter listing', () => {
  const result = filterQuery({
    primary_release_year: '2024',
    first_air_date_year: '2023',
    with_origin_country: 'KR',
    with_original_language: 'id',
    sort_by: 'vote_average.desc',
    with_genres: '28',
    jahat: 'buang'
  });

  assert.strictEqual(result.primary_release_year, '2024');
  assert.strictEqual(result.first_air_date_year, '2023');
  assert.strictEqual(result.with_origin_country, 'KR');
  assert.strictEqual(result.sort_by, 'vote_average.desc');
  assert.strictEqual(result.jahat, undefined);
});

test('isTrustedOrigin meloloskan bila tidak ada header Origin/Referer sama sekali', () => {
  assert.strictEqual(isTrustedOrigin({ headers: { host: 'cinelax.vercel.app' } }), true);
  assert.strictEqual(isTrustedOrigin({}), true);
});

test('isTrustedOrigin meloloskan permintaan same-origin lewat Origin atau Referer', () => {
  assert.strictEqual(isTrustedOrigin({
    headers: { host: 'cinelax.vercel.app', origin: 'https://cinelax.vercel.app' }
  }), true);
  assert.strictEqual(isTrustedOrigin({
    headers: { host: 'cinelax.vercel.app', referer: 'https://cinelax.vercel.app/movies' }
  }), true);
});

test('isTrustedOrigin menolak host pihak ketiga di Origin/Referer', () => {
  assert.strictEqual(isTrustedOrigin({
    headers: { host: 'cinelax.vercel.app', origin: 'https://situs-lain.com' }
  }), false);
  assert.strictEqual(isTrustedOrigin({
    headers: { host: 'cinelax.vercel.app', referer: 'https://situs-lain.com/curi-kuota' }
  }), false);
});

test('isTrustedOrigin meloloskan localhost untuk pengembangan lokal', () => {
  assert.strictEqual(isTrustedOrigin({
    headers: { host: 'localhost:3000', origin: 'http://localhost:5173' }
  }), true);
});
