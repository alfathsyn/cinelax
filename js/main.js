/* ============================================
   CINELAX — Complete Streaming Frontend Engine
   SPA Router, Multi-View, Video Player & Filters
   ============================================ */

// ==========================================
// COLOR GRADIENTS & VISUAL TOKENS
// ==========================================

const GRADIENTS = [
  'linear-gradient(135deg, #0575e6 0%, #00f260 100%)',
  'linear-gradient(135deg, #e50914 0%, #b20710 50%, #4a0e17 100%)',
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
  'linear-gradient(135deg, #360033 0%, #0b8793 100%)',
  'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
  'linear-gradient(135deg, #0c0c1d 0%, #3a1c71 50%, #d76d77 100%)',
  'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
  'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  'linear-gradient(135deg, #200122 0%, #6f0000 100%)',
  'linear-gradient(135deg, #1a002e 0%, #4a0e4e 50%, #340e0e 100%)',
  'linear-gradient(135deg, #000428 0%, #004e92 100%)',
  'linear-gradient(135deg, #1d2b64 0%, #f8cdda 100%)',
  'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
  'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
  'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)',
  'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)',
  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
];

const EMOJIS = ['👑', '🔥', '🦸', '🚀', '🌌', '⚔️', '👹', '🦖', '🧪', '🦇', '🕷️', '🧟', '🕵️', '🌊', '💍', '🎭', '🥊', '🤖', '🩸', '🔮', '🔔', '💀', '🐍', '⚡', '🎒', '🛵', '🐘', '👻', '🩺', '🌸', '📻', '🍄', '🏛️', '🖤', '👽', '🏜️', '🦍', '🧅', '🤠', '🐉'];

// Global Movie Registry for instant lookups
const movieRegistry = new Map();

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message, type = 'info', duration = 3200) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => {
      toast.remove();
    }, 280);
  }, duration);
}

window.showToast = showToast;

// ==========================================
// RICK AND MORTY 7 SEASONS (COMPLETE)
// ==========================================
const rickAndMortySeasons = [
  {
    season: 1,
    episodes: [
      { number: 1, title: 'Pilot', duration: '22m' },
      { number: 2, title: 'Lawnmower Dog', duration: '22m' },
      { number: 3, title: 'Anatomy Park', duration: '22m' },
      { number: 4, title: 'M. Night Shaym-Aliens!', duration: '21m' },
      { number: 5, title: 'Meeseeks and Destroy', duration: '21m' },
      { number: 6, title: 'Rick Potion #9', duration: '22m' },
      { number: 7, title: 'Raising Gazorpazorp', duration: '22m' },
      { number: 8, title: 'Rixty Minutes', duration: '22m' },
      { number: 9, title: 'Something Ricked This Way Comes', duration: '22m' },
      { number: 10, title: 'Close Rick-counters of the Rick Kind', duration: '23m' },
      { number: 11, title: 'Ricksy Business', duration: '22m' }
    ]
  },
  {
    season: 2,
    episodes: [
      { number: 1, title: 'A Rickle in Time', duration: '23m' },
      { number: 2, title: 'Mortynight Run', duration: '22m' },
      { number: 3, title: 'Auto Erotic Assimilation', duration: '22m' },
      { number: 4, title: 'Total Rickall', duration: '22m' },
      { number: 5, title: 'Get Schwifty', duration: '22m' },
      { number: 6, title: 'The Ricks Must Be Crazy', duration: '22m' },
      { number: 7, title: 'Big Trouble in Little Sanchez', duration: '22m' },
      { number: 8, title: 'Interdimensional Cable 2: Tempting Fate', duration: '22m' },
      { number: 9, title: 'Look Who\'s Purging Now', duration: '22m' },
      { number: 10, title: 'The Wedding Squanchers', duration: '23m' }
    ]
  },
  {
    season: 3,
    episodes: [
      { number: 1, title: 'The Rickshank Rickdemption', duration: '23m' },
      { number: 2, title: 'Rickmancing the Stone', duration: '22m' },
      { number: 3, title: 'Pickle Rick', duration: '23m' },
      { number: 4, title: 'Vindicators 3: The Return of Worldender', duration: '22m' },
      { number: 5, title: 'The Whirly Dirly Conspiracy', duration: '22m' },
      { number: 6, title: 'Rest and Ricklaxation', duration: '22m' },
      { number: 7, title: 'The Ricklantis Mixup', duration: '22m' },
      { number: 8, title: 'Morty\'s Mind Blowers', duration: '22m' },
      { number: 9, title: 'The ABC\'s of Beth', duration: '22m' },
      { number: 10, title: 'The Rickchurian Mortydate', duration: '22m' }
    ]
  },
  {
    season: 4,
    episodes: [
      { number: 1, title: 'Edge of Tomorty: Rick Die Rickpeat', duration: '22m' },
      { number: 2, title: 'The Old Man and the Seat', duration: '22m' },
      { number: 3, title: 'One Crew over the Crewcoo\'s Morty', duration: '22m' },
      { number: 4, title: 'Claw and Hoarder: Special Ricktim\'s Morty', duration: '22m' },
      { number: 5, title: 'Rattlestar Ricklactica', duration: '22m' },
      { number: 6, title: 'Never Ricking Morty', duration: '22m' },
      { number: 7, title: 'Promortyus', duration: '22m' },
      { number: 8, title: 'The Vat of Acid Episode', duration: '22m' },
      { number: 9, title: 'Childrick of Mort', duration: '22m' },
      { number: 10, title: 'Star Mort Rickturn of the Jerri', duration: '22m' }
    ]
  },
  {
    season: 5,
    episodes: [
      { number: 1, title: 'Mort Dinner Rick Andre', duration: '22m' },
      { number: 2, title: 'Mortyplicity', duration: '22m' },
      { number: 3, title: 'A Rickconvenient Mort', duration: '22m' },
      { number: 4, title: 'Rickdependence Spray', duration: '22m' },
      { number: 5, title: 'AmRickan Graffiti', duration: '22m' },
      { number: 6, title: 'Rick & Morty\'s Thanksploitation Spectacular', duration: '22m' },
      { number: 7, title: 'Gotron Jerrysis Rickvangelion', duration: '22m' },
      { number: 8, title: 'Rickternal Friendshine of the Spotless Mort', duration: '22m' },
      { number: 9, title: 'Forgetting Sarick Mortshall', duration: '22m' },
      { number: 10, title: 'Rickmurai Jack', duration: '22m' }
    ]
  },
  {
    season: 6,
    episodes: [
      { number: 1, title: 'Solaricks', duration: '22m' },
      { number: 2, title: 'Rick: A Mort Well Lived', duration: '22m' },
      { number: 3, title: 'Bethic Twinstinct', duration: '22m' },
      { number: 4, title: 'Night Family', duration: '22m' },
      { number: 5, title: 'Final DeSmithation', duration: '22m' },
      { number: 6, title: 'Juricksic Mort', duration: '22m' },
      { number: 7, title: 'Full Meta Jackrick', duration: '22m' },
      { number: 8, title: 'Analyze Piss', duration: '22m' },
      { number: 9, title: 'A Rick in King Mortur\'s Court', duration: '22m' },
      { number: 10, title: 'Ricktional Mortpoon\'s Rickmas Mortcation', duration: '22m' }
    ]
  },
  {
    season: 7,
    episodes: [
      { number: 1, title: 'How Poopy Got His Poop Back', duration: '22m' },
      { number: 2, title: 'The Joirick Mortstrosity', duration: '22m' },
      { number: 3, title: 'Air Force Wong', duration: '22m' },
      { number: 4, title: 'That\'s Amorte', duration: '22m' },
      { number: 5, title: 'Unmortricken', duration: '22m' },
      { number: 6, title: 'Rickfending Your Mort', duration: '22m' },
      { number: 7, title: 'Wet Kuat Amortican Summer', duration: '22m' },
      { number: 8, title: 'Rise of the Numbericons: The Movie', duration: '22m' },
      { number: 9, title: 'Mort: Ragnarick', duration: '22m' },
      { number: 10, title: 'Fear No Mort', duration: '22m' }
    ]
  }
];

const rickAndMorty = {
  id: 'rick-and-morty-2013',
  title: 'Rick and Morty',
  originalTitle: 'Rick and Morty (2013-2025)',
  year: 2025,
  rating: '9.1',
  duration: '7 Seasons (71 EP)',
  quality: '1080p Full HD',
  type: 'series',
  genre: 'Animation',
  genres: ['Animation', 'Sci-Fi', 'Comedy', 'Adventure'],
  country: 'United States',
  director: 'Dan Harmon, Justin Roiland',
  cast: 'Justin Roiland, Chris Parnell, Spencer Grammer, Sarah Chalke, Ian Cardoni',
  description: 'Rick Sanchez, seorang ilmuwan sosiopat jenius dan alkoholik, menyeret cucunya yang pemalu dan canggung, Morty Smith, dalam petualangan antardimensi yang gila, berbahaya, dan penuh kekacauan di seluruh alam semesta.',
  poster: 'assets/posters/rick-and-morty-2025.jpg',
  backdrop: 'assets/hero/hero-rick-morty.jpg',
  gradient: 'linear-gradient(135deg, #0575e6 0%, #00f260 100%)',
  emoji: '🧪',
  badge: '🔥 Animasi Sci-Fi Top View',
  slug: 'rick-and-morty-2013',
  imdbId: 'tt2861424',
  tmdbId: '60625',
  episode: 'S7 EP10',
  idlixUrl: 'https://z2.idlixku.com/series/rick-and-morty-2013',
  seasons: rickAndMortySeasons,
  episodes: rickAndMortySeasons[0].episodes
};

movieRegistry.set(rickAndMorty.id, rickAndMorty);
movieRegistry.set(rickAndMorty.slug, rickAndMorty);
movieRegistry.set('rick-and-morty', rickAndMorty);

// ==========================================
// HERO SLIDER DATA
// ==========================================

const heroSlides = [
  {
    id: 'deadpool-wolverine-hero',
    title: 'Deadpool & Wolverine',
    originalTitle: 'Deadpool & Wolverine (2024)',
    year: 2024,
    rating: '8.9',
    duration: '2h 08m',
    quality: '4K Ultra HD',
    type: 'movie',
    genre: 'Action',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    country: 'United States',
    director: 'Shawn Levy',
    cast: 'Ryan Reynolds, Hugh Jackman, Emma Corrin, Matthew Macfadyen',
    description: 'Wade Wilson yang lesu dalam kehidupan sipil dipanggil kembali oleh Time Variance Authority (TVA) untuk misi penyelamatan semesta bersama Wolverine yang penuh luka masa lalu.',
    poster: 'assets/posters/deadpool-wolverine-2024.jpg',
    backdrop: 'assets/posters/deadpool-wolverine-2024.jpg',
    gradient: 'linear-gradient(135deg, #e50914 0%, #b20710 50%, #4a0e17 100%)',
    emoji: '⚔️',
    badge: '👑 Box Office Terlaris 2024',
    slug: 'deadpool-wolverine-2024',
    imdbId: 'tt5177120',
    tmdbId: '533535',
    idlixUrl: 'https://z2.idlixku.com/movie/deadpool-wolverine-2024/',
    isUnavailable: false,
    trailerUrl: 'https://www.youtube-nocookie.com/embed/73_1biulkYk'
  },
  {
    id: 'gladiator-2-hero',
    title: 'Gladiator II',
    originalTitle: 'Gladiator II (2024)',
    year: 2024,
    rating: '8.7',
    duration: '2h 28m',
    quality: '4K Ultra HD',
    type: 'movie',
    genre: 'Action',
    genres: ['Action', 'Drama', 'Adventure'],
    country: 'United Kingdom',
    director: 'Ridley Scott',
    cast: 'Paul Mescal, Pedro Pascal, Denzel Washington, Connie Nielsen',
    description: 'Bertahun-tahun setelah menyaksikan kematian Maximus, Lucius dipaksa memasuki Colosseum setelah rumahnya ditaklukkan oleh kaisar-kaisar tiran yang memerintah Roma dengan tangan besi.',
    poster: 'assets/posters/gladiator-2-2024.jpg',
    backdrop: 'assets/posters/gladiator-2-2024.jpg',
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 50%, #1a1a2e 100%)',
    emoji: '🏛️',
    badge: '🏛️ Epik Bioskop Terbaik',
    slug: 'gladiator-2-2024',
    imdbId: 'tt9660502',
    tmdbId: '558449',
    idlixUrl: 'https://z2.idlixku.com/movie/gladiator-2-2024/',
    isUnavailable: false,
    trailerUrl: 'https://www.youtube-nocookie.com/embed/4rgYUipGJNo'
  },
  {
    id: 'squid-game-2-2025',
    title: 'Squid Game Season 2',
    originalTitle: '오징어 게임 시즌2 (2025)',
    year: 2025,
    rating: '9.3',
    duration: '6 Episode (1 Season)',
    quality: '4K Ultra HD',
    type: 'series',
    genre: 'Thriller',
    genres: ['Thriller', 'Drama', 'Mystery'],
    country: 'Korea Selatan',
    director: 'Hwang Dong-hyuk',
    cast: 'Lee Jung-jae, Lee Byung-hun, Wi Ha-joon, Im Si-wan, Kang Ha-neul',
    description: 'Seong Gi-hun (Player 456) membatalkan kepergiannya ke Amerika dan kembali masuk ke dalam permainan maut Squid Game dengan tujuan menghancurkan organisasi dalang permainan dari dalam.',
    poster: 'assets/posters/squid-game-s2-2025.jpg',
    backdrop: 'assets/hero/hero-squid-game.jpg',
    gradient: 'linear-gradient(135deg, #e50914 0%, #16161f 70%, #00f260 100%)',
    emoji: '🦑',
    badge: '🔥 Serial Terpopuler Dunia',
    slug: 'squid-game-season-2',
    imdbId: 'tt10919420',
    tmdbId: '93405',
    idlixUrl: 'https://z2.idlixku.com/series/squid-game-season-2',
    isUnavailable: false,
    trailerUrl: 'https://www.youtube-nocookie.com/embed/lQBmZBJTN4U',
    seasons: [
      {
        season: 2,
        episodes: [
          { number: 1, title: 'Bread and Lottery', duration: '58m' },
          { number: 2, title: 'The Red Light Return', duration: '55m' },
          { number: 3, title: 'Zero Sum Game', duration: '62m' },
          { number: 4, title: 'Circle and Cross', duration: '59m' },
          { number: 5, title: 'The Frontman\'s Face', duration: '65m' },
          { number: 6, title: 'End Game: Revolution', duration: '71m' }
        ]
      }
    ],
    episodes: [
      { number: 1, title: 'Bread and Lottery', duration: '58m' },
      { number: 2, title: 'The Red Light Return', duration: '55m' },
      { number: 3, title: 'Zero Sum Game', duration: '62m' },
      { number: 4, title: 'Circle and Cross', duration: '59m' },
      { number: 5, title: 'The Frontman\'s Face', duration: '65m' },
      { number: 6, title: 'End Game: Revolution', duration: '71m' }
    ]
  },
  {
    id: 'alien-romulus-hero',
    title: 'Alien: Romulus',
    originalTitle: 'Alien: Romulus (2024)',
    year: 2024,
    rating: '8.5',
    duration: '1h 59m',
    quality: '4K Ultra HD',
    type: 'movie',
    genre: 'Horror',
    genres: ['Horror', 'Sci-Fi', 'Thriller'],
    country: 'United States',
    director: 'Fede Álvarez',
    cast: 'Cailee Spaeny, David Jonsson, Archie Renaux, Isabela Merced',
    description: 'Sekelompok pemuda koloni luar angkasa yang menjelajahi stasiun luar angkasa terlantar berhadapan langsung dengan bentuk kehidupan paling mematikan dan mengerikan di alam semesta.',
    poster: 'assets/posters/alien-romulus-2024.jpg',
    backdrop: 'assets/posters/alien-romulus-2024.jpg',
    gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    emoji: '👽',
    badge: '👽 Sci-Fi Horror Populer',
    slug: 'alien-romulus-2024',
    imdbId: 'tt18412256',
    tmdbId: '945961',
    idlixUrl: 'https://z2.idlixku.com/movie/alien-romulus-2024/',
    isUnavailable: false,
    trailerUrl: 'https://www.youtube-nocookie.com/embed/x0XDEhP4MQs'
  },
  {
    id: 'demon-slayer-movie-2025',
    title: 'Demon Slayer: Infinity Castle',
    originalTitle: '鬼滅の刃 無限城編 (2025)',
    year: 2025,
    rating: '9.4',
    duration: '2h 10m',
    quality: '1080p Full HD',
    type: 'movie',
    genre: 'Animation',
    genres: ['Animation', 'Action', 'Fantasy'],
    country: 'Jepang',
    director: 'Haruo Sotozaki',
    cast: 'Natsuki Hanae, Akari Kito, Hiro Shimono, Takahiro Sakurai',
    description: 'Pertempuran puncak Korps Pembasmi Iblis di dalam Kastil Tanpa Batas milik Kibutsuji Muzan. Tanjiro dan para Hashira mengerahkan seluruh kekuatan dalam perang hidup mati.',
    poster: 'assets/posters/demon-slayer-infinity-castle-2025.jpg',
    backdrop: 'assets/hero/hero-demon-slayer.jpg',
    gradient: 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)',
    emoji: '⚔️',
    badge: '🎌 Anime Box Office #1',
    slug: 'demon-slayer-infinity-castle-2025',
    imdbId: 'tt32840000',
    tmdbId: '1214484',
    idlixUrl: 'https://z2.idlixku.com/movie/demon-slayer-infinity-castle-2025/',
    isUnavailable: false,
    trailerUrl: 'https://www.youtube-nocookie.com/embed/x7uG_F_sR4Y'
  },
  {
    id: 'rick-and-morty-hero',
    title: 'Rick and Morty',
    originalTitle: 'Rick and Morty (2013-2025)',
    year: 2025,
    rating: '9.1',
    duration: '7 Seasons (71 EP)',
    quality: '1080p Full HD',
    type: 'series',
    genre: 'Animation',
    genres: ['Animation', 'Sci-Fi', 'Comedy', 'Adventure'],
    country: 'United States',
    director: 'Dan Harmon, Justin Roiland',
    cast: 'Justin Roiland, Chris Parnell, Spencer Grammer, Sarah Chalke',
    description: 'Rick Sanchez, seorang ilmuwan sosiopat jenius dan alkoholik, menyeret cucunya yang pemalu dan canggung, Morty Smith, dalam petualangan antardimensi yang gila, berbahaya, dan penuh kekacauan di seluruh alam semesta.',
    poster: 'assets/posters/rick-and-morty-2025.jpg',
    backdrop: 'assets/hero/hero-rick-morty.jpg',
    gradient: 'linear-gradient(135deg, #0575e6 0%, #00f260 100%)',
    emoji: '🧪',
    badge: '🧪 Sci-Fi Series #1',
    slug: 'rick-and-morty-2013',
    imdbId: 'tt2861424',
    tmdbId: '60625',
    idlixUrl: 'https://z2.idlixku.com/series/rick-and-morty-2013',
    isUnavailable: false,
    trailerUrl: 'https://www.youtube-nocookie.com/embed/jerFRSQW9g8',
    seasons: rickAndMortySeasons,
    episodes: rickAndMortySeasons[0].episodes
  }
];

