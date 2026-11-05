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
  let serviceReady = false;
  let pricingReady = false;

  const PRICING = window.KATSUI_PRICING || null;

  const SERVICE_FIELDS = [
    { key: "clip_open", input: "clip-open" },
    { key: "shorts_open", input: "shorts-open" },
    { key: "vod_open", input: "vod-open" }
  ];

  const LOCAL_CARD_FIELDS = [
    { key: "clip", prefix: "local-clip" },
    { key: "shorts", prefix: "local-shorts" },
    { key: "bundle", prefix: "local-bundle" },
    { key: "vod", prefix: "local-vod" }
  ];

  const GLOBAL_CARD_FIELDS = [
    { key: "shorts", prefix: "global-shorts" },
    { key: "bundle", prefix: "global-bundle" },
    { key: "clip", prefix: "global-clip" },
    { key: "vod", prefix: "global-vod" }
  ];

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

  function normalizeOpen(value){
    if(value === false || value === 0) return false;
    if(typeof value === "string" && /^(false|0|closed)$/i.test(value.trim())) return false;
    return true;
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

  function syncServiceSwitchLabels(){
    SERVICE_FIELDS.forEach(({ input }) => {
      const el = $(input);
      const label = document.querySelector(`[data-switch-label="${input}"]`);
      if(!el || !label) return;
      label.textContent = el.checked ? "Open" : "Closed";
      label.classList.toggle("is-open", el.checked);
      label.classList.toggle("is-closed", !el.checked);
    });
  }

  function fillServiceForm(data){
    SERVICE_FIELDS.forEach(({ key, input }) => {
      const el = $(input);
      if(el) el.checked = normalizeOpen(data[key]);
    });
    syncServiceSwitchLabels();
  }

  function setServiceEnabled(enabled){
    serviceReady = Boolean(enabled);
    const save = $("service-save");
    if(save) save.disabled = !serviceReady;
    SERVICE_FIELDS.forEach(({ input }) => {
      const el = $(input);
      if(el) el.disabled = !serviceReady;
    });
  }

  function setPricingEnabled(enabled){
    pricingReady = Boolean(enabled);
    document.querySelectorAll("#tab-pricing input, #tab-pricing textarea").forEach(el => {
      el.disabled = !pricingReady;
    });
    ["local-pricing-save", "global-pricing-save"].forEach(id => {
      const btn = $(id);
      if(btn) btn.disabled = !pricingReady;
    });
  }

  function setInputValue(id, value){
    const el = $(id);
    if(el) el.value = value == null ? "" : String(value);
  }

  function readInputValue(id, maxLength){
    const el = $(id);
    return String(el ? el.value : "").trim().slice(0, maxLength);
  }

  function fillLocalCardFields(prefix, data){
    setInputValue(prefix + "-title", data.title);
    setInputValue(prefix + "-price", data.price);
    setInputValue(prefix + "-unit", data.unit);
    setInputValue(prefix + "-cta", data.cta);
    setInputValue(prefix + "-includes", data.includes.join("\n"));
    setInputValue(prefix + "-note", data.note);
  }

  function fillGlobalCardFields(prefix, data){
    setInputValue(prefix + "-label", data.label);
    setInputValue(prefix + "-price", data.price);
    setInputValue(prefix + "-unit", data.unit);
    setInputValue(prefix + "-meta", data.meta);
  }

  function fillPricingForm(data){
    if(!PRICING) return;
    const local = PRICING.normalizeLocal(data.local_pricing);
    const global = PRICING.normalizeGlobal(data.global_pricing);

    LOCAL_CARD_FIELDS.forEach(({ key, prefix }) => {
      fillLocalCardFields(prefix, local[key]);
    });
    setInputValue("local-duration-rows",
      local.duration.rows.map(row => `${row.duration} | ${row.price}`).join("\n"));
    setInputValue("local-duration-badge", local.duration.badge);
    setInputValue("local-duration-extra", local.duration.extra);
    setInputValue("local-duration-note", local.duration.note);

    setInputValue("global-intro-badge", global.intro.badge);
    setInputValue("global-intro-title", global.intro.title);
    setInputValue("global-intro-text", global.intro.text);
    setInputValue("global-intro-points", global.intro.points.join("\n"));
    setInputValue("global-intro-cta", global.intro.cta);
    GLOBAL_CARD_FIELDS.forEach(({ key, prefix }) => {
      fillGlobalCardFields(prefix, global[key]);
    });
    setInputValue("global-note-extra", global.note.extra_revision);
    setInputValue("global-note-payment", global.note.payment);
    setInputValue("global-note-quote", global.note.quote);
  }

  function readGlobalCardFields(prefix){
    return {
      label: readInputValue(prefix + "-label", 80),
      price: readInputValue(prefix + "-price", 40),
      unit: readInputValue(prefix + "-unit", 60),
      meta: readInputValue(prefix + "-meta", 180)
    };
  }

  function readLocalPricing(){
    const data = {};
    LOCAL_CARD_FIELDS.forEach(({ key, prefix }) => {
      data[key] = {
        title: readInputValue(prefix + "-title", 80),
        price: readInputValue(prefix + "-price", 40),
        unit: readInputValue(prefix + "-unit", 60),
        includes: PRICING.parseList(readInputValue(prefix + "-includes", 800), 10, 80),
        note: readInputValue(prefix + "-note", 240),
        cta: readInputValue(prefix + "-cta", 40)
      };
    });
    data.duration = {
      rows: PRICING.parseDurationRows(readInputValue("local-duration-rows", 900)),
      badge: readInputValue("local-duration-badge", 60),
      extra: readInputValue("local-duration-extra", 160),
      note: readInputValue("local-duration-note", 600)
    };
    return data;
  }

  function readGlobalPricing(){
    const data = {
      intro: {
        badge: readInputValue("global-intro-badge", 60),
        title: readInputValue("global-intro-title", 100),
        text: readInputValue("global-intro-text", 600),
        points: PRICING.parseList(readInputValue("global-intro-points", 800), 8, 80),
        cta: readInputValue("global-intro-cta", 40)
      },
      note: {
        extra_revision: readInputValue("global-note-extra", 200),
        payment: readInputValue("global-note-payment", 200),
        quote: readInputValue("global-note-quote", 240)
      }
    };
    GLOBAL_CARD_FIELDS.forEach(({ key, prefix }) => {
      data[key] = readGlobalCardFields(prefix);
    });
    return data;
  }

  function missingRequired(fields){
    const found = fields.find(([, value]) => !String(value || "").trim());
    return found ? found[0] : "";
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
      setServiceEnabled(false);
      setPricingEnabled(false);
      setStatus("slot-status", "Gagal memuat data: " + error.message, "err");
      setStatus("service-status", "Gagal memuat data: " + error.message, "err");
      setStatus("local-pricing-status", "Gagal memuat data: " + error.message, "err");
      setStatus("global-pricing-status", "Gagal memuat data: " + error.message, "err");
      setStatus("leaderboard-status", "Gagal memuat data: " + error.message, "err");
      return;
    }
    if(!data){
      const message = "Baris site_data (id=1) belum ada. Jalankan SQL setup terlebih dahulu.";
      setServiceEnabled(false);
      setPricingEnabled(false);
      setStatus("slot-status", message, "err");
      setStatus("service-status", message, "err");
      setStatus("local-pricing-status", message, "err");
      setStatus("global-pricing-status", message, "err");
      setStatus("leaderboard-status", message, "err");
      return;
    }

    siteData = data;
    fillSlotForm(data);
    fillServiceForm(data);
    fillPricingForm(data);
    fillLeaderboardForm(data);

    const missingServiceColumns = SERVICE_FIELDS
      .map(field => field.key)
      .filter(key => !(key in data));
    const setupHint = $("service-setup-hint");
    const servicesAvailable = missingServiceColumns.length === 0;
    setServiceEnabled(servicesAvailable);
    if(setupHint) setupHint.hidden = servicesAvailable;

    if(!servicesAvailable){
      setStatus("service-status", "Fitur status layanan belum aktif. Jalankan SQL migrasi, lalu refresh.", "err");
    }else{
      setStatus("service-status", "", "");
    }

    const missingPricingColumns = ["local_pricing", "global_pricing"]
      .filter(key => !(key in data));
    const pricingHint = $("pricing-setup-hint");
    const pricingAvailable = missingPricingColumns.length === 0 && Boolean(PRICING);
    setPricingEnabled(pricingAvailable);
    if(pricingHint) pricingHint.hidden = pricingAvailable;

    if(!pricingAvailable){
      const message = PRICING
        ? "Fitur edit harga belum aktif. Jalankan SQL migrasi harga, lalu refresh."
        : "File harga gagal dimuat. Refresh halaman atau cek assets/js/pricing-defaults.js.";
      setStatus("local-pricing-status", message, "err");
      setStatus("global-pricing-status", message, "err");
    }else{
      setStatus("local-pricing-status", "", "");
      setStatus("global-pricing-status", "", "");
    }
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

  async function savePricingRegion(region){
    if(!client || !currentUser || !pricingReady || !PRICING) return;

    const isLocal = region === "local";
    const statusId = region + "-pricing-status";
    const btnId = region + "-pricing-save";
    const column = isLocal ? "local_pricing" : "global_pricing";
    let payload = null;
    let missing = "";

    if(isLocal){
      payload = readLocalPricing();
      missing = missingRequired([
        ["Judul Katsui Clip", payload.clip.title],
        ["Harga Katsui Clip", payload.clip.price],
        ["Tombol Katsui Clip", payload.clip.cta],
        ["Judul Shorts Reguler", payload.shorts.title],
        ["Harga Shorts Reguler", payload.shorts.price],
        ["Tombol Shorts Reguler", payload.shorts.cta],
        ["Judul Paket 5 Shorts", payload.bundle.title],
        ["Harga Paket 5 Shorts", payload.bundle.price],
        ["Tombol Paket 5 Shorts", payload.bundle.cta],
        ["Judul VOD Clip Lite", payload.vod.title],
        ["Harga VOD Clip Lite", payload.vod.price],
        ["Tombol VOD Clip Lite", payload.vod.cta]
      ]);
    }else{
      payload = readGlobalPricing();
      const required = [
        ["Judul intro Global", payload.intro.title],
        ["Teks intro Global", payload.intro.text],
        ["Tombol intro Global", payload.intro.cta]
      ];
      GLOBAL_CARD_FIELDS.forEach(({ key }) => {
        required.push([`Label ${key}`, payload[key].label]);
        required.push([`Harga ${key}`, payload[key].price]);
      });
      missing = missingRequired(required);
    }

    if(missing){
      setStatus(statusId, "Lengkapi field wajib: " + missing + ".", "err");
      return;
    }

    const btn = $(btnId);
    const originalLabel = btn ? btn.textContent : "";
    if(btn){ btn.disabled = true; btn.textContent = "Menyimpan..."; }
    setStatus(statusId, "Menyimpan ke Supabase...", "");

    try{
      const { error } = await client
        .from("site_data")
        .update({
          [column]: payload,
          updated_at: new Date().toISOString()
        })
        .eq("id", 1);

      if(error) throw error;

      siteData = { ...(siteData || {}), [column]: payload };
      setStatus(statusId, "Tersimpan. Harga website langsung update.", "ok");
    }catch(err){
      const message = String(err.message || "");
      if(/column|schema cache|does not exist/i.test(message)){
        setPricingEnabled(false);
        setStatus(statusId, "Gagal menyimpan: kolom harga belum ada. Jalankan SQL migrasi di SUPABASE_SETUP.md.", "err");
      }else{
        setStatus(statusId, "Gagal menyimpan: " + (message || "coba lagi."), "err");
      }
    }finally{
      if(btn){
        btn.disabled = !pricingReady;
        btn.textContent = originalLabel || (isLocal ? "Simpan harga Indonesia" : "Simpan harga Global");
      }
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

    document.querySelectorAll(".admin-price-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        const region = tab.dataset.priceRegion;
        document.querySelectorAll(".admin-price-tab").forEach(t => {
          const active = t === tab;
          t.classList.toggle("active", active);
          t.setAttribute("aria-selected", active ? "true" : "false");
        });
        const local = $("pricing-local");
        const global = $("pricing-global");
        if(local) local.hidden = region !== "local";
        if(global) global.hidden = region !== "global";
      });
    });

    const localPricingForm = $("local-pricing-form");
    if(localPricingForm){
      localPricingForm.addEventListener("submit", event => {
        event.preventDefault();
        savePricingRegion("local");
      });
    }

    const globalPricingForm = $("global-pricing-form");
    if(globalPricingForm){
      globalPricingForm.addEventListener("submit", event => {
        event.preventDefault();
        savePricingRegion("global");
      });
    }

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

    SERVICE_FIELDS.forEach(({ input }) => {
      const el = $(input);
      if(el) el.addEventListener("change", syncServiceSwitchLabels);
    });

    const serviceForm = $("service-form");
    if(serviceForm){
      serviceForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if(!client || !currentUser || !serviceReady) return;

        const values = {};
        SERVICE_FIELDS.forEach(({ key, input }) => {
          values[key] = Boolean($(input) && $(input).checked);
        });

        const btn = $("service-save");
        if(btn){ btn.disabled = true; btn.textContent = "Menyimpan..."; }
        setStatus("service-status", "Menyimpan ke Supabase...", "");

        try{
          const { error } = await client
            .from("site_data")
            .update({
              ...values,
              updated_at: new Date().toISOString()
            })
            .eq("id", 1);

          if(error) throw error;

          siteData = { ...(siteData || {}), ...values };
          setStatus("service-status", "Tersimpan. Status layanan website langsung update.", "ok");
        }catch(err){
          const message = String(err.message || "");
          if(/column|schema cache|does not exist/i.test(message)){
            setStatus("service-status", "Gagal menyimpan: kolom status layanan belum ada. Jalankan SQL migrasi di SUPABASE_SETUP.md.", "err");
          }else{
            setStatus("service-status", "Gagal menyimpan: " + (message || "coba lagi."), "err");
          }
        }finally{
          if(btn){ btn.disabled = !serviceReady; btn.textContent = "Simpan status"; }
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
    setServiceEnabled(false);
    setPricingEnabled(false);
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
