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
  return TmdbMap.slugify(text);
}

// Meng-escape karakter HTML pada nilai yang tidak kita kendalikan (query
// pencarian dari URL, judul/nama dari TMDB yang bisa disunting komunitas)
// sebelum disisipkan ke template literal yang berakhir di innerHTML. Jangan
// dipakai untuk nilai yang kita bangun sendiri dari kosakata tetap (slug,
// id internal, angka) — itu tidak butuh escaping dan malah menambah noise.
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
  // message kadang menyisipkan judul film (mis. shareMovie) yang berasal
  // dari TMDB — escape di sini, satu titik, menutup seluruh kelas bug ini
  // untuk semua pemanggil showToast sekarang maupun nanti.
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span>${escapeHtml(message)}</span>
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
// HERO SLIDER DATA
// ==========================================

// Data cadangan HANYA untuk kasus fetch trending TMDB gagal total (mis. API
// key belum dikonfigurasi, jaringan mati). Dalam kondisi normal, heroSlides
// (di bawah) diisi ulang dari baris trending TMDB yang sama yang dipakai
// topview-row — lihat loadTrendingHeroSlides(). Field idlixUrl/isUnavailable/
// quality SENGAJA tidak ada di sini: idlixUrl menunjuk ke host tak berlisensi
// yang penghapusannya adalah alasan migrasi ini, dan quality adalah karangan
// (lihat catatan "quality sengaja tidak ada" di listingState).
const FALLBACK_HERO_SLIDES = [
  {
    id: 'deadpool-wolverine-hero',
    title: 'Deadpool & Wolverine',
    originalTitle: 'Deadpool & Wolverine (2024)',
    year: 2024,
    rating: '8.9',
    duration: '2h 08m',
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
    imdbId: 'tt6263850',
    tmdbId: '533535',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/73_1biulkYk'
  },
  {
    id: 'gladiator-2-hero',
    title: 'Gladiator II',
    originalTitle: 'Gladiator II (2024)',
    year: 2024,
    rating: '8.7',
    duration: '2h 28m',
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
    imdbId: 'tt9218128',
    tmdbId: '558449',
    trailerUrl: 'https://www.youtube-nocookie.com/embed/4rgYUipGJNo'
  },
  {
    id: 'squid-game-2-2025',
    title: 'Squid Game Season 2',
    originalTitle: '오징어 게임 시즌2 (2025)',
    year: 2025,
    rating: '9.3',
    duration: '6 Episode (1 Season)',
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
    trailerUrl: 'https://www.youtube-nocookie.com/embed/x0XDEhP4MQs'
  },
  {
    id: 'demon-slayer-movie-2025',
    title: 'Demon Slayer: Infinity Castle',
    originalTitle: '鬼滅の刃 無限城編 (2025)',
    year: 2025,
    rating: '9.4',
    duration: '2h 10m',
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
    trailerUrl: 'https://www.youtube-nocookie.com/embed/x7uG_F_sR4Y'
  },
  {
    id: 'rick-and-morty-hero',
    title: 'Rick and Morty',
    originalTitle: 'Rick and Morty (2013-2025)',
    year: 2025,
    rating: '9.1',
    duration: '7 Seasons (71 EP)',
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
    trailerUrl: 'https://www.youtube-nocookie.com/embed/jerFRSQW9g8',
    seasons: [
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
      }
    ],
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
  }
];

// Jumlah slide hero yang diambil dari trending TMDB (§7.1). Diperbarui oleh
// loadTrendingHeroSlides() setelah fetch trending selesai; sebelum itu (dan
// bila fetch gagal total), tetap memakai FALLBACK_HERO_SLIDES di atas supaya
// hero tidak pernah kosong.
let heroSlides = FALLBACK_HERO_SLIDES;

heroSlides.forEach(slide => {
  movieRegistry.set(slide.id, slide);
  movieRegistry.set(slide.slug, slide);
});

function initRegistry() {
  heroSlides.forEach((slide) => {
    movieRegistry.set(slide.id, slide);
    movieRegistry.set(slide.slug, slide);
    movieRegistry.set(slugify(slide.title), slide);
  });
}

// Melengkapi objek hasil TMDB dengan gradient dan emoji, lalu mendaftarkannya
function decorateMovie(movie) {
  if (!movie) return movie;

  movie.gradient = GRADIENTS[movie.gradientIndex % GRADIENTS.length];
  movie.emoji = EMOJIS[movie.emojiIndex % EMOJIS.length];

  movieRegistry.set(movie.id, movie);
  movieRegistry.set(movie.slug, movie);
  movieRegistry.set(slugify(movie.title), movie);

  return movie;
}

// Mencari objek film dari registry, lalu dari TMDB bila belum ada
async function resolveMovie(idOrSlug) {
  if (!idOrSlug) return null;

  const cached = movieRegistry.get(idOrSlug);
  if (cached && cached.tmdbId) {
    // Lengkapi detail bila objek berasal dari daftar ringkas
    if (!cached.description || !cached.director) {
      try {
        const full = await Tmdb.getDetail(cached.type, cached.tmdbId);
        return decorateMovie(Object.assign({}, cached, full));
      } catch (error) {
        return cached;
      }
    }
    return cached;
  }

  if (cached) return cached;

  const slug = String(idOrSlug).replace(/^(movie|series)-/, '');

  try {
    const found = await Tmdb.findBySlug(slug);
    if (!found) return null;

    const full = await Tmdb.getDetail(found.type, found.tmdbId);
    return decorateMovie(Object.assign({}, found, full));
  } catch (error) {
    return null;
  }
}

// ==========================================
// MOVIE CARD COMPONENT
// ==========================================

