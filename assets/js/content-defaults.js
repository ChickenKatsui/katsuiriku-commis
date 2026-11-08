/* ============================================================
   KatsuiRiku Ch - default About Me + commission schedule
   Dipakai oleh website publik dan admin panel.
   Nilai tersimpan di Supabase (about / schedule), lalu digabung
   dengan default di sini agar data lama tetap aman.
   ============================================================ */
(function(){
  "use strict";

  const ABOUT_DEFAULT = {
    kicker: "About Me",
    name: "KatsuiRiku Ch",
    role: "VTuber & Doggo Clipper",
    tagline: "Clip, Shorts, dan VOD editing yang rapi, clean, dan enak ditonton.",
    bio: "Halo! Aku KatsuiRiku Ch, VTuber dan editor yang suka bikin clip rapi, short yang enak ditonton, dan VOD clip untuk sosial media. Aku membuka commission untuk Katsui Clip, Shorts / Reels / TikTok, dan VOD Clip Lite. Setiap project dikerjakan dengan brief yang jelas, 2x revisi, dan file final siap upload.",
    location: "Indonesia",
    timezone: "WIB (UTC+7)",
    birthday: "-",
    languages: "Indonesia, English",
    software: ["CapCut", "Premiere Pro", "After Effects"],
    equipment: ["PC", "Headset", "Editing setup"],
    hobbies: ["Gaming", "Editing", "Music"],
    fun_facts: ["Doggo mode: ON", "Suka eksperimen gaya editing baru"],
    favorites: ["Clip yang rapi", "BGM yang pas", "Meme yang relate"],
    commission_note: "Slot commish dibuka berkala. Cek status slot dan jadwal antrean di website, lalu hubungi aku untuk konfirmasi brief.",
    photo_url: ""
  };

  const SCHEDULE_STATUSES = [
    { key: "waiting", label: "Waiting List", short: "Waiting" },
    { key: "in_work", label: "In Work", short: "In Work" },
    { key: "done", label: "Done", short: "Done" }
  ];

  const SCHEDULE_VISIBILITIES = [
    { key: "name", label: "Tampilkan nama" },
    { key: "initial", label: "Inisial saja" },
    { key: "anonymous", label: "Anonymous" }
  ];

  function asObject(value){
    if(typeof value === "string"){
      try{ value = JSON.parse(value); }catch(e){ return {}; }
    }
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function cleanText(value, fallback, maxLength){
    if(value === undefined || value === null) return fallback;
    return String(value).replace(/\s+/g, " ").trim().slice(0, maxLength);
  }

  function cleanList(value, fallback, maxItems, maxLength){
    if(value === undefined || value === null) return fallback.slice(0, maxItems);
    let list = value;
    if(typeof list === "string") list = list.split(/\r?\n/);
    if(!Array.isArray(list)) return fallback.slice(0, maxItems);
    return list
      .map(item => cleanText(item, "", maxLength))
      .filter(Boolean)
      .slice(0, maxItems);
  }

  function clampInt(value, min, max, fallback = 0){
    const parsed = Number.parseInt(value, 10);
    if(!Number.isFinite(parsed)) return fallback;
    return Math.max(min, Math.min(max, parsed));
  }

  function normalizeAbout(value){
    const source = asObject(value);
    return {
      kicker: cleanText(source.kicker, ABOUT_DEFAULT.kicker, 40),
      name: cleanText(source.name, ABOUT_DEFAULT.name, 80),
      role: cleanText(source.role, ABOUT_DEFAULT.role, 100),
      tagline: cleanText(source.tagline, ABOUT_DEFAULT.tagline, 160),
      bio: cleanText(source.bio, ABOUT_DEFAULT.bio, 1200),
      location: cleanText(source.location, ABOUT_DEFAULT.location, 80),
      timezone: cleanText(source.timezone, ABOUT_DEFAULT.timezone, 80),
      birthday: cleanText(source.birthday, ABOUT_DEFAULT.birthday, 80),
      languages: cleanText(source.languages, ABOUT_DEFAULT.languages, 120),
      software: cleanList(source.software, ABOUT_DEFAULT.software, 12, 80),
      equipment: cleanList(source.equipment, ABOUT_DEFAULT.equipment, 12, 80),
      hobbies: cleanList(source.hobbies, ABOUT_DEFAULT.hobbies, 12, 80),
      fun_facts: cleanList(source.fun_facts ?? source.funFacts, ABOUT_DEFAULT.fun_facts, 12, 100),
      favorites: cleanList(source.favorites, ABOUT_DEFAULT.favorites, 12, 80),
      commission_note: cleanText(source.commission_note ?? source.commissionNote, ABOUT_DEFAULT.commission_note, 400),
      photo_url: cleanText(source.photo_url ?? source.photoUrl, ABOUT_DEFAULT.photo_url, 500)
    };
  }

  function normalizeSchedule(value){
    let rows = value;
    if(typeof rows === "string"){
      try{ rows = JSON.parse(rows); }catch(e){ rows = []; }
    }
    if(!Array.isArray(rows)) return [];

    const statusKeys = SCHEDULE_STATUSES.map(item => item.key);
    const visibilityKeys = SCHEDULE_VISIBILITIES.map(item => item.key);

    return rows
      .map((row, index) => {
        if(!row || typeof row !== "object") return null;
        const title = cleanText(row.title ?? row.name, "", 80);
        if(!title) return null;

        const status = statusKeys.includes(String(row.status)) ? String(row.status) : "waiting";
        const visibility = visibilityKeys.includes(String(row.visibility)) ? String(row.visibility) : "name";

        return {
          title,
          client_name: cleanText(row.client_name ?? row.client, "", 60),
          service: cleanText(row.service, "", 40),
          status,
          visibility,
          note: cleanText(row.note, "", 140),
          position: clampInt(row.position, 1, 999, index + 1)
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.position - b.position)
      .slice(0, 100)
      .map((row, index) => ({ ...row, position: index + 1 }));
  }

  function listFromText(value, maxItems = 12, maxLength = 80){
    return cleanList(value, [], maxItems, maxLength);
  }

  window.KATSUI_CONTENT = {
    defaults: {
      about: ABOUT_DEFAULT,
      schedule: []
    },
    statuses: SCHEDULE_STATUSES,
    visibilities: SCHEDULE_VISIBILITIES,
    normalizeAbout,
    normalizeSchedule,
    parseList: listFromText
  };
})();
