-- Status open/closed per layanan
-- Jalankan sekali di Supabase SQL Editor untuk database yang sudah ada.
alter table public.site_data
  add column if not exists clip_open boolean not null default true,
  add column if not exists shorts_open boolean not null default true,
  add column if not exists vod_open boolean not null default true;