heroSlides.forEach(slide => {
  movieRegistry.set(slide.id, slide);
  movieRegistry.set(slide.slug, slide);
});

// ==========================================
// MASTER MOVIE & SERIES DATABASE
// ==========================================

const TOP_VIEW_DATABASE = {
  topview: [
    { title: 'Deadpool & Wolverine', year: 2024, rating: '8.9', genre: 'Action', quality: '4K', type: 'movie', country: 'United States', imdbId: 'tt5177120', tmdbId: '533535', emoji: '⚔️', director: 'Shawn Levy', cast: 'Ryan Reynolds, Hugh Jackman', desc: 'Duet gila pahlawan mutan melintasi Void demi menyelamatkan semesta.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/73_1biulkYk' },
    { title: 'Gladiator II', year: 2024, rating: '8.7', genre: 'Action', quality: '4K', type: 'movie', country: 'United Kingdom', imdbId: 'tt9660502', tmdbId: '558449', emoji: '🏛️', director: 'Ridley Scott', cast: 'Paul Mescal, Denzel Washington', desc: 'Lucius memasuki Colosseum demi merebut kembali kehormatan Roma.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/4rgYUipGJNo' },
    { title: 'Squid Game Season 2', year: 2025, rating: '9.3', genre: 'Thriller', quality: '4K', type: 'series', country: 'Korea Selatan', imdbId: 'tt10919420', tmdbId: '93405', emoji: '🦑', director: 'Hwang Dong-hyuk', cast: 'Lee Jung-jae, Lee Byung-hun', episodeCount: 6, desc: 'Pembalasan dendam Gi-hun di arena maut permainan cumi-cumi.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/lQBmZBJTN4U' },
    { title: 'Alien: Romulus', year: 2024, rating: '8.5', genre: 'Horror', quality: '1080p', type: 'movie', country: 'United States', imdbId: 'tt18412256', tmdbId: '945961', emoji: '👽', director: 'Fede Álvarez', cast: 'Cailee Spaeny, David Jonsson', desc: 'Remaja koloni luar angkasa berhadapan dengan monster Xenomorph paling mematikan.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/x0XDEhP4MQs' },
    { title: 'Demon Slayer: Infinity Castle', year: 2025, rating: '9.4', genre: 'Animation', quality: '1080p', type: 'movie', country: 'Jepang', imdbId: 'tt32840000', tmdbId: '1214484', emoji: '⚔️', director: 'Haruo Sotozaki', cast: 'Natsuki Hanae, Akari Kito', desc: 'Perang puncak di Kastil Tanpa Batas melawan Raja Iblis Muzan.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/x7uG_F_sR4Y' },
    { title: 'Mission: Impossible – The Final Reckoning', year: 2025, rating: '8.9', genre: 'Action', quality: '4K', type: 'movie', country: 'United States', imdbId: 'tt9603208', tmdbId: '573435', emoji: '💣', director: 'Christopher McQuarrie', cast: 'Tom Cruise, Hayley Atwell', desc: 'Misi terakhir Ethan Hunt menghentikan kecerdasan buatan The Entity.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/NOhDy655QBs' },
    { title: 'Captain America: Brave New World', year: 2025, rating: '8.6', genre: 'Action', quality: '1080p', type: 'movie', country: 'United States', imdbId: 'tt14513804', tmdbId: '822119', emoji: '🛡️', director: 'Julius Onah', cast: 'Anthony Mackie, Harrison Ford', desc: 'Sam Wilson menghadapi krisis internasional dan transformasi Red Hulk.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/1pHDWnXmK7Y' },
    { title: 'Wicked: Part One', year: 2024, rating: '8.8', genre: 'Fantasy', quality: '1080p', type: 'movie', country: 'United States', imdbId: 'tt27448866', tmdbId: '611570', emoji: '🧙‍♀️', director: 'Jon M. Chu', cast: 'Ariana Grande, Cynthia Erivo', desc: 'Kisah magis penyihir hijau Elphaba dan Glinda di negeri Oz.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/6COmYeLsz4c' },
    { title: 'Rick and Morty', year: 2025, rating: '9.1', genre: 'Animation', quality: '1080p', type: 'series', country: 'United States', imdbId: 'tt2861424', tmdbId: '60625', emoji: '🧪', director: 'Dan Harmon', cast: 'Justin Roiland, Chris Parnell', desc: 'Petualangan lintas dimensi paling kocak dan absurd di multisemesta.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/jerFRSQW9g8' },
    { title: 'Dune: Prophecy', year: 2024, rating: '8.6', genre: 'Sci-Fi', quality: '1080p', type: 'series', country: 'United States', imdbId: 'tt15239678', tmdbId: '124905', emoji: '🏜️', director: 'Alison Schapker', cast: 'Emily Watson, Olivia Williams', episodeCount: 6, desc: 'Kisah asal-usul persaudaraan Bene Gesserit 10.000 tahun sebelum Paul Atreides.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/p8bK4_wH8aE' },
    { title: 'How to Train Your Dragon Live Action', year: 2025, rating: '8.8', genre: 'Adventure', quality: '1080p', type: 'movie', country: 'United States', imdbId: 'tt26743210', tmdbId: '1084199', emoji: '🐉', director: 'Dean DeBlois', cast: 'Mason Thames, Nico Parker', desc: 'Adaptasi live action persahabatan Hiccup dan Toothless si naga Night Fury.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/5a09yJU-mCI' }
  ],

  trending: [
    { title: 'Squid Game Season 2', year: 2025, rating: '9.3', genre: 'Thriller', quality: '4K', type: 'series', country: 'Korea Selatan', imdbId: 'tt10919420', tmdbId: '93405', emoji: '🦑', director: 'Hwang Dong-hyuk', cast: 'Lee Jung-jae, Im Si-wan', episodeCount: 6, desc: 'Kelanjutan permainan bertahan hidup berhadiah 45.6 miliar won.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/lQBmZBJTN4U' },
    { title: 'Deadpool & Wolverine', year: 2024, rating: '8.9', genre: 'Action', quality: '4K', type: 'movie', country: 'United States', imdbId: 'tt5177120', tmdbId: '533535', emoji: '⚔️', director: 'Shawn Levy', cast: 'Ryan Reynolds, Hugh Jackman', desc: 'Duet gila pahlawan mutan melintasi Void demi menyelamatkan semesta.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/73_1biulkYk' },
    { title: 'Stranger Things Season 5', year: 2025, rating: '9.2', genre: 'Sci-Fi', quality: '4K', type: 'series', country: 'United States', imdbId: 'tt4574334', tmdbId: '66732', emoji: '🚲', director: 'The Duffer Brothers', cast: 'Millie Bobby Brown, Finn Wolfhard', episodeCount: 8, desc: 'Pertempuran terakhir anak-anak Hawkins melawan Vecna dan Upside Down.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/sBEvEcpnG7k' },
    { title: 'The Last of Us Season 2', year: 2025, rating: '9.1', genre: 'Drama', quality: '4K', type: 'series', country: 'United States', imdbId: 'tt3581920', tmdbId: '100088', emoji: '🍄', director: 'Craig Mazin', cast: 'Pedro Pascal, Bella Ramsey, Kaitlyn Dever', episodeCount: 7, desc: 'Tragedi dan balas dendam Ellie dan Abby di reruntuhan Seattle.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/k4hy9v-fL2M' },
    { title: 'Gladiator II', year: 2024, rating: '8.7', genre: 'Action', quality: '4K', type: 'movie', country: 'United Kingdom', imdbId: 'tt9660502', tmdbId: '558449', emoji: '🏛️', director: 'Ridley Scott', cast: 'Paul Mescal, Denzel Washington', desc: 'Lucius memasuki Colosseum demi merebut kembali kehormatan Roma.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/4rgYUipGJNo' },
    { title: 'Wednesday Season 2', year: 2025, rating: '8.8', genre: 'Comedy', quality: '1080p', type: 'series', country: 'United States', imdbId: 'tt13443470', tmdbId: '119051', emoji: '🖤', director: 'Tim Burton', cast: 'Jenna Ortega, Steve Buscemi', episodeCount: 8, desc: 'Semester baru penuh kutukan dan misteri pembunuhan di Nevermore Academy.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/Di310BC80ew' },
    { title: 'Rick and Morty', year: 2025, rating: '9.1', genre: 'Animation', quality: '1080p', type: 'series', country: 'United States', imdbId: 'tt2861424', tmdbId: '60625', emoji: '🧪', director: 'Dan Harmon', cast: 'Justin Roiland, Chris Parnell', desc: 'Petualangan lintas dimensi paling kocak dan absurd di multisemesta.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/jerFRSQW9g8' },
    { title: 'Demon Slayer: Infinity Castle', year: 2025, rating: '9.4', genre: 'Animation', quality: '1080p', type: 'movie', country: 'Jepang', imdbId: 'tt32840000', tmdbId: '1214484', emoji: '⚔️', director: 'Haruo Sotozaki', cast: 'Natsuki Hanae, Akari Kito', desc: 'Perang puncak di Kastil Tanpa Batas melawan Raja Iblis Muzan.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/x7uG_F_sR4Y' },
    { title: 'Alien: Romulus', year: 2024, rating: '8.5', genre: 'Horror', quality: '1080p', type: 'movie', country: 'United States', imdbId: 'tt18412256', tmdbId: '945961', emoji: '👽', director: 'Fede Álvarez', cast: 'Cailee Spaeny, David Jonsson', desc: 'Remaja koloni luar angkasa berhadapan dengan monster Xenomorph paling mematikan.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/x0XDEhP4MQs' },
    { title: 'Dune: Prophecy', year: 2024, rating: '8.6', genre: 'Sci-Fi', quality: '1080p', type: 'series', country: 'United States', imdbId: 'tt15239678', tmdbId: '124905', emoji: '🏜️', director: 'Alison Schapker', cast: 'Emily Watson, Olivia Williams', episodeCount: 6, desc: 'Kisah asal-usul persaudaraan Bene Gesserit 10.000 tahun sebelum Paul Atreides.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/p8bK4_wH8aE' }
  ],

  latest: [
    { title: 'Captain America: Brave New World', year: 2025, rating: '8.6', genre: 'Action', quality: '1080p', type: 'movie', country: 'United States', imdbId: 'tt14513804', tmdbId: '822119', emoji: '🛡️', director: 'Julius Onah', cast: 'Anthony Mackie, Harrison Ford', desc: 'Sam Wilson memimpin pertarungan melawan konspirasi dunia.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/1pHDWnXmK7Y' },
    { title: 'Deadpool & Wolverine', year: 2024, rating: '8.9', genre: 'Action', quality: '4K', type: 'movie', country: 'United States', imdbId: 'tt5177120', tmdbId: '533535', emoji: '⚔️', director: 'Shawn Levy', cast: 'Ryan Reynolds, Hugh Jackman', desc: 'Duet gila pahlawan mutan melintasi Void demi menyelamatkan semesta.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/73_1biulkYk' },
    { title: 'Gladiator II', year: 2024, rating: '8.7', genre: 'Action', quality: '4K', type: 'movie', country: 'United Kingdom', imdbId: 'tt9660502', tmdbId: '558449', emoji: '🏛️', director: 'Ridley Scott', cast: 'Paul Mescal, Denzel Washington', desc: 'Lucius memasuki Colosseum demi merebut kembali kehormatan Roma.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/4rgYUipGJNo' },
    { title: 'Alien: Romulus', year: 2024, rating: '8.5', genre: 'Horror', quality: '1080p', type: 'movie', country: 'United States', imdbId: 'tt18412256', tmdbId: '945961', emoji: '👽', director: 'Fede Álvarez', cast: 'Cailee Spaeny, David Jonsson', desc: 'Remaja koloni luar angkasa berhadapan dengan monster Xenomorph paling mematikan.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/x0XDEhP4MQs' },
    { title: 'How to Train Your Dragon Live Action', year: 2025, rating: '8.8', genre: 'Adventure', quality: '1080p', type: 'movie', country: 'United States', imdbId: 'tt26743210', tmdbId: '1084199', emoji: '🐉', director: 'Dean DeBlois', cast: 'Mason Thames, Nico Parker', desc: 'Adaptasi live action persahabatan Hiccup dan Toothless si naga Night Fury.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/5a09yJU-mCI' },
    { title: 'Wicked: Part One', year: 2024, rating: '8.8', genre: 'Fantasy', quality: '1080p', type: 'movie', country: 'United States', imdbId: 'tt27448866', tmdbId: '611570', emoji: '🧙‍♀️', director: 'Jon M. Chu', cast: 'Ariana Grande, Cynthia Erivo', desc: 'Kisah magis penyihir hijau Elphaba dan Glinda di negeri Oz.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/6COmYeLsz4c' }
  ],

  popular: [
    { title: 'Deadpool & Wolverine', year: 2024, rating: '8.9', genre: 'Action', quality: '4K', type: 'movie', country: 'United States', imdbId: 'tt5177120', tmdbId: '533535', emoji: '⚔️', director: 'Shawn Levy', cast: 'Ryan Reynolds, Hugh Jackman', desc: 'Kolaborasi pahlawan super terlucu dan terbrutal dalam sejarah.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/73_1biulkYk' },
    { title: 'Rick and Morty', year: 2025, rating: '9.1', genre: 'Animation', quality: '1080p', type: 'series', country: 'United States', imdbId: 'tt2861424', tmdbId: '60625', emoji: '🧪', director: 'Dan Harmon', cast: 'Justin Roiland, Chris Parnell', desc: 'Serial animasi dengan rating tertinggi dan jutaan penggemar setia.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/jerFRSQW9g8' },
    { title: 'Gladiator II', year: 2024, rating: '8.7', genre: 'Action', quality: '4K', type: 'movie', country: 'United Kingdom', imdbId: 'tt9660502', tmdbId: '558449', emoji: '🏛️', director: 'Ridley Scott', cast: 'Paul Mescal, Denzel Washington', desc: 'Kelanjutan epik pertempuran arena Colosseum kekaisaran Roma.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/4rgYUipGJNo' },
    { title: 'Wicked: Part One', year: 2024, rating: '8.8', genre: 'Fantasy', quality: '1080p', type: 'movie', country: 'United States', imdbId: 'tt27448866', tmdbId: '611570', emoji: '🧙‍♀️', director: 'Jon M. Chu', cast: 'Ariana Grande, Cynthia Erivo', desc: 'Kisah magis penyihir hijau Elphaba dan Glinda di negeri Oz.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/6COmYeLsz4c' },
    { title: 'The Last of Us Season 2', year: 2025, rating: '9.1', genre: 'Drama', quality: '4K', type: 'series', country: 'United States', imdbId: 'tt3581920', tmdbId: '100088', emoji: '🍄', director: 'Craig Mazin', cast: 'Pedro Pascal, Bella Ramsey', episodeCount: 7, desc: 'Kisah manusia di tengah kepunahan pandemi jamur Cordyceps.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/k4hy9v-fL2M' },
    { title: 'Demon Slayer: Infinity Castle', year: 2025, rating: '9.4', genre: 'Animation', quality: '1080p', type: 'movie', country: 'Jepang', imdbId: 'tt32840000', tmdbId: '1214484', emoji: '⚔️', director: 'Haruo Sotozaki', cast: 'Natsuki Hanae, Akari Kito', desc: 'Animasi pertarungan pedang terindah sepanjang masa.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/x7uG_F_sR4Y' }
  ],

  series: [
    { title: 'Rick and Morty', year: 2025, rating: '9.1', genre: 'Animation', quality: '1080p', type: 'series', country: 'United States', imdbId: 'tt2861424', tmdbId: '60625', emoji: '🧪', director: 'Dan Harmon', cast: 'Justin Roiland, Chris Parnell', desc: 'Petualangan antardimensi liar Rick Sanchez bersama Morty Smith.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/jerFRSQW9g8' },
    { title: 'Squid Game Season 2', year: 2025, rating: '9.3', genre: 'Thriller', quality: '4K', type: 'series', country: 'Korea Selatan', imdbId: 'tt10919420', tmdbId: '93405', emoji: '🦑', director: 'Hwang Dong-hyuk', cast: 'Lee Jung-jae, Im Si-wan', episodeCount: 6, desc: 'Pertarungan hidup mati permainan anak-anak berdarah di Korea.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/lQBmZBJTN4U' },
    { title: 'Stranger Things Season 5', year: 2025, rating: '9.2', genre: 'Sci-Fi', quality: '4K', type: 'series', country: 'United States', imdbId: 'tt4574334', tmdbId: '66732', emoji: '🚲', director: 'The Duffer Brothers', cast: 'Millie Bobby Brown, Finn Wolfhard', episodeCount: 8, desc: 'Musim penutup perang legendaris Hawkins melawan monster Upside Down.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/sBEvEcpnG7k' },
    { title: 'The Last of Us Season 2', year: 2025, rating: '9.1', genre: 'Drama', quality: '4K', type: 'series', country: 'United States', imdbId: 'tt3581920', tmdbId: '100088', emoji: '🍄', director: 'Craig Mazin', cast: 'Pedro Pascal, Bella Ramsey, Kaitlyn Dever', episodeCount: 7, desc: 'Balas dendam dan kemanusiaan di dunia pasca-apokaliptik.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/k4hy9v-fL2M' },
    { title: 'Wednesday Season 2', year: 2025, rating: '8.8', genre: 'Comedy', quality: '1080p', type: 'series', country: 'United States', imdbId: 'tt13443470', tmdbId: '119051', emoji: '🖤', director: 'Tim Burton', cast: 'Jenna Ortega, Steve Buscemi', episodeCount: 8, desc: 'Investigasi baru Wednesday Addams di asrama Nevermore.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/Di310BC80ew' },
    { title: 'The Boys Season 5', year: 2025, rating: '9.0', genre: 'Action', quality: '4K', type: 'series', country: 'United States', imdbId: 'tt1190634', tmdbId: '76479', emoji: '🦸‍♂️', director: 'Eric Kripke', cast: 'Karl Urban, Antony Starr, Jack Quaid', episodeCount: 8, desc: 'Pertarungan klimaks terakhir Butcher melawan kekejaman tirani Homelander.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/EzFXDvC-6L4' },
    { title: 'Peacemaker Season 2', year: 2025, rating: '8.7', genre: 'Action', quality: '1080p', type: 'series', country: 'United States', imdbId: 'tt13146404', tmdbId: '110492', emoji: '🦅', director: 'James Gunn', cast: 'John Cena, Danielle Brooks, Freddie Stroma', episodeCount: 8, desc: 'Misi baru pahlawan bertopeng konyol Christopher Smith di DC Universe.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/WHXq62VCaCM' },
    { title: 'Severance Season 2', year: 2025, rating: '9.1', genre: 'Sci-Fi', quality: '1080p', type: 'series', country: 'United States', imdbId: 'tt11280740', tmdbId: '95396', emoji: '🏢', director: 'Ben Stiller', cast: 'Adam Scott, Patricia Arquette, John Turturro', episodeCount: 10, desc: 'Misteri pemisahan ingatan kerja dan pribadi di perusahaan misterius Lumon.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/xEQP4VVuyrY' },
    { title: 'Euphoria Season 3', year: 2025, rating: '8.8', genre: 'Drama', quality: '1080p', type: 'series', country: 'United States', imdbId: 'tt8772296', tmdbId: '85552', emoji: '💊', director: 'Sam Levinson', cast: 'Zendaya, Hunter Schafer, Sydney Sweeney', episodeCount: 8, desc: 'Kisah Rue Bennett dan teman-temannya menghadapi pendewasaan hidup.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/JdwZwrs8SLQ' },
    { title: 'All of Us Are Dead Season 2', year: 2025, rating: '8.9', genre: 'Horror', quality: '1080p', type: 'series', country: 'Korea Selatan', imdbId: 'tt14169960', tmdbId: '99966', emoji: '🧟‍♂️', director: 'Lee Jae-kyoo', cast: 'Park Ji-hu, Yoon Chan-young, Cho Yi-hyun', episodeCount: 8, desc: 'Ancaman mutasi manusia setengah zombie (Hambie) menyebar di Seoul.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/IN5TD4VRcSM' },
    { title: 'Moving Season 2', year: 2025, rating: '9.2', genre: 'Superhero', quality: '4K', type: 'series', country: 'Korea Selatan', imdbId: 'tt21609146', tmdbId: '124364', emoji: '🦸‍♀️', director: 'Park In-je', cast: 'Ryu Seung-ryong, Han Hyo-joo, Jo In-sung', episodeCount: 20, desc: 'Generasi anak berkekuatan super bersatu melindungi keluarga dari agen rahasia.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/1B1-18eHh04' }
  ],

  kdrama: [
    { title: 'Squid Game Season 2', year: 2025, rating: '9.3', genre: 'Thriller', quality: '4K', type: 'series', country: 'Korea Selatan', imdbId: 'tt10919420', tmdbId: '93405', emoji: '🦑', director: 'Hwang Dong-hyuk', cast: 'Lee Jung-jae, Im Si-wan', episodeCount: 6, desc: 'Permainan bertahan hidup mematikan yang ditonton jutaan miliarder.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/lQBmZBJTN4U' },
    { title: 'All of Us Are Dead Season 2', year: 2025, rating: '8.9', genre: 'Horror', quality: '1080p', type: 'series', country: 'Korea Selatan', imdbId: 'tt14169960', tmdbId: '99966', emoji: '🧟‍♂️', director: 'Lee Jae-kyoo', cast: 'Park Ji-hu, Yoon Chan-young, Cho Yi-hyun', episodeCount: 8, desc: 'Kisah murid SMA bertahan dari wabah zombie berlanjut di kota Seoul.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/IN5TD4VRcSM' },
    { title: 'Moving Season 2', year: 2025, rating: '9.2', genre: 'Superhero', quality: '4K', type: 'series', country: 'Korea Selatan', imdbId: 'tt21609146', tmdbId: '124364', emoji: '🦸‍♀️', director: 'Park In-je', cast: 'Ryu Seung-ryong, Han Hyo-joo, Jo In-sung', episodeCount: 20, desc: 'Agen rahasia berkekuatan super terbang dan regenerasi melindungi anaknya.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/1B1-18eHh04' },
    { title: 'Sweet Home Season 3', year: 2024, rating: '8.6', genre: 'Horror', quality: '1080p', type: 'series', country: 'Korea Selatan', imdbId: 'tt11612120', tmdbId: '96580', emoji: '👹', director: 'Lee Eung-bok', cast: 'Song Kang, Lee Jin-uk, Lee Si-young', episodeCount: 8, desc: 'Babak akhir pertempuran Cha Hyun-su melawan monster hasrat manusia.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/tMbgv44l-rM' },
    { title: 'Queen of Tears', year: 2024, rating: '9.0', genre: 'Romance', quality: '1080p', type: 'series', country: 'Korea Selatan', imdbId: 'tt26569106', tmdbId: '215079', emoji: '👑', director: 'Jang Young-woo', cast: 'Kim Soo-hyun, Kim Ji-won, Park Sung-hoon', episodeCount: 16, desc: 'Kisah cinta pernikahan pewaris konglomerat dan pengacara desa yang penuh haru.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/kYqjF3B5qGg' },
    { title: 'Vincenzo', year: 2021, rating: '9.1', genre: 'Crime', quality: '1080p', type: 'series', country: 'Korea Selatan', imdbId: 'tt13433802', tmdbId: '117376', emoji: '⚖️', director: 'Kim Hee-won', cast: 'Song Joong-ki, Jeon Yeo-been, Taecyeon', episodeCount: 20, desc: 'Pengacara mafia Italia pulang ke Korea membalas kejahatan konglomerat rakus.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/_J8tYxSB_LQ' },
    { title: 'A Shop for Killers Season 2', year: 2025, rating: '8.8', genre: 'Action', quality: '1080p', type: 'series', country: 'Korea Selatan', imdbId: 'tt28220000', tmdbId: '220000', emoji: '🔫', director: 'Lee Kwon', cast: 'Lee Dong-wook, Kim Hye-jun', episodeCount: 8, desc: 'Gadis muda mewarisi pusat perbelanjaan senjata rahasia milik pamannya.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/gWnLwWqCgV4' },
    { title: 'Signal Season 2', year: 2025, rating: '9.4', genre: 'Mystery', quality: '1080p', type: 'series', country: 'Korea Selatan', imdbId: 'tt5333198', tmdbId: '65942', emoji: '📻', director: 'Kim Eun-hee', cast: 'Lee Je-hoon, Kim Hye-soo, Cho Jin-woong', episodeCount: 16, desc: 'Detektif masa lalu dan masa kini terhubung melalui walkie-talkie memecahkan kasus dingin.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/n4sL8Qf2V3w' }
  ],

  anime: [
    { title: 'Demon Slayer: Infinity Castle', year: 2025, rating: '9.4', genre: 'Animation', quality: '1080p', type: 'movie', country: 'Jepang', imdbId: 'tt32840000', tmdbId: '1214484', emoji: '⚔️', director: 'Haruo Sotozaki', cast: 'Natsuki Hanae, Akari Kito', desc: 'Perang puncak Korps Pembasmi Iblis di dalam Kastil Tanpa Batas.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/x7uG_F_sR4Y' },
    { title: 'Solo Leveling Season 2: Arise from the Shadow', year: 2025, rating: '9.3', genre: 'Action', quality: '1080p', type: 'series', country: 'Jepang', imdbId: 'tt21209876', tmdbId: '209867', emoji: '🗡️', director: 'Shunsuke Nakashige', cast: 'Taito Ban, Genta Nakamura', episodeCount: 12, desc: 'Sung Jinwoo membangkitkan pasukan bayangan Shadow Monarch tak terkalahkan.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/5a24r_4w188' },
    { title: 'Chainsaw Man: The Movie – Reze Arc', year: 2025, rating: '9.2', genre: 'Action', quality: '1080p', type: 'movie', country: 'Jepang', imdbId: 'tt30449560', tmdbId: '1214485', emoji: '🪚', director: 'Ryu Nakayama', cast: 'Kikunosuke Toya, Reina Ueda', desc: 'Denji terpikat oleh Reze gadis misterius pemegang kekuatan Bom Iblis.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/p17i8oQ4WbE' },
    { title: 'Jujutsu Kaisen Season 3: Culling Game', year: 2025, rating: '9.3', genre: 'Supernatural', quality: '1080p', type: 'series', country: 'Jepang', imdbId: 'tt12343534', tmdbId: '95479', emoji: '🔮', director: 'Sunghoo Park', cast: 'Junya Enoki, Yuma Uchida, Asami Seto', episodeCount: 24, desc: 'Yuji Itadori dan Megumi terjebak dalam ritual maut Game Pemusnahan Kenjaku.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/O6qVieflwQs' },
    { title: 'Bleach: Thousand-Year Blood War Part 3 & 4', year: 2025, rating: '9.2', genre: 'Action', quality: '1080p', type: 'series', country: 'Jepang', imdbId: 'tt14995536', tmdbId: '158415', emoji: '🗡️', director: 'Tomohisa Taguchi', cast: 'Masakazu Morita, Fumiko Orikasa', episodeCount: 13, desc: 'Perang pamungkas Ichigo Kurosaki melawan Raja Quincy Yhwach di Istana Jiwa.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/z4y9T5C9b4g' },
    { title: 'One Piece: Egghead Arc Climax', year: 2025, rating: '9.3', genre: 'Adventure', quality: '1080p', type: 'series', country: 'Jepang', imdbId: 'tt0388629', tmdbId: '37854', emoji: '🏴‍☠️', director: 'Megumi Ishitani', cast: 'Mayumi Tanaka, Kazuya Nakai', episodeCount: 24, desc: 'Luffy Mode Gear 5 bertarung melawan Gorosei di pulau masa depan Egghead.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/S8_YwFLCh4U' },
    { title: 'Spy x Family Season 3', year: 2025, rating: '8.9', genre: 'Comedy', quality: '1080p', type: 'series', country: 'Jepang', imdbId: 'tt13706018', tmdbId: '120089', emoji: '🥜', director: 'Kazuhiro Furuhashi', cast: 'Takuya Eguchi, Atsumi Tanezaki', episodeCount: 12, desc: 'Misi rahasia keluarga Forger berlanjut dengan kelucuan telepati Anya.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/7V2Z54E5bQ0' },
    { title: 'Kaiju No. 8 Season 2', year: 2025, rating: '8.8', genre: 'Sci-Fi', quality: '1080p', type: 'series', country: 'Jepang', imdbId: 'tt21609146', tmdbId: '207572', emoji: '🦖', director: 'Shigeyuki Miya', cast: 'Masaya Fukunishi, Asami Seto', episodeCount: 12, desc: 'Kafka Hibino bertarung sebagai anggota Pasukan Pertahanan sambil menyembunyikan wujud monster.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/G6jWnQG6U48' },
    { title: 'My Hero Academia Season 8: Final War', year: 2025, rating: '9.0', genre: 'Superhero', quality: '1080p', type: 'series', country: 'Jepang', imdbId: 'tt5626028', tmdbId: '65930', emoji: '💥', director: 'Kenji Nagasaki', cast: 'Daiki Yamashita, Nobuhiko Okamoto', episodeCount: 14, desc: 'Pertarungan satu lawan satu Deku melawan Shigaraki Tomura dan All For One.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/7wZ8B9Z1G4k' }
  ],

  indonesia: [
    { title: 'Petualangan Sherina 3', year: 2025, rating: '8.7', genre: 'Adventure', quality: '1080p', type: 'movie', country: 'Indonesia', imdbId: 'tt12349006', tmdbId: '7006', emoji: '🎒', director: 'Riri Riza', cast: 'Sherina Munaf, Derby Romero', desc: 'Petualangan baru jurnalis Sherina dan Sadam melindungi hutan konservasi Indonesia.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/wzX0h1hR1_A' },
    { title: 'Jumbo: Petualangan Ajaib', year: 2025, rating: '8.9', genre: 'Animation', quality: '1080p', type: 'movie', country: 'Indonesia', imdbId: 'tt12349008', tmdbId: '7008', emoji: '🐘', director: 'Ryan Adriandhy', cast: 'Pengisi Suara Selebriti Indonesia', desc: 'Film animasi karya animator lokal tentang keberanian anak bermimpi besar.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/4a-uW7vA128' },
    { title: 'Bumi Manusia 2: Anak Semua Bangsa', year: 2025, rating: '8.8', genre: 'Drama', quality: '1080p', type: 'movie', country: 'Indonesia', imdbId: 'tt12349009', tmdbId: '7009', emoji: '📜', director: 'Hanung Bramantyo', cast: 'Iqbaal Ramadhan, Mawar de Jongh', desc: 'Perjuangan Minke menuliskan perlawanan kaum tertindas di era kolonial Hindia Belanda.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/aM_e4aV0k3E' },
    { title: 'The Big 4: Part 2', year: 2025, rating: '8.7', genre: 'Action', quality: '1080p', type: 'movie', country: 'Indonesia', imdbId: 'tt12349010', tmdbId: '7010', emoji: '💥', director: 'Timo Tjahjanto', cast: 'Abimana Aryasatya, Putri Marino, Arie Kriting', desc: 'Empat mantan pembunuh bayaran kembali beraksi dalam baku tembak komedi gila.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/bX4a7eB5c2U' },
    { title: 'Qodrat 2: Ruqyah Terakhir', year: 2025, rating: '8.7', genre: 'Horror', quality: '1080p', type: 'movie', country: 'Indonesia', imdbId: 'tt12349011', tmdbId: '7011', emoji: '📖', director: 'Charles Gozali', cast: 'Vino G. Bastian, Marsha Timothy', desc: 'Ustadz Qodrat berhadapan dengan raja jin Assuala yang merasuki kota besar.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/g_pBwXGz6B0' },
    { title: 'Agak Laen 2: Rumah Hantu Baru', year: 2025, rating: '8.8', genre: 'Comedy', quality: '1080p', type: 'movie', country: 'Indonesia', imdbId: 'tt12349012', tmdbId: '7012', emoji: '👻', director: 'Muhadkly Acho', cast: 'Boris Bokir, Indra Jegel, Oki Rengga, Bene Dion', desc: 'Kekonyolan empat sekawan membuka wahana horor baru yang kembali memakan korban.', unavailable: false, trailerUrl: 'https://www.youtube-nocookie.com/embed/c0tG4a4rP2k' }
  ]
};

