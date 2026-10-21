# KatsuiRiku Ch — Commission (Static Site)

Website commission statis (HTML/CSS/JS) dengan nuansa blush rose, cream, cocoa, sage, dan moon gold. Responsive + mobile dock.

## Struktur
- `index.html` — halaman utama
- `assets/css/style.css` — styling & responsive
- `assets/js/main.js` — data & interaksi (EDIT DI SINI)
- `data/slots.json` — jumlah slot commish (dibaca website, diedit lewat panel admin)
- `assets/img/logo-character.png` — logo headcrop karakter (header, favicon)
- `assets/img/character.png` — ilustrasi karakter full body (hero)
- `assets/img/logo.svg` — logo paw cadangan (tidak dipakai)

## Konten saat ini
- Katsui Clip: **Rp60.000 / menit** — kartu gradient royal gold
- VOD Clip Lite: **Rp60.000 / menit** — kartu soft rose, format **16:9**
- Shorts: Rp50.000 / Rp100.000 / Rp150.000
- Info slot commish: angka slot tampil di hero, section khusus, dan badge kartu
- Portfolio Shorts: playlist `https://youtube.com/playlist?list=PLNJ5KH9O1soM&si=lMcD65zGpCHeEC8i`
- Portfolio VOD & Kategori Shorts: dihapus
- Stats subscriber/views/video: diganti highlight layanan (Rapi & Clean, 2x Revisi, Asset & BGM)
- Footer: © KatsuiRiku Ch (tanpa credit Carrd)
- Logo header & favicon memakai `assets/img/logo-character.png`; avatar/ilustrasi hero memakai `assets/img/character.png`

## Cara edit
Buka `assets/js/main.js`:
- `BRAND` → nama, tagline, logo
- `SOCIALS` → link sosmed + ikon SVG
- `CONTACT` → link Twitter/X, Instagram, Discord, Facebook
- `PORTFOLIO_PLAYLIST` → link playlist portfolio

Link/tombol langsung ada di `index.html`.

Setelah mengubah `assets/css/style.css` atau `assets/js/main.js`, ganti angka `?v=20261021` di `index.html` (link CSS dan script JS) agar browser/CDN tidak memakai cache lama. Untuk gambar, timpa file lalu tambahkan `?v=` baru di `BRAND.logoImage`, favicon, atau `src` gambar terkait.

## Edit slot commish (tanpa buka GitHub)
1. Buka `https://chickenkatsui.github.io/katsuiriku-commis/#admin` atau klik **Admin slot** di footer.
2. Isi **Total slot**, **Slot terisi**, dan catatan. Sisa slot dihitung otomatis.
3. Tempel **GitHub token** (fine-grained PAT) dengan akses **Contents: Read and write** khusus repo ini.
4. Klik **Simpan slot**. Data ditulis ke `data/slots.json`; website live biasanya update dalam ±1 menit.

Catatan:
- Token hanya disimpan di browser kamu (localStorage) kalau opsi **Ingat token** dicentang. Token tidak pernah dimasukkan ke website/repo.
- Jangan centang **Ingat token** di perangkat bersama. Untuk menghapus token, buka panel admin lalu uncheck dan simpan, atau hapus lewat DevTools.
- Karena ini situs statis, panel admin butuh token GitHub untuk menulis data. Tanpa token, panel hanya bisa dibuka, tidak bisa menyimpan.
- Angka default saat ini: total **5**, terisi **0**. Ubah lewat panel admin sesuai slot asli.

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
  - `≤ 820px` — slot board jadi satu kolom
  - `≤ 720px` — highlight & playlist menyesuaikan
  - `≤ 560px` — kartu satu kolom + mobile dock + modal admin satu kolom
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
