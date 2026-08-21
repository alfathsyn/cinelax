# Desain — Migrasi Cinelax ke Katalog Live TMDB

> **Versi:** 1.0
> **Tanggal:** 21 Agustus 2026
> **Status:** Menunggu review
> **Menggantikan:** katalog statis IDLIX pada `js/movies-data.js` dan `idlix_movies_db.json`

---

## 1. Ringkasan

Cinelax saat ini adalah situs statis dengan katalog 389 judul yang dibekukan di dalam
`js/movies-data.js`, dan pemutaran video dilakukan lewat iframe ke sejumlah host embed pihak
ketiga (`vidsrc.to`, `autoembed.co`, `2embed.cc`, `vidsrc.in`).

Desain ini mengganti sumber data katalog dengan TMDB API secara live, dan mengganti mekanisme
pemutaran dengan trailer resmi YouTube ditambah panel ketersediaan layanan streaming resmi.

Dua alasan perubahan:

1. **Katalog statis tidak berkelanjutan.** Setiap judul baru harus ditambahkan manual, poster
   diunduh manual, dan metadata cepat basi. Poster pada katalog sekarang pun sebenarnya sudah
   menunjuk ke `image.tmdb.org`, sehingga TMDB memang sudah menjadi sumber metadata de-facto —
   hanya dalam bentuk beku.
2. **Host embed pihak ketiga bukan sumber berlisensi.** Menggantinya dengan trailer resmi dan
   tautan ke layanan berlisensi menempatkan proyek ini pada posisi yang jelas.

---

## 2. Keputusan yang Sudah Diambil

| Topik | Keputusan |
|-------|-----------|
| Cakupan | Ganti total — katalog statis dibuang, seluruh data dari TMDB live |
| Backend | Vercel serverless, hanya mem-proxy JSON (tidak mem-proxy video) |
| Pendekatan | Tambah proxy dan data layer baru, UI/router/filter yang sudah ada dipertahankan |
| Badge kualitas | Diganti rating TMDB (data asli, menggantikan nilai karangan) |
| Skrip scraper lama | Dihapus seluruhnya |
| Baris homepage | Trending minggu ini, Rating tertinggi, dan beberapa baris per genre |

Baris "Populer di Indonesia" secara sadar **tidak** dimasukkan.

---

## 3. Prasyarat

**API key TMDB harus disiapkan pemilik proyek.** Daftar di themoviedb.org, buka Settings lalu API,
pilih tipe Developer. Key disimpan sebagai Environment Variable di Vercel dengan nama
`TMDB_API_KEY`, dan tidak pernah masuk ke dalam kode maupun ke browser.

Untuk pengembangan lokal, key diletakkan di `.env.local` (perlu dipastikan tercakup `.gitignore`),
dijalankan lewat `vercel dev`.

---

## 4. Arsitektur

```
Browser  (index.html + css/style.css + js/*.js — tetap statis)
    |
    |  fetch /api/tmdb/<endpoint>?<params>
    v
Vercel Serverless Function   api/tmdb/[...path].js
    - memegang TMDB_API_KEY dari environment
    - allowlist endpoint dan parameter
    - memaksa language=id-ID, region=ID, include_adult=false
    - menetapkan Cache-Control
    |
    v
api.themoviedb.org/3/...
```

Browser tidak pernah menghubungi TMDB secara langsung. Seluruh trafik metadata melewati proxy,
sehingga API key tetap rahasia dan respons dapat di-cache oleh CDN Vercel.

Video tidak pernah melewati server. Trailer diputar lewat embed YouTube resmi, dan pemutaran
konten penuh diserahkan ke layanan berlisensi lewat tautan keluar.

### 4.1 Berkas yang Terpengaruh

| Berkas | Aksi | Keterangan |
|--------|------|------------|
| `api/tmdb/[...path].js` | Baru | Proxy TMDB |
| `js/tmdb.js` | Baru | Data layer: fetch, pemetaan, cache |
| `js/main.js` | Ubah | Data menjadi async, pemutar diganti panel provider |
| `index.html` | Ubah | Buang tag script katalog statis, tambah atribusi TMDB |
| `vercel.json` | Ubah | Pastikan rewrite tidak menelan `/api/*` |
| `js/movies-data.js` | Hapus | Katalog statis |
| `idlix_movies_db.json` | Hapus | Katalog statis |
| `download_all_posters.js` | Hapus | Skrip scraper poster |
| `download_helper.js` | Hapus | Skrip scraper poster |
| `fetch_posters.js` | Hapus | Skrip scraper poster |
| `get_wiki_posters.js` | Hapus | Skrip scraper poster |
| `test_candidates.js` | Hapus | Skrip bantu scraper |
| `test_remaining.js` | Hapus | Skrip bantu scraper |
| `wiki_posters.json` | Hapus | Keluaran scraper |
| `scraped_posters.json` | Hapus | Keluaran scraper |