function renderMovieCard(movie) {
  const hasPoster = Boolean(movie.poster);

  const safeTitle = escapeHtml(movie.title);

  return `
    <div class="movie-card" data-id="${movie.id}" onclick="openDetailOrPlayer('${movie.id}')">
      <div class="card-poster">
        ${hasPoster ? `
          <img src="${movie.poster}" alt="${safeTitle}" loading="lazy" class="poster-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
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
        ${movie.rating ? `<span class="card-badge-quality">⭐ ${movie.rating}</span>` : ''}
        ${movie.type === 'series' ? `<span class="card-badge-type">Series</span>` : ''}
        ${movie.episode ? `<span class="card-badge-episode">${escapeHtml(movie.episode)}</span>` : ''}
      </div>
      <div class="card-info">
        <h3 class="card-title">${safeTitle}</h3>
        <div class="card-meta">
          <span>${movie.year || '—'}</span>
          <span class="dot"></span>
          <span>${escapeHtml(movie.genre || (movie.genres && movie.genres[0]) || 'Film')}</span>
        </div>
      </div>
    </div>
  `;
}

function renderSkeletonRow(container, count) {
  container.innerHTML = Array.from({ length: count || 8 }, () => `
    <div class="movie-card skeleton-card">
      <div class="card-poster skeleton-block"></div>
      <div class="card-info">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `).join('');
}

async function renderContentSection(containerId, rowKind, options) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const settings = options || {};
  renderSkeletonRow(container, 8);

  try {
    const movies = await Tmdb.getRow(rowKind, settings);
    const decorated = movies.map(decorateMovie);

    if (decorated.length === 0) {
      container.closest('.content-section')?.classList.add('hidden');
      return;
    }

    container.innerHTML = decorated.map((m) => renderMovieCard(m)).join('');
  } catch (error) {
    container.closest('.content-section')?.classList.add('hidden');
    console.warn(`Baris ${containerId} gagal dimuat:`, error.message);
  }
}

// ID genre TMDB
const GENRE_IDS = { action: 28, animation: 16 };

function renderAllSections() {
  renderContentSection('topview-row', 'trending');
  renderContentSection('trending-row', 'trending', { page: 2 });
  renderContentSection('latest-row', 'top_rated');
  renderContentSection('popular-row', 'genre', { genreId: GENRE_IDS.action });
  renderContentSection('series-row', 'tv');
  renderContentSection('kdrama-row', 'tv', { with_origin_country: 'KR' });
  renderContentSection('anime-row', 'genre', { genreId: GENRE_IDS.animation });
  renderContentSection('indonesia-row', 'genre', { with_original_language: 'id' });
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
    const detailPath = `/${slide.type === 'series' ? 'series' : 'movie'}/${slide.slug}`;
    slideEl.innerHTML = `
      <div class="hero-slide-bg" style="background-image: url('${escapeHtml(slide.backdrop)}')"></div>
      <div class="hero-slide-overlay"></div>
      <div class="hero-content container">
        <div class="hero-info">
          <div class="hero-badge">${escapeHtml(slide.badge)}</div>
          <h1 class="hero-title">${escapeHtml(slide.title)}</h1>
          <div class="hero-meta">
            <span class="hero-rating"><span class="star">⭐</span> ${slide.rating || '—'}</span>
            <span class="hero-meta-divider"></span>
            <span class="hero-meta-item">${slide.year || '—'}</span>
            <span class="hero-meta-divider"></span>
            <span class="hero-meta-item">${escapeHtml(slide.duration || '—')}</span>
          </div>
          <div class="hero-genres">
            ${(slide.genres || []).map(g => `<span class="hero-genre-tag">${escapeHtml(g)}</span>`).join('')}
          </div>
          <p class="hero-description">${escapeHtml(slide.description || '')}</p>
          <div class="hero-buttons">
            <button class="btn btn-primary" onclick="openPlayer('${slide.id}')">▶ Tonton Sekarang</button>
            <a href="${detailPath}" class="btn btn-secondary" data-nav="${detailPath}">ℹ️ Detail Lengkap</a>
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

// Jumlah slide hero yang diambil dari baris trending TMDB (§7.1).
const HERO_SLIDE_COUNT = 6;

function initHeroSlider() {
  // Render dulu dengan data yang tersedia saat ini (FALLBACK_HERO_SLIDES)
  // supaya hero tidak pernah kosong selagi menunggu fetch trending, lalu
  // render ulang otomatis begitu data TMDB nyata datang (lihat
  // loadTrendingHeroSlides). Mekanisme slider (interval, dot, prev/next)
  // tidak berubah — hanya sumber datanya.
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

  loadTrendingHeroSlides();
}

// §7.1: hero diambil dari judul trending teratas yang punya backdrop, dari
// baris trending TMDB yang sama yang dipakai topview-row. Tmdb.fetchTmdb
// meng-cache per URL, jadi pemanggilan Tmdb.getRow('trending', {}) di sini
// berbagi satu request jaringan dengan renderContentSection('topview-row',
// 'trending') di renderAllSections(), bukan memicu fetch kedua yang
// terpisah. FALLBACK_HERO_SLIDES tetap tampil kecuali fetch ini berhasil
// dengan minimal satu judul berbackdrop.
async function loadTrendingHeroSlides() {
  try {
    const trending = (await Tmdb.getRow('trending', {})).map(decorateMovie);
    const withBackdrop = trending.filter((m) => m.backdrop).slice(0, HERO_SLIDE_COUNT);

    if (withBackdrop.length === 0) return;

    heroSlides = withBackdrop.map(buildHeroSlideFromTrending);
    heroSlides.forEach((slide) => {
      movieRegistry.set(slide.id, slide);
      movieRegistry.set(slide.slug, slide);
    });

    currentSlide = 0;
    renderHeroSlider();
    resetSlideInterval();
  } catch (error) {
    console.warn('Hero slider: gagal memuat trending TMDB, memakai data cadangan.', error.message);
  }
}

// Menyaring field objek TMDB penuh (movieRegistry bisa punya banyak field
// lain) ke bentuk minimal yang dibutuhkan renderHeroSlider/sidebar. quality,
// idlixUrl, dan isUnavailable sengaja tidak disertakan — lihat catatan di
// FALLBACK_HERO_SLIDES.
function buildHeroSlideFromTrending(movie) {
  return {
    id: movie.id,
    title: movie.title,
    originalTitle: movie.originalTitle,
    year: movie.year,
    rating: movie.rating,
    duration: movie.duration,
    type: movie.type,
    genre: movie.genre,
    genres: (movie.genres && movie.genres.length) ? movie.genres : [movie.genre || 'Trending'],
    country: movie.country,
    description: movie.description,
    poster: movie.poster,
    backdrop: movie.backdrop,
    gradient: movie.gradient,
    emoji: movie.emoji,
    badge: '🔥 Trending Minggu Ini',
    slug: movie.slug,
    tmdbId: movie.tmdbId,
    trailerUrl: movie.trailerUrl
  };
}

// ==========================================
// PANEL KETERSEDIAAN LAYANAN STREAMING
// ==========================================

// link: URL JustWatch dari providers.link. Spec §8 minta logo provider bisa
// diklik menuju JustWatch — TMDB hanya memberi satu link gabungan per
// judul/region (bukan deep-link per provider), jadi setiap logo di grup ini
// memakai link yang sama.
function renderProviderGroup(label, list, link) {
  if (!list || list.length === 0) return '';

  return `
    <div class="provider-group">
      <h4 class="provider-group-title">${escapeHtml(label)}</h4>
      <div class="provider-logos">
        ${list.map((p) => {
          const safeName = escapeHtml(p.name);
          const inner = `<img src="${p.logo}" alt="${safeName}" loading="lazy">`;
          return link
            ? `<a class="provider-logo" href="${escapeHtml(link)}" title="${safeName}" target="_blank" rel="noopener noreferrer">${inner}</a>`
            : `<div class="provider-logo" title="${safeName}">${inner}</div>`;
        }).join('')}
      </div>
    </div>
  `;
}

async function renderProviderPanel(containerId, movie) {
  const container = document.getElementById(containerId);
  if (!container || !movie) return;

  container.innerHTML = `<p class="provider-loading">Memeriksa ketersediaan...</p>`;

  if (!movie.tmdbId) {
    container.innerHTML = `<p class="provider-empty">Data ketersediaan tidak tersedia untuk judul ini.</p>`;
    return;
  }

  let providers;
  try {
    providers = await Tmdb.getProviders(movie.type, movie.tmdbId);
  } catch (error) {
    container.innerHTML = `
      <p class="provider-empty">Gagal memuat ketersediaan.</p>
      <button class="btn-retry" onclick="renderProviderPanel('${containerId}', movieRegistry.get('${movie.id}'))">Coba Lagi</button>
    `;
    return;
  }

  const groups = [
    renderProviderGroup('Langganan', providers.flatrate, providers.link),
    renderProviderGroup('Sewa', providers.rent, providers.link),
    renderProviderGroup('Beli', providers.buy, providers.link)
  ].join('');

  if (!groups) {
    container.innerHTML = `
      <p class="provider-empty">
        "${escapeHtml(movie.title)}" belum tersedia di layanan streaming Indonesia.
      </p>
    `;
    return;
  }

  container.innerHTML = `
    <h3 class="provider-heading">Nonton di</h3>
    ${groups}
    ${providers.link ? `
      <a class="provider-cta" href="${escapeHtml(providers.link)}" target="_blank" rel="noopener noreferrer">
        Buka opsi menonton
      </a>
    ` : ''}
    <p class="provider-note">Data ketersediaan disediakan JustWatch melalui TMDB.</p>
  `;
}

window.renderProviderPanel = renderProviderPanel;

// ==========================================
// QUICK THEATER MODAL CONTROLLER
// ==========================================

let activeMovie = null;
let activeSeasonIndex = 0;
let activeEpisodeIndex = 0;
let isCinemaMode = false;
// Penjaga respons basi: openPlayer() adalah async dan menunggu resolveMovie.
// Dua klik kartu yang cepat bisa membuat respons klik pertama selesai belakangan
// dan menimpa modal dengan film yang salah. Pola sama dipakai searchSequence,
// listingRequestSeq, dan routeRequestSeq di bawah.
let playerRequestSeq = 0;

function loadPlayerIframe() {
  if (!activeMovie) return;

  const iframe = document.getElementById('video-player-iframe');
  const loader = document.getElementById('player-iframe-loader');
  const overlay = document.getElementById('player-unavailable-overlay');
  const overlayMsg = document.getElementById('modal-unavailable-msg');

  if (!iframe) return;

  if (!activeMovie.trailerUrl) {
    if (loader) loader.classList.add('hidden');
    iframe.src = 'about:blank';
    if (overlay) {
      overlay.style.display = 'flex';
      if (overlayMsg) {
        overlayMsg.textContent = `Trailer resmi untuk "${activeMovie.title}" belum tersedia. Silakan lihat opsi menonton di bawah.`;
      }
    }
    return;
  }

  if (overlay) overlay.style.display = 'none';
  if (loader) loader.classList.remove('hidden');

  iframe.src = activeMovie.trailerUrl;

  iframe.onload = () => {
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
    }, 400);
  };

  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
  }, 2200);
}

