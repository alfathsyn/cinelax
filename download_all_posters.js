const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const posters = {
  // Top View & Hero
  "avatar-fire-and-ash-2025": "https://upload.wikimedia.org/wikipedia/en/9/95/Avatar_Fire_and_Ash_poster.jpeg",
  "superman-2025": "https://upload.wikimedia.org/wikipedia/en/3/32/Superman_%282025_film%29_poster.jpg",
  "avengers-doomsday-2026": "https://upload.wikimedia.org/wikipedia/en/e/ee/Avengers_Doomsday_poster.jpg",
  "demon-slayer-infinity-castle-2025": "https://upload.wikimedia.org/wikipedia/en/a/ae/Kimetsu_No_Yaiba_Mugen_Jyo-hen_theatrical_poster.jpg",
  "squid-game-s2-2025": "https://upload.wikimedia.org/wikipedia/en/3/38/Squid_Game_season_2_poster.png",
  "rick-and-morty-2025": "https://upload.wikimedia.org/wikipedia/en/6/6e/Rick_and_Morty_season_7.jpg",
  
  // Trending & Populer
  "deadpool-wolverine-2024": "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
  "gladiator-2-2024": "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
  "the-batman-part-ii-2026": "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
  "spider-man-beyond-spider-verse-2026": "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
  "fantastic-four-first-steps-2025": "https://upload.wikimedia.org/wikipedia/en/1/13/The_Fantastic_Four_First_Steps_poster.jpg",
  "captain-america-brave-new-world-2025": "https://upload.wikimedia.org/wikipedia/en/a/a4/Captain_America_Brave_New_World_poster.jpg",
  "jurassic-world-rebirth-2025": "https://upload.wikimedia.org/wikipedia/en/a/a5/Jurassic_World_Rebirth_poster.jpg",
  "mickey-17-2025": "https://upload.wikimedia.org/wikipedia/en/2/2d/Mickey_17_film_poster.png",
  "ballerina-2025": "https://upload.wikimedia.org/wikipedia/en/f/f6/Ballerina_%282025_film%29_poster.jpg",
  "28-years-later-2025": "https://upload.wikimedia.org/wikipedia/en/3/38/28_Years_Later_film_poster.jpg",
  "tron-ares-2025": "https://upload.wikimedia.org/wikipedia/en/0/06/Tron_Ares_poster.jpg",

  // Series
  "stranger-things-s5-2025": "https://upload.wikimedia.org/wikipedia/en/b/be/Stranger_Things_season_5.jpeg",
  "the-last-of-us-s2-2025": "https://upload.wikimedia.org/wikipedia/en/d/d9/The_Last_of_Us_season_2_Blu-ray.png",
  "wednesday-s2-2025": "https://upload.wikimedia.org/wikipedia/en/b/ba/Wednesday_%28TV_series%29_poster.jpg",
  "house-of-the-dragon-s3-2026": "https://upload.wikimedia.org/wikipedia/en/3/3d/House_of_the_Dragon_season_2.png",
  "the-boys-s5-2025": "https://upload.wikimedia.org/wikipedia/en/1/1d/The_Boys_season_4_poster.jpg",
  "peacemaker-s2-2025": "https://upload.wikimedia.org/wikipedia/en/a/a0/Peacemaker_%28TV_series%29_logo.jpg",
  "severance-s2-2025": "https://upload.wikimedia.org/wikipedia/en/0/07/Severance_TV_series_poster.jpg",
  "euphoria-s3-2025": "https://upload.wikimedia.org/wikipedia/en/a/a3/Euphoria_season_2_poster.png",

  // Drama Korea
  "all-of-us-are-dead-s2-2025": "https://upload.wikimedia.org/wikipedia/en/2/24/All_of_Us_Are_Dead.jpeg",
  "moving-s2-2025": "https://upload.wikimedia.org/wikipedia/en/f/f2/Moving_%28South_Korean_TV_series%29.png",
  "sweet-home-s3-2024": "https://upload.wikimedia.org/wikipedia/en/f/f7/Sweet_Home_-_TV_series_%28title_card%29.png",
  "queen-of-tears-2024": "https://upload.wikimedia.org/wikipedia/en/e/e2/Queen_of_Tears_poster.png",
  "vincenzo-2021": "https://upload.wikimedia.org/wikipedia/en/5/5b/Vincenzo_TV_series.jpg",

  // Anime
  "solo-leveling-s2-2025": "https://upload.wikimedia.org/wikipedia/en/6/6c/Solo_Leveling_Volume_1_Cover.jpg",
  "chainsaw-man-reze-arc-2025": "https://upload.wikimedia.org/wikipedia/en/9/95/Chainsaw_Man_Reze_Arc_movie_poster.jpg",
  "jujutsu-kaisen-culling-game-2025": "https://upload.wikimedia.org/wikipedia/en/4/46/Jujutsu_kaisen.jpg",
  "bleach-thousand-year-blood-war-p3-2024": "https://upload.wikimedia.org/wikipedia/en/7/7b/Bleach_Thousand-Year_Blood_War_key_visual.jpg",
  "one-piece-egghead-arc-2024": "https://upload.wikimedia.org/wikipedia/en/2/21/One_Piece_DVD_21.png",
  "spy-x-family-s3-2025": "https://upload.wikimedia.org/wikipedia/en/5/51/Spy_Family_vol_1.jpg",
  "kaiju-no-8-s2-2025": "https://upload.wikimedia.org/wikipedia/en/c/cd/Kaiju_No_8.jpg",
  "dandadan-2024": "https://upload.wikimedia.org/wikipedia/en/f/f2/Dandadan_vol._1_cover.jpg",

  // Film Indonesia
  "pengabdi-setan-3-2025": "https://upload.wikimedia.org/wikipedia/en/0/0b/Satan%27s_Slaves_2_-_Communion.jpg",
  "siksa-kubur-2024": "https://upload.wikimedia.org/wikipedia/id/b/bf/Poster_Siksa_Kubur.jpg",
  "agak-laen-2-2025": "https://upload.wikimedia.org/wikipedia/id/0/01/Poster_Agak_Laen_%282024%29.jpg",
  "kkn-desa-penari-luwih-dowo-2023": "https://upload.wikimedia.org/wikipedia/en/b/b7/KKN_di_Desa_Penari.jpg",
  "gundala-2-2025": "https://upload.wikimedia.org/wikipedia/en/d/de/Gundala_%282019%29_poster.jpg",
  "sri-asih-2022": "https://upload.wikimedia.org/wikipedia/id/b/bd/Poster_Sri_Asih.jpg",
  "petualangan-sherina-2-2023": "https://upload.wikimedia.org/wikipedia/id/2/22/Petualangan_Sherina_2_%28poster%29.jpeg"
};

function download(url, destPath) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'CinelaxMovieStreaming/1.0 (Mozilla/5.0 Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://wikipedia.org/'
      }
    }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(true)));
        file.on('error', () => {
          fs.unlink(destPath, () => {});
          resolve(false);
        });
      } else {
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
  });
}

async function run() {
  const dir = path.join(__dirname, 'assets', 'posters');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log('Downloading all posters to assets/posters/...');
  for (const [key, url] of Object.entries(posters)) {
    const ext = url.includes('.png') ? '.png' : '.jpg';
    const filePath = path.join(dir, `${key}${ext}`);
    const ok = await download(url, filePath);
    console.log(key, '->', ok ? 'DOWNLOADED (' + ext + ')' : 'FAILED (' + url + ')');
  }
}

run();
