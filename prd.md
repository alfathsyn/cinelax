# PRD — Cinelax: Website Streaming Film

> **Versi:** 1.0  
> **Tanggal:** 18 Agustus 2026  
> **Referensi Desain:** [IDLIX (z2.idlixku.com)](https://z2.idlixku.com/)  
> **Status:** Draft

---

## 1. Ringkasan Produk

**Cinelax** adalah website streaming film dan serial TV yang menyajikan koleksi lengkap film dari berbagai negara dengan subtitle Indonesia. Website ini didesain dengan antarmuka modern bergaya Netflix-like, mendukung responsif di berbagai perangkat (desktop, tablet, mobile), dan menyediakan pengalaman menonton yang seamless.

### 1.1 Tujuan

- Menyediakan platform streaming film dan serial TV dengan UI/UX premium
- Mendukung navigasi dan pencarian konten yang cepat dan intuitif
- Menyediakan multiple server untuk setiap konten agar pengalaman menonton tidak terganggu
- Mendukung subtitle Indonesia untuk konten internasional

### 1.2 Fitur yang TIDAK Termasuk (Out of Scope)

| Fitur | Keterangan |
|-------|------------|
| Login / Sign Up | Tidak ada sistem autentikasi |
| Watchlist | Tidak ada fitur simpan tontonan |
| Membership / Langganan | Tidak ada sistem membership premium |
| Sistem Pembayaran | Tidak ada payment gateway |

### 1.3 Penempatan Iklan

Semua slot iklan ditempatkan sebagai **HTML comment** di kode sumber agar mudah di-replace. Format:

```html
<!-- AD_SLOT: [POSISI] — Replace dengan kode iklan Anda -->
```

---

## 2. Arsitektur Halaman

### 2.1 Peta Halaman (Sitemap)

```
Cinelax/
├── / (Homepage)
├── /movies (Daftar Film)
├── /series (Daftar Serial TV)
├── /genre/:slug (Filter Genre)
├── /country/:slug (Filter Negara)
├── /year/:year (Filter Tahun)
├── /search?q=... (Hasil Pencarian)
├── /movie/:slug (Detail Film + Player)
├── /series/:slug (Detail Serial + Player)
├── /series/:slug/season/:num/episode/:num (Episode Player)
└── /404 (Halaman Tidak Ditemukan)
```

---

## 3. Halaman & Komponen Detail

---

### 3.1 Layout Global (Semua Halaman)

#### 3.1.1 Header / Navbar

| Elemen | Deskripsi |
|--------|-----------|
| **Logo** | Logo "Cinelax" di kiri atas, klik kembali ke homepage |
| **Menu Navigasi** | `Home` · `Movies` · `Series` · `Genre ▾` · `Country ▾` · `Year ▾` |
| **Dropdown Genre** | Menampilkan daftar semua genre (lihat §4.1) |
| **Dropdown Country** | Menampilkan daftar semua negara (lihat §4.2) |
| **Dropdown Year** | Menampilkan daftar tahun rilis (misal: 2026 s/d 2000) |
| **Search Bar** | Input pencarian dengan ikon 🔍, mendukung live search / autocomplete |
| **Mobile Menu** | Hamburger menu (☰) untuk tampilan mobile, slide-in dari kiri/kanan |

**Behavior:**
- Navbar **sticky** di bagian atas saat di-scroll
- Background navbar semi-transparent di homepage (di atas hero), menjadi solid saat di-scroll
- Dropdown muncul saat hover (desktop) atau tap (mobile)
- Search bar expand on click dengan animasi smooth

#### 3.1.2 Footer

| Elemen | Deskripsi |
|--------|-----------|
| **Logo & Tagline** | Logo Cinelax + tagline singkat |
| **Link Navigasi** | Home, Movies, Series, Genre list |
| **Kontak** | Email, media sosial (ikon) |
| **Disclaimer** | Teks disclaimer konten |
| **Copyright** | © 2026 Cinelax. All rights reserved. |

```html
<!-- AD_SLOT: FOOTER_BANNER — Replace dengan kode iklan Anda -->
```

---

### 3.2 Homepage (`/`)

Homepage adalah halaman utama yang menampilkan overview seluruh konten.

#### 3.2.1 Hero Slider / Banner Carousel

| Properti | Deskripsi |
|----------|-----------|
| **Tipe** | Full-width carousel/slider otomatis |
| **Jumlah Slide** | 5–8 film/serial unggulan |
| **Konten per Slide** | Backdrop image (landscape), judul, rating ⭐, tahun, genre tags, sinopsis singkat (2-3 baris), tombol "Tonton Sekarang" & "Detail" |
| **Navigasi** | Dot indicator di bawah, panah kiri/kanan, auto-slide setiap 5 detik |
| **Pause** | Auto-slide berhenti saat hover (desktop) |

```html
<!-- AD_SLOT: HERO_BELOW — Replace dengan kode iklan Anda -->
```

#### 3.2.2 Section: Trending Minggu Ini

| Properti | Deskripsi |
|----------|-----------|
| **Layout** | Horizontal scroll row dengan movie cards |
| **Jumlah** | 10–20 item |
| **Sorting** | Berdasarkan popularitas/views minggu ini |
| **Navigasi** | Panah kiri/kanan untuk scroll, swipe di mobile |
| **Link "Lihat Semua"** | Mengarah ke halaman filtered |

#### 3.2.3 Section: Film Terbaru

| Properti | Deskripsi |
|----------|-----------|
| **Layout** | Horizontal scroll row dengan movie cards |
| **Jumlah** | 10–20 item |
| **Sorting** | Berdasarkan tanggal rilis terbaru |
| **Filter Tab** | `Semua` · `Movies` · `Series` |

```html
<!-- AD_SLOT: HOMEPAGE_MID_BANNER — Replace dengan kode iklan Anda -->
```

#### 3.2.4 Section: Film Populer

| Properti | Deskripsi |
|----------|-----------|
| **Layout** | Horizontal scroll row dengan movie cards |
| **Jumlah** | 10–20 item |
| **Sorting** | Berdasarkan rating tertinggi dan jumlah views keseluruhan |

#### 3.2.5 Section: Serial TV Terbaru

| Properti | Deskripsi |
|----------|-----------|
| **Layout** | Horizontal scroll row |
| **Jumlah** | 10–20 item |
| **Konten** | Khusus serial TV / K-Drama / Anime series |

#### 3.2.6 Section: Drama Korea

| Properti | Deskripsi |
|----------|-----------|
| **Layout** | Horizontal scroll row |
| **Jumlah** | 10–20 item |
| **Filter** | Country = Korea, Type = Series/Drama |

#### 3.2.7 Section: Anime

| Properti | Deskripsi |
|----------|-----------|
| **Layout** | Horizontal scroll row |
| **Jumlah** | 10–20 item |
| **Filter** | Genre = Animation, Country = Japan |

```html
<!-- AD_SLOT: HOMEPAGE_BOTTOM_BANNER — Replace dengan kode iklan Anda -->
```

#### 3.2.8 Section: Film Indonesia

| Properti | Deskripsi |
|----------|-----------|
| **Layout** | Horizontal scroll row |
| **Jumlah** | 10–20 item |
| **Filter** | Country = Indonesia |

---

### 3.3 Movie Card (Komponen Reusable)

Movie card digunakan di seluruh website untuk menampilkan preview konten.

#### Tampilan Card

```
┌─────────────────────┐
│                     │
│   [Poster Image]    │
│                     │
│  ┌──────┐  ┌─────┐ │
│  │ HD   │  │ ⭐7.5│ │
│  └──────┘  └─────┘ │
│                     │
├─────────────────────┤
│  Judul Film         │
│  2024 · Action      │
└─────────────────────┘
```

| Elemen | Deskripsi |
|--------|-----------|
| **Poster** | Gambar poster portrait (ratio 2:3), lazy loading |
| **Badge Kualitas** | Label di pojok: `CAM`, `HD`, `HDTC`, `720p`, `1080p`, `4K` |
| **Rating** | Skor IMDb/TMDb (⭐ 7.5) di pojok poster |
| **Badge Tipe** | `MOVIE` atau `SERIES` (opsional, untuk halaman campuran) |
| **Badge Episode** | Untuk series: `S2 EP12` (season/episode terbaru) |
| **Judul** | Judul film, max 2 baris, ellipsis jika terlalu panjang |
| **Meta** | Tahun rilis · Genre utama |

**Hover State (Desktop):**
- Scale up sedikit (1.05x) dengan shadow
- Overlay gelap dengan tombol ▶ Play
- Munculkan info tambahan: sinopsis singkat, durasi

**Tap (Mobile):**
- Navigasi langsung ke halaman detail

---

### 3.4 Halaman Daftar Film (`/movies`)

#### 3.4.1 Layout

| Elemen | Deskripsi |
|--------|-----------|
| **Heading** | "Semua Film" atau "Movies" |
| **Filter Bar** | Dropdown: Genre, Negara, Tahun, Kualitas, Sortir |
| **Grid Konten** | Grid responsif movie cards (4-6 kolom desktop, 3 tablet, 2 mobile) |
| **Pagination** | Navigasi halaman di bawah: `« Prev` `1` `2` `3` ... `Next »` atau infinite scroll |

```html
<!-- AD_SLOT: MOVIE_LIST_TOP — Replace dengan kode iklan Anda -->
```

#### 3.4.2 Filter & Sorting

| Filter | Opsi |
|--------|------|
| **Genre** | Semua genre (lihat §4.1) |
| **Negara** | Semua negara (lihat §4.2) |
| **Tahun** | 2026, 2025, 2024, ..., 2000 |
| **Kualitas** | Semua, CAM, HD, 720p, 1080p, 4K |
| **Sortir** | Terbaru, Rating Tertinggi, Paling Populer, Judul A-Z, Tahun |

```html
<!-- AD_SLOT: MOVIE_LIST_SIDEBAR — Replace dengan kode iklan Anda -->
```

---

### 3.5 Halaman Daftar Serial (`/series`)

Sama persis dengan halaman Movies, namun khusus menampilkan serial TV, K-Drama, Anime Series, dll.

#### Perbedaan dari Movies:

| Elemen | Deskripsi |
|--------|-----------|
| **Heading** | "Semua Serial" atau "TV Series" |
| **Card Badge** | Menampilkan season/episode terbaru (`S2 EP12`) |
| **Filter Tambahan** | Status: `Ongoing` · `Completed` |

```html
<!-- AD_SLOT: SERIES_LIST_TOP — Replace dengan kode iklan Anda -->
```

---

### 3.6 Halaman Filter Genre (`/genre/:slug`)

| Elemen | Deskripsi |
|--------|-----------|
| **Heading** | "Genre: Action" (dinamis sesuai genre) |
| **Breadcrumb** | Home > Genre > Action |
| **Sub-filter** | Tipe (Film/Serial), Negara, Tahun, Sortir |
| **Grid Konten** | Grid responsif movie cards |
| **Pagination** | Sama seperti halaman Movies |

---

### 3.7 Halaman Filter Negara (`/country/:slug`)

| Elemen | Deskripsi |
|--------|-----------|
| **Heading** | "Negara: Korea" (dinamis) |
| **Breadcrumb** | Home > Country > Korea |
| **Sub-filter** | Tipe, Genre, Tahun, Sortir |
| **Grid Konten** | Grid responsif movie cards |
| **Pagination** | Navigasi halaman |

---

### 3.8 Halaman Filter Tahun (`/year/:year`)

| Elemen | Deskripsi |
|--------|-----------|
| **Heading** | "Tahun Rilis: 2024" (dinamis) |
| **Breadcrumb** | Home > Year > 2024 |
| **Sub-filter** | Tipe, Genre, Negara, Sortir |
| **Grid Konten** | Grid responsif movie cards |
| **Pagination** | Navigasi halaman |

---

### 3.9 Halaman Pencarian (`/search?q=...`)

#### 3.9.1 Fitur Pencarian

| Fitur | Deskripsi |
|-------|-----------|
| **Live Search** | Dropdown suggestion muncul setelah mengetik min 2 karakter |
| **Autocomplete** | Menampilkan max 5 suggestion dengan poster kecil, judul, tahun |
| **Hasil Pencarian** | Grid movie cards dengan total hasil ditemukan |
| **Kosong** | Pesan "Tidak ditemukan hasil untuk '[query]'" dengan rekomendasi |

```html
<!-- AD_SLOT: SEARCH_RESULTS_TOP — Replace dengan kode iklan Anda -->
```

---

### 3.10 Halaman Detail Film (`/movie/:slug`)

Halaman ini adalah inti dari pengalaman menonton.

#### 3.10.1 Layout Detail Film

```
┌─────────────────────────────────────────────────────┐
│              [BACKDROP IMAGE / BANNER]               │
│                                                     │
│   ┌──────────┐                                      │
│   │          │  Judul Film (Tahun)                   │
│   │ [POSTER] │  ⭐ 8.5/10 · 2h 15m · HD             │
│   │          │  Genre: Action, Thriller, Drama       │
│   │          │                                       │
│   └──────────┘  [▶ Tonton Sekarang] [📥 Download]    │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  SINOPSIS                                            │
│  Lorem ipsum dolor sit amet...                       │
│  [Selengkapnya ▾]                                    │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  INFORMASI FILM                                      │
│  ┌─────────────┬────────────────────────────────┐    │
│  │ Judul Asli  │ Original Title                  │    │
│  │ Sutradara   │ Nama Sutradara                  │    │
│  │ Pemeran     │ Actor 1, Actor 2, Actor 3...    │    │
│  │ Negara      │ 🇺🇸 United States                │    │
│  │ Rilis       │ 15 Maret 2024                   │    │
│  │ Durasi      │ 2 jam 15 menit                  │    │
│  │ Kualitas    │ HD 1080p                         │    │
│  │ Rating      │ ⭐ 8.5 / 10 (IMDb)              │    │
│  │ Genre       │ Action, Thriller, Drama          │    │
│  │ Bahasa      │ English                          │    │
│  │ Subtitle    │ Indonesia                        │    │
│  └─────────────┴────────────────────────────────┘    │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  <!-- AD_SLOT: DETAIL_MID — Replace dgn iklan -->    │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  VIDEO PLAYER                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │                                              │    │
│  │           [EMBEDDED VIDEO PLAYER]            │    │
│  │                                              │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  Server: [Server 1] [Server 2] [Server 3] [Backup]   │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  <!-- AD_SLOT: DETAIL_BELOW_PLAYER — Replace -->     │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  DOWNLOAD                                            │
│  ┌──────────────────────────────────────────────┐    │
│  │ 🔗 360p  │ 🔗 480p  │ 🔗 720p  │ 🔗 1080p  │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  FILM TERKAIT (Related Movies)                       │
│  [Card] [Card] [Card] [Card] [Card] [Card]           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### 3.10.2 Info Metadata Film

| Field | Deskripsi |
|-------|-----------|
| **Judul** | Judul film (ditampilkan besar/heading) |
| **Judul Asli** | Judul asli (jika beda bahasa) |
| **Backdrop** | Gambar landscape sebagai background header |
| **Poster** | Gambar poster portrait |
| **Tahun Rilis** | Tahun rilis film |
| **Tanggal Rilis** | Tanggal rilis lengkap |
| **Rating** | Skor IMDb / TMDb (skala 1-10) |
| **Vote Count** | Jumlah vote |
| **Durasi** | Durasi film (jam:menit) |
| **Genre** | Daftar genre (klik menuju halaman genre) |
| **Sutradara** | Nama sutradara |
| **Pemeran** | Daftar aktor/aktris utama (max 10, expandable) |
| **Negara** | Negara produksi (klik menuju halaman negara) |
| **Bahasa** | Bahasa asli film |
| **Kualitas** | Label kualitas video (CAM/HD/720p/1080p/4K) |
| **Subtitle** | Bahasa subtitle yang tersedia |
| **Sinopsis** | Deskripsi/plot film, collapsible jika panjang |
| **Trailer** | Link/embed trailer YouTube (opsional) |

#### 3.10.3 Video Player

| Fitur | Deskripsi |
|-------|-----------|
| **Embed Player** | Iframe embed dari server hosting video |
| **Rasio Aspek** | 16:9 responsive |
| **Kontrol** | Play/Pause, Volume, Fullscreen, Picture-in-Picture |
| **Loading** | Skeleton/spinner saat player loading |
| **Error State** | Pesan "Server bermasalah, silakan pilih server lain" |

#### 3.10.4 Server Selection

| Fitur | Deskripsi |
|-------|-----------|
| **Jumlah Server** | Minimum 2–4 server alternatif |
| **Tampilan** | Tab buttons horizontal: `Server 1` `Server 2` `Server 3` `Backup` |
| **Active State** | Server yang dipilih diberi highlight (warna berbeda) |
| **Behavior** | Klik server → player reload dengan source baru, smooth transition |
| **Label** | Nama server (VidSrc, DoodStream, Filemoon, StreamTape, dll.) |

#### 3.10.5 Download Section

| Fitur | Deskripsi |
|-------|-----------|
| **Kualitas** | Tombol per resolusi: `360p` `480p` `720p` `1080p` |
| **Link** | Masing-masing mengarah ke halaman download atau direct link |
| **Ukuran File** | Estimasi ukuran file per resolusi (opsional) |
| **Format** | MP4 / MKV |

```html
<!-- AD_SLOT: DETAIL_DOWNLOAD_BELOW — Replace dengan kode iklan Anda -->
```

#### 3.10.6 Film Terkait (Related Movies)

| Fitur | Deskripsi |
|-------|-----------|
| **Layout** | Horizontal scroll row movie cards |
| **Jumlah** | 10–15 film terkait |
| **Algoritma** | Berdasarkan genre yang sama, negara, atau sutradara |

---

### 3.11 Halaman Detail Serial TV (`/series/:slug`)

Mirip dengan halaman detail film, dengan tambahan komponen khusus serial.

#### 3.11.1 Perbedaan dari Detail Film

| Elemen | Deskripsi |
|--------|-----------|
| **Status** | Badge status: `Ongoing` (hijau) / `Completed` (biru) |
| **Total Episode** | Jumlah total episode |
| **Total Season** | Jumlah total season |
| **Jadwal Tayang** | Hari dan jam tayang episode baru (untuk Ongoing) |
| **Network** | Nama network/stasiun TV (Netflix, HBO, tvN, dll.) |

#### 3.11.2 Season & Episode Selector

```
┌──────────────────────────────────────────────────┐
│  PILIH SEASON & EPISODE                          │
│                                                  │
│  Season: [Season 1 ▾] [Season 2] [Season 3]     │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │ EP 1  │ Judul Episode 1      │ 45 min │ ▶ │  │
│  │ EP 2  │ Judul Episode 2      │ 43 min │ ▶ │  │
│  │ EP 3  │ Judul Episode 3      │ 47 min │ ▶ │  │
│  │ EP 4  │ Judul Episode 4      │ 44 min │ ▶ │  │
│  │ EP 5  │ Judul Episode 5      │ 46 min │ ▶ │  │
│  │ ...                                        │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

| Elemen | Deskripsi |
|--------|-----------|
| **Season Tabs/Dropdown** | Tab horizontal atau dropdown untuk memilih season |
| **Episode List** | Daftar episode per season dalam tabel/list |
| **Per Episode** | Nomor EP, judul episode, durasi, thumbnail kecil (opsional), tombol play ▶ |
| **Active Episode** | Episode yang sedang ditonton diberi highlight |
| **Episode Terakhir** | Badge "NEW" untuk episode terbaru |
| **Navigasi Episode** | Tombol `← Episode Sebelumnya` dan `Episode Selanjutnya →` di bawah player |

```html
<!-- AD_SLOT: SERIES_EPISODE_LIST — Replace dengan kode iklan Anda -->
```

#### 3.11.3 Player untuk Serial

Sama seperti film, namun ditambah:

| Fitur Tambahan | Deskripsi |
|----------------|-----------|
| **Info Episode** | Judul episode & nomor ditampilkan di atas player |
| **Navigasi Episode** | Prev ← dan → Next episode buttons |
| **Auto Next** | (Opsional) Countdown auto-play episode berikutnya |

---

### 3.12 Halaman 404

| Elemen | Deskripsi |
|--------|-----------|
| **Ilustrasi** | Gambar/icon 404 yang menarik |
| **Heading** | "Halaman Tidak Ditemukan" |
| **Deskripsi** | "Maaf, halaman yang Anda cari tidak tersedia." |
| **Tombol** | "Kembali ke Homepage" |
| **Rekomendasi** | Section film populer di bawah |

---

## 4. Data Referensi

### 4.1 Daftar Genre

| # | Genre | Slug |
|---|-------|------|
| 1 | Action | `action` |
| 2 | Adventure | `adventure` |
| 3 | Animation | `animation` |
| 4 | Comedy | `comedy` |
| 5 | Crime | `crime` |
| 6 | Documentary | `documentary` |
| 7 | Drama | `drama` |
| 8 | Family | `family` |
| 9 | Fantasy | `fantasy` |
| 10 | History | `history` |
| 11 | Horror | `horror` |
| 12 | Music | `music` |
| 13 | Mystery | `mystery` |
| 14 | Romance | `romance` |
| 15 | Science Fiction | `sci-fi` |
| 16 | Thriller | `thriller` |
| 17 | TV Movie | `tv-movie` |
| 18 | War | `war` |
| 19 | Western | `western` |

### 4.2 Daftar Negara

| # | Negara | Slug | Bendera |
|---|--------|------|---------|
| 1 | United States | `us` | 🇺🇸 |
| 2 | United Kingdom | `uk` | 🇬🇧 |
| 3 | Korea Selatan | `korea` | 🇰🇷 |
| 4 | Jepang | `japan` | 🇯🇵 |
| 5 | China | `china` | 🇨🇳 |
| 6 | India | `india` | 🇮🇳 |
| 7 | Thailand | `thailand` | 🇹🇭 |
| 8 | Indonesia | `indonesia` | 🇮🇩 |
| 9 | Filipina | `philippines` | 🇵🇭 |
| 10 | Hong Kong | `hongkong` | 🇭🇰 |
| 11 | Taiwan | `taiwan` | 🇹🇼 |
| 12 | Prancis | `france` | 🇫🇷 |
| 13 | Jerman | `germany` | 🇩🇪 |
| 14 | Spanyol | `spain` | 🇪🇸 |
| 15 | Turki | `turkey` | 🇹🇷 |

### 4.3 Daftar Kualitas Video

| Label | Deskripsi |
|-------|-----------|
| `CAM` | Rekaman kamera di bioskop |
| `HDTC` | HD TeleCine |
| `HD` | High Definition (umum) |
| `720p` | Resolusi 1280×720 |
| `1080p` | Resolusi 1920×1080 (Full HD) |
| `4K` | Resolusi 3840×2160 (Ultra HD) |

---

## 5. Komponen UI Global

### 5.1 Loading States

| State | Deskripsi |
|-------|-----------|
| **Skeleton Cards** | Placeholder cards saat konten loading |
| **Spinner** | Loading spinner pada video player |
| **Progress Bar** | Loading bar tipis di atas halaman saat navigasi |

### 5.2 Toast / Notification

| Tipe | Deskripsi |
|------|-----------|
| **Error** | "Gagal memuat konten. Silakan coba lagi." (merah) |
| **Info** | "Server sedang sibuk, mencoba server alternatif..." (biru) |
| **Success** | "Berhasil dimuat" (hijau) |

### 5.3 Breadcrumb

Ditampilkan di halaman detail dan filter:

```
Home > Movies > Action > Judul Film
Home > Series > Korea > Judul Serial
```

### 5.4 Back to Top Button

- Muncul saat scroll ke bawah > 300px
- Tombol bulat di pojok kanan bawah
- Smooth scroll ke atas saat diklik

---

## 6. Responsif & Breakpoint

| Breakpoint | Lebar | Grid Kolom | Catatan |
|------------|-------|------------|---------|
| **Mobile** | < 640px | 2 kolom | Hamburger menu, stacked layout |
| **Tablet** | 640–1024px | 3 kolom | Sidebar collapsed |
| **Desktop** | 1024–1440px | 4–5 kolom | Full layout |
| **Large Desktop** | > 1440px | 5–6 kolom | Max-width container |

### 6.1 Adaptasi Mobile

| Elemen | Adaptasi |
|--------|----------|
| **Navbar** | Hamburger menu, search icon (expand on tap) |
| **Hero Slider** | Tinggi dikurangi, teks lebih ringkas |
| **Movie Cards** | 2 kolom grid, ukuran poster lebih kecil |
| **Player** | Full-width, tombol fullscreen lebih prominent |
| **Episode List** | Accordion/collapsible per season |
| **Filter** | Bottom sheet / modal filter |
| **Footer** | Stacked vertical layout |

---

## 7. Penempatan Iklan (Semua Slot)

Semua slot iklan disimpan sebagai HTML comment agar mudah di-replace:

| # | Slot ID | Lokasi | Tipe yang Disarankan |
|---|---------|--------|----------------------|
| 1 | `HERO_BELOW` | Di bawah hero slider, homepage | Banner 728×90 |
| 2 | `HOMEPAGE_MID_BANNER` | Antara section trending & populer | Banner 728×90 |
| 3 | `HOMEPAGE_BOTTOM_BANNER` | Sebelum footer, homepage | Banner 728×90 |
| 4 | `MOVIE_LIST_TOP` | Atas halaman daftar film | Banner 728×90 |
| 5 | `MOVIE_LIST_SIDEBAR` | Sidebar halaman film (desktop) | Banner 300×250 |
| 6 | `SERIES_LIST_TOP` | Atas halaman daftar serial | Banner 728×90 |
| 7 | `SEARCH_RESULTS_TOP` | Atas hasil pencarian | Banner 728×90 |
| 8 | `DETAIL_MID` | Antara info film dan player | Banner 728×90 |
| 9 | `DETAIL_BELOW_PLAYER` | Di bawah video player | Banner 728×90 |
| 10 | `DETAIL_DOWNLOAD_BELOW` | Di bawah section download | Banner 728×90 |
| 11 | `SERIES_EPISODE_LIST` | Di antara episode list | Native / Banner 728×90 |
| 12 | `FOOTER_BANNER` | Di atas footer | Banner 728×90 |
| 13 | `POPUP_OVERLAY` | Popup overlay (1x per sesi) | Interstitial / Popup |
| 14 | `MOBILE_STICKY_BOTTOM` | Sticky bottom bar (mobile only) | Sticky Banner 320×50 |

### Format Comment di Code

```html
<!-- AD_SLOT: HERO_BELOW — Replace dengan kode iklan Anda -->
<!-- Ukuran yang disarankan: 728x90 (Desktop) / 320x100 (Mobile) -->

<!-- AD_SLOT: POPUP_OVERLAY — Replace dengan kode iklan Anda -->
<!-- Tipe: Interstitial popup, tampilkan 1x per sesi user -->

<!-- AD_SLOT: MOBILE_STICKY_BOTTOM — Replace dengan kode iklan Anda -->
<!-- Tipe: Sticky bottom banner, mobile only, 320x50 -->
```

---

## 8. Desain & Tema Visual

### 8.1 Color Palette

| Token | Warna | Penggunaan |
|-------|-------|------------|
| `--bg-primary` | `#0a0a0f` | Background utama (dark) |
| `--bg-secondary` | `#14141f` | Background card, section |
| `--bg-tertiary` | `#1e1e2e` | Background dropdown, hover |
| `--accent-primary` | `#e50914` | Tombol utama, CTA, highlight (merah Netflix-like) |
| `--accent-secondary` | `#f5c518` | Rating stars, badge (kuning IMDb) |
| `--text-primary` | `#ffffff` | Teks utama |
| `--text-secondary` | `#a0a0b0` | Teks sekunder, meta info |
| `--text-muted` | `#6b6b80` | Teks placeholder, disabled |
| `--border` | `#2a2a3a` | Border card, divider |
| `--success` | `#22c55e` | Badge ongoing, status aktif |
| `--overlay` | `rgba(0,0,0,0.7)` | Overlay pada poster hover |

### 8.2 Typography

| Elemen | Font | Ukuran | Weight |
|--------|------|--------|--------|
| **Heading H1** | Inter / Outfit | 32–40px | 700 (Bold) |
| **Heading H2** | Inter / Outfit | 24–28px | 600 (SemiBold) |
| **Heading H3** | Inter / Outfit | 18–22px | 600 |
| **Body** | Inter | 14–16px | 400 (Regular) |
| **Caption** | Inter | 12–13px | 400 |
| **Button** | Inter | 14–16px | 600 |

### 8.3 Efek & Animasi

| Elemen | Efek |
|--------|------|
| **Card Hover** | `transform: scale(1.05)`, `box-shadow` elevated, transition 300ms |
| **Page Transition** | Fade-in content, opacity 0→1, 200ms |
| **Navbar Scroll** | Background opacity transition, blur(10px) |
| **Skeleton Loading** | Shimmer/pulse animation gradient |
| **Dropdown** | Slide-down + fade-in, 200ms |
| **Carousel** | Smooth slide transition, 500ms ease |
| **Button Hover** | Brightness increase, subtle scale |
| **Back to Top** | Fade-in/out pada scroll threshold |

---

## 9. SEO & Meta Tags

### 9.1 Meta Tags per Halaman

| Halaman | Title Pattern | Description Pattern |
|---------|--------------|---------------------|
| **Homepage** | `Cinelax — Nonton Film & Serial TV Sub Indo` | `Streaming film terbaru, serial TV, K-Drama, dan Anime sub Indonesia. Koleksi lengkap kualitas HD.` |
| **Movies** | `Daftar Film Terbaru — Cinelax` | `Jelajahi koleksi film lengkap dari berbagai genre dan negara di Cinelax.` |
| **Series** | `Serial TV & Drama Terbaru — Cinelax` | `Nonton serial TV, K-Drama, dan anime terbaru sub Indonesia.` |
| **Genre** | `Film {Genre} Terbaik — Cinelax` | `Koleksi film dan serial {genre} terpopuler sub Indo.` |
| **Detail** | `Nonton {Judul} ({Tahun}) Sub Indo — Cinelax` | `{Judul} — {Sinopsis singkat 150 char}. Nonton streaming kualitas {Kualitas}.` |
| **Search** | `Pencarian: {Query} — Cinelax` | `Hasil pencarian untuk "{Query}" di Cinelax.` |

### 9.2 Structured Data (JSON-LD)

Setiap halaman detail film/serial harus menyertakan:

```json
{
  "@context": "https://schema.org",
  "@type": "Movie",
  "name": "Judul Film",
  "image": "url-poster.jpg",
  "datePublished": "2024-03-15",
  "director": { "@type": "Person", "name": "Nama Sutradara" },
  "actor": [{ "@type": "Person", "name": "Nama Aktor" }],
  "genre": ["Action", "Thriller"],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "8.5",
    "bestRating": "10",
    "ratingCount": "12500"
  },
  "description": "Sinopsis film..."
}
```

### 9.3 Sitemap XML

- Auto-generate `sitemap.xml` dari database konten
- Submit ke Google Search Console
- Update harian untuk konten baru

### 9.4 Robots.txt

```
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://cinelax.com/sitemap.xml
```

---

## 10. Performa & Optimasi

| Area | Target |
|------|--------|
| **First Contentful Paint** | < 1.5 detik |
| **Largest Contentful Paint** | < 2.5 detik |
| **Cumulative Layout Shift** | < 0.1 |
| **Time to Interactive** | < 3.5 detik |

### 10.1 Strategi Optimasi

| Strategi | Implementasi |
|----------|-------------|
| **Lazy Loading** | Semua gambar poster menggunakan `loading="lazy"` |
| **Image Optimization** | Format WebP, multiple size (srcset), CDN |
| **Code Splitting** | Halaman di-split per route |
| **Caching** | Cache API response, cache static assets |
| **Minification** | Minify CSS/JS untuk production |
| **CDN** | Serve static assets via CDN |
| **Preconnect** | Preconnect ke domain player/video server |

---

## 11. Tech Stack yang Disarankan

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js / Vite + React (atau HTML/CSS/JS vanilla) |
| **Styling** | Vanilla CSS dengan CSS Custom Properties |
| **Font** | Google Fonts: Inter, Outfit |
| **Icons** | Lucide Icons / Heroicons |
| **Player** | Iframe embed (multi-server) |
| **API** | TMDb API / custom backend |
| **Image CDN** | TMDb image proxy / custom CDN |
| **Deployment** | Vercel / Netlify / VPS |

---

## 12. Daftar Fitur Ringkasan (Checklist)

### Core Features

- [ ] Hero slider/carousel otomatis di homepage
- [ ] Navbar sticky dengan dropdown genre, country, year
- [ ] Search bar dengan live search/autocomplete
- [ ] Movie card component (poster, badge, rating, judul, meta)
- [ ] Horizontal scroll rows untuk section konten
- [ ] Halaman daftar film dengan grid & filter
- [ ] Halaman daftar serial TV dengan grid & filter
- [ ] Halaman filter per genre
- [ ] Halaman filter per negara
- [ ] Halaman filter per tahun
- [ ] Halaman pencarian dengan hasil grid
- [ ] Halaman detail film (metadata lengkap)
- [ ] Video player embed (iframe)
- [ ] Server selection (multi-server switching)
- [ ] Download section (multi-resolusi)
- [ ] Season & episode selector untuk serial TV
- [ ] Navigasi episode (prev/next)
- [ ] Film terkait / rekomendasi
- [ ] Breadcrumb navigation
- [ ] Pagination
- [ ] Halaman 404

### UI/UX

- [ ] Dark theme (default)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Skeleton loading states
- [ ] Hover effects pada cards
- [ ] Smooth page transitions
- [ ] Back to top button
- [ ] Mobile hamburger menu
- [ ] Toast notifications
- [ ] Lazy loading images

### SEO

- [ ] Dynamic meta title & description per halaman
- [ ] Structured data (JSON-LD) per film/serial
- [ ] Semantic HTML (proper heading hierarchy)
- [ ] Sitemap XML
- [ ] Robots.txt
- [ ] Open Graph & Twitter Card meta tags

### Iklan

- [ ] 14 slot iklan sebagai HTML comment
- [ ] Format konsisten dan mudah di-replace
- [ ] Responsive ad sizing (desktop vs mobile)

---

> **Catatan:** PRD ini dibuat berdasarkan analisis fitur website referensi (IDLIX/idlixku.com). Semua fitur autentikasi (login, signup), watchlist, dan membership telah dihilangkan sesuai permintaan. Slot iklan disediakan sebagai HTML comment untuk kemudahan integrasi.