Seluruh berkas yang dihapus tetap tersimpan di riwayat git.

### 4.2 Catatan `vercel.json`

Konfigurasi sekarang me-rewrite `/(.*)` ke `/index.html`. Vercel memeriksa filesystem dan
serverless function sebelum menerapkan rewrite, sehingga `/api/*` kemungkinan besar sudah aman.
Meski begitu pola sumber akan dibuat eksplisit agar tidak mencakup `/api`, lalu diverifikasi
dengan `vercel dev` sebelum dianggap selesai.

---

## 5. Komponen: Proxy TMDB

### 5.1 Allowlist Endpoint

Permintaan yang tidak cocok dengan salah satu pola berikut ditolak dengan status 400. Tujuannya
mencegah proxy dipakai pihak lain sebagai open proxy atas kuota pemilik proyek.

```
search/multi
discover/movie
discover/tv
trending/{media}/{window}
movie/{id}
tv/{id}
tv/{id}/season/{n}
{media}/{id}/credits
{media}/{id}/videos
{media}/{id}/watch/providers
{media}/{id}/recommendations
genre/{media}/list
```

### 5.2 Allowlist Parameter

Hanya parameter berikut yang diteruskan: `query`, `page`, `with_genres`, `sort_by`,
`primary_release_year`, `year`, `vote_count.gte`. Parameter lain dibuang tanpa pemberitahuan.

Proxy selalu menambahkan `api_key` dari environment, `region=ID`, dan `include_adult=false`.
Ketiganya tidak dapat ditimpa klien.

Bahasa diperlakukan khusus. Nilai bawaannya `language=id-ID`. Klien boleh mengirim parameter
`lang` dengan nilai terbatas pada `id` atau `en` saja, yang diterjemahkan proxy menjadi `id-ID`
atau `en-US`. Nilai lain ditolak dan diperlakukan sebagai bawaan. Jalur sempit ini ada semata
untuk melayani fallback sinopsis pada bagian 14 — tanpa itu, fallback tersebut mustahil
dijalankan.

### 5.3 Cache

| Jenis endpoint | Header |
|----------------|--------|
| Detail, kredit, video, provider, genre | `public, s-maxage=3600, stale-while-revalidate=86400` |
| Discover, trending | `public, s-maxage=1800, stale-while-revalidate=86400` |
| Search | `public, s-maxage=600, stale-while-revalidate=3600` |

Cache inilah yang menjaga penggunaan kuota tetap rendah: permintaan berulang dilayani CDN Vercel
tanpa menyentuh TMDB.

### 5.4 Penanganan Error

| Kondisi | Respons proxy |
|---------|---------------|
| Path di luar allowlist | 400 dengan pesan singkat |
| TMDB 404 | 404 diteruskan |
| TMDB 429 | 429 diteruskan beserta header `Retry-After` |
| TMDB error lain, atau gagal jaringan | 502 |
| `TMDB_API_KEY` tidak ada | 500 dengan pesan konfigurasi |

---

## 6. Komponen: Data Layer `js/tmdb.js`

Tugasnya memetakan respons TMDB ke bentuk objek film yang **sudah** dipakai fungsi render saat
ini, sehingga baris 735 sampai 2043 pada `js/main.js` tidak perlu diubah strukturnya.

### 6.1 Pemetaan Medan

| Medan tujuan | Sumber TMDB |
|--------------|-------------|
| `tmdbId` | `id` |
| `title` | `title` (film) atau `name` (serial) |
| `originalTitle` | `original_title` / `original_name` |
| `year` | 4 digit pertama `release_date` / `first_air_date` |
| `rating` | `vote_average`, satu desimal |
| `type` | `movie` atau `series` dari `media_type` atau konteks endpoint |
| `duration` | Film: `runtime` diformat "2j 15m". Serial: jumlah season |
| `genres` | `genres[].name`, atau `genre_ids` dipetakan lewat `genre/{media}/list` |
| `genre` | Elemen pertama `genres` |
| `country` | `production_countries[0].name` / `origin_country[0]` |
| `director` | `credits.crew` dengan `job == "Director"`. Serial: `created_by[0].name` |
| `cast` | 4 nama teratas `credits.cast` |
| `description` | `overview` |
| `poster` | `image.tmdb.org/t/p/w500` ditambah `poster_path` |
| `backdrop` | `image.tmdb.org/t/p/w1280` ditambah `backdrop_path` |
| `slug` | Slugify dari `title` dan `year` |
| `id` | `{type}-{slug}` |
| `seasonCount` | `number_of_seasons` |
| `trailerUrl` | `/videos`, ambil `type == "Trailer"` dan `site == "YouTube"`, jadikan embed `youtube-nocookie` |
| `providers` | `/watch/providers` bagian `results.ID` |

