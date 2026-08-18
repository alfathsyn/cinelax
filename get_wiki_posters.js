const https = require('https');
const fs = require('fs');

const titles = [
  { key: 'avatar-fire-and-ash-2025', query: 'Avatar: Fire and Ash' },
  { key: 'superman-2025', query: 'Superman (2025 film)' },
  { key: 'avengers-doomsday-2026', query: 'Avengers: Doomsday' },
  { key: 'demon-slayer-infinity-castle-2025', query: 'Demon Slayer: Kimetsu no Yaiba – The Movie: Infinity Castle' },
  { key: 'squid-game-s2-2025', query: 'Squid Game season 2' },
  { key: 'rick-and-morty-2025', query: 'Rick and Morty' },
  { key: 'deadpool-wolverine-2024', query: 'Deadpool & Wolverine' },
  { key: 'gladiator-2-2024', query: 'Gladiator II' },
  { key: 'the-batman-part-ii-2026', query: 'The Batman – Part II' },
  { key: 'spider-man-beyond-spider-verse-2026', query: 'Spider-Man: Beyond the Spider-Verse' },
  { key: 'fantastic-four-first-steps-2025', query: 'The Fantastic Four: First Steps' },
  { key: 'captain-america-brave-new-world-2025', query: 'Captain America: Brave New World' },
  { key: 'jurassic-world-rebirth-2025', query: 'Jurassic World Rebirth' },
  { key: 'mickey-17-2025', query: 'Mickey 17' },
  { key: 'ballerina-2025', query: 'Ballerina (2025 film)' },
  { key: '28-years-later-2025', query: '28 Years Later' },
  { key: 'tron-ares-2025', query: 'Tron: Ares' },
  { key: 'stranger-things-s5-2025', query: 'Stranger Things season 5' },
  { key: 'the-last-of-us-s2-2025', query: 'The Last of Us season 2' },
  { key: 'wednesday-s2-2025', query: 'Wednesday (TV series)' },
  { key: 'house-of-the-dragon-s3-2026', query: 'House of the Dragon season 2' },
  { key: 'the-boys-s5-2025', query: 'The Boys (TV series)' },
  { key: 'peacemaker-s2-2025', query: 'Peacemaker (TV series)' },
  { key: 'severance-s2-2025', query: 'Severance (TV series)' },
  { key: 'euphoria-s3-2025', query: 'Euphoria (American TV series)' },
  { key: 'all-of-us-are-dead-s2-2025', query: 'All of Us Are Dead' },
  { key: 'moving-s2-2025', query: 'Moving (South Korean TV series)' },
  { key: 'sweet-home-s3-2024', query: 'Sweet Home (TV series)' },
  { key: 'queen-of-tears-2024', query: 'Queen of Tears' },
  { key: 'vincenzo-2021', query: 'Vincenzo (TV series)' },
  { key: 'solo-leveling-s2-2025', query: 'Solo Leveling' },
  { key: 'chainsaw-man-reze-arc-2025', query: 'Chainsaw Man – The Movie: Reze Arc' },
  { key: 'jujutsu-kaisen-culling-game-2025', query: 'Jujutsu Kaisen' },
  { key: 'bleach-thousand-year-blood-war-p3-2024', query: 'Bleach: Thousand-Year Blood War' },
  { key: 'one-piece-egghead-arc-2024', query: 'One Piece (TV series)' },
  { key: 'spy-x-family-s3-2025', query: 'Spy × Family' },
  { key: 'kaiju-no-8-s2-2025', query: 'Kaiju No. 8' },
  { key: 'dandadan-2024', query: 'Dandadan' },
  { key: 'pengabdi-setan-3-2025', query: 'Satan\'s Slaves 2: Communion' },
  { key: 'siksa-kubur-2024', query: 'Grave Torture (film)' },
  { key: 'agak-laen-2-2025', query: 'Agak Laen (film)' },
  { key: 'kkn-desa-penari-luwih-dowo-2023', query: 'KKN di Desa Penari' },
  { key: 'gundala-2-2025', query: 'Gundala (film)' },
  { key: 'sri-asih-2022', query: 'Sri Asih (film)' },
  { key: 'petualangan-sherina-2-2023', query: 'Sherina\'s Adventure 2' }
];

function fetchWikiImage(query) {
  return new Promise((resolve) => {
    const url = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(query);
    https.get(url, {
      headers: {
        'User-Agent': 'CinelaxMovieApp/1.0 (contact: support@cinelax.id)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          resolve(j.originalimage?.source || j.thumbnail?.source || null);
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  const results = {};
  for (const item of titles) {
    const img = await fetchWikiImage(item.query);
    results[item.key] = img;
    console.log(item.key, '=>', img ? 'FOUND: ' + img.substring(0, 70) + '...' : 'NOT FOUND');
  }
  fs.writeFileSync('c:\\LOCAL ALFATH\\cinelax\\wiki_posters.json', JSON.stringify(results, null, 2));
  console.log('Saved all to wiki_posters.json');
})();
