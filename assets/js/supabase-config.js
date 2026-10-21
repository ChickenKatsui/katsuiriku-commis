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
  url: "",
  anonKey: ""
};
