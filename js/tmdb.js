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

  async function getCombinedGenreLookup() {
    const [movieGenres, tvGenres] = await Promise.all([
      getGenreLookup('movie'),
      getGenreLookup('tv')
    ]);
    return Object.assign({}, movieGenres, tvGenres);
  }

  async function searchTitles(query, page) {
    if (!query || query.trim().length < 2) return [];

    const [data, genreLookup] = await Promise.all([
      fetchTmdb('search/multi', { query: query.trim(), page: page || 1 }),
      getCombinedGenreLookup()
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
    let isMixedMedia = false;
    let isTv = false;

    if (kind === 'trending') {
      path = 'trending/all/week';
      params = { page: settings.page || 1 };
      isMixedMedia = true;
    } else if (kind === 'top_rated') {
      path = 'discover/movie';
      params = { sort_by: 'vote_average.desc', 'vote_count.gte': MIN_VOTES, page: settings.page || 1 };
    } else if (kind === 'genre') {
      path = 'discover/movie';
      params = {
        with_genres: settings.genreId,
        sort_by: 'popularity.desc',
        page: settings.page || 1,
        with_origin_country: settings.with_origin_country,
        with_original_language: settings.with_original_language
      };
    } else if (kind === 'tv') {
      path = 'discover/tv';
      params = {
        with_genres: settings.genreId,
        sort_by: 'popularity.desc',
        page: settings.page || 1,
        with_origin_country: settings.with_origin_country,
        with_original_language: settings.with_original_language
      };
      isTv = true;
    } else {
      throw new Error(`Jenis baris tidak dikenal: ${kind}`);
    }

    const [data, genreLookup] = await Promise.all([
      fetchTmdb(path, params),
      isMixedMedia ? getCombinedGenreLookup() : getGenreLookup(isTv ? 'tv' : 'movie')
    ]);

    return (data.results || [])
      .filter((item) => item.media_type !== 'person')
      .map((item) => map.mapTitle(item, { genreLookup }));
  }

  const MAX_TMDB_PAGE = 500;

  // Versi getRow yang mengembalikan data pager (page/totalPages/totalResults)
  // alih-alih hanya array. Ditambahkan di samping getRow, bukan menggantinya:
  // renderContentSection (Task 5) memanggil getRow dan mengandalkan nilai
  // kembaliannya berupa array — mengubah bentuk itu akan merusaknya diam-diam.
  async function getRowPaged(kind, options) {
    const settings = options || {};
    const isTv = kind === 'tv';
    const mediaType = isTv ? 'tv' : 'movie';

    let path;
    const params = { page: settings.page || 1 };

    if (kind === 'trending') {
      path = 'trending/all/week';
    } else if (kind === 'genre' || kind === 'top_rated' || isTv) {
      // 'top_rated' (dipakai /movies) lewat cabang discover yang sama dengan
      // 'genre' supaya genreId/country/year benar-benar diterapkan, bukan
      // diabaikan seperti sebelumnya. sort_by=vote_average.desc dan floor
      // vote_count tetap jadi default "top rated" HANYA selama pengguna
      // belum memilih sortir sendiri lewat toolbar filter.
      path = `discover/${mediaType}`;
      if (settings.genreId) params.with_genres = settings.genreId;
      if (settings.sortBy) {
        params.sort_by = settings.sortBy;
      } else if (kind === 'top_rated') {
        params.sort_by = 'vote_average.desc';
        params['vote_count.gte'] = MIN_VOTES;
      }
      if (settings.country) params.with_origin_country = settings.country;
      if (settings.language) params.with_original_language = settings.language;
      if (settings.year) {
        if (isTv) params.first_air_date_year = settings.year;
        else params.primary_release_year = settings.year;
      }
    } else {
      throw new Error(`Jenis baris tidak dikenal: ${kind}`);
    }

    const [data, genreLookup] = await Promise.all([
      fetchTmdb(path, params),
      kind === 'trending' ? getCombinedGenreLookup() : getGenreLookup(mediaType)
    ]);

    const items = (data.results || [])
      .filter((item) => item.media_type !== 'person')
      .map((item) => map.mapTitle(item, { genreLookup }));

    return {
      items,
      page: data.page || 1,
      totalPages: Math.min(data.total_pages || 1, MAX_TMDB_PAGE),
      totalResults: data.total_results || 0
    };
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
    getRowPaged,
    findBySlug,
    clearCache
  };
});
