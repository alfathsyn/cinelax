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
  const GRADIENT_COUNT = 20;
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