Medan `quality` dihapus. Badge pada kartu diisi `rating`.

### 6.2 Cache Sisi Browser

Cache in-memory berupa `Map` dengan kunci endpoint beserta parameternya, berlaku selama satu
sesi halaman. Data halaman detail disimpan tambahan di `sessionStorage` agar navigasi mundur-maju
tidak memicu permintaan ulang.

### 6.3 Bentuk Modul

`js/tmdb.js` memisahkan fungsi murni dari fungsi yang melakukan I/O:

- Fungsi murni pemetaan (`mapMovie`, `mapTv`, `mapSearchResult`, `formatRuntime`, `pickTrailer`,
  `pickDirector`) — tidak menyentuh jaringan, sehingga dapat diuji dengan fixture.
- Fungsi pengambilan data (`fetchTmdb`, `searchTitles`, `getDetail`, `getHomeRows`) — memanggil
  proxy lalu menyerahkan hasilnya ke fungsi pemetaan.

Pemisahan ini yang membuat pengujian bisa dilakukan tanpa jaringan.

---

## 7. Alur Data

### 7.1 Homepage

Saat halaman dimuat, `js/main.js` meminta beberapa baris secara paralel:

| Baris | Permintaan |
|-------|-----------|
| Trending minggu ini | `trending/all/week` |
| Rating tertinggi | `discover/movie` diurutkan `vote_average.desc` dengan ambang `vote_count.gte` agar judul bervote sedikit tidak naik |
| Per genre | `discover/movie` dengan `with_genres` untuk Aksi, Horor, Animasi, dan Drama |

Hero slider mengambil beberapa judul teratas dari baris trending yang memiliki `backdrop_path`.

### 7.2 Pencarian

`initSearch()` pada `js/main.js:2043` sekarang memfilter array lokal. Perilaku baru: input
di-debounce 300 milidetik, lalu memanggil `search/multi`. Dropdown menampilkan poster, judul,
tahun, dan tipe. Tersedia state kosong dan state error.

### 7.3 Halaman Detail

Router yang sudah ada mengurai slug dari URL. Karena slug tidak dapat diterjemahkan langsung
menjadi ID TMDB, halaman detail menyertakan `tmdbId` pada tautan yang dihasilkan kartu. Bila
pengguna membuka URL detail secara langsung tanpa `tmdbId`, aplikasi melakukan `search/multi`
dengan judul hasil un-slugify lalu memilih kecocokan menurut urutan berikut:

1. Hasil pertama yang slug judul beserta tahunnya sama persis dengan slug pada URL.
2. Bila tidak ada, hasil pertama yang slug judulnya sama persis tanpa memperhitungkan tahun.
3. Bila tetap tidak ada, hasil pertama dengan `popularity` tertinggi.

Bila pencarian tidak mengembalikan hasil sama sekali, `renderNotFoundView()` pada
`js/main.js:2031` dipanggil.

Detail memuat tiga permintaan paralel: detail utama, `credits`, dan `videos`. Panel provider
dimuat menyusul agar tidak menahan tampilan utama.

---

## 8. Panel "Nonton di"

Menggantikan iframe pemutar pada tampilan modal maupun tampilan detail.

Susunannya:

1. Bila tersedia trailer, tampilkan iframe YouTube resmi.
2. Di bawahnya, baris logo provider dari TMDB, dikelompokkan menjadi **Langganan**, **Sewa**, dan
   **Beli** sesuai medan `flatrate`, `rent`, dan `buy`.
3. Mengklik provider membuka tautan JustWatch region Indonesia yang disediakan TMDB.
4. Bila region Indonesia kosong, tampilkan pesan bahwa judul belum tersedia di layanan streaming
   Indonesia, disertai tautan JustWatch global.

**Batasan yang perlu disadari.** TMDB tidak menyediakan URL langsung ke halaman judul di
masing-masing provider. Yang tersedia hanya satu tautan agregat ke JustWatch. Karena itu logo
provider akurat, tetapi tautannya melewati JustWatch terlebih dahulu. Membangun tautan langsung
per provider lewat pola URL pencarian masing-masing layanan memungkinkan, tetapi rapuh dan mudah
basi, sehingga secara sadar tidak dilakukan.

