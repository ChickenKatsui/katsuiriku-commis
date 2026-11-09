# KatsuiRiku Ch — Commission (Static Site + Supabase)

Website commission statis (HTML/CSS/JS) dengan nuansa blush rose, cream, cocoa, sage, dan moon gold. Responsive + mobile dock. Data slot, status layanan, harga Indonesia/Global, jadwal commission, About Me, dan leaderboard **Top Commish** memakai Supabase supaya bisa diedit dari admin panel terpisah dan update realtime.

## Struktur

- `index.html` — halaman utama
- `schedule/index.html` — halaman jadwal commission (Waiting List / In Work / Done)
- `about/index.html` — halaman About Me lengkap
- `assets/css/style.css` — styling & responsive
- `assets/js/main.js` — data brand/sosmed + pembacaan data live (EDIT DI SINI)
- `assets/js/pricing-defaults.js` — harga default + normalizer harga Indonesia/Global
- `assets/js/content-defaults.js` — default About Me + normalizer jadwal commission
- `assets/js/supabase-config.js` — URL + anon key Supabase (isi setelah setup)
- `admin/` — panel admin terpisah (`index.html`, `admin.css`, `admin.js`)
- `data/slots.json` — fallback slot + status layanan kalau Supabase belum aktif
- `data/top-commish.json` — fallback leaderboard kosong
- `SUPABASE_SETUP.md` — panduan SQL, Auth, RLS, realtime
- `supabase/migrations/20261102_service_status.sql` — migrasi kolom status layanan
- `supabase/migrations/20261105_pricing.sql` — migrasi kolom harga Indonesia/Global
- `supabase/migrations/20261107_schedule_about.sql` — migrasi kolom jadwal & About Me
- `assets/img/logo-character.png` — logo headcrop karakter (header, favicon)
- `assets/img/character.png` — ilustrasi karakter full body (hero)
- `assets/img/logo.svg` — logo paw cadangan (tidak dipakai)
- `robots.txt` — mencegah `/admin/` diindeks mesin pencari

## Konten saat ini

- Katsui Clip: **Rp60.000 / menit** — kartu gradient royal gold
- VOD Clip Lite: **Rp60.000 / menit** — kartu soft rose, format **16:9**
- Shorts: Shorts Reguler **Rp50.000 / video (1 menit)**, Paket 5 Shorts **Rp240.000**, durasi lebih panjang Rp100.000 / Rp150.000
- Global / overseas: Shorts **$15 / video**, 5-Short Bundle **$65**, Katsui Clip & VOD Clip Lite **$25 / menit**, extra revision **$5**; payment PayPal/Wise
- Rate global diposisikan low-mid market VGen (shorts $10–$35, bundle 5 $65–$90, clip/VOD $30–$50) supaya tetap kompetitif untuk client luar
- Info slot commish: angka slot tampil di hero dan section khusus; badge kartu menampilkan status layanan (Open/Closed/Full)
- Estimasi waktu: Katsui Clip **1–4 hari**, Shorts **1–3 hari**, VOD **1–4 hari**
- Status layanan: Katsui Clip, Shorts, dan VOD bisa diatur **Open / Closed** dari admin
- Harga Indonesia (IDR) dan Global (USD) dipisah di admin: harga, satuan, daftar termasuk, catatan, label tombol, dan tabel durasi bisa diedit tanpa mengubah HTML
- Jadwal commission: board publik **Waiting List / In Work / Done** di `/schedule/`, nama client bisa ditampilkan, inisial, atau anonymous per item
- About Me: halaman `/about/` + ringkasan di homepage, berisi bio, lokasi, timezone, birthday, bahasa, software, equipment, hobi, fun facts, favorites, dan catatan commission
- Top Commish: leaderboard manual **top 5 client** berdasarkan jumlah commission per bulan
- Portfolio Shorts: playlist `https://youtube.com/playlist?list=PLNJ5KH9O1soM&si=lMcD65zGpCHeEC8i`
- Portfolio VOD & Kategori Shorts: dihapus
- Stats subscriber/views/video: diganti highlight layanan (Rapi & Clean, 2x Revisi, Asset & BGM)
- Footer: © KatsuiRiku Ch (tanpa credit Carrd)
- Logo header & favicon memakai `assets/img/logo-character.png`; avatar/ilustrasi hero memakai `assets/img/character.png`

