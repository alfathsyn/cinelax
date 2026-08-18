const https = require('https');

const candidates = {
  "Deadpool & Wolverine": [
    "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    "https://image.tmdb.org/t/p/original/yDHYTjiQxDczBhZMB3KuN9f7QYc.jpg"
  ],
  "Gladiator II": [
    "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    "https://image.tmdb.org/t/p/original/euYIWhBvda9L9tQd2q0nE40P4U4.jpg"
  ],
  "The Batman": [
    "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg"
  ],
  "Avatar: Way of Water": [
    "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    "https://image.tmdb.org/t/p/original/vL5LR6WdxWPjC00rW1IRqW5b44m.jpg"
  ],
  "Spider-Man: Across the Spider-Verse": [
    "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg"
  ],
  "Squid Game": [
    "https://image.tmdb.org/t/p/w500/oaGvjB0DvdhXhOAuADfHb261ZHa.jpg"
  ]
};

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

(async () => {
  for (const [title, urls] of Object.entries(candidates)) {
    for (const u of urls) {
      const ok = await checkUrl(u);
      console.log(title, ':', ok ? 'OK' : 'FAIL', '->', u);
    }
  }
})();