// ==========================================
// MOVIE POSTER & BACKDROP RESOLVER
// ==========================================

const MOVIE_POSTER_MAP = {
  // Avatars
  'avatar': 'assets/posters/avatar-fire-and-ash-2025.jpg',
  
  // Superheroes & Blockbusters
  'superman': 'assets/posters/superman-2025.jpg',
  'avengers': 'assets/posters/avengers-doomsday-2026.jpg',
  'deadpool': 'assets/posters/deadpool-wolverine-2024.jpg',
  'batman': 'assets/posters/the-batman-part-ii-2026.jpg',
  'spider-man': 'assets/posters/spider-man-beyond-spider-verse-2026.jpg',
  'fantastic four': 'assets/posters/fantastic-four-first-steps-2025.jpg',
  'captain america': 'assets/posters/captain-america-brave-new-world-2025.jpg',
  'jurassic world': 'assets/posters/jurassic-world-rebirth-2025.jpg',
  'mickey 17': 'assets/posters/mickey-17-2025.jpg',
  'ballerina': 'assets/posters/ballerina-2025.jpg',
  '28 years later': 'assets/posters/28-years-later-2025.jpg',
  'tron': 'assets/posters/tron-ares-2025.jpg',
  'gladiator': 'assets/posters/gladiator-2-2024.jpg',
  'mission: impossible': 'assets/posters/mission-impossible-final-reckoning.jpg',
  'mission impossible': 'assets/posters/mission-impossible-final-reckoning.jpg',
  'alien: romulus': 'assets/posters/alien-romulus-2024.jpg',
  'alien romulus': 'assets/posters/alien-romulus-2024.jpg',
  'dune: prophecy': 'assets/posters/dune-prophecy-2024.jpg',
  'dune prophecy': 'assets/posters/dune-prophecy-2024.jpg',
  'godzilla x kong': 'assets/posters/godzilla-x-kong-the-new-empire.jpg',
  'godzilla': 'assets/posters/godzilla-x-kong-the-new-empire.jpg',
  'wicked': 'assets/posters/wicked-part-one-2024.jpg',
  'toy story': 'assets/posters/toy-story-4.jpg',
  'how to train your dragon': 'assets/posters/how-to-train-your-dragon-live-action.jpg',
  'shrek': 'assets/posters/dandadan-2024.jpg',

  // Western Series
  'squid game': 'assets/posters/squid-game-s2-2025.jpg',
  'rick and morty': 'assets/posters/rick-and-morty-2025.jpg',
  'stranger things': 'assets/posters/stranger-things-s5-2025.jpg',
  'the last of us': 'assets/posters/the-last-of-us-s2-2025.jpg',
  'last of us': 'assets/posters/the-last-of-us-s2-2025.jpg',
  'wednesday': 'assets/posters/wednesday-s2-2025.jpg',
  'house of the dragon': 'assets/posters/house-of-the-dragon-s3-2026.jpg',
  'the boys': 'assets/posters/the-boys-s5-2025.jpg',
  'peacemaker': 'assets/posters/peacemaker-s2-2025.jpg',
  'severance': 'assets/posters/severance-s2-2025.jpg',
  'euphoria': 'assets/posters/euphoria-s3-2025.jpg',

  // Drama Korea
  'all of us are dead': 'assets/posters/all-of-us-are-dead-s2-2025.jpg',
  'moving': 'assets/posters/moving-s2-2025.jpg',
  'sweet home': 'assets/posters/sweet-home-s3-2024.jpg',
  'queen of tears': 'assets/posters/queen-of-tears-2024.jpg',
  'vincenzo': 'assets/posters/vincenzo-2021.jpg',

  // Anime
  'demon slayer': 'assets/posters/demon-slayer-infinity-castle-2025.jpg',
  'solo leveling': 'assets/posters/solo-leveling-s2-2025.jpg',
  'chainsaw man': 'assets/posters/chainsaw-man-reze-arc-2025.jpg',
  'jujutsu kaisen': 'assets/posters/jujutsu-kaisen-culling-game-2025.jpg',
  'bleach': 'assets/posters/bleach-thousand-year-blood-war-p3-2024.jpg',
  'one piece': 'assets/posters/one-piece-egghead-arc-2024.jpg',
  'spy x family': 'assets/posters/spy-x-family-s3-2025.jpg',
  'kaiju no': 'assets/posters/kaiju-no-8-s2-2025.jpg',
  'kaiju no. 8': 'assets/posters/kaiju-no-8-s2-2025.jpg',
  'dandadan': 'assets/posters/dandadan-2024.jpg',
  'my hero academia': 'assets/posters/my-hero-academia-anime.jpg',
  'attack on titan': 'assets/posters/demon-slayer-infinity-castle-2025.jpg',

  // Indonesia
  'pengabdi setan': 'assets/posters/pengabdi-setan-3-2025.jpg',
  'siksa kubur': 'assets/posters/siksa-kubur-2024.jpg',
  'agak laen': 'assets/posters/agak-laen-2-2025.jpg',
  'kkn di desa penari': 'assets/posters/kkn-desa-penari-luwih-dowo-2023.jpg',
  'kkn desa penari': 'assets/posters/kkn-desa-penari-luwih-dowo-2023.jpg',
  'gundala': 'assets/posters/gundala-2-2025.jpg',
  'sri asih': 'assets/posters/sri-asih-2022.jpg',
  'petualangan sherina': 'assets/posters/petualangan-sherina-2-2023.jpg',
  'dilan': 'assets/posters/dilan-1990.jpg',
  'bumi manusia': 'assets/posters/bumi-manusia-film.jpg',
  'the big 4': 'assets/posters/the-big-4-film.jpg',
  'jumbo': 'assets/posters/petualangan-sherina-2-2023.jpg',
  'qodrat': 'assets/posters/pengabdi-setan-3-2025.jpg'
};

