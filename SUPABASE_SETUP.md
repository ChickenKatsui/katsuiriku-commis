# Supabase Setup — Admin & Data Live

Website ini tetap static (GitHub Pages), tapi data slot + Top Commish disimpan di **Supabase**. Admin login lewat **Supabase Auth**, dan hanya user yang terdaftar di tabel `admin_users` yang boleh menulis. Pengunjung biasa hanya bisa membaca.

> **Penting:** jangan pernah menaruh `service_role` key di website. Yang dipakai di browser hanya **Project URL** + **anon public key**. Anon key aman dipublikasikan karena RLS yang membatasi akses tulis.

---

## 1. Buat project Supabase

1. Buka <https://supabase.com/dashboard> → **New project**.
2. Isi nama project, database password, dan region. Tunggu project siap.

## 2. Jalankan SQL setup

Buka **SQL Editor → New query**, copy-paste seluruh SQL di bawah, lalu **Run**.

```sql
-- ============================================================
-- Admin allow-list
-- ============================================================
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- Sengaja tidak ada policy publik. Tabel ini hanya dikelola
-- lewat dashboard/service role dan dibaca oleh fungsi is_admin().

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ============================================================
-- Satu baris data untuk seluruh website
-- ============================================================
create table if not exists public.site_data (
  id integer primary key default 1 check (id = 1),
  slot_total integer not null default 5 check (slot_total >= 0),
  slot_filled integer not null default 0 check (slot_filled >= 0),
  slot_note text not null default 'Slot commish dibuka. Chat untuk konfirmasi slot.',
  leaderboard_title text not null default 'Top Commish',
  leaderboard_period text not null default 'Bulan Ini',
  leaderboard jsonb not null default '[]'::jsonb
    check (jsonb_typeof(leaderboard) = 'array'),
  updated_at timestamptz not null default now(),
  constraint slot_filled_lte_total check (slot_filled <= slot_total)
);

insert into public.site_data (id)
values (1)
on conflict (id) do nothing;

alter table public.site_data enable row level security;

-- Publik boleh membaca (dibutuhkan website + realtime)
drop policy if exists "site_data public read" on public.site_data;
create policy "site_data public read"
on public.site_data
for select
using (true);

-- Hanya admin di admin_users yang boleh insert/update/delete
drop policy if exists "site_data admin write" on public.site_data;
create policy "site_data admin write"
on public.site_data
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.site_data to anon, authenticated;
grant insert, update, delete on public.site_data to authenticated;

-- ============================================================
-- Realtime
-- ============================================================
do $$
begin
  alter publication supabase_realtime add table public.site_data;
exception
  when duplicate_object then null;
end $$;

-- ============================================================
-- Jadikan user sebagai admin
-- Ganti email di bawah dengan email admin yang kamu buat di
-- Authentication -> Users. Jalankan setelah user dibuat.
-- ============================================================
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'email@kamu.com'
-- on conflict (user_id) do nothing;
```

Kalau muncul pesan tabel/fungsi sudah ada, itu aman — SQL dibuat idempotent sebisa mungkin.

## 3. Buat user admin

1. Buka **Authentication → Users → Add user**.
2. Isi email + password. Centang **Auto Confirm User** supaya bisa langsung login.
3. Copy **UUID** user tersebut.
4. Buka **SQL Editor**, jalankan:

```sql
insert into public.admin_users (user_id)
values ('UUID-USER-ADMIN-DI-SINI')
on conflict (user_id) do nothing;
```