function renderModalEpisodesSection(movie) {
  const section = document.getElementById('player-episodes-section');
  const seasonWrap = document.getElementById('season-selector-wrap');
  const grid = document.getElementById('episodes-grid');

  if (!section || !grid) return;

  const seasons = (movie.type === 'series')
    ? (movie.seasons || [{ season: 1, episodes: movie.episodes || [] }])
    : [];
  const hasAnyEpisodes = seasons.some((s) => Array.isArray(s.episodes) && s.episodes.length > 0);

  // tmdb-map.js tidak memetakan episode/season TMDB sama sekali (episode:
  // null, episodes: null, tanpa seasons) — dulu section ini tetap muncul
  // untuk setiap serial dengan tab "Season 1" kosong. Sembunyikan total bila
  // memang tidak ada data episode sama sekali, alih-alih menampilkan panel
  // kosong yang menyesatkan (F4).
  if (movie.type !== 'series' || !hasAnyEpisodes) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  const currentSeasonData = seasons[activeSeasonIndex] || seasons[0];
  const episodesList = (currentSeasonData && currentSeasonData.episodes) || [];

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
        <span class="ep-num">S${activeSeasonIndex + 1} EP ${ep.number} (${escapeHtml(ep.duration)})</span>
        <span class="ep-title">${escapeHtml(ep.title)}</span>
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
        <h5 class="modal-related-title">${escapeHtml(m.title)}</h5>
        <div class="modal-related-meta">⭐ ${m.rating || '—'} · ${m.year || '—'}</div>
      </div>
    </div>
  `).join('');
}

async function openPlayer(movieId, episodeIndex = 0, seasonIndex = 0) {
  // Penjaga respons basi: lihat komentar pada deklarasi playerRequestSeq.
  const playerSequence = ++playerRequestSeq;
  const movie = await resolveMovie(movieId);
  if (playerSequence !== playerRequestSeq) return;

  if (!movie) {
    showToast('Judul tidak ditemukan.', 'error');
    return;
  }

  activeMovie = movie;
  activeSeasonIndex = seasonIndex;
  activeEpisodeIndex = episodeIndex;

  const modal = document.getElementById('player-modal');
  if (!modal) return;

  const titleEl = document.getElementById('modal-movie-title');
  const typeBadge = document.getElementById('modal-type-badge');
  const qualityBadge = document.getElementById('modal-quality-badge');

  if (titleEl) {
    if (movie.type === 'series') {
      const currentSeason = movie.seasons ? movie.seasons[activeSeasonIndex] : null;
      const currentEp = currentSeason && currentSeason.episodes ? currentSeason.episodes[activeEpisodeIndex] : null;
      // Tanpa data episode nyata (kasus TMDB saat ini — lihat F4), modal ini
      // cuma menampilkan trailer, jadi jangan karang suffix "S1 EP1".
      const epTitle = currentEp ? ` — S${activeSeasonIndex + 1} EP${currentEp.number}: ${currentEp.title}` : '';
      titleEl.textContent = `${movie.title}${epTitle}`;
    } else {
      titleEl.textContent = `${movie.title} (${movie.year || '—'})`;
    }
  }

  if (typeBadge) {
    typeBadge.textContent = movie.type === 'series' ? 'SERIES' : 'MOVIE';
    typeBadge.className = `modal-badge-type ${movie.type === 'series' ? 'series' : ''}`;
  }

  // quality tidak lagi dipetakan dari TMDB (nilainya dulu karangan) — badge
  // disembunyikan sepenuhnya alih-alih menampilkan default palsu (F2).
  if (qualityBadge) {
    if (movie.quality) {
      qualityBadge.textContent = movie.quality;
      qualityBadge.style.display = '';
    } else {
      qualityBadge.style.display = 'none';
    }
  }

  const posterBox = document.getElementById('modal-poster-box');
  const posterEmoji = document.getElementById('modal-poster-emoji');
  if (posterBox) {
    if (movie.poster) {
      posterBox.innerHTML = `<img src="${movie.poster}" alt="${escapeHtml(movie.title)}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">`;
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

  if (ratingEl) ratingEl.innerHTML = `<span class="star">⭐</span> ${movie.rating || '—'}`;
  if (yearEl) yearEl.textContent = movie.year;
  if (durationEl) durationEl.textContent = movie.duration || '-';
  if (countryEl) countryEl.textContent = displayCountry(movie.country);

  if (genresEl) {
    const genreList = movie.genres || [movie.genre || 'Action'];
    genresEl.innerHTML = genreList.map(g => `<span class="genre-pill">${escapeHtml(g)}</span>`).join('');
  }

  if (synopsisEl) synopsisEl.textContent = movie.description;
  if (directorEl) directorEl.textContent = movie.director || '-';
  if (castEl) castEl.textContent = movie.cast || '-';

  // "Kualitas: ..." adalah baris meta-item dengan label tetap di HTML —
  // menyembunyikan hanya nilainya akan menyisakan "Kualitas:" tanpa isi,
  // jadi seluruh baris disembunyikan ketika tidak ada data quality (F2).
  if (qualityDetailEl) {
    const qualityRow = qualityDetailEl.closest('.meta-item');
    if (movie.quality) {
      qualityDetailEl.textContent = movie.quality;
      if (qualityRow) qualityRow.style.display = '';
    } else if (qualityRow) {
      qualityRow.style.display = 'none';
    } else {
      qualityDetailEl.style.display = 'none';
    }
  }

  renderModalEpisodesSection(movie);
  renderRelatedInModal(movie);

  loadPlayerIframe();
  renderProviderPanel('player-provider-panel', movie);

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

  if (isCinemaMode) {
    isCinemaMode = false;
    document.body.classList.remove('cinema-mode-active');
    document.getElementById('btn-cinema-mode')?.classList.remove('active');
  }
}

window.closePlayer = closePlayer;

function switchPlayerSeason(seasonIdx) {
  activeSeasonIndex = seasonIdx;
  activeEpisodeIndex = 0;
  if (activeMovie) {
    const currentSeason = activeMovie.seasons ? activeMovie.seasons[activeSeasonIndex] : null;
    const currentEp = currentSeason && currentSeason.episodes ? currentSeason.episodes[0] : null;
    const epTitle = currentEp ? ` — S${activeSeasonIndex + 1} EP${currentEp.number}: ${currentEp.title}` : '';

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
    const epTitle = currentEp ? ` — S${activeSeasonIndex + 1} EP${currentEp.number}: ${currentEp.title}` : '';

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

let listingState = {
  view: 'listing',
  title: '',
  subtitle: '',
  breadcrumbName: '',
  searchQuery: '',
  genre: '',
  genreId: null,
  country: '',
  year: '',
  type: '',
  sort: '',
  rowKind: 'trending',
  page: 1,
  totalPages: 1,
  totalResults: 0
};
// quality sengaja tidak ada: TMDB tidak punya padanannya, dan field ini
// sudah dibuang di Task 5 karena isinya karangan (lihat brief Task 7b).

let listingRequestSeq = 0;
let routeRequestSeq = 0;

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

// Nama genre pada URL (/genre/:slug, huruf kecil berpemisah "-") dan pada
// toolbar filter (nilai <option>, huruf kecil) dipetakan ke ID genre TMDB.
// Diperluas pada Task 7b agar mencakup seluruh <option> nyata di #filter-genre
// (dibaca dari index.html): Action, Adventure, Animation, Comedy, Crime,
// Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery,
// Romance, Sci-Fi, Superhero, Supernatural, Thriller, TV Movie, War, Western.
// Catatan "tv movie" vs "tv-movie": nilai <option> toolbar adalah "TV Movie"
// (berspasi bila di-lowercase), sedangkan link navigasi memakai slug URL
// "tv-movie" (bertanda hubung) — keduanya harus ada agar dua sumber ini
// sama-sama cocok.
// "Superhero" dan "Supernatural" SENGAJA tidak dipetakan: TMDB tidak punya
// genre resmi untuk keduanya (bukan kelalaian, dan keduanya juga tidak
// muncul sebagai link navigasi /genre/:slug). Bila dipilih di toolbar,
// initListingFilterEvents membiarkan filter genre kosong (setara "Semua
// Genre") dan mencatat peringatan di console, bukan memalsukan ID.
const GENRE_SLUG_TO_ID = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  'sci-fi': 878,
  thriller: 53,
  'tv movie': 10770,
  'tv-movie': 10770,
  war: 10752,
  western: 37
};

// Nama negara pada toolbar filter (#filter-country) dan pada rute /country/:slug
// dipetakan ke kode negara ISO 3166-1 alpha-2 yang dipahami parameter TMDB
// with_origin_country. Dibangun dari <option value="..."> nyata di index.html.
const COUNTRY_NAME_TO_CODE = {
  'United States': 'US',
  'United Kingdom': 'GB',
  'Korea Selatan': 'KR',
  Jepang: 'JP',
  China: 'CN',
  India: 'IN',
  Thailand: 'TH',
  Indonesia: 'ID',
  Filipina: 'PH',
  'Hong Kong': 'HK',
  Taiwan: 'TW',
  Prancis: 'FR',
  Jerman: 'DE',
  Spanyol: 'ES',
  Turki: 'TR'
};

// Sumber tunggal kode->nama negara dipindah ke TmdbMap.COUNTRY_CODE_TO_NAME
// (js/tmdb-map.js) supaya main.js dan tmdb-map.js tidak punya dua tabel yang
// bisa saling menyimpang (F11). listingState.country menyimpan kode ISO
// (dipakai langsung oleh getRowPaged sebagai with_origin_country), tapi
// <option value="..."> pada #filter-country adalah nama negara, bukan kode —
// tabel ini dipakai untuk menyinkronkan <select> dan label pill filter aktif
// kembali ke nama yang bisa dibaca pengguna.
const COUNTRY_CODE_TO_NAME = TmdbMap.COUNTRY_CODE_TO_NAME;

// mapTitle() (tmdb-map.js) sengaja mengembalikan country mentah: nama penuh
// untuk film (production_countries), tapi kode ISO mentah untuk serial
// (origin_country tidak punya nama — lihat catatan di countryOf()). Fungsi
// tampilan ini yang menerjemahkan kode itu ke nama pada saat merender,
// supaya "KR" muncul sebagai "Korea Selatan" di UI tanpa mengubah kontrak
// data mapTitle() yang dikunci test suite.
function displayCountry(country) {
  if (!country) return '-';
  return COUNTRY_CODE_TO_NAME[country] || country;
}

// Kunci pilihan #filter-sort dipetakan ke parameter sort_by TMDB yang valid.
// Nama field tanggal dan judul berbeda antara discover/movie dan discover/tv,
// sehingga pemetaan ini butuh tahu media (isTv) di titik penggunaan (lihat
// getFilteredMovies), bukan pada saat pengguna memilih opsi.
function resolveSortBy(sortKey, isTv) {
  switch (sortKey) {
    case 'rating':
      return 'vote_average.desc';
    case 'popular':
      return 'popularity.desc';
    case 'title':
      return isTv ? 'name.asc' : 'title.asc';
    case 'year':
    case 'latest':
      return isTv ? 'first_air_date.desc' : 'primary_release_date.desc';
    default:
      return undefined;
  }
}

async function handleRoute() {
  // Penjaga respons basi: dua navigasi cepat bisa membuat sebuah
  // `await resolveMovie(slug)` yang lambat menimpa hasil navigasi yang lebih
  // baru. Setiap pemanggilan handleRoute menaikkan generasi ini; hasil dari
  // generasi yang sudah kedaluwarsa dibuang sebelum dirender (lihat cabang 9).
  const routeSequence = ++routeRequestSeq;

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
    listingState.searchQuery = '';
    listingState.genre = '';
    listingState.genreId = null;
    listingState.country = '';
    listingState.year = '';
    listingState.type = 'movie';
    listingState.sort = '';
    listingState.rowKind = 'top_rated';
    listingState.page = 1;
    renderListingView('Semua Film (Movies)', 'Jelajahi seluruh film bioskop box office terbaru dengan subtitle Indonesia.', 'Movies');
    document.getElementById('view-listing').style.display = 'block';
    updateActiveNav('/movies');
    document.title = 'Daftar Film Terbaru — Cinelax';
    return;
  }

  // 3. Series List (/series)
  if (path === '/series') {
    listingState.searchQuery = '';
    listingState.genre = '';
    listingState.genreId = null;
    listingState.country = '';
    listingState.year = '';
    listingState.type = 'series';
    listingState.sort = '';
    listingState.rowKind = 'tv';
    listingState.page = 1;
    renderListingView('Serial TV & Drama', 'Koleksi serial TV Barat, Drama Korea, dan Anime terlengkap multi-season.', 'Series');
    document.getElementById('view-listing').style.display = 'block';
    updateActiveNav('/series');
    document.title = 'Serial TV & Drama Terbaru — Cinelax';
    return;
  }

  // 4. Trending List (/trending)
  if (path === '/trending') {
    listingState.searchQuery = '';
    listingState.genre = '';
    listingState.genreId = null;
    listingState.country = '';
    listingState.year = '';
    listingState.type = '';
    listingState.sort = '';
    listingState.rowKind = 'trending';
    listingState.page = 1;
    renderListingView('🔥 Trending 2025 — 2026', 'Film dan serial paling banyak ditonton dan viral minggu ini.', 'Trending');
    document.getElementById('view-listing').style.display = 'block';
    updateActiveNav('/');
    document.title = 'Film & Serial Trending — Cinelax';
    return;
  }

  // 5. Genre Filter (/genre/:slug)
  if (path.startsWith('/genre/')) {
    const genreSlug = path.replace('/genre/', '').split('?')[0].toLowerCase();
    const genreId = GENRE_SLUG_TO_ID[genreSlug] || null;

    if (!genreId) {
      renderNotFoundView();
      document.getElementById('view-404').style.display = 'block';
      updateActiveNav('/');
      document.title = '404 — Halaman Tidak Ditemukan — Cinelax';
      return;
    }

    const genreLabel = genreSlug.charAt(0).toUpperCase() + genreSlug.slice(1);

    listingState.searchQuery = '';
    listingState.genre = genreLabel;
    listingState.genreId = genreId;
    listingState.country = '';
    listingState.year = '';
    listingState.type = '';
    listingState.sort = '';
    listingState.rowKind = 'genre';
    listingState.page = 1;

    renderListingView(`Genre: ${genreLabel}`, `Koleksi film dan serial TV bertema ${genreLabel} terbaik.`, genreLabel);
    document.getElementById('view-listing').style.display = 'block';
    updateActiveNav('/genre/' + genreSlug);
    document.title = `Film ${genreLabel} Terbaik — Cinelax`;
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
    const countryCode = COUNTRY_NAME_TO_CODE[countryName] || '';

    listingState.searchQuery = '';
    listingState.genre = '';
    listingState.genreId = null;
    listingState.country = countryCode;
    listingState.year = '';
    listingState.type = '';
    listingState.sort = '';
    // rowKind: 'genre' membuat getRowPaged benar-benar memfilter memakai
    // with_origin_country, alih-alih jatuh ke trending tanpa filter apa pun.
    listingState.rowKind = 'genre';
    listingState.page = 1;

    renderListingView(`Negara: ${countryName}`, `Daftar film dan drama produksi ${countryName}.`, countryName);
    document.getElementById('view-listing').style.display = 'block';
    updateActiveNav('/country/' + countrySlug);
    document.title = `Film & Drama ${countryName} — Cinelax`;
    return;
  }

  // 7. Year Filter (/year/:year)
  if (path.startsWith('/year/')) {
    const year = path.replace('/year/', '').split('?')[0];

    listingState.searchQuery = '';
    listingState.genre = '';
    listingState.genreId = null;
    listingState.country = '';
    listingState.year = year;
    listingState.type = '';
    listingState.sort = '';
    // rowKind: 'genre' membuat getRowPaged benar-benar memfilter memakai
    // primary_release_year, alih-alih jatuh ke trending tanpa filter apa pun.
    listingState.rowKind = 'genre';
    listingState.page = 1;

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

    listingState.searchQuery = query;
    listingState.genre = '';
    listingState.genreId = null;
    listingState.country = '';
    listingState.year = '';
    listingState.type = '';
    listingState.sort = '';
    listingState.rowKind = 'trending';
    listingState.page = 1;

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

    // Tampilkan kerangka (skeleton) sebelum menunggu resolveMovie, seperti
    // yang sudah dilakukan updateListingGrid — tanpa ini layar kosong total
    // di koneksi lambat karena hideAllViews() di atas menyembunyikan semua view.
    document.getElementById('view-detail').style.display = 'block';
    const detailRelatedRow = document.getElementById('detail-related-row');
    if (detailRelatedRow) renderSkeletonRow(detailRelatedRow, 6);

    const movie = await resolveMovie(slug);

    // Navigasi yang lebih baru sudah terjadi selagi resolveMovie menunggu;
    // buang hasil ini, jangan timpa apa yang sudah dirender.
    if (routeSequence !== routeRequestSeq) return;

    if (!movie) {
      hideAllViews();
      renderNotFoundView();
      document.getElementById('view-404').style.display = 'block';
      updateActiveNav('/');
      document.title = '404 — Halaman Tidak Ditemukan — Cinelax';
      return;
    }

    renderDedicatedDetailView(movie, seasonNum - 1, epNum - 1);
    document.getElementById('view-detail').style.display = 'block';
    updateActiveNav(movie.type === 'series' ? '/series' : '/movies');
    document.title = `Nonton ${movie.title} (${movie.year}) Sub Indo — Cinelax`;
    return;
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

async function getFilteredMovies() {
  const state = listingState;

  // Halaman hasil pencarian. Tmdb.searchTitles (F6) sekarang mengembalikan
  // bentuk pager yang sama seperti getRowPaged (items/page/totalPages/
  // totalResults) — search/multi TMDB memang melaporkan total_pages/
  // total_results yang valid, jadi paginasi bekerja seperti baris genre/tv.
  if (state.searchQuery) {
    const searchResult = await Tmdb.searchTitles(state.searchQuery, state.page || 1);
    return {
      items: searchResult.items.map(decorateMovie),
      page: searchResult.page,
      totalPages: searchResult.totalPages,
      totalResults: searchResult.totalResults
    };
  }

  const kind = state.type === 'series' ? 'tv' : (state.rowKind || 'genre');
  const isTv = kind === 'tv';

  const result = await Tmdb.getRowPaged(kind, {
    page: state.page || 1,
    genreId: state.genreId || undefined,
    country: state.country || undefined,
    year: state.year || undefined,
    sortBy: resolveSortBy(state.sort, isTv)
  });

  return {
    items: result.items.map(decorateMovie),
    page: result.page,
    totalPages: result.totalPages,
    totalResults: result.totalResults
  };
}

// Menyinkronkan <select> toolbar filter dan visibilitas toolbar itu sendiri
// ke listingState saat ini. Diekstrak dari renderListingView supaya
// resetListingFilters (F8) bisa memakainya kembali tanpa harus menimpa
// title/subtitle/breadcrumb halaman dengan string generik.
function syncFilterToolbarUI() {
  const genreSelect = document.getElementById('filter-genre');
  const countrySelect = document.getElementById('filter-country');
  const yearSelect = document.getElementById('filter-year');
  const typeSelect = document.getElementById('filter-type');
  const sortSelect = document.getElementById('filter-sort');

  if (genreSelect) genreSelect.value = listingState.genre || '';
  // listingState.country menyimpan kode ISO (mis. "KR"); <option> memakai nama negara.
  if (countrySelect) countrySelect.value = COUNTRY_CODE_TO_NAME[listingState.country] || '';
  if (yearSelect) yearSelect.value = listingState.year || '';
  if (typeSelect) typeSelect.value = listingState.type || '';
  if (sortSelect) sortSelect.value = listingState.sort || 'latest';

  // /trending memakai endpoint trending/all/week TMDB, yang sama sekali tidak
  // menerima parameter discover (genre/country/year/sort). Menampilkan toolbar
  // di halaman ini membuat kontrolnya terlihat aktif padahal diam-diam tak
  // berpengaruh — jadi disembunyikan total, bukan dibiarkan berpura-pura jalan.
  const filterToolbar = document.querySelector('.filter-toolbar');
  if (filterToolbar) {
    filterToolbar.style.display = listingState.rowKind === 'trending' ? 'none' : '';
  }
}

function renderListingView(title, subtitle, breadcrumbName) {
  const titleEl = document.getElementById('listing-page-title');
  const descEl = document.getElementById('listing-page-desc');
  const breadcrumbCurrent = document.getElementById('listing-breadcrumb-current');

  // title/breadcrumbName bisa membawa nilai dari URL tanpa disaring (query
  // pencarian, slug negara/tahun yang tidak dikenal peta — lihat cabang
  // handleRoute /search, /country/:slug, /year/:year) — escape sebelum masuk
  // innerHTML (F1). breadcrumbName lewat textContent, sudah aman dari HTML.
  if (titleEl) titleEl.innerHTML = `<span class="title-accent"></span> <span>${escapeHtml(title)}</span>`;
  if (descEl) descEl.textContent = subtitle;
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = breadcrumbName;

  syncFilterToolbarUI();

  // Render Sidebar Top Picks
  renderSidebarTopPicks();

  // Render Main Grid & Pagination
  updateListingGrid();
}

async function updateListingGrid() {
  const grid = document.getElementById('listing-grid');
  const emptyState = document.getElementById('listing-empty-state');
  const pagination = document.getElementById('listing-pagination');
  const countText = document.getElementById('listing-count-text');
  const pillsBar = document.getElementById('active-pills-bar');
  const pillsContainer = document.getElementById('active-pills-container');

  if (!grid) return;

  // Penjaga respons basi: dua panggilan updateListingGrid bisa tumpang
  // tindih (mis. pengguna mengganti filter dua kali dengan cepat). Hasil
  // dari generasi yang sudah kedaluwarsa dibuang sebelum dirender.
  const sequence = ++listingRequestSeq;

  renderSkeletonRow(grid, 12);
  if (emptyState) emptyState.style.display = 'none';
  if (pagination) pagination.innerHTML = '';

  try {
    const result = await getFilteredMovies();
    if (sequence !== listingRequestSeq) return;

    const { items, page, totalPages, totalResults } = result;
    listingState.page = page;
    listingState.totalPages = totalPages;
    listingState.totalResults = totalResults;

    if (countText) {
      countText.textContent = totalResults > 0 ? `${totalResults} judul` : '0 judul';
    }

    // Active Pills Bar (tidak ada chip quality — lihat Task 7b)
    const activeFilters = [];
    if (listingState.genre) activeFilters.push({ key: 'genre', label: `Genre: ${listingState.genre}` });
    if (listingState.country) activeFilters.push({ key: 'country', label: `Negara: ${COUNTRY_CODE_TO_NAME[listingState.country] || listingState.country}` });
    if (listingState.year) activeFilters.push({ key: 'year', label: `Tahun: ${listingState.year}` });
    if (listingState.type) activeFilters.push({ key: 'type', label: `Tipe: ${listingState.type === 'series' ? 'Series' : 'Movies'}` });
    if (listingState.searchQuery) activeFilters.push({ key: 'searchQuery', label: `Cari: "${listingState.searchQuery}"` });

    if (pillsBar && pillsContainer) {
      if (activeFilters.length > 0) {
        pillsBar.style.display = 'flex';
        // f.label bisa membawa listingState.searchQuery mentah dari URL —
        // escape di titik render (F1).
        pillsContainer.innerHTML = activeFilters.map(f => `
          <span class="active-pill">
            ${escapeHtml(f.label)}
            <span class="remove-pill" onclick="removeFilter('${f.key}')">✕</span>
          </span>
        `).join('');
      } else {
        pillsBar.style.display = 'none';
      }
    }

    if (items.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (pagination) pagination.innerHTML = '';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    grid.innerHTML = items.map((m) => renderMovieCard(m)).join('');

    // Render Pagination Buttons
    if (pagination) {
      if (totalPages <= 1) {
        pagination.innerHTML = '';
      } else {
        let pagHtml = `
          <button class="page-btn" ${page === 1 ? 'disabled' : ''} onclick="changeListingPage(${page - 1})">« Prev</button>
        `;

        for (let p = 1; p <= totalPages; p++) {
          if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
            pagHtml += `
              <button class="page-btn ${p === page ? 'active' : ''}" onclick="changeListingPage(${p})">${p}</button>
            `;
          } else if (p === page - 2 || p === page + 2) {
            pagHtml += `<span class="page-ellipsis">...</span>`;
          }
        }

        pagHtml += `
          <button class="page-btn" ${page === totalPages ? 'disabled' : ''} onclick="changeListingPage(${page + 1})">Next »</button>
        `;

        pagination.innerHTML = pagHtml;
      }
    }
  } catch (error) {
    if (sequence !== listingRequestSeq) return;
    // 429 bukan masalah koneksi pengguna — jangan salahkan koneksinya (F11).
    const message = error && error.status === 429
      ? 'Terlalu banyak permintaan ke TMDB. Silakan tunggu sebentar lalu coba lagi.'
      : 'Gagal memuat daftar. Periksa koneksi lalu coba lagi.';
    grid.innerHTML = `
      <div class="listing-empty">
        <p>${message}</p>
        <button class="btn-retry" onclick="updateListingGrid()">Coba Lagi</button>
      </div>
    `;
    if (emptyState) emptyState.style.display = 'none';
    if (pagination) pagination.innerHTML = '';
    console.warn('Gagal memuat listing:', error.message);
  }
}

window.updateListingGrid = updateListingGrid;

function changeListingPage(newPage) {
  listingState.page = newPage;
  updateListingGrid();
  document.querySelector('.filter-toolbar')?.scrollIntoView({ behavior: 'smooth' });
}

window.changeListingPage = changeListingPage;

function removeFilter(key) {
  if (key === 'genre') {
    // genre dan genreId selalu berpasangan — mengosongkan salah satu tanpa
    // yang lain akan membuat getFilteredMovies tetap memfilter dengan ID lama.
    listingState.genre = '';
    listingState.genreId = null;
  } else {
    listingState[key] = '';
  }
  listingState.page = 1;
  const el = document.getElementById(`filter-${key}`);
  if (el) el.value = '';
  updateListingGrid();
}

window.removeFilter = removeFilter;

// Sebelumnya fungsi ini mengganti seluruh listingState (termasuk rowKind
// jadi 'trending'), yang membuat renderListingView menyembunyikan toolbar
// filter tempat tombol Reset ini berada, dan diam-diam membawa pengguna ke
// trending tanpa filter sama sekali. Sekarang hanya field FILTER yang
// dibersihkan (genre, country, year, sort) — rowKind dan type milik rute
// saat ini tetap dipertahankan, jadi toolbar (dan halaman) tidak berpindah
// identitas hanya karena filternya direset (F8).
function resetListingFilters() {
  listingState.genre = '';
  listingState.genreId = null;
  listingState.country = '';
  listingState.year = '';
  listingState.sort = '';
  listingState.page = 1;

  document.querySelectorAll('.chip-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.chip-btn[data-filter-chip="all"]')?.classList.add('active');

  syncFilterToolbarUI();
  updateListingGrid();
}

window.resetListingFilters = resetListingFilters;

function renderSidebarTopPicks() {
  const container = document.getElementById('sidebar-top-picks');
  if (!container) return;

  // heroSlides sekarang bisa berisi judul trending TMDB nyata (F3), jadi
  // title/poster di sini bukan lagi teks statis yang kita tulis sendiri —
  // escape sebelum masuk innerHTML (F1).
  const topPicks = heroSlides.slice(0, 5);
  container.innerHTML = topPicks.map(m => `
    <div class="sidebar-mini-item" onclick="openPlayer('${m.id}')">
      <div class="sidebar-mini-poster" style="background: ${m.gradient}">
        ${m.poster ? `<img src="${m.poster}" alt="${escapeHtml(m.title)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">` : `<span>${m.emoji}</span>`}
      </div>
      <div class="sidebar-mini-info">
        <h5 class="sidebar-mini-title">${escapeHtml(m.title)}</h5>
        <span class="sidebar-mini-meta">⭐ ${m.rating || '—'} · ${m.year || '—'}</span>
      </div>
    </div>
  `).join('');
}

// Mencari ID genre TMDB dari nilai option (case-insensitive). Mengembalikan
// null dan mencatat peringatan bila nilai tidak punya padanan (Superhero,
// Supernatural) — filter genre lalu diabaikan, bukan dipalsukan.
function resolveGenreId(rawValue, sourceLabel) {
  if (!rawValue) return null;
  const genreId = GENRE_SLUG_TO_ID[rawValue.toLowerCase()];
  if (!genreId) {
    console.warn(`Cinelax: tidak ada padanan genre TMDB untuk "${rawValue}" (${sourceLabel}); filter genre diabaikan.`);
    return null;
  }
  return genreId;
}

function initListingFilterEvents() {
  const genreSelect = document.getElementById('filter-genre');
  const countrySelect = document.getElementById('filter-country');
  const yearSelect = document.getElementById('filter-year');
  const typeSelect = document.getElementById('filter-type');
  const sortSelect = document.getElementById('filter-sort');
  const resetBtn = document.getElementById('btn-reset-filters');

  const onFilterChange = () => {
    // Jangan set listingState.genre ketika resolveGenreId gagal memetakan
    // nilai ke ID TMDB (mis. "Superhero"/"Supernatural") — kalau tidak, pill
    // filter aktif akan mengklaim "Genre: Superhero" padahal tidak ada
    // filter genre yang benar-benar diterapkan ke hasil (F9).
    const genreValue = genreSelect?.value || '';
    const genreId = resolveGenreId(genreValue, 'filter-genre');
    listingState.genre = genreId ? genreValue : '';
    listingState.genreId = genreId;

    const countryValue = countrySelect?.value || '';
    listingState.country = COUNTRY_NAME_TO_CODE[countryValue] || '';

    listingState.year = yearSelect?.value || '';
    listingState.type = typeSelect?.value || '';
    listingState.sort = sortSelect?.value || '';
    listingState.page = 1;
    updateListingGrid();
  };

  genreSelect?.addEventListener('change', onFilterChange);
  countrySelect?.addEventListener('change', onFilterChange);
  yearSelect?.addEventListener('change', onFilterChange);
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
        listingState.genreId = null;
        listingState.year = '';
      } else if (chipVal === '2026' || chipVal === '2025') {
        listingState.year = chipVal;
      } else {
        // Sama seperti onFilterChange di atas: jangan klaim filter genre
        // yang tidak benar-benar diterapkan (F9).
        const chipGenreId = resolveGenreId(chipVal, 'quick-chip');
        listingState.genre = chipGenreId ? chipVal : '';
        listingState.genreId = chipGenreId;
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
let detailSeasonIndex = 0;
let detailEpisodeIndex = 0;

function renderDedicatedDetailView(movie, seasonIdx = 0, episodeIdx = 0) {
  detailActiveMovie = movie;
  detailSeasonIndex = seasonIdx;
  detailEpisodeIndex = episodeIdx;

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
  // quality tidak lagi dipetakan dari TMDB — badge disembunyikan sepenuhnya
  // alih-alih menampilkan default palsu (F2).
  if (qualityBadge) {
    if (movie.quality) {
      qualityBadge.textContent = movie.quality;
      qualityBadge.style.display = '';
    } else {
      qualityBadge.style.display = 'none';
    }
  }
  if (ratingEl) ratingEl.textContent = movie.rating;
  if (yearEl) yearEl.textContent = movie.year;
  if (durationEl) durationEl.textContent = movie.duration || '-';
  if (countryEl) countryEl.textContent = displayCountry(movie.country);
  if (synopsisEl) synopsisEl.textContent = movie.description;

  if (posterBox) {
    if (movie.poster) {
      posterBox.innerHTML = `<img src="${movie.poster}" alt="${escapeHtml(movie.title)}" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">`;
      posterBox.style.background = 'transparent';
    } else {
      posterBox.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;">${movie.emoji}</div>`;
      posterBox.style.background = movie.gradient;
    }
  }
  if (backdropBg) backdropBg.style.backgroundImage = `url('${escapeHtml(movie.backdrop || movie.poster || 'assets/hero/hero-1.jpg')}')`;

  if (genresList) {
    const list = movie.genres || [movie.genre || 'Action'];
    genresList.innerHTML = list.map(g => `<span class="hero-genre-tag">${escapeHtml(g)}</span>`).join('');
  }

  // Table Metadata
  const setTableVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '-';
  };

  setTableVal('table-original-title', movie.originalTitle || movie.title);
  setTableVal('table-director', movie.director);
  setTableVal('table-cast', movie.cast);
  setTableVal('table-country', displayCountry(movie.country));
  setTableVal('table-year', movie.year);
  setTableVal('table-duration', movie.duration);
  // Baris "Kualitas" dihapus/disembunyikan seluruhnya ketika tidak ada data
  // quality, bukan diisi default palsu (F2) — menyembunyikan hanya nilainya
  // akan menyisakan label "Kualitas" tanpa isi.
  const tableQualityEl = document.getElementById('table-quality');
  if (tableQualityEl) {
    const qualityRow = tableQualityEl.closest('tr');
    if (movie.quality) {
      tableQualityEl.textContent = movie.quality;
      if (qualityRow) qualityRow.style.display = '';
    } else if (qualityRow) {
      qualityRow.style.display = 'none';
    } else {
      tableQualityEl.textContent = '-';
    }
  }
  // Labelnya sudah bilang "Rating IMDb" tapi nilainya TMDB vote_average —
  // ganti label jadi TMDB, bukan IMDb (F2). Fallback '—' mencegah "null"
  // literal ketika movie.rating kosong (F11).
  setTableVal('table-rating', `⭐ ${movie.rating || '—'} / 10 (TMDB)`);
  setTableVal('table-genre', (movie.genres || [movie.genre]).join(', '));

  // Player Section
  renderDetailEpisodesSection(movie);
  loadDetailPlayerIframe();
  renderProviderPanel('detail-provider-panel', movie);

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

  if (!detailActiveMovie.trailerUrl) {
    if (loader) loader.classList.add('hidden');
    iframe.src = 'about:blank';
    if (overlay) {
      overlay.style.display = 'flex';
      if (overlayMsg) {
        overlayMsg.textContent = `Trailer resmi untuk "${detailActiveMovie.title}" belum tersedia. Silakan lihat opsi menonton di bawah.`;
      }
    }
    return;
  }

  if (overlay) overlay.style.display = 'none';
  if (loader) loader.classList.remove('hidden');

  iframe.src = detailActiveMovie.trailerUrl;

  iframe.onload = () => {
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
    }, 400);
  };

  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
  }, 2200);
}