function getPosterForMovie(title, slug) {
  const clean = title.toLowerCase();
  for (const [key, path] of Object.entries(MOVIE_POSTER_MAP)) {
    if (clean.includes(key)) {
      return path;
    }
  }
  return null;
}

// Generates and stores movie objects into movieRegistry
function generateMovies(category, count = 20) {
  let list = TOP_VIEW_DATABASE[category] || TOP_VIEW_DATABASE.topview;

  // Augment category list with items from IDLIX_DATABASE if available
  if (window.IDLIX_DATABASE && Array.isArray(window.IDLIX_DATABASE)) {
    let idlixFiltered = [];
    if (category === 'series') {
      idlixFiltered = window.IDLIX_DATABASE.filter(m => m.type === 'series');
    } else if (category === 'anime') {
      idlixFiltered = window.IDLIX_DATABASE.filter(m => m.genres.includes('Animation') || m.country === 'Jepang');
    } else if (category === 'kdrama') {
      idlixFiltered = window.IDLIX_DATABASE.filter(m => m.country === 'Korea Selatan' || m.genres.includes('Romance') || m.description.toLowerCase().includes('korea'));
    } else if (category === 'indonesia') {
      idlixFiltered = window.IDLIX_DATABASE.filter(m => m.country === 'Indonesia' || m.genres.includes('Horror'));
    } else if (category === 'latest') {
      idlixFiltered = window.IDLIX_DATABASE.filter(m => m.year >= 2025).concat(window.IDLIX_DATABASE.filter(m => m.year === 2024));
    } else if (category === 'topview' || category === 'popular') {
      idlixFiltered = window.IDLIX_DATABASE.filter(m => parseFloat(m.rating) >= 8.6);
    } else if (category === 'trending') {
      idlixFiltered = window.IDLIX_DATABASE.slice(0, 40);
    }

    if (idlixFiltered.length > 0) {
      const titleMap = new Set(list.map(i => i.title.toLowerCase()));
      idlixFiltered.forEach(m => {
        if (!titleMap.has(m.title.toLowerCase())) {
          list = list.concat(m);
          titleMap.add(m.title.toLowerCase());
        }
      });
    }
  }

  return list.slice(0, count).map((item, i) => {
    if (item.title && item.title.toLowerCase().includes('rick and morty')) {
      return rickAndMorty;
    }

    // If item is already a fully formed movie object from IDLIX_DATABASE
    if (item.id && item.originalTitle && item.genres && item.gradient) {
      movieRegistry.set(item.id, item);
      movieRegistry.set(item.slug, item);
      movieRegistry.set(slugify(item.title), item);
      return item;
    }

    const movieId = item.id || `${category}-${i}-${slugify(item.title)}`;
    const slug = item.slug || slugify(item.title);
    const gradientIndex = (Object.keys(TOP_VIEW_DATABASE).indexOf(category) * 4 + i) % GRADIENTS.length;
    const isSeries = item.type === 'series';
    const epCount = item.episodeCount || (isSeries ? 8 : null);

    const episodes = isSeries ? Array.from({ length: epCount }, (_, epI) => ({
      number: epI + 1,
      title: `${item.title} — Episode ${epI + 1}`,
      duration: `${45 + (epI % 15)}m`
    })) : null;

    const poster = item.poster || getPosterForMovie(item.title, slug);
    const backdrop = item.backdrop || poster || 'assets/hero/hero-1.jpg';

    const movieObj = {
      id: movieId,
      title: item.title,
      originalTitle: item.originalTitle || `${item.title} (${item.year})`,
      year: item.year,
      rating: item.rating || '8.8',
      genre: item.genre || (item.genres && item.genres[0]) || 'Film',
      genres: item.genres || [item.genre || 'Action', 'Drama'].filter((v, idx, arr) => arr.indexOf(v) === idx),
      quality: item.quality === '4K' ? '4K Ultra HD' : (item.quality === '1080p' ? '1080p FHD' : (item.quality || 'HD')),
      type: item.type || 'movie',
      episode: isSeries ? `S1 EP${epCount}` : null,
      episodes,
      poster,
      backdrop,
      gradient: item.gradient || GRADIENTS[gradientIndex],
      emoji: item.emoji || '🎬',
      country: item.country || 'United States',
      director: item.director || 'Christopher Nolan',
      cast: item.cast || 'Star Ensemble Cast',
      description: item.desc || item.description || `Saksikan film blockbuster ${item.title} (${item.year}) dengan kualitas visual jernih dan subtitle Indonesia resmi di Cinelax.`,
      slug: item.slug || `${slug}-${item.year}`,
      imdbId: item.imdbId,
      tmdbId: item.tmdbId,
      idlixUrl: isSeries ? `https://z2.idlixku.com/series/${slug}-${item.year}` : `https://z2.idlixku.com/movie/${slug}-${item.year}`,
      isUnavailable: false,
      trailerUrl: item.trailerUrl || null
    };

    movieRegistry.set(movieId, movieObj);
    movieRegistry.set(movieObj.slug, movieObj);
    movieRegistry.set(slugify(movieObj.title), movieObj);
    return movieObj;
  });
}