## Cara edit konten

Buka `assets/js/main.js`:

- `BRAND` → nama, tagline, logo
- `SOCIALS` → link sosmed + ikon SVG
- `CONTACT` → link Twitter/X, Instagram, Discord, Facebook
- `PORTFOLIO_PLAYLIST` → link playlist portfolio

Harga default dan struktur detail panel ada di `assets/js/pricing-defaults.js`. Default About Me dan struktur jadwal ada di `assets/js/content-defaults.js`. Setelah admin menyimpan, nilai dari Supabase yang dipakai. Link/tombol langsung ada di `index.html`, `schedule/index.html`, dan `about/index.html`.

Setelah mengubah `assets/css/style.css`, `assets/js/main.js`, `assets/js/pricing-defaults.js`, `assets/js/content-defaults.js`, `admin/admin.css`, atau `admin/admin.js`, ganti angka `?v=...` di `index.html`, `schedule/index.html`, `about/index.html`, dan `admin/index.html` agar browser/CDN tidak memakai cache lama. Versi saat ini: **20261109b**. Untuk gambar, timpa file lalu tambahkan `?v=` baru di `BRAND.logoImage`, favicon, atau `src` gambar terkait.

## Admin panel & data live

Panel admin ada di halaman terpisah, bukan modal publik:

`https://chickenkatsui.github.io/katsuiriku-commis/admin/`

Halaman ini tidak dilink dari website publik dan memakai `noindex` + `robots.txt`. Pengunjung biasa yang membuka URL tersebut hanya melihat halaman login.

### Setup Supabase (sekali)

Ikuti langkah lengkap di **`SUPABASE_SETUP.md`**. Ringkasnya:

1. Buat project Supabase.
2. Jalankan SQL setup (tabel `site_data`, `admin_users`, RLS, realtime). Untuk database yang sudah ada, jalankan juga migrasi status layanan, harga, serta jadwal & About Me.
3. Buat user admin di **Authentication → Users** (auto-confirm), lalu masukkan UUID-nya ke `admin_users`.
4. Salin **Project URL** + **anon public key** ke `assets/js/supabase-config.js`.
5. Buka `/admin/`, login.

**Jangan pernah** memakai `service_role` key di website. Anon key aman karena RLS membatasi tulis.

### Edit slot

Tab **Slot Commish** → isi total, terisi, catatan → simpan. Website update realtime (fallback polling ±60 detik kalau realtime mati).

### Edit harga Indonesia & Global

Tab **Harga** → pilih **Indonesia · IDR** atau **Global · USD**. Setiap kartu bisa diedit: judul/label, harga, satuan, daftar termasuk, catatan, dan label tombol order. Tabel durasi Shorts diisi satu baris per durasi dengan format `Durasi | Harga`.

Harga Indonesia disimpan di `local_pricing` dan Global di `global_pricing`, jadi keduanya terpisah. Untuk database yang sudah ada, jalankan migrasi `supabase/migrations/20261105_pricing.sql`.

### Edit status layanan

Tab **Layanan** → toggle **Katsui Clip**, **Shorts / Reels / TikTok**, dan **VOD Clip Lite** ke Open/Closed → simpan. Badge dan tombol order di website mengikuti status masing-masing layanan.

Untuk database yang sudah ada, jalankan SQL migrasi di **`SUPABASE_SETUP.md`** agar kolom `clip_open`, `shorts_open`, dan `vod_open` ditambahkan.

### Edit jadwal commission

