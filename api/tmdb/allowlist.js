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
  'vote_count.gte',
  'with_origin_country',
  'with_original_language'
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
