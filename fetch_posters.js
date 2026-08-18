const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (err) => {
      resolve('');
    });
  });
}

async function searchMovie(title) {
  const html = await fetchUrl('https://z2.idlixku.com/?s=' + encodeURIComponent(title));
  // Look for articles or items
  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi;
  let match;
  const results = [];
  while ((match = regex.exec(html)) !== null) {
    const src = match[1];
    const alt = match[2];
    if (src.includes('wp-content/uploads') || src.includes('image.tmdb.org') || src.includes('.jpg') || src.includes('.png') || src.includes('.webp')) {
      results.push({ src, alt });
    }
  }
  return results;
}

async function main() {
  const titles = [
    'Avatar',
    'Superman',
    'Squid Game',
    'Avengers',
    'Demon Slayer',
    'Rick and Morty',
    'Deadpool',
    'Stranger Things',
    'The Last of Us',
    'Gladiator',
    'Wednesday',
    'Batman',
    'Spider-Man',
    'Jurassic World',
    'Mickey 17',
    'Fantastic Four',
    'Captain America',
    'Ballerina',
    '28 Years Later',
    'Tron',
    'House of the Dragon',
    'Peacemaker',
    'Severance',
    'The Boys',
    'Euphoria',
    'All of Us Are Dead',
    'Moving',
    'Sweet Home',
    'Queen of Tears',
    'Vincenzo',
    'Solo Leveling',
    'Chainsaw Man',
    'Jujutsu Kaisen',
    'Bleach',
    'One Piece',
    'Spy x Family',
    'Kaiju No. 8',
    'Dandadan',
    'Attack on Titan',
    'Pengabdi Setan',
    'Siksa Kubur',
    'KKN di Desa Penari',
    'Gundala',
    'Sri Asih',
    'Petualangan Sherina',
    'Dilan',
    'Bumi Manusia',
    'The Big 4',
    'Agak Laen'
  ];

  const posterMap = {};
  for (const t of titles) {
    const res = await searchMovie(t);
    if (res.length > 0) {
      posterMap[t] = res[0].src;
      console.log(t, '=>', res[0].src);
    } else {
      console.log(t, '=> Not found');
    }
  }

  fs.writeFileSync('c:\\LOCAL ALFATH\\cinelax\\scraped_posters.json', JSON.stringify(posterMap, null, 2));
  console.log('Saved to scraped_posters.json');
}

main();
