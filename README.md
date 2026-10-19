# KatsuiRiku Ch — Commission (Static Site)

Website commission statis (HTML/CSS/JS) dengan nuansa blush rose, cream, cocoa, sage, dan moon gold. Responsive + mobile dock.

## Struktur
- `index.html` — halaman utama
- `assets/css/style.css` — styling & responsive
- `assets/js/main.js` — data & interaksi (EDIT DI SINI)
- `assets/img/logo-character.png` — logo headcrop karakter (header, favicon)
- `assets/img/character.png` — ilustrasi karakter full body (hero)
- `assets/img/logo.svg` — logo paw cadangan (tidak dipakai)

## Konten saat ini
- Katsui Clip: **Rp60.000 / menit** — kartu gradient royal gold
- VOD Clip Lite: **Rp60.000 / menit** — kartu soft rose
- Shorts: Rp50.000 / Rp100.000 / Rp150.000
- Portfolio Shorts: playlist `https://youtube.com/playlist?list=PLNJ5KH9O1soM&si=lMcD65zGpCHeEC8i`
- Portfolio VOD & Kategori Shorts: dihapus
- Stats subscriber/views/video: diganti highlight layanan (Rapi & Clean, 2x Revisi, Asset & BGM)
- Footer: © KatsuiRiku Ch (tanpa credit Carrd)
- Logo header & favicon memakai `assets/img/logo-character.png`; avatar/ilustrasi hero memakai `assets/img/character.png`

## Cara edit
Buka `assets/js/main.js`:
- `BRAND` → nama, tagline, logo
- `SOCIALS` → link sosmed + ikon SVG
- `CONTACT` → link DM/email
- `PORTFOLIO_PLAYLIST` → link playlist portfolio

Link/tombol langsung ada di `index.html`.

## Deploy ke GitHub Pages
1. Buat repo baru (mis. `katsuiriku-commis`).
2. Upload semua file.
3. Settings → Pages → Source: branch `main`, root.
4. Akses `https://username.github.io/katsuiriku-commis/`.

## Responsive
- Sudah dicek dari **240px sampai 2560px** tanpa horizontal scroll.
- Breakpoint utama:
  - `≤ 980px` — hero jadi satu kolom
  - `≤ 900px` — navigasi berubah jadi hamburger (tablet)
  - `≤ 720px` — highlight & playlist menyesuaikan
  - `≤ 560px` — kartu satu kolom + mobile dock
  - `≤ 380px` — penyesuaian layar sangat kecil
  - `≤ 560px` / HP landscape (`≤ 950px` & tinggi `≤ 500px`) — header logo saja
- Mobile dock & footer sudah memakai safe-area inset (iPhone notch/home indicator).
- Header HP/iPhone memakai **logo saja** (teks brand disembunyikan); tablet & laptop tetap logo + teks.
- Logo HP diperbesar (56px) dan memakai frame blush + gold; di tablet/laptop tetap 42px agar layout tidak berubah.

## Catatan
- Tidak perlu build tool.
- `.nojekyll` sudah disertakan.
- Untuk mengganti logo header/favicon, timpa `assets/img/logo-character.png` dengan gambar persegi (disarankan 256×256 atau lebih, background transparan).
- Untuk mengganti ilustrasi hero, timpa `assets/img/character.png`.