// Prepopulate all categories into registry
function initRegistry() {
  // Pre-load all IDLIX movies into the registry map
  if (window.IDLIX_DATABASE && Array.isArray(window.IDLIX_DATABASE)) {
    window.IDLIX_DATABASE.forEach(m => {
      movieRegistry.set(m.id, m);
      movieRegistry.set(m.slug, m);
      movieRegistry.set(slugify(m.title), m);
    });
  }

  // Pre-load hero slides
  heroSlides.forEach(slide => {
    movieRegistry.set(slide.id, slide);
    movieRegistry.set(slide.slug, slide);
    movieRegistry.set(slugify(slide.title), slide);
  });

  // Prepopulate all categories
  Object.keys(TOP_VIEW_DATABASE).forEach(cat => generateMovies(cat, 50));
}

// ==========================================
// MOVIE CARD COMPONENT
// ==========================================

function renderMovieCard(movie) {
  const hasPoster = Boolean(movie.poster);

  return `
    <div class="movie-card" data-id="${movie.id}" onclick="openDetailOrPlayer('${movie.id}')">
      <div class="card-poster">
        ${hasPoster ? `
          <img src="${movie.poster}" alt="${movie.title}" loading="lazy" class="poster-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="poster-gradient" style="background: ${movie.gradient}; display: none;">
            <span>${movie.emoji}</span>
          </div>
        ` : `
          <div class="poster-gradient" style="background: ${movie.gradient}">
            <span>${movie.emoji}</span>
          </div>
        `}
        <div class="card-overlay">
          <div class="card-play-btn">▶</div>
        </div>
        <span class="card-badge-quality">${movie.quality}</span>
        <span class="card-badge-rating"><span class="star">⭐</span> ${movie.rating}</span>
        ${movie.type === 'series' ? `<span class="card-badge-type">Series</span>` : ''}
        ${movie.episode ? `<span class="card-badge-episode">${movie.episode}</span>` : ''}
      </div>
      <div class="card-info">
        <h3 class="card-title">${movie.title}</h3>
        <div class="card-meta">
          <span>${movie.year}</span>
          <span class="dot"></span>
          <span>${movie.genre || (movie.genres && movie.genres[0]) || 'Film'}</span>
        </div>
      </div>
    </div>
  `;
}

function renderContentSection(containerId, category, count = 20) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const movies = generateMovies(category, count);
  container.innerHTML = movies.map(m => renderMovieCard(m)).join('');
}

function renderAllSections() {
  renderContentSection('topview-row', 'topview', 24);
  renderContentSection('trending-row', 'trending', 24);
  renderContentSection('latest-row', 'latest', 24);
  renderContentSection('popular-row', 'popular', 24);
  renderContentSection('series-row', 'series', 24);
  renderContentSection('kdrama-row', 'kdrama', 24);
  renderContentSection('anime-row', 'anime', 24);
  renderContentSection('indonesia-row', 'indonesia', 24);
}

// Open modal player or standalone detail
function openDetailOrPlayer(movieId) {
  // If user clicks on card, open quick theater modal
  openPlayer(movieId);
}

window.openDetailOrPlayer = openDetailOrPlayer;

// ==========================================
// HERO SLIDER LOGIC
// ==========================================

let currentSlide = 0;
let slideInterval;
const SLIDE_DURATION = 6000;

function goToSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');

  if (!slides.length) return;

  slides[currentSlide]?.classList.remove('active');
  dots[currentSlide]?.classList.remove('active');

  currentSlide = index % slides.length;

  slides[currentSlide]?.classList.add('active');
  dots[currentSlide]?.classList.add('active');

  resetSlideInterval();
}

function nextSlide() {
  const slides = document.querySelectorAll('.hero-slide');
  goToSlide((currentSlide + 1) % slides.length);
}

function prevSlide() {
  const slides = document.querySelectorAll('.hero-slide');
  goToSlide((currentSlide - 1 + slides.length) % slides.length);
}

function resetSlideInterval() {
  clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, SLIDE_DURATION);
}

function renderHeroSlider() {
  const heroContainer = document.getElementById('hero-slider');
  const dotsContainer = document.getElementById('hero-dots');

  if (!heroContainer || !dotsContainer) return;
  heroContainer.innerHTML = '';
  dotsContainer.innerHTML = '';

  heroSlides.forEach((slide, i) => {
    const slideEl = document.createElement('div');
    slideEl.className = `hero-slide ${i === 0 ? 'active' : ''}`;
    slideEl.innerHTML = `
      <div class="hero-slide-bg" style="background-image: url('${slide.backdrop}')"></div>
      <div class="hero-slide-overlay"></div>
      <div class="hero-content container">
        <div class="hero-info">
          <div class="hero-badge">${slide.badge}</div>
          <h1 class="hero-title">${slide.title}</h1>
          <div class="hero-meta">
            <span class="hero-rating"><span class="star">⭐</span> ${slide.rating}</span>
            <span class="hero-meta-divider"></span>
            <span class="hero-meta-item">${slide.year}</span>
            <span class="hero-meta-divider"></span>
            <span class="hero-meta-item">${slide.duration}</span>
            <span class="hero-meta-divider"></span>
            <span class="hero-meta-item">${slide.quality}</span>
          </div>
          <div class="hero-genres">
            ${slide.genres.map(g => `<span class="hero-genre-tag">${g}</span>`).join('')}
          </div>
          <p class="hero-description">${slide.description}</p>
          <div class="hero-buttons">
            <button class="btn btn-primary" onclick="openPlayer('${slide.id}')">▶ Tonton Sekarang</button>
            <a href="/movie/${slide.slug}" class="btn btn-secondary" data-nav="/movie/${slide.slug}">ℹ️ Detail Lengkap</a>
          </div>
        </div>
      </div>
    `;
    heroContainer.appendChild(slideEl);

    const dot = document.createElement('button');
    dot.className = `hero-dot ${i === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });
}

function initHeroSlider() {
  renderHeroSlider();
  slideInterval = setInterval(nextSlide, SLIDE_DURATION);

  document.getElementById('hero-prev')?.addEventListener('click', prevSlide);
  document.getElementById('hero-next')?.addEventListener('click', nextSlide);

  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mouseenter', () => clearInterval(slideInterval));
    hero.addEventListener('mouseleave', () => {
      slideInterval = setInterval(nextSlide, SLIDE_DURATION);
    });
  }
}

// ==========================================
// STREAMING CONTROLLER & EMBED GENERATOR
// ==========================================

const STREAM_SERVERS = [
  { id: 'server-1', name: 'Server 1 (Cinelax Ultra HD)', quality: '1080p Ultra Fast' },
  { id: 'server-2', name: 'Server 2 (VidSrc VIP)', quality: 'Multi-Sub Indo' },
  { id: 'server-3', name: 'Server 3 (Filemoon)', quality: 'Super Buffer' },
  { id: 'server-4', name: 'Server 4 (Backup Cloud)', quality: '720p HD Clean' }
];

function getStreamEmbedUrl(movie, serverIdx, seasonIdx, episodeIdx) {
  const isSeries = movie.type === 'series';
  const seasonNum = seasonIdx + 1;
  const epNum = episodeIdx + 1;
  const imdbId = movie.imdbId || (isSeries ? 'tt2861424' : 'tt1757678');
  const tmdbId = movie.tmdbId || (isSeries ? '60625' : '83533');

  switch (serverIdx) {
    case 0:
      return isSeries 
        ? `https://vidsrc.to/embed/tv/${imdbId}/${seasonNum}/${epNum}`
        : `https://vidsrc.to/embed/movie/${imdbId}`;
    case 1:
      return isSeries 
        ? `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${seasonNum}&episode=${epNum}`
        : `https://vidsrc.me/embed/movie?imdb=${imdbId}`;
    case 2:
      return isSeries 
        ? `https://embed.smashystream.com/playertv.php?tmdb=${tmdbId}&s=${seasonNum}&e=${epNum}`
        : `https://embed.smashystream.com/playermovie.php?tmdb=${tmdbId}`;
    case 3:
    default:
      return isSeries 
        ? `https://multiembed.mov/directstream.php?video_id=${imdbId}&s=${seasonNum}&e=${epNum}`
        : `https://multiembed.mov/directstream.php?video_id=${imdbId}`;
  }
}

// ==========================================
// QUICK THEATER MODAL CONTROLLER
// ==========================================

let activeMovie = null;
let activeServerIndex = 0;
let activeSeasonIndex = 0;
let activeEpisodeIndex = 0;
let isCinemaMode = false;
let modalPlayingTrailer = false;

function loadPlayerIframe() {
  if (!activeMovie) return;

  const iframe = document.getElementById('video-player-iframe');
  const loader = document.getElementById('player-iframe-loader');
  const overlay = document.getElementById('player-unavailable-overlay');
  const overlayMsg = document.getElementById('modal-unavailable-msg');

  if (!iframe) return;

  // Check if movie is marked unavailable and we're not currently previewing trailer
  if (activeMovie.isUnavailable && !modalPlayingTrailer) {
    if (loader) loader.classList.add('hidden');
    iframe.src = 'about:blank';
    if (overlay) {
      overlay.style.display = 'flex';
      if (overlayMsg) {
        overlayMsg.textContent = `Film "${activeMovie.title}" (${activeMovie.year}) saat ini belum dapat diputar secara streaming. Judul ini masih dalam jadwal penayangan bioskop atau menunggu rilis digital resmi. Anda dapat memutar trailer resminya di bawah ini.`;
      }
    }
    return;
  }

  // Hide unavailable overlay
  if (overlay) overlay.style.display = 'none';
  if (loader) loader.classList.remove('hidden');

  if (modalPlayingTrailer && activeMovie.trailerUrl) {
    const trailerSrc = activeMovie.trailerUrl.includes('?') 
      ? `${activeMovie.trailerUrl}&autoplay=1` 
      : `${activeMovie.trailerUrl}?autoplay=1`;
    iframe.src = trailerSrc;
  } else {
    const streamUrl = getStreamEmbedUrl(activeMovie, activeServerIndex, activeSeasonIndex, activeEpisodeIndex);
    iframe.src = streamUrl;
  }

  iframe.onload = () => {
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
    }, 400);
  };

  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
  }, 2200);
}

function renderModalServerButtons() {
  const container = document.getElementById('player-server-buttons');
  if (!container) return;

  container.innerHTML = STREAM_SERVERS.map((server, idx) => `
    <button class="server-btn ${idx === activeServerIndex ? 'active' : ''}" onclick="switchPlayerServer(${idx})">
      <span class="server-status-dot"></span>
      <span>${server.name}</span>
    </button>
  `).join('');
}

