/* ============================================================
   Supabase public config
   ------------------------------------------------------------
   Isi dua nilai di bawah dari Supabase Dashboard:
   Project Settings -> API -> Project URL + anon public key.

   AMAN dipublikasikan: anon key memang untuk browser.
   JANGAN pernah menaruh service_role key di file ini.
   Akses tulis dilindungi RLS + tabel admin_users.
   ============================================================ */
window.KATSUI_SUPABASE = {
  url: "https://omkdvrfrzhwepqzdoiay.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ta2R2cmZyemh3ZXBxemRvaWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1ODI4OTYsImV4cCI6MjEwODE1ODg5Nn0.bEWbEbdXykSx4sUWyijQptNhsu82vMNwirgsujyGol0"
};
