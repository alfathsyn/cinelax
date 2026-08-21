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