function renderModalEpisodesSection(movie) {
  const section = document.getElementById('player-episodes-section');
  const seasonWrap = document.getElementById('season-selector-wrap');
  const grid = document.getElementById('episodes-grid');

  if (!section || !grid) return;

  if (movie.type !== 'series') {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  const seasons = movie.seasons || [
    { season: 1, episodes: movie.episodes || [] }
  ];

  const currentSeasonData = seasons[activeSeasonIndex] || seasons[0];
  const episodesList = currentSeasonData.episodes || [];

  if (seasonWrap) {
    seasonWrap.innerHTML = seasons.map((s, sIdx) => `
      <button class="season-tab-btn ${sIdx === activeSeasonIndex ? 'active' : ''}" onclick="switchPlayerSeason(${sIdx})">
        Season ${s.season || sIdx + 1}
      </button>
    `).join('');
  }

  grid.innerHTML = episodesList.map((ep, idx) => `
    <div class="episode-card ${idx === activeEpisodeIndex ? 'active' : ''}" onclick="selectPlayerEpisode(${idx})">
      <div class="episode-card-info">
        <span class="ep-num">S${activeSeasonIndex + 1} EP ${ep.number} (${ep.duration})</span>
        <span class="ep-title">${ep.title}</span>
      </div>
      <span class="ep-play-icon">${idx === activeEpisodeIndex ? '▶' : '▷'}</span>
    </div>
  `).join('');
}

function renderRelatedInModal(current) {
  const container = document.getElementById('modal-related-grid');
  if (!container) return;

  const related = Array.from(movieRegistry.values())
    .filter(m => m.id !== current.id && (m.genre === current.genre || m.type === current.type))
    .slice(0, 5);

  container.innerHTML = related.map(m => `
    <div class="modal-related-card" onclick="openPlayer('${m.id}')">
      <div class="modal-related-poster" style="background: ${m.gradient}">
        <span>${m.emoji}</span>
      </div>
      <div class="modal-related-info">
        <h5 class="modal-related-title">${m.title}</h5>
        <div class="modal-related-meta">⭐ ${m.rating} · ${m.year}</div>
      </div>
    </div>
  `).join('');
}

function openPlayer(movieId, episodeIndex = 0, seasonIndex = 0) {
  let movie = movieRegistry.get(movieId);
  if (!movie) {
    movie = Array.from(movieRegistry.values()).find(m => m.slug === movieId || slugify(m.title) === movieId);
  }
  if (!movie) return;

  activeMovie = movie;
  activeServerIndex = 0;
  activeSeasonIndex = seasonIndex;
  activeEpisodeIndex = episodeIndex;
  modalPlayingTrailer = false;

  const modal = document.getElementById('player-modal');
  if (!modal) return;

  const titleEl = document.getElementById('modal-movie-title');
  const typeBadge = document.getElementById('modal-type-badge');
  const qualityBadge = document.getElementById('modal-quality-badge');

  if (titleEl) {
    if (movie.type === 'series') {
      const currentSeason = movie.seasons ? movie.seasons[activeSeasonIndex] : null;
      const currentEp = currentSeason && currentSeason.episodes ? currentSeason.episodes[activeEpisodeIndex] : null;
      const epTitle = currentEp ? ` — S${activeSeasonIndex + 1} EP${currentEp.number}: ${currentEp.title}` : ` — S${activeSeasonIndex + 1} EP${activeEpisodeIndex + 1}`;
      titleEl.textContent = `${movie.title}${epTitle}`;
    } else {
      titleEl.textContent = `${movie.title} (${movie.year})`;
    }
  }

  if (typeBadge) {
    typeBadge.textContent = movie.type === 'series' ? 'SERIES' : 'MOVIE';
    typeBadge.className = `modal-badge-type ${movie.type === 'series' ? 'series' : ''}`;
  }

  if (qualityBadge) qualityBadge.textContent = movie.quality || '4K';

  const posterBox = document.getElementById('modal-poster-box');
  const posterEmoji = document.getElementById('modal-poster-emoji');
  if (posterBox) {
    if (movie.poster) {
      posterBox.innerHTML = `<img src="${movie.poster}" alt="${movie.title}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">`;
      posterBox.style.background = 'transparent';
    } else {
      posterBox.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;">${movie.emoji}</div>`;
      posterBox.style.background = movie.gradient;
    }
  }

  const ratingEl = document.getElementById('modal-rating');
  const yearEl = document.getElementById('modal-year');
  const durationEl = document.getElementById('modal-duration');
  const countryEl = document.getElementById('modal-country');
  const genresEl = document.getElementById('modal-genres');
  const synopsisEl = document.getElementById('modal-synopsis');
  const directorEl = document.getElementById('modal-director');
  const castEl = document.getElementById('modal-cast');
  const qualityDetailEl = document.getElementById('modal-quality-detail');

  if (ratingEl) ratingEl.innerHTML = `<span class="star">⭐</span> ${movie.rating}`;
  if (yearEl) yearEl.textContent = movie.year;
  if (durationEl) durationEl.textContent = movie.duration || (movie.type === 'series' ? '45m/ep' : '2h 15m');
  if (countryEl) countryEl.textContent = movie.country || 'United States';

  if (genresEl) {
    const genreList = movie.genres || [movie.genre || 'Action'];
    genresEl.innerHTML = genreList.map(g => `<span class="genre-pill">${g}</span>`).join('');
  }

  if (synopsisEl) synopsisEl.textContent = movie.description;
  if (directorEl) directorEl.textContent = movie.director || 'James Cameron';
  if (castEl) castEl.textContent = movie.cast || 'Hollywood Star Ensemble';
  if (qualityDetailEl) qualityDetailEl.textContent = `${movie.quality || '4K Ultra HD'} (Subtitle Indonesia)`;

  renderModalServerButtons();
  renderModalEpisodesSection(movie);
  renderRelatedInModal(movie);

  loadPlayerIframe();

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

window.openPlayer = openPlayer;

function closePlayer() {
  const modal = document.getElementById('player-modal');
  const iframe = document.getElementById('video-player-iframe');
  const overlay = document.getElementById('player-unavailable-overlay');

  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';

  if (iframe) iframe.src = '';
  if (overlay) overlay.style.display = 'none';
  modalPlayingTrailer = false;

  if (isCinemaMode) {
    isCinemaMode = false;
    document.body.classList.remove('cinema-mode-active');
    document.getElementById('btn-cinema-mode')?.classList.remove('active');
  }
}

window.closePlayer = closePlayer;

function switchPlayerServer(serverIdx) {
  if (activeServerIndex === serverIdx) return;
  activeServerIndex = serverIdx;
  modalPlayingTrailer = false;
  renderModalServerButtons();
  loadPlayerIframe();
  showToast(`Mengalihkan ke ${STREAM_SERVERS[serverIdx].name}...`, 'info');
}

window.switchPlayerServer = switchPlayerServer;

function switchPlayerSeason(seasonIdx) {
  activeSeasonIndex = seasonIdx;
  activeEpisodeIndex = 0;
  if (activeMovie) {
    const currentSeason = activeMovie.seasons ? activeMovie.seasons[activeSeasonIndex] : null;
    const currentEp = currentSeason && currentSeason.episodes ? currentSeason.episodes[0] : null;
    const epTitle = currentEp ? ` — S${activeSeasonIndex + 1} EP${currentEp.number}: ${currentEp.title}` : ` — S${activeSeasonIndex + 1} EP1`;
    
    const titleEl = document.getElementById('modal-movie-title');
    if (titleEl) titleEl.textContent = `${activeMovie.title}${epTitle}`;

    renderModalEpisodesSection(activeMovie);
    loadPlayerIframe();
    showToast(`Memuat Season ${seasonIdx + 1}...`, 'info');
  }
}

window.switchPlayerSeason = switchPlayerSeason;

function selectPlayerEpisode(episodeIdx) {
  activeEpisodeIndex = episodeIdx;
  if (activeMovie) {
    const currentSeason = activeMovie.seasons ? activeMovie.seasons[activeSeasonIndex] : null;
    const currentEp = currentSeason && currentSeason.episodes ? currentSeason.episodes[activeEpisodeIndex] : null;
    const epTitle = currentEp ? ` — S${activeSeasonIndex + 1} EP${currentEp.number}: ${currentEp.title}` : ` — S${activeSeasonIndex + 1} EP${activeEpisodeIndex + 1}`;

    const titleEl = document.getElementById('modal-movie-title');
    if (titleEl) titleEl.textContent = `${activeMovie.title}${epTitle}`;

    renderModalEpisodesSection(activeMovie);
    loadPlayerIframe();
    showToast(`Memutar Episode ${episodeIdx + 1}...`, 'info');
  }
}

window.selectPlayerEpisode = selectPlayerEpisode;

function toggleCinemaMode() {
  isCinemaMode = !isCinemaMode;
  document.body.classList.toggle('cinema-mode-active', isCinemaMode);
  const btn = document.getElementById('btn-cinema-mode');
  const btnDetail = document.getElementById('btn-detail-cinema');
  if (btn) btn.classList.toggle('active', isCinemaMode);
  if (btnDetail) btnDetail.classList.toggle('active', isCinemaMode);

  showToast(isCinemaMode ? '💡 Cinema Mode Aktif' : '💡 Cinema Mode Nonaktif', 'info');
}

window.toggleCinemaMode = toggleCinemaMode;

// Share Movie Link
function shareMovie(movie) {
  const m = movie || activeMovie;
  if (!m) return;

  const url = `${window.location.origin}${window.location.pathname}#/movie/${m.slug || m.id}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      showToast(`🔗 Tautan film "${m.title}" disalin ke clipboard!`, 'success');
    }).catch(() => {
      showToast(`🔗 ${url}`, 'info');
    });
  } else {
    showToast(`🔗 ${url}`, 'info');
  }
}

window.shareMovie = shareMovie;

// ==========================================
// SPA ROUTER ENGINE & VIEW SWITCHER
// ==========================================

const ITEMS_PER_PAGE = 12;
let listingState = {
  currentCategory: 'all',
  genre: '',
  country: '',
  year: '',
  quality: '',
  type: '',
  sort: 'latest',
  searchQuery: '',
  page: 1
};

function hideAllViews() {
  document.querySelectorAll('.app-view').forEach(view => {
    view.style.display = 'none';
  });
}

function updateActiveNav(path) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const navAttr = link.getAttribute('data-nav') || link.getAttribute('href');
    if (navAttr === path || (path !== '/' && navAttr !== '/' && path.startsWith(navAttr))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function handleRoute() {
  let path = window.location.hash.replace(/^#/, '');
  if (!path) path = window.location.pathname;
  if (path === '' || path === 'index.html') path = '/';

  hideAllViews();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 1. Homepage
  if (path === '/' || path === '/home') {
    document.getElementById('view-homepage').style.display = 'block';
    updateActiveNav('/');
    document.title = 'Cinelax — Nonton Film & Serial TV Sub Indo';
    return;
  }

  // 2. Movies List (/movies)
  if (path === '/movies') {
    listingState = { ...listingState, type: 'movie', searchQuery: '', page: 1 };
    renderListingView('Semua Film (Movies)', 'Jelajahi seluruh film bioskop box office terbaru dengan subtitle Indonesia.', 'Movies');
    document.getElementById('view-listing').style.display = 'block';
    updateActiveNav('/movies');
    document.title = 'Daftar Film Terbaru — Cinelax';
    return;
  }

  // 3. Series List (/series)
  if (path === '/series') {
    listingState = { ...listingState, type: 'series', searchQuery: '', page: 1 };
    renderListingView('Serial TV & Drama', 'Koleksi serial TV Barat, Drama Korea, dan Anime terlengkap multi-season.', 'Series');
    document.getElementById('view-listing').style.display = 'block';
    updateActiveNav('/series');
    document.title = 'Serial TV & Drama Terbaru — Cinelax';
    return;
  }

  // 4. Trending List (/trending)
  if (path === '/trending') {
    listingState = { ...listingState, sort: 'popular', searchQuery: '', page: 1 };
    renderListingView('🔥 Trending 2025 — 2026', 'Film dan serial paling banyak ditonton dan viral minggu ini.', 'Trending');
    document.getElementById('view-listing').style.display = 'block';
    updateActiveNav('/');
    document.title = 'Film & Serial Trending — Cinelax';
    return;
  }

  // 5. Genre Filter (/genre/:slug)
  if (path.startsWith('/genre/')) {
    const genreSlug = path.replace('/genre/', '').split('?')[0];
    const genreMap = {
      'action': 'Action', 'adventure': 'Adventure', 'animation': 'Animation',
      'comedy': 'Comedy', 'crime': 'Crime', 'documentary': 'Documentary',
      'drama': 'Drama', 'family': 'Family', 'fantasy': 'Fantasy',
      'history': 'History', 'horror': 'Horror', 'music': 'Music',
      'mystery': 'Mystery', 'romance': 'Romance', 'sci-fi': 'Sci-Fi',
      'superhero': 'Superhero', 'thriller': 'Thriller', 'tv-movie': 'TV Movie',
      'war': 'War', 'western': 'Western'
    };
    const genreName = genreMap[genreSlug.toLowerCase()] || genreSlug;
    listingState = { ...listingState, genre: genreName, searchQuery: '', page: 1 };
    renderListingView(`Genre: ${genreName}`, `Koleksi film dan serial TV bertema ${genreName} terbaik.`, genreName);
    document.getElementById('view-listing').style.display = 'block';
    updateActiveNav('/genre/' + genreSlug);
    document.title = `Film ${genreName} Terbaik — Cinelax`;
    return;
  }

  // 6. Country Filter (/country/:slug)
  if (path.startsWith('/country/')) {
    const countrySlug = path.replace('/country/', '').split('?')[0];
    const countryMap = {
      'us': 'United States', 'uk': 'United Kingdom', 'korea': 'Korea Selatan',
      'japan': 'Jepang', 'china': 'China', 'india': 'India',
      'thailand': 'Thailand', 'indonesia': 'Indonesia', 'philippines': 'Filipina',
      'hongkong': 'Hong Kong', 'taiwan': 'Taiwan', 'france': 'Prancis',
      'germany': 'Jerman', 'spain': 'Spanyol', 'turkey': 'Turki'
    };
    const countryName = countryMap[countrySlug.toLowerCase()] || countrySlug;
    listingState = { ...listingState, country: countryName, searchQuery: '', page: 1 };
    renderListingView(`Negara: ${countryName}`, `Daftar film dan drama produksi ${countryName}.`, countryName);
    document.getElementById('view-listing').style.display = 'block';
    updateActiveNav('/country/' + countrySlug);
    document.title = `Film & Drama ${countryName} — Cinelax`;
    return;
  }

  // 7. Year Filter (/year/:year)
  if (path.startsWith('/year/')) {
    const year = path.replace('/year/', '').split('?')[0];
    listingState = { ...listingState, year: year, searchQuery: '', page: 1 };
    renderListingView(`Tahun Rilis: ${year}`, `Daftar film dan serial yang dirilis pada tahun ${year}.`, year);
    document.getElementById('view-listing').style.display = 'block';
    updateActiveNav('/year/' + year);
    document.title = `Film Tahun ${year} — Cinelax`;
    return;
  }

  // 8. Search Query (/search?q=...)
  if (path.startsWith('/search')) {
    const params = new URLSearchParams(path.split('?')[1] || window.location.search);
    const query = params.get('q') || '';
    listingState = { ...listingState, searchQuery: query, page: 1 };
    renderListingView(`Hasil Pencarian: "${query}"`, `Menampilkan semua judul yang cocok dengan kata kunci "${query}".`, `Pencarian: ${query}`);
    document.getElementById('view-listing').style.display = 'block';
    updateActiveNav('/');
    document.title = `Pencarian: ${query} — Cinelax`;
    return;
  }

  // 9. Dedicated Detail Page (/movie/:slug or /series/:slug)
  if (path.startsWith('/movie/') || path.startsWith('/series/')) {
    const parts = path.split('/');
    const slug = parts[2];
    let seasonNum = 1;
    let epNum = 1;

    if (parts[3] === 'season' && parts[4] && parts[5] === 'episode' && parts[6]) {
      seasonNum = parseInt(parts[4], 10) || 1;
      epNum = parseInt(parts[6], 10) || 1;
    }

    let movie = movieRegistry.get(slug);
    if (!movie) {
      movie = Array.from(movieRegistry.values()).find(m => m.slug === slug || slugify(m.title) === slug);
    }

    if (movie) {
      renderDedicatedDetailView(movie, seasonNum - 1, epNum - 1);
      document.getElementById('view-detail').style.display = 'block';
      updateActiveNav(movie.type === 'series' ? '/series' : '/movies');
      document.title = `Nonton ${movie.title} (${movie.year}) Sub Indo — Cinelax`;
      return;
    }
  }

  // 10. 404 Page (Catch-all)
  renderNotFoundView();
  document.getElementById('view-404').style.display = 'block';
  updateActiveNav('/');
  document.title = '404 — Halaman Tidak Ditemukan — Cinelax';
}

function navigate(url) {
  // Use hash routing for ultra compatibility across all local and static servers
  const cleanUrl = url.startsWith('/') ? `#${url}` : `#/${url}`;
  window.location.hash = cleanUrl;
}

window.navigate = navigate;

// ==========================================
// LISTING VIEW CONTROLLER
// ==========================================

function getFilteredMovies() {
  let list = Array.from(movieRegistry.values());
  // Remove duplicates by normalized title
  const uniqueMap = new Map();
  list.forEach(item => {
    if (item && item.title) {
      const key = item.title.trim().toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    }
  });
  list = Array.from(uniqueMap.values());

  // Search Filter
  if (listingState.searchQuery) {
    const q = listingState.searchQuery.toLowerCase();
    list = list.filter(m => 
      m.title.toLowerCase().includes(q) ||
      (m.genre && m.genre.toLowerCase().includes(q)) ||
      (m.cast && m.cast.toLowerCase().includes(q)) ||
      (m.director && m.director.toLowerCase().includes(q)) ||
      (m.country && m.country.toLowerCase().includes(q))
    );
  }

  // Type Filter
  if (listingState.type) {
    list = list.filter(m => m.type === listingState.type);
  }

  // Genre Filter
  if (listingState.genre) {
    list = list.filter(m => 
      (m.genre && m.genre.toLowerCase() === listingState.genre.toLowerCase()) ||
      (m.genres && m.genres.some(g => g.toLowerCase() === listingState.genre.toLowerCase()))
    );
  }

  // Country Filter
  if (listingState.country) {
    list = list.filter(m => m.country && m.country.toLowerCase().includes(listingState.country.toLowerCase()));
  }

  // Year Filter
  if (listingState.year) {
    list = list.filter(m => String(m.year) === String(listingState.year));
  }

  // Quality Filter
  if (listingState.quality) {
    list = list.filter(m => m.quality && m.quality.toLowerCase().includes(listingState.quality.toLowerCase()));
  }

  // Sorting
  switch (listingState.sort) {
    case 'rating':
      list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      break;
    case 'popular':
      list.sort((a, b) => (b.year * 10 + parseFloat(b.rating)) - (a.year * 10 + parseFloat(a.rating)));
      break;
    case 'title':
      list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'year':
      list.sort((a, b) => b.year - a.year);
      break;
    case 'latest':
    default:
      list.sort((a, b) => (b.year === a.year ? parseFloat(b.rating) - parseFloat(a.rating) : b.year - a.year));
      break;
  }

  return list;
}

function renderListingView(title, subtitle, breadcrumbName) {
  const titleEl = document.getElementById('listing-page-title');
  const descEl = document.getElementById('listing-page-desc');
  const breadcrumbCurrent = document.getElementById('listing-breadcrumb-current');

  if (titleEl) titleEl.innerHTML = `<span class="title-accent"></span> <span>${title}</span>`;
  if (descEl) descEl.textContent = subtitle;
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = breadcrumbName;

  // Sync toolbar selects
  const genreSelect = document.getElementById('filter-genre');
  const countrySelect = document.getElementById('filter-country');
  const yearSelect = document.getElementById('filter-year');
  const qualitySelect = document.getElementById('filter-quality');
  const typeSelect = document.getElementById('filter-type');
  const sortSelect = document.getElementById('filter-sort');

  if (genreSelect) genreSelect.value = listingState.genre || '';
  if (countrySelect) countrySelect.value = listingState.country || '';
  if (yearSelect) yearSelect.value = listingState.year || '';
  if (qualitySelect) qualitySelect.value = listingState.quality || '';
  if (typeSelect) typeSelect.value = listingState.type || '';
  if (sortSelect) sortSelect.value = listingState.sort || 'latest';

  // Render Sidebar Top Picks
  renderSidebarTopPicks();

  // Render Main Grid & Pagination
  updateListingGrid();
}

function updateListingGrid() {
  const grid = document.getElementById('listing-grid');
  const emptyState = document.getElementById('listing-empty-state');
  const pagination = document.getElementById('listing-pagination');
  const countText = document.getElementById('listing-count-text');
  const pillsBar = document.getElementById('active-pills-bar');
  const pillsContainer = document.getElementById('active-pills-container');

  if (!grid) return;

  const allFiltered = getFilteredMovies();
  const totalCount = allFiltered.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  if (listingState.page > totalPages) listingState.page = 1;

  const startIdx = (listingState.page - 1) * ITEMS_PER_PAGE;
  const pageItems = allFiltered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  if (countText) {
    countText.textContent = totalCount > 0 ? `${startIdx + 1}–${Math.min(startIdx + ITEMS_PER_PAGE, totalCount)} dari ${totalCount} judul` : '0 judul';
  }

  // Active Pills Bar
  const activeFilters = [];
  if (listingState.genre) activeFilters.push({ key: 'genre', label: `Genre: ${listingState.genre}` });
  if (listingState.country) activeFilters.push({ key: 'country', label: `Negara: ${listingState.country}` });
  if (listingState.year) activeFilters.push({ key: 'year', label: `Tahun: ${listingState.year}` });
  if (listingState.quality) activeFilters.push({ key: 'quality', label: `Kualitas: ${listingState.quality}` });
  if (listingState.type) activeFilters.push({ key: 'type', label: `Tipe: ${listingState.type === 'series' ? 'Series' : 'Movies'}` });
  if (listingState.searchQuery) activeFilters.push({ key: 'searchQuery', label: `Cari: "${listingState.searchQuery}"` });

  if (pillsBar && pillsContainer) {
    if (activeFilters.length > 0) {
      pillsBar.style.display = 'flex';
      pillsContainer.innerHTML = activeFilters.map(f => `
        <span class="active-pill">
          ${f.label}
          <span class="remove-pill" onclick="removeFilter('${f.key}')">✕</span>
        </span>
      `).join('');
    } else {
      pillsBar.style.display = 'none';
    }
  }

  if (totalCount === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (pagination) pagination.innerHTML = '';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  grid.innerHTML = pageItems.map(m => renderMovieCard(m)).join('');

  // Render Pagination Buttons
  if (pagination) {
    if (totalPages <= 1) {
      pagination.innerHTML = '';
    } else {
      let pagHtml = `
        <button class="page-btn" ${listingState.page === 1 ? 'disabled' : ''} onclick="changeListingPage(${listingState.page - 1})">« Prev</button>
      `;

      for (let p = 1; p <= totalPages; p++) {
        if (p === 1 || p === totalPages || (p >= listingState.page - 1 && p <= listingState.page + 1)) {
          pagHtml += `
            <button class="page-btn ${p === listingState.page ? 'active' : ''}" onclick="changeListingPage(${p})">${p}</button>
          `;
        } else if (p === listingState.page - 2 || p === listingState.page + 2) {
          pagHtml += `<span class="page-ellipsis">...</span>`;
        }
      }

      pagHtml += `
        <button class="page-btn" ${listingState.page === totalPages ? 'disabled' : ''} onclick="changeListingPage(${listingState.page + 1})">Next »</button>
      `;

      pagination.innerHTML = pagHtml;
    }
  }
}

function changeListingPage(newPage) {
  listingState.page = newPage;
  updateListingGrid();
  document.querySelector('.filter-toolbar')?.scrollIntoView({ behavior: 'smooth' });
}

window.changeListingPage = changeListingPage;

function removeFilter(key) {
  listingState[key] = '';
  listingState.page = 1;
  const el = document.getElementById(`filter-${key}`);
  if (el) el.value = '';
  updateListingGrid();
}

window.removeFilter = removeFilter;

function resetListingFilters() {
  listingState = {
    currentCategory: 'all',
    genre: '',
    country: '',
    year: '',
    quality: '',
    type: '',
    sort: 'latest',
    searchQuery: '',
    page: 1
  };
  document.querySelectorAll('.chip-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.chip-btn[data-filter-chip="all"]')?.classList.add('active');
  renderListingView('Semua Koleksi Film & Serial', 'Jelajahi seluruh koleksi film dan serial TV terbaik di Cinelax.', 'Katalog');
}

window.resetListingFilters = resetListingFilters;

function renderSidebarTopPicks() {
  const container = document.getElementById('sidebar-top-picks');
  if (!container) return;

  const topPicks = heroSlides.slice(0, 5);
  container.innerHTML = topPicks.map(m => `
    <div class="sidebar-mini-item" onclick="openPlayer('${m.id}')">
      <div class="sidebar-mini-poster" style="background: ${m.gradient}">
        ${m.poster ? `<img src="${m.poster}" alt="${m.title}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">` : `<span>${m.emoji}</span>`}
      </div>
      <div class="sidebar-mini-info">
        <h5 class="sidebar-mini-title">${m.title}</h5>
        <span class="sidebar-mini-meta">⭐ ${m.rating} · ${m.year}</span>
      </div>
    </div>
  `).join('');
}

function initListingFilterEvents() {
  const genreSelect = document.getElementById('filter-genre');
  const countrySelect = document.getElementById('filter-country');
  const yearSelect = document.getElementById('filter-year');
  const qualitySelect = document.getElementById('filter-quality');
  const typeSelect = document.getElementById('filter-type');
  const sortSelect = document.getElementById('filter-sort');
  const resetBtn = document.getElementById('btn-reset-filters');

  const onFilterChange = () => {
    listingState.genre = genreSelect?.value || '';
    listingState.country = countrySelect?.value || '';
    listingState.year = yearSelect?.value || '';
    listingState.quality = qualitySelect?.value || '';
    listingState.type = typeSelect?.value || '';
    listingState.sort = sortSelect?.value || 'latest';
    listingState.page = 1;
    updateListingGrid();
  };

  genreSelect?.addEventListener('change', onFilterChange);
  countrySelect?.addEventListener('change', onFilterChange);
  yearSelect?.addEventListener('change', onFilterChange);
  qualitySelect?.addEventListener('change', onFilterChange);
  typeSelect?.addEventListener('change', onFilterChange);
  sortSelect?.addEventListener('change', onFilterChange);
  resetBtn?.addEventListener('click', resetListingFilters);

  // Quick Chips
  document.querySelectorAll('.chip-btn[data-filter-chip]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip-btn[data-filter-chip]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const chipVal = chip.getAttribute('data-filter-chip');
      if (chipVal === 'all') {
        listingState.genre = '';
        listingState.year = '';
      } else if (chipVal === '2026' || chipVal === '2025') {
        listingState.year = chipVal;
      } else {
        listingState.genre = chipVal;
      }
      listingState.page = 1;
      updateListingGrid();
    });
  });
}

