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

test('mapTitle menjaga gradientIndex tetap dalam rentang GRADIENTS (0-19)', () => {
  const ids = [0, 1, 2, 11, 12, 13, 19, 20, 21, 550, 60625, 999999, 123456789];
  ids.forEach((id) => {
    const result = map.mapTitle({ id }, {});
    assert.ok(result.gradientIndex >= 0 && result.gradientIndex <= 19, `gradientIndex untuk id ${id} di luar rentang: ${result.gradientIndex}`);
  });
});
