# KatsuiRiku Ch — Commission (Static Site + Supabase)

Website commission statis (HTML/CSS/JS) dengan nuansa blush rose, cream, cocoa, sage, dan moon gold. Responsive + mobile dock. Data slot dan leaderboard **Top Commish** memakai Supabase supaya bisa diedit dari admin panel terpisah dan update realtime.

## Struktur

- `index.html` — halaman utama
- `assets/css/style.css` — styling & responsive
- `assets/js/main.js` — data brand/sosmed + pembacaan data live (EDIT DI SINI)
- `assets/js/supabase-config.js` — URL + anon key Supabase (isi setelah setup)
- `admin/` — panel admin terpisah (`index.html`, `admin.css`, `admin.js`)
- `data/slots.json` — fallback slot kalau Supabase belum aktif
- `data/top-commish.json` — fallback leaderboard kosong
- `SUPABASE_SETUP.md` — panduan SQL, Auth, RLS, realtime
- `assets/img/logo-character.png` — logo headcrop karakter (header, favicon)
- `assets/img/character.png` — ilustrasi karakter full body (hero)
- `assets/img/logo.svg` — logo paw cadangan (tidak dipakai)
- `robots.txt` — mencegah `/admin/` diindeks mesin pencari

## Konten saat ini

- Katsui Clip: **Rp60.000 / menit** — kartu gradient royal gold
- VOD Clip Lite: **Rp60.000 / menit** — kartu soft rose, format **16:9**
- Shorts: Rp50.000 / Rp100.000 / Rp150.000
- Info slot commish: angka slot tampil di hero, section khusus, dan badge kartu
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

Link/tombol langsung ada di `index.html`.

Setelah mengubah `assets/css/style.css`, `assets/js/main.js`, `admin/admin.css`, atau `admin/admin.js`, ganti angka `?v=...` di `index.html` dan `admin/index.html` agar browser/CDN tidak memakai cache lama. Versi saat ini: **20261022a**. Untuk gambar, timpa file lalu tambahkan `?v=` baru di `BRAND.logoImage`, favicon, atau `src` gambar terkait.

## Admin panel & data live

Panel admin ada di halaman terpisah, bukan modal publik:

`https://chickenkatsui.github.io/katsuiriku-commis/admin/`

Halaman ini tidak dilink dari website publik dan memakai `noindex` + `robots.txt`. Pengunjung biasa yang membuka URL tersebut hanya melihat halaman login.

### Setup Supabase (sekali)

Ikuti langkah lengkap di **`SUPABASE_SETUP.md`**. Ringkasnya:

1. Buat project Supabase.
2. Jalankan SQL setup (tabel `site_data`, `admin_users`, RLS, realtime).
3. Buat user admin di **Authentication → Users** (auto-confirm), lalu masukkan UUID-nya ke `admin_users`.
4. Salin **Project URL** + **anon public key** ke `assets/js/supabase-config.js`.
5. Buka `/admin/`, login.

**Jangan pernah** memakai `service_role` key di website. Anon key aman karena RLS membatasi tulis.

### Edit slot

Tab **Slot Commish** → isi total, terisi, catatan → simpan. Website update realtime (fallback polling ±60 detik kalau realtime mati).

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

- `data/slots.json` untuk slot
- `data/top-commish.json` untuk leaderboard (default kosong)

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
  - `≤ 980px` — hero jadi satu kolom
  - `≤ 900px` — navigasi berubah jadi hamburger
  - `≤ 820px` — slot board jadi satu kolom
  - `≤ 720px` — highlight & playlist menyesuaikan
  - `≤ 560px` — kartu satu kolom + mobile dock + header logo saja
  - `≤ 380px` — penyesuaian layar sangat kecil
  - HP landscape (`≤ 950px` & tinggi `≤ 500px`) — header logo saja
- Mobile dock & footer memakai safe-area inset (iPhone notch/home indicator).
- Logo HP diperbesar (56px); tablet/laptop tetap 42px.

## Catatan

- Tidak perlu build tool.
- `.nojekyll` sudah disertakan.
- Untuk mengganti logo header/favicon, timpa `assets/img/logo-character.png` dengan gambar persegi (disarankan 256×256 atau lebih, background transparan).
- Untuk mengganti ilustrasi hero, timpa `assets/img/character.png`.
- Palet: bg `#F3E7E0` → `#E4C6C0` → `#D9A6A6`; surface `#FBF4EC` / `#F4E7DA`; ink `#3A2620`; rose `#B86B6B` / `#8E4F4F`; sage `#6F8B7E`; gold `#C9A227`; gold-light `#F5D98B`.