// ==========================================
// STANDALONE DETAIL VIEW CONTROLLER (#view-detail)
// ==========================================

let detailActiveMovie = null;
let detailServerIndex = 0;
let detailSeasonIndex = 0;
let detailEpisodeIndex = 0;
let detailPlayingTrailer = false;

function renderDedicatedDetailView(movie, seasonIdx = 0, episodeIdx = 0) {
  detailActiveMovie = movie;
  detailServerIndex = 0;
  detailSeasonIndex = seasonIdx;
  detailEpisodeIndex = episodeIdx;
  detailPlayingTrailer = false;

  // Breadcrumbs
  const breadcrumbType = document.getElementById('detail-breadcrumb-type');
  const breadcrumbTitle = document.getElementById('detail-breadcrumb-title');
  if (breadcrumbType) {
    breadcrumbType.textContent = movie.type === 'series' ? 'Series' : 'Movies';
    breadcrumbType.setAttribute('data-nav', movie.type === 'series' ? '/series' : '/movies');
  }
  if (breadcrumbTitle) breadcrumbTitle.textContent = movie.title;

  // Header Banner
  const titleEl = document.getElementById('detail-title');
  const typeBadge = document.getElementById('detail-type-badge');
  const qualityBadge = document.getElementById('detail-quality-badge');
  const ratingEl = document.getElementById('detail-rating');
  const yearEl = document.getElementById('detail-year');
  const durationEl = document.getElementById('detail-duration');
  const countryEl = document.getElementById('detail-country');
  const synopsisEl = document.getElementById('detail-synopsis');
  const genresList = document.getElementById('detail-genres-list');
  const posterBox = document.getElementById('detail-poster-box');
  const backdropBg = document.getElementById('detail-backdrop-bg');

  if (titleEl) titleEl.textContent = movie.title;
  if (typeBadge) typeBadge.textContent = movie.type === 'series' ? 'SERIES' : 'MOVIE';
  if (qualityBadge) qualityBadge.textContent = movie.quality || '4K ULTRA HD';
  if (ratingEl) ratingEl.textContent = movie.rating;
  if (yearEl) yearEl.textContent = movie.year;
  if (durationEl) durationEl.textContent = movie.duration || (movie.type === 'series' ? '45m/ep' : '2h 15m');
  if (countryEl) countryEl.textContent = movie.country || 'United States';
  if (synopsisEl) synopsisEl.textContent = movie.description;

  if (posterBox) {
    if (movie.poster) {
      posterBox.innerHTML = `<img src="${movie.poster}" alt="${movie.title}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">`;
      posterBox.style.background = 'transparent';
    } else {
      posterBox.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;">${movie.emoji}</div>`;
      posterBox.style.background = movie.gradient;
    }
  }
  if (backdropBg) backdropBg.style.backgroundImage = `url('${movie.backdrop || movie.poster || 'assets/hero/hero-1.jpg'}')`;

  if (genresList) {
    const list = movie.genres || [movie.genre || 'Action'];
    genresList.innerHTML = list.map(g => `<span class="hero-genre-tag">${g}</span>`).join('');
  }

  // Table Metadata
  const setTableVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '-';
  };

  setTableVal('table-original-title', movie.originalTitle || movie.title);
  setTableVal('table-director', movie.director || 'James Cameron');
  setTableVal('table-cast', movie.cast || 'Star Ensemble Cast');
  setTableVal('table-country', movie.country || 'United States');
  setTableVal('table-year', movie.year);
  setTableVal('table-duration', movie.duration || (movie.type === 'series' ? '45m/ep' : '2h 15m'));
  setTableVal('table-quality', movie.quality || '4K Ultra HD');
  setTableVal('table-rating', `⭐ ${movie.rating} / 10 (IMDb)`);
  setTableVal('table-genre', (movie.genres || [movie.genre]).join(', '));

  // Player Section
  renderDetailServerButtons();
  renderDetailEpisodesSection(movie);
  loadDetailPlayerIframe();

  // Related Row
  const relatedRow = document.getElementById('detail-related-row');
  if (relatedRow) {
    const relatedList = Array.from(movieRegistry.values())
      .filter(m => m.id !== movie.id && (m.genre === movie.genre || m.type === movie.type))
      .slice(0, 10);
    relatedRow.innerHTML = relatedList.map(m => renderMovieCard(m)).join('');
  }
}