function renderDetailEpisodesSection(movie) {
  const section = document.getElementById('detail-episodes-section');
  const seasonWrap = document.getElementById('detail-season-selector-wrap');
  const grid = document.getElementById('detail-episodes-grid');

  if (!section || !grid) return;

  const seasons = (movie.type === 'series')
    ? (movie.seasons || [{ season: 1, episodes: movie.episodes || [] }])
    : [];
  const hasAnyEpisodes = seasons.some((s) => Array.isArray(s.episodes) && s.episodes.length > 0);

  // Sama seperti renderModalEpisodesSection: TMDB tidak memetakan episode/
  // season sama sekali, jadi sembunyikan total panel "Daftar Episode Serial"
  // ketika memang tidak ada data episode, bukan tampilkan tab "Season 1"
  // kosong untuk setiap serial (F4).
  if (movie.type !== 'series' || !hasAnyEpisodes) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  const currentSeasonData = seasons[detailSeasonIndex] || seasons[0];
  const episodesList = (currentSeasonData && currentSeasonData.episodes) || [];

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
        <span class="ep-num">S${detailSeasonIndex + 1} EP ${ep.number} (${escapeHtml(ep.duration)})</span>
        <span class="ep-title">${escapeHtml(ep.title)}</span>
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

async function renderNotFoundView() {
  const container = document.getElementById('notfound-related-row');
  if (!container) return;

  try {
    const trending = (await Tmdb.getRow('trending', {})).slice(0, 10).map(decorateMovie);
    container.innerHTML = trending.map(m => renderMovieCard(m)).join('');
  } catch (error) {
    container.innerHTML = '';
  }
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

  // Live autocomplete lewat TMDB
  let searchTimer = null;
  let searchSequence = 0;

  input?.addEventListener('input', (e) => {
    const raw = e.target.value;
    const query = raw.trim();

    clearTimeout(searchTimer);

    if (query.length < 2) {
      suggestions?.classList.remove('active');
      return;
    }

    const sequence = ++searchSequence;

    searchTimer = setTimeout(async () => {
      if (!suggestions) return;

      suggestions.classList.add('active');
      // raw adalah nilai mentah dari input pencarian pengguna — escape
      // sebelum masuk innerHTML (F1).
      suggestions.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 14px;">
          Mencari "${escapeHtml(raw)}"...
        </div>
      `;

      try {
        // Tmdb.searchTitles sekarang mengembalikan bentuk pager
        // {items, page, totalPages, totalResults} (F6) — dropdown autocomplete
        // ini hanya butuh array item-nya.
        const results = await Tmdb.searchTitles(query);

        // Abaikan respons yang sudah kedaluwarsa
        if (sequence !== searchSequence) return;

        const top = results.items.slice(0, 6).map(decorateMovie);

        if (top.length === 0) {
          suggestions.innerHTML = `
            <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 14px;">
              Tidak ditemukan judul untuk "${escapeHtml(raw)}"
            </div>
          `;
          return;
        }

        suggestions.innerHTML = top.map((m) => `
          <div class="suggestion-item" onclick="openPlayer('${m.id}'); document.getElementById('search-close').click();">
            <div class="suggestion-poster">
              ${m.poster
                ? `<img src="${m.poster}" alt="${escapeHtml(m.title)}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">`
                : `<div style="width:100%;height:100%;background:${m.gradient};border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:16px;">${m.emoji}</div>`}
            </div>
            <div class="suggestion-info">
              <h4>${escapeHtml(m.title)}</h4>
              <span>${m.year || '—'} · ${escapeHtml(m.genre || 'Film')} · ⭐ ${m.rating || '—'}</span>
            </div>
          </div>
        `).join('');
      } catch (error) {
        if (sequence !== searchSequence) return;
        suggestions.innerHTML = `
          <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 14px;">
            Pencarian gagal. Periksa koneksi lalu coba lagi.
          </div>
        `;
      }
    }, 300);
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

      if (text === 'series') {
        renderContentSection('latest-row', 'tv');
      } else {
        renderContentSection('latest-row', 'top_rated');
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