Fungsi berikut dihapus atau diganti: `STREAM_SERVERS` dan `getStreamEmbedUrl`
(`js/main.js:905` sampai 952), `loadPlayerIframe` (`js/main.js:961`), `loadDetailPlayerIframe`
(`js/main.js:1849`), `renderModalServerButtons`, `renderDetailServerButtons`,
`switchPlayerServer`, `switchDetailServer`, dan `tryAlternateServer`.

---

## 9. Atribusi TMDB

Ketentuan pemakaian API TMDB mewajibkan atribusi. Footer harus memuat logo TMDB beserta
pernyataan bahwa produk ini memakai API TMDB namun tidak didukung maupun disertifikasi oleh
TMDB. Ini kewajiban, bukan pilihan desain.

---

## 10. Penanganan Error di Sisi Klien

| Kondisi | Perilaku |
|---------|----------|
| Proxy tidak dapat dihubungi | `showToast()` (`js/main.js:49`) beserta tombol coba lagi |
| Status 429 | Backoff, lalu toast pemberitahuan terlalu banyak permintaan |
| Poster kosong | Fallback gradien dan emoji yang sudah ada (`js/main.js:10`) tetap dipakai |
| Hasil pencarian kosong | State kosong pada dropdown |
| Slug tidak dikenal | `renderNotFoundView()` (`js/main.js:2031`) |
| Baris homepage gagal sebagian | Baris yang gagal disembunyikan, baris lain tetap tampil |

Kegagalan satu baris homepage tidak boleh mengosongkan seluruh halaman.

---

## 11. Pengujian

Repo belum memiliki test sama sekali. Rencananya memakai `node --test` bawaan Node 24 sehingga
tidak menambah dependency.

Cakupan pengujian:

| Target | Bentuk pengujian |
|--------|------------------|
| Fungsi pemetaan `js/tmdb.js` | Fixture JSON respons TMDB tersimpan di `test/fixtures/`, diuji tanpa jaringan |
| `formatRuntime`, `pickTrailer`, `pickDirector` | Uji unit termasuk kasus medan kosong |
| Allowlist endpoint proxy | Pastikan path terlarang ditolak 400 dan path sah diteruskan |
| Allowlist parameter proxy | Pastikan parameter tak dikenal dibuang dan `include_adult` tidak dapat ditimpa |

Pengembangan mengikuti alur TDD: test ditulis lebih dulu, dilihat gagal, baru implementasi.

Verifikasi manual dilakukan lewat `vercel dev` untuk memastikan routing `/api/*` berfungsi.

---

## 12. Urutan Implementasi

1. Proxy `api/tmdb/[...path].js` beserta pengujian allowlist.
2. Data layer `js/tmdb.js` beserta pengujian pemetaan.
3. Tukar sumber data homepage, pencarian, listing, dan detail ke data layer.
4. Ganti pemutar dengan panel "Nonton di".
5. Ganti badge kualitas menjadi rating TMDB.
6. Hapus katalog statis dan skrip scraper.
7. Tambahkan atribusi TMDB, sesuaikan `vercel.json`, verifikasi menyeluruh.

Tiap tahap dijaga tetap dapat dijalankan, sehingga situs tidak pernah dalam keadaan rusak total
di tengah pengerjaan.

---

## 13. Di Luar Lingkup

- Pemutaran konten penuh di dalam Cinelax.
- Proxy video dalam bentuk apa pun.
- Tautan langsung per provider di luar tautan agregat JustWatch.
- Autentikasi, watchlist, dan pembayaran — tetap di luar lingkup sesuai PRD.
- Migrasi ke framework. Situs tetap statis dengan JavaScript biasa.

---

## 14. Risiko

| Risiko | Mitigasi |
|--------|----------|
| Rewrite `vercel.json` menelan `/api/*` | Pola sumber dibuat eksplisit, diverifikasi `vercel dev` |
| Slug tidak dapat dipetakan ke ID TMDB | `tmdbId` disertakan pada tautan, dengan fallback pencarian judul |
| Kuota TMDB terpakai berlebihan | Cache CDN agresif ditambah cache sisi browser |
| Ketersediaan provider Indonesia tipis | State kosong yang jujur, bukan disembunyikan |
| Terjemahan `id-ID` tidak lengkap di TMDB | Bila `overview` kosong, data layer mengulang permintaan dengan `lang=en` (lihat bagian 5.2) |