function loadDetailPlayerIframe() {
  if (!detailActiveMovie) return;

  const iframe = document.getElementById('detail-player-iframe');
  const loader = document.getElementById('detail-iframe-loader');
  const overlay = document.getElementById('detail-unavailable-overlay');
  const overlayMsg = document.getElementById('detail-unavailable-msg');

  if (!iframe) return;

  // Check if movie is marked unavailable and we're not currently previewing trailer
  if (detailActiveMovie.isUnavailable && !detailPlayingTrailer) {
    if (loader) loader.classList.add('hidden');
    iframe.src = 'about:blank';
    if (overlay) {
      overlay.style.display = 'flex';
      if (overlayMsg) {
        overlayMsg.textContent = `Film "${detailActiveMovie.title}" (${detailActiveMovie.year}) saat ini belum dapat diputar secara streaming. Judul ini masih dalam jadwal penayangan bioskop atau menunggu rilis digital resmi. Anda dapat memutar trailer resminya di bawah ini.`;
      }
    }
    return;
  }

  // Hide unavailable overlay
  if (overlay) overlay.style.display = 'none';
  if (loader) loader.classList.remove('hidden');

  if (detailPlayingTrailer && detailActiveMovie.trailerUrl) {
    const trailerSrc = detailActiveMovie.trailerUrl.includes('?') 
      ? `${detailActiveMovie.trailerUrl}&autoplay=1` 
      : `${detailActiveMovie.trailerUrl}?autoplay=1`;
    iframe.src = trailerSrc;
  } else {
    const streamUrl = getStreamEmbedUrl(detailActiveMovie, detailServerIndex, detailSeasonIndex, detailEpisodeIndex);
    iframe.src = streamUrl;
  }

  iframe.onload = () => {
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
    }, 400);
  };

  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
  }, 2200);
}

function renderDetailServerButtons() {
  const container = document.getElementById('detail-server-buttons');
  if (!container) return;

  container.innerHTML = STREAM_SERVERS.map((server, idx) => `
    <button class="server-btn ${idx === detailServerIndex ? 'active' : ''}" onclick="switchDetailServer(${idx})">
      <span class="server-status-dot"></span>
      <span>${server.name}</span>
    </button>
  `).join('');
}

function switchDetailServer(serverIdx) {
  if (detailServerIndex === serverIdx) return;
  detailServerIndex = serverIdx;
  detailPlayingTrailer = false;
  renderDetailServerButtons();
  loadDetailPlayerIframe();
  showToast(`Mengalihkan ke ${STREAM_SERVERS[serverIdx].name}...`, 'info');
}

window.switchDetailServer = switchDetailServer;

// Global Actions for Unavailable Overlay & Trailer
function playOfficialTrailer(context = 'modal') {
  if (context === 'modal') {
    if (!activeMovie) return;
    modalPlayingTrailer = true;
    showToast(`Memutar trailer resmi "${activeMovie.title}"...`, 'success');
    loadPlayerIframe();
  } else {
    if (!detailActiveMovie) return;
    detailPlayingTrailer = true;
    showToast(`Memutar trailer resmi "${detailActiveMovie.title}"...`, 'success');
    loadDetailPlayerIframe();
  }
}

function tryAlternateServer(context = 'modal') {
  const currentMovie = context === 'modal' ? activeMovie : detailActiveMovie;
  if (!currentMovie) return;

  if (currentMovie.isUnavailable) {
    showToast(`Semua server streaming saat ini belum memiliki copy rilis untuk "${currentMovie.title}". Memutar trailer resmi...`, 'warning');
    playOfficialTrailer(context);
    return;
  }

  if (context === 'modal') {
    const nextIdx = (activeServerIndex + 1) % STREAM_SERVERS.length;
    switchPlayerServer(nextIdx);
  } else {
    const nextIdx = (detailServerIndex + 1) % STREAM_SERVERS.length;
    switchDetailServer(nextIdx);
  }
}

function notifyWhenAvailable() {
  const currentMovie = detailActiveMovie || activeMovie;
  const title = currentMovie ? currentMovie.title : 'film ini';
  showToast(`🔔 Pengingat Diaktifkan! Anda akan diberi notifikasi saat "${title}" siap diputar di Cinelax.`, 'success');
}

window.playOfficialTrailer = playOfficialTrailer;
window.tryAlternateServer = tryAlternateServer;
window.notifyWhenAvailable = notifyWhenAvailable;

function renderDetailEpisodesSection(movie) {
  const section = document.getElementById('detail-episodes-section');
  const seasonWrap = document.getElementById('detail-season-selector-wrap');
  const grid = document.getElementById('detail-episodes-grid');

  if (!section || !grid) return;

  if (movie.type !== 'series') {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  const seasons = movie.seasons || [
    { season: 1, episodes: movie.episodes || [] }
  ];

  const currentSeasonData = seasons[detailSeasonIndex] || seasons[0];
  const episodesList = currentSeasonData.episodes || [];

  if (seasonWrap) {
    seasonWrap.innerHTML = seasons.map((s, sIdx) => `
      <button class="season-tab-btn ${sIdx === detailSeasonIndex ? 'active' : ''}" onclick="switchDetailSeason(${sIdx})">
        Season ${s.season || sIdx + 1}
      </button>
    `).join('');
  }

  grid.innerHTML = episodesList.map((ep, idx) => `
    <div class="episode-card ${idx === detailEpisodeIndex ? 'active' : ''}" onclick="selectDetailEpisode(${idx})">
      <div class="episode-card-info">
        <span class="ep-num">S${detailSeasonIndex + 1} EP ${ep.number} (${ep.duration})</span>
        <span class="ep-title">${ep.title}</span>
      </div>
      <span class="ep-play-icon">${idx === detailEpisodeIndex ? '▶' : '▷'}</span>
    </div>
  `).join('');
}

function switchDetailSeason(seasonIdx) {
  detailSeasonIndex = seasonIdx;
  detailEpisodeIndex = 0;
  if (detailActiveMovie) {
    renderDetailEpisodesSection(detailActiveMovie);
    loadDetailPlayerIframe();
    showToast(`Memuat Season ${seasonIdx + 1}...`, 'info');
  }
}

window.switchDetailSeason = switchDetailSeason;

function selectDetailEpisode(episodeIdx) {
  detailEpisodeIndex = episodeIdx;
  if (detailActiveMovie) {
    renderDetailEpisodesSection(detailActiveMovie);
    loadDetailPlayerIframe();
    showToast(`Memutar Episode ${episodeIdx + 1}...`, 'info');
  }
}

window.selectDetailEpisode = selectDetailEpisode;

// ==========================================
// 404 NOT FOUND VIEW CONTROLLER
// ==========================================

function renderNotFoundView() {
  const container = document.getElementById('notfound-related-row');
  if (!container) return;

  const trending = generateMovies('trending', 10);
  container.innerHTML = trending.map(m => renderMovieCard(m)).join('');
}

// ==========================================
// SEARCH & AUTOCOMPLETE OVERLAY
// ==========================================

function initSearch() {
  const toggleBtn = document.getElementById('search-toggle');
  const overlay = document.getElementById('search-overlay');
  const closeBtn = document.getElementById('search-close');
  const input = document.getElementById('search-input');
  const suggestions = document.getElementById('search-suggestions');

  if (!toggleBtn || !overlay) return;

  const openSearch = () => {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input?.focus(), 300);
  };

  const closeSearch = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    if (input) input.value = '';
    if (suggestions) {
      suggestions.classList.remove('active');
      suggestions.innerHTML = '';
    }
  };

  toggleBtn.addEventListener('click', openSearch);
  closeBtn?.addEventListener('click', closeSearch);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSearch();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeSearch();
    }
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      openSearch();
    }
  });

  // Enter to full search listing
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) {
        closeSearch();
        navigate(`/search?q=${encodeURIComponent(q)}`);
      }
    }
  });

  // Live autocomplete
  input?.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    if (query.length < 2) {
      suggestions?.classList.remove('active');
      return;
    }

    const allMovies = Array.from(movieRegistry.values());
    const results = allMovies.filter(m =>
      m.title.toLowerCase().includes(query) ||
      (m.genre && m.genre.toLowerCase().includes(query)) ||
      (m.country && m.country.toLowerCase().includes(query)) ||
      (m.cast && m.cast.toLowerCase().includes(query))
    ).slice(0, 6);

    if (results.length && suggestions) {
      suggestions.classList.add('active');
      suggestions.innerHTML = results.map(m => `
        <div class="suggestion-item" onclick="openPlayer('${m.id}'); document.getElementById('search-close').click();">
          <div class="suggestion-poster">
            ${m.poster ? `<img src="${m.poster}" alt="${m.title}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">` : `<div style="width:100%;height:100%;background:${m.gradient};border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:16px;">${m.emoji}</div>`}
          </div>
          <div class="suggestion-info">
            <h4>${m.title}</h4>
            <span>${m.year} · ${m.genre || (m.genres && m.genres[0]) || 'Film'} · ⭐ ${m.rating}</span>
          </div>
        </div>
      `).join('');
    } else if (suggestions) {
      suggestions.classList.add('active');
      suggestions.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 14px;">
          Tidak ditemukan judul untuk "${e.target.value}"
        </div>
      `;
    }
  });
}

// ==========================================
// MOBILE MENU CONTROLLER
// ==========================================

function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('mobile-menu-backdrop');
  const closeBtn = document.getElementById('mobile-menu-close');

  if (!toggleBtn || !menu) return;

  const openMenu = () => {
    menu.classList.add('active');
    backdrop?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menu.classList.remove('active');
    backdrop?.classList.remove('active');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  backdrop?.addEventListener('click', closeMenu);

  document.querySelectorAll('.mobile-nav-link[data-toggle]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(link.dataset.toggle);
      if (target) {
        target.classList.toggle('active');
        const arrow = link.querySelector('.arrow');
        if (arrow) arrow.style.transform = target.classList.contains('active') ? 'rotate(180deg)' : '';
      }
    });
  });
}

// ==========================================
// SCROLL & UI ENHANCEMENTS
// ==========================================

function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initScrollArrows() {
  document.querySelectorAll('.content-row-wrapper').forEach(wrapper => {
    const row = wrapper.querySelector('.content-row');
    const leftArrow = wrapper.querySelector('.scroll-arrow.left');
    const rightArrow = wrapper.querySelector('.scroll-arrow.right');

    if (!row || !leftArrow || !rightArrow) return;

    const scrollAmount = 600;

    const updateArrows = () => {
      leftArrow.classList.toggle('hidden', row.scrollLeft <= 10);
      rightArrow.classList.toggle('hidden', row.scrollLeft + row.clientWidth >= row.scrollWidth - 10);
    };

    leftArrow.addEventListener('click', () => {
      row.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', () => {
      row.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    row.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();

    window.addEventListener('resize', updateArrows, { passive: true });
  });
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function initFilterTabs() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const text = tab.textContent.trim().toLowerCase();
      const latestRow = document.getElementById('latest-row');
      if (!latestRow) return;

      if (text === 'movies') {
        const moviesOnly = generateMovies('latest', 20).filter(m => m.type === 'movie');
        latestRow.innerHTML = moviesOnly.map(m => renderMovieCard(m)).join('');
      } else if (text === 'series') {
        const seriesOnly = generateMovies('series', 20);
        latestRow.innerHTML = seriesOnly.map(m => renderMovieCard(m)).join('');
      } else {
        renderContentSection('latest-row', 'latest', 14);
      }
    });
  });
}

// Global Link Interceptor for SPA Navigation
function initLinkInterceptor() {
  document.addEventListener('click', (e) => {
    const targetLink = e.target.closest('a[data-nav], a[href^="/"]');
    if (targetLink && !targetLink.getAttribute('target')) {
      const navPath = targetLink.getAttribute('data-nav') || targetLink.getAttribute('href');
      if (navPath && navPath.startsWith('/')) {
        e.preventDefault();
        // Close mobile drawer if open
        document.getElementById('mobile-menu')?.classList.remove('active');
        document.getElementById('mobile-menu-backdrop')?.classList.remove('active');
        document.body.style.overflow = '';
        navigate(navPath);
      }
    }
  });
}

function initPlayerModalEvents() {
  const closeBtn = document.getElementById('player-modal-close');
  const backdrop = document.getElementById('player-modal-backdrop');
  const cinemaBtn = document.getElementById('btn-cinema-mode');
  const shareBtn = document.getElementById('btn-modal-share');

  closeBtn?.addEventListener('click', closePlayer);
  backdrop?.addEventListener('click', closePlayer);
  cinemaBtn?.addEventListener('click', toggleCinemaMode);
  shareBtn?.addEventListener('click', () => shareMovie(activeMovie));

  // Detail View Buttons
  document.getElementById('btn-detail-cinema')?.addEventListener('click', toggleCinemaMode);
  document.getElementById('btn-detail-share')?.addEventListener('click', () => shareMovie(detailActiveMovie));
  document.getElementById('btn-scroll-to-player')?.addEventListener('click', () => {
    document.getElementById('detail-stream-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('player-modal');
      if (modal?.classList.contains('active')) {
        closePlayer();
      }
    }
  });
}

// ==========================================
// APP INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initRegistry();
  initHeroSlider();
  renderAllSections();
  initNavbarScroll();
  initScrollArrows();
  initSearch();
  initMobileMenu();
  initBackToTop();
  initScrollReveal();
  initFilterTabs();
  initListingFilterEvents();
  initPlayerModalEvents();
  initLinkInterceptor();

  // Router Listeners
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('popstate', handleRoute);

  // Initial Route Dispatch
  handleRoute();

  // Remove page loader
  setTimeout(() => {
    const loader = document.querySelector('.page-loader');
    if (loader) loader.style.display = 'none';
  }, 900);
});
