/* ============================================================
   Admin panel — Supabase Auth + RLS
   Hanya user yang ada di tabel admin_users yang bisa menulis.
   ============================================================ */
(function(){
  "use strict";

  const $ = (id) => document.getElementById(id);
  const cfg = window.KATSUI_SUPABASE || {};
  const hasConfig = Boolean(
    String(cfg.url || "").trim() &&
    String(cfg.anonKey || "").trim() &&
    !/YOUR[-_]/i.test(String(cfg.url || "")) &&
    !/YOUR[-_]/i.test(String(cfg.anonKey || ""))
  );
  const hasLib = Boolean(window.supabase && typeof window.supabase.createClient === "function");

  let client = null;
  let currentUser = null;
  let siteData = null;
  let leaderboardRows = [];
  let routing = false;

  function setStatus(id, message, type){
    const el = $(id);
    if(!el) return;
    el.textContent = message;
    el.className = "admin-status" + (type ? " " + type : "");
  }

  function show(screen){
    ["setup-screen", "login-screen", "dashboard-screen"].forEach(id => {
      const el = $(id);
      if(el) el.hidden = id !== screen;
    });
    const logout = $("logout-btn");
    if(logout) logout.hidden = screen !== "dashboard-screen";
  }

  function escapeAttr(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[ch]);
  }

  function clampInt(value, min, max, fallback = 0){
    const parsed = Number.parseInt(value, 10);
    if(!Number.isFinite(parsed)) return fallback;
    return Math.max(min, Math.min(max, parsed));
  }

  function normalizeEntries(raw){
    let rows = raw;
    if(typeof rows === "string"){
      try{ rows = JSON.parse(rows); }catch(e){ rows = []; }
    }
    if(!Array.isArray(rows)) return [];

    return rows
      .map((row, index) => {
        if(!row || typeof row !== "object") return null;
        const name = String(row.name || "").trim().slice(0, 60);
        if(!name) return null;
        return {
          position: clampInt(row.position, 1, 99, index + 1),
          name,
          commission_count: clampInt(row.commission_count ?? row.count, 0, 9999, 0),
          handle: String(row.handle || "").trim().slice(0, 80),
          avatar_url: String(row.avatar_url || row.avatar || "").trim().slice(0, 500)
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.position - b.position)
      .slice(0, 5)
      .map((row, index) => ({ ...row, position: index + 1 }));
  }

  function updateSlotPreview(){
    const total = clampInt($("slot-total") && $("slot-total").value, 0, 999, 0);
    const filled = clampInt($("slot-filled") && $("slot-filled").value, 0, 999, 0);
    const remaining = Math.max(0, total - Math.min(filled, total));
    const el = $("slot-remaining");
    if(el) el.textContent = remaining;
  }

  function fillSlotForm(data){
    const total = $("slot-total");
    const filled = $("slot-filled");
    const note = $("slot-note");
    if(total) total.value = clampInt(data.slot_total, 0, 999, 5);
    if(filled) filled.value = clampInt(data.slot_filled, 0, 999, 0);
    if(note) note.value = String(data.slot_note || "").slice(0, 240);
    updateSlotPreview();
  }

  function fillLeaderboardForm(data){
    const title = $("leaderboard-title");
    const period = $("leaderboard-period");
    if(title) title.value = String(data.leaderboard_title || "Top Commish").slice(0, 80);
    if(period) period.value = String(data.leaderboard_period || "").slice(0, 60);

    const entries = normalizeEntries(data.leaderboard);
    leaderboardRows = Array.from({ length: 5 }, (_, i) => {
      const entry = entries[i];
      return {
        name: entry ? entry.name : "",
        commission_count: entry ? String(entry.commission_count) : "",
        handle: entry ? entry.handle : "",
        avatar_url: entry ? entry.avatar_url : ""
      };
    });
    renderLeaderboardRows();
  }

  function renderLeaderboardRows(){
    const wrap = $("leaderboard-rows");
    if(!wrap) return;

    wrap.innerHTML = leaderboardRows.map((row, index) => `
      <div class="admin-leader-row" data-index="${index}">
        <span class="admin-rank">${String(index + 1).padStart(2, "0")}</span>
        <label class="admin-field">Nama
          <input data-field="name" type="text" maxlength="60" value="${escapeAttr(row.name)}" placeholder="Nama client" />
        </label>
        <label class="admin-field">Commish
          <input data-field="commission_count" type="number" min="0" max="9999" step="1" value="${escapeAttr(row.commission_count)}" placeholder="0" />
        </label>
        <label class="admin-field">Handle
          <input data-field="handle" type="text" maxlength="80" value="${escapeAttr(row.handle)}" placeholder="@username" />
        </label>
        <label class="admin-field">Avatar URL
          <input data-field="avatar_url" type="url" maxlength="500" value="${escapeAttr(row.avatar_url)}" placeholder="https://..." />
        </label>
      </div>
    `).join("");

    wrap.querySelectorAll(".admin-leader-row").forEach((rowEl, index) => {
      rowEl.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", () => {
          if(!leaderboardRows[index]) return;
          leaderboardRows[index][input.dataset.field] = input.value;
        });
      });
    });
  }

  async function loadSiteData(){
    if(!client) return;
    const { data, error } = await client
      .from("site_data")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if(error){
      setStatus("slot-status", "Gagal memuat data: " + error.message, "err");
      setStatus("leaderboard-status", "Gagal memuat data: " + error.message, "err");
      return;
    }
    if(!data){
      const message = "Baris site_data (id=1) belum ada. Jalankan SQL setup terlebih dahulu.";
      setStatus("slot-status", message, "err");
      setStatus("leaderboard-status", message, "err");
      return;
    }

    siteData = data;
    fillSlotForm(data);
    fillLeaderboardForm(data);
  }

  async function handleSession(session){
    if(!session || routing) return;
    if(
      currentUser &&
      currentUser.id === session.user.id &&
      $("dashboard-screen") &&
      !$("dashboard-screen").hidden
    ) return;
    routing = true;

    try{
      currentUser = session.user;
      show("login-screen");
      setStatus("login-status", "Memeriksa akses admin...", "");

      const { data: isAdmin, error } = await client.rpc("is_admin");
      if(error){
        setStatus("login-status",
          "Gagal memeriksa akses admin. Pastikan SQL setup sudah dijalankan. " + (error.message || ""),
          "err");
        await client.auth.signOut();
        show("login-screen");
        return;
      }
      if(!isAdmin){
        setStatus("login-status", "Akun ini bukan admin. Tambahkan UUID-nya ke tabel admin_users.", "err");
        await client.auth.signOut();
        show("login-screen");
        return;
      }

      const email = $("admin-email");
      if(email) email.textContent = currentUser.email || "";
      show("dashboard-screen");
      await loadSiteData();
    }catch(err){
      setStatus("login-status", "Terjadi error saat login: " + (err.message || "coba lagi."), "err");
      show("login-screen");
    }finally{
      routing = false;
    }
  }

  function bindUI(){
    const loginForm = $("login-form");
    if(loginForm){
      loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if(!client) return;

        const email = String($("login-email").value || "").trim();
        const password = String($("login-password").value || "");
        if(!email || !password){
          setStatus("login-status", "Isi email dan password.", "err");
          return;
        }

        const btn = $("login-btn");
        if(btn){ btn.disabled = true; btn.textContent = "Memeriksa..."; }
        setStatus("login-status", "Menghubungi Supabase...", "");

        try{
          const { error } = await client.auth.signInWithPassword({ email, password });
          if(error) throw error;
          setStatus("login-status", "Berhasil. Memuat dashboard...", "ok");
        }catch(err){
          setStatus("login-status", "Gagal masuk: " + (err.message || "cek email/password."), "err");
        }finally{
          if(btn){ btn.disabled = false; btn.textContent = "Masuk"; }
        }
      });
    }

    const logoutBtn = $("logout-btn");
    if(logoutBtn){
      logoutBtn.addEventListener("click", async () => {
        if(!client) return;
        logoutBtn.disabled = true;
        logoutBtn.textContent = "Keluar...";
        try{ await client.auth.signOut(); }catch(e){}
        currentUser = null;
        siteData = null;
        logoutBtn.disabled = false;
        logoutBtn.textContent = "Keluar";
        const email = $("login-email");
        const password = $("login-password");
        if(email) email.value = "";
        if(password) password.value = "";
        setStatus("login-status", "Kamu sudah keluar.", "");
        show("login-screen");
      });
    }

    document.querySelectorAll(".admin-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".admin-tab").forEach(t => {
          const active = t === tab;
          t.classList.toggle("active", active);
          t.setAttribute("aria-selected", active ? "true" : "false");
        });
        document.querySelectorAll(".admin-panel").forEach(panel => {
          panel.hidden = panel.id !== "tab-" + tab.dataset.tab;
        });
      });
    });

    ["slot-total", "slot-filled"].forEach(id => {
      const input = $(id);
      if(input) input.addEventListener("input", updateSlotPreview);
    });

    const slotForm = $("slot-form");
    if(slotForm){
      slotForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if(!client || !currentUser) return;

        const total = Number.parseInt($("slot-total").value, 10);
        const filled = Number.parseInt($("slot-filled").value, 10);
        const note = String($("slot-note").value || "").trim().slice(0, 240);

        if(!Number.isFinite(total) || total < 0 || !Number.isFinite(filled) || filled < 0){
          setStatus("slot-status", "Total dan slot terisi harus angka 0 atau lebih.", "err");
          return;
        }
        if(total > 999 || filled > 999){
          setStatus("slot-status", "Maksimal 999 slot.", "err");
          return;
        }
        if(filled > total){
          setStatus("slot-status", "Slot terisi tidak boleh lebih besar dari total slot.", "err");
          return;
        }

        const btn = $("slot-save");
        if(btn){ btn.disabled = true; btn.textContent = "Menyimpan..."; }
        setStatus("slot-status", "Menyimpan ke Supabase...", "");

        try{
          const { error } = await client
            .from("site_data")
            .update({
              slot_total: total,
              slot_filled: filled,
              slot_note: note || "Slot diupdate berkala. Chat untuk konfirmasi slot.",
              updated_at: new Date().toISOString()
            })
            .eq("id", 1);

          if(error) throw error;

          siteData = { ...(siteData || {}), slot_total: total, slot_filled: filled, slot_note: note };
          setStatus("slot-status", "Tersimpan. Website update realtime.", "ok");
        }catch(err){
          setStatus("slot-status", "Gagal menyimpan: " + (err.message || "coba lagi."), "err");
        }finally{
          if(btn){ btn.disabled = false; btn.textContent = "Simpan slot"; }
        }
      });
    }

    const leaderboardForm = $("leaderboard-form");
    if(leaderboardForm){
      leaderboardForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if(!client || !currentUser) return;

        const title = String($("leaderboard-title").value || "").trim().slice(0, 80);
        const period = String($("leaderboard-period").value || "").trim().slice(0, 60);
        const entries = [];

        for(const row of leaderboardRows){
          const name = String(row.name || "").trim().slice(0, 60);
          if(!name) continue;

          const count = Number.parseInt(row.commission_count, 10);
          if(!Number.isFinite(count) || count < 0){
            setStatus("leaderboard-status", `Jumlah commish untuk "${name}" harus angka 0 atau lebih.`, "err");
            return;
          }

          const avatar = String(row.avatar_url || "").trim().slice(0, 500);
          if(avatar && !/^https?:\/\//i.test(avatar)){
            setStatus("leaderboard-status", `Avatar URL untuk "${name}" harus diawali http:// atau https://.`, "err");
            return;
          }

          entries.push({
            position: entries.length + 1,
            name,
            commission_count: Math.min(9999, count),
            handle: String(row.handle || "").trim().slice(0, 80),
            avatar_url: avatar
          });
        }

        if(entries.length > 5){
          setStatus("leaderboard-status", "Maksimal 5 client untuk Top Commish.", "err");
          return;
        }

        const btn = $("leaderboard-save");
        if(btn){ btn.disabled = true; btn.textContent = "Menyimpan..."; }
        setStatus("leaderboard-status", "Menyimpan ke Supabase...", "");

        try{
          const { error } = await client
            .from("site_data")
            .update({
              leaderboard_title: title || "Top Commish",
              leaderboard_period: period || "Bulan Ini",
              leaderboard: entries,
              updated_at: new Date().toISOString()
            })
            .eq("id", 1);

          if(error) throw error;

          siteData = {
            ...(siteData || {}),
            leaderboard_title: title || "Top Commish",
            leaderboard_period: period || "Bulan Ini",
            leaderboard: entries
          };
          setStatus("leaderboard-status", "Tersimpan. Leaderboard website langsung update.", "ok");
        }catch(err){
          setStatus("leaderboard-status", "Gagal menyimpan: " + (err.message || "coba lagi."), "err");
        }finally{
          if(btn){ btn.disabled = false; btn.textContent = "Simpan leaderboard"; }
        }
      });
    }
  }

  function init(){
    if(!hasConfig || !hasLib){
      show("setup-screen");
      if(!hasConfig){
        setStatus("setup-status", "Isi assets/js/supabase-config.js terlebih dahulu.", "");
      }else{
        setStatus("setup-status", "Library Supabase gagal dimuat. Cek koneksi/CDN lalu refresh.", "err");
      }
      return;
    }

    try{
      client = window.supabase.createClient(
        String(cfg.url).trim(),
        String(cfg.anonKey).trim(),
        {
          auth: {
            persistSession: true,
            storage: window.sessionStorage,
            autoRefreshToken: true,
            detectSessionInUrl: false
          }
        }
      );
    }catch(err){
      show("setup-screen");
      setStatus("setup-status", "Config Supabase tidak valid: " + (err.message || "cek URL/anon key."), "err");
      return;
    }

    bindUI();
    show("login-screen");

    client.auth.getSession().then(({ data, error }) => {
      if(error){
        setStatus("login-status", "Gagal membaca sesi: " + error.message, "err");
        show("login-screen");
        return;
      }
      if(data && data.session) handleSession(data.session);
      else show("login-screen");
    }).catch(err => {
      setStatus("login-status", "Gagal membaca sesi: " + (err.message || "coba refresh."), "err");
      show("login-screen");
    });

    client.auth.onAuthStateChange((event, session) => {
      if(event === "SIGNED_OUT"){
        currentUser = null;
        show("login-screen");
        return;
      }
      if(session) handleSession(session);
    });
  }

  init();
})();
