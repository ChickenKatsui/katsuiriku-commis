-- ============================================================
-- Jadwal commission + About Me yang bisa diedit dari admin.
-- Jalankan sekali di Supabase SQL Editor untuk database yang
-- sudah memiliki tabel public.site_data.
-- ============================================================
alter table public.site_data
  add column if not exists schedule jsonb not null default '[]'::jsonb,
  add column if not exists about jsonb not null default '{}'::jsonb;