Atau langsung by email:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'email@kamu.com'
on conflict (user_id) do nothing;
```

### Matikan pendaftaran publik (disarankan)

Di Supabase: **Authentication → Providers → Email** (atau **Authentication → Settings**), matikan **Allow new users to sign up**. Dengan begitu tidak ada orang yang bisa membuat akun sendiri. Walaupun ada yang membuat akun, tetap tidak bisa menulis karena tidak ada di `admin_users`.

## 4. Isi config website

Buka **Project Settings → API**. Copy:

- **Project URL**
- **anon public** key

Lalu edit `assets/js/supabase-config.js`:

```js
window.KATSUI_SUPABASE = {
  url: "https://xxxxxxxx.supabase.co",
  anonKey: "eyJhbGciOi..."
};
```

Commit + push. Jangan pakai **service_role** key.

## 5. Login admin

Buka:

`https://chickenkatsui.github.io/katsuiriku-commis/admin/`

Login pakai email + password admin. Kalau berhasil, dashboard Slot dan Top Commish muncul.

Halaman admin tidak dilink dari website publik dan diberi `noindex`. Tapi keamanan sebenarnya bukan dari URL rahasia — keamanan ada di **Supabase Auth + RLS**: user biasa yang membuka `/admin/` hanya melihat halaman login, dan walaupun memaksa melihat tampilan dashboard, semua tulis akan ditolak RLS.

## 6. Cara pakai

### Slot Commish

Isi **Total slot**, **Slot terisi**, dan catatan → **Simpan slot**. Website publik langsung update lewat Supabase Realtime (kalau realtime aktif; kalau tidak, fallback refresh ±1 menit).

### Top Commish (manual, top 5)

1. Buka tab **Top Commish**.
2. Isi **Judul** (mis. `Top Commish`) dan **Periode** (mis. `Oktober 2026`).
3. Isi maksimal 5 baris: Nama, jumlah commish, handle (opsional), avatar URL (opsional).
4. Urutan baris = urutan rank.
5. **Simpan leaderboard**.

Ganti periode + isi ulang setiap bulan. Baris yang namanya kosong tidak disimpan.

## 7. Realtime

SQL di atas menambahkan `site_data` ke publication `supabase_realtime`. Kalau realtime belum jalan:

1. Buka **Database → Replication**.
2. Pastikan tabel `public.site_data` aktif untuk Realtime.
3. Refresh website.

Website juga punya fallback polling tiap 60 detik + refresh saat tab kembali aktif.

## 8. Sebelum Supabase selesai

Selama `supabase-config.js` masih kosong, website publik memakai file cadangan:

- `data/slots.json` — slot
- `data/top-commish.json` — leaderboard (default kosong)

Jadi situs tetap tampil normal. Setelah config diisi dan SQL dijalankan, Supabase menjadi sumber utama.

## 9. Troubleshooting

| Masalah | Solusi |
| --- | --- |
| `/admin/` menampilkan "Supabase belum dikonfigurasi" | Isi URL + anon key di `assets/js/supabase-config.js`, lalu refresh. |
| Login gagal "Invalid login credentials" | Cek email/password di **Authentication → Users**; pastikan user sudah confirmed. |
| "Akun ini bukan admin" | Jalankan insert ke `admin_users` dengan UUID yang benar. |
| "Gagal memeriksa akses admin" / function not found | SQL setup belum dijalankan atau `grant execute` gagal. Jalankan ulang bagian `is_admin`. |
| Simpan gagal / RLS error | User belum ada di `admin_users`, atau policy RLS belum dibuat. Cek **Table Editor → site_data → RLS**. |
| Website tidak update realtime | Aktifkan `site_data` di **Database → Replication**. Fallback refresh ±1 menit tetap jalan. |
| `slot_filled_lte_total` error | Slot terisi lebih besar dari total. Kecilkan filled atau besarkan total. |

## 10. Keamanan

- Public: hanya `SELECT` ke `site_data`.
- Admin: `SELECT/INSERT/UPDATE/DELETE` hanya jika `is_admin()` true.
- `admin_users` tidak punya policy publik, jadi tidak bisa dibaca/ditulis dari browser.
- Anon key aman di browser; **service_role key tidak boleh**.
- Halaman `/admin/` hanya menampilkan login untuk pengunjung biasa.
