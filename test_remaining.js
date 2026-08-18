const https = require('https');

const tests = [
  { key: 'wednesday', lang: 'id', query: 'Wednesday (seri televisi)' },
  { key: 'severance', lang: 'en', query: 'Severance (TV series)' },
  { key: 'sri-asih', lang: 'id', query: 'Sri Asih (film 2022)' },
  { key: 'sri-asih-alt', lang: 'id', query: 'Sri Asih' },
  { key: 'sweet-home', lang: 'en', query: 'Sweet Home (TV series)' },
  { key: 'sweet-home-alt', lang: 'id', query: 'Sweet Home (seri televisi Korea Selatan)' },
  { key: 'bleach', lang: 'en', query: 'Bleach: Thousand-Year Blood War' }
];

function fetchWiki(lang, query) {
  return new Promise((resolve) => {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/` + encodeURIComponent(query);
    https.get(url, { headers: { 'User-Agent': 'Cinelax/1.0' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          resolve(j.originalimage?.source || j.thumbnail?.source || null);
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  for (const t of tests) {
    const img = await fetchWiki(t.lang, t.query);
    console.log(t.key, '=>', img);
  }
})();
