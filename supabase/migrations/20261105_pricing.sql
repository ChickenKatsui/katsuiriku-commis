-- ============================================================
-- Harga Indonesia & Global yang bisa diedit dari admin.
-- Jalankan sekali di Supabase SQL Editor untuk database yang
-- sudah memiliki tabel public.site_data.
-- ============================================================
alter table public.site_data
  add column if not exists local_pricing jsonb not null default '{}'::jsonb,
  add column if not exists global_pricing jsonb not null default '{}'::jsonb;