Tab **Jadwal** → **+ Tambah item** → isi judul, client, layanan, status (Waiting List / In Work / Done), pilihan tampil nama, dan catatan → atur urutan dengan tombol panah → **Simpan jadwal**. Board publik ada di `/schedule/`.

Untuk database yang sudah ada, jalankan migrasi `supabase/migrations/20261107_schedule_about.sql`.

### Edit About Me

Tab **About Me** → isi profil, bio, lokasi, timezone, birthday, bahasa, daftar software/equipment/hobi/favorites/fun facts (satu per baris), catatan commission, dan foto URL opsional → **Simpan About Me**. Halaman lengkap ada di `/about/`, ringkasannya tampil di homepage.

### Edit Top Commish

Tab **Top Commish** → isi judul + periode → isi maksimal 5 baris (nama, jumlah commish, handle opsional, avatar URL opsional) → simpan. Urutan baris = rank. Ganti periode dan isi ulang setiap bulan.

### Keamanan

- Public hanya bisa `SELECT` data.
- Hanya user di `admin_users` yang bisa menulis (RLS `is_admin()`).
- `admin_users` tidak bisa dibaca/ditulis dari browser.
- Sesi login admin disimpan di `sessionStorage` tab (tutup tab = logout).
- Pendaftaran publik di Supabase sebaiknya dimatikan.
- Admin page bukan URL rahasia sebagai pengaman utama; pengamannya adalah Supabase Auth + RLS.

## Fallback sebelum Supabase aktif

Selama `supabase-config.js` kosong, website publik memakai:

- `data/slots.json` untuk slot + status layanan
- `data/top-commish.json` untuk leaderboard (default kosong)
- `assets/js/pricing-defaults.js` untuk harga default Indonesia/Global
- `assets/js/content-defaults.js` untuk default About Me + jadwal kosong

Jadi situs tetap jalan tanpa Supabase. Setelah config diisi, Supabase menjadi sumber utama.

## Deploy ke GitHub Pages

1. Repo: `ChickenKatsui/katsuiriku-commis`.
2. Settings → Pages → Source: branch `main`, root.
3. Akses `https://chickenkatsui.github.io/katsuiriku-commis/`.
4. Admin: `https://chickenkatsui.github.io/katsuiriku-commis/admin/`.

Tidak perlu build tool. `.nojekyll` sudah disertakan.

## Responsive

- Sudah dicek dari **240px sampai 2560px** tanpa horizontal scroll.
- Breakpoint utama:
  - `≤ 980px` — hero dan About hero jadi satu kolom
  - `≤ 900px` — navigasi berubah jadi hamburger + mobile dock
  - `≤ 820px` — slot board, jadwal board, dan About lists menyesuaikan
  - `≤ 720px` — highlight, playlist, dan About facts menyesuaikan
  - `≤ 560px` — kartu satu kolom + header logo saja
  - `≤ 420px` — mobile dock dipadatkan untuk 6 item
  - `≤ 380px` — penyesuaian layar sangat kecil
  - `≤ 300px` — label mobile dock disembunyikan, ikon tetap tampil
  - HP landscape (`≤ 950px` & tinggi `≤ 500px`) — header logo saja
- Mobile dock & footer memakai safe-area inset (iPhone notch/home indicator).
- Logo HP diperbesar (56px); tablet/laptop tetap 42px.

## Catatan

- Tidak perlu build tool.
- `.nojekyll` sudah disertakan.
- Untuk mengganti logo header/favicon, timpa `assets/img/logo-character.png` dengan gambar persegi (disarankan 256×256 atau lebih, background transparan).
- Untuk mengganti ilustrasi hero, timpa `assets/img/character.png`.
- Palet: bg `#F3E7E0` → `#E4C6C0` → `#D9A6A6`; surface `#FBF4EC` / `#F4E7DA`; ink `#3A2620`; rose `#B86B6B` / `#8E4F4F`; sage `#6F8B7E`; gold `#C9A227`; gold-light `#F5D98B`.
