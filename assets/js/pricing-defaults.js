/* ============================================================
   KatsuiRiku Ch — default pricing & normalizers
   Dipakai oleh website publik dan admin panel.
   Nilai tersimpan di Supabase (local_pricing / global_pricing),
   lalu digabung dengan default di sini agar data lama tetap aman.
   ============================================================ */
(function(){
  "use strict";

  const LOCAL_DEFAULT = {
    clip: {
      title: "Katsui Clip",
      price: "Rp60.000",
      unit: "/ menit",
      includes: ["Thumbnail", "Judul", "2x Revisi", "File final"],
      note: "+Rp15.000 / revisi tambahan",
      cta: "Order Clip"
    },
    shorts: {
      title: "Shorts Reguler",
      price: "Rp50.000",
      unit: "/ video · 1 menit",
      includes: ["Durasi 1 menit", "2x Revisi", "File final", "Siap upload"],
      note: "+Rp15.000 / revisi tambahan",
      cta: "Order Shorts"
    },
    bundle: {
      title: "Paket 5 Shorts",
      price: "Rp240.000",
      unit: "/ 5 video",
      includes: ["5 video short", "Durasi 1 menit / video", "2x Revisi", "File final"],
      note: "Hemat Rp10.000 dari harga satuan",
      cta: "Order Paket"
    },
    vod: {
      title: "VOD Clip Lite",
      price: "Rp60.000",
      unit: "/ menit",
      includes: ["2x Revisi", "Format 16:9", "File final", "Siap upload"],
      note: "+Rp15.000 / revisi tambahan",
      cta: "Order VOD"
    },
    duration: {
      rows: [
        { duration: "0:00 – 1:05", price: "Rp50.000" },
        { duration: "1:05 – 2:05", price: "Rp100.000" },
        { duration: "2:06 – 2:59", price: "Rp150.000" }
      ],
      badge: "Termasuk 2x Revisi",
      extra: "+Rp15.000 / revisi tambahan",
      note: "Untuk durasi lebih panjang, harga menyesuaikan tabel. Paket 5 Shorts berlaku untuk 5 video durasi 1 menit. Bisa berikan referensi editing. Sediakan assets (BG, BGM, PNG) jika perlu. Mau harga lebih murah? Request Low Effort Editing jika slot tersedia."
    }
  };

  const GLOBAL_DEFAULT = {
    intro: {
      badge: "USD · Worldwide",
      title: "Clip & Shorts untuk Creator Luar",
      text: "Rate internasional yang ramah untuk creator luar, dengan output rapi, caption, dan revisi yang jelas. Cocok untuk VTuber, streamer, dan creator yang butuh clip konsisten.",
      points: ["Caption / subtitle", "2x revisi", "File final siap upload", "Turnaround 1–3 hari"],
      cta: "Tanya Global Rate"
    },
    shorts: {
      label: "Shorts / Reels / TikTok",
      price: "$15",
      unit: "/ video",
      meta: "Base rate · up to 1 minute · caption · 2x revision"
    },
    bundle: {
      label: "5-Short Bundle",
      price: "$65",
      unit: "/ 5 videos",
      meta: "Save $10 · up to 1 min each"
    },
    clip: {
      label: "Katsui Clip",
      price: "$25",
      unit: "/ minute",
      meta: "Base rate · 16:9 · thumbnail · title · 2x revision"
    },
    vod: {
      label: "VOD Clip Lite",
      price: "$25",
      unit: "/ minute",
      meta: "Base rate · 16:9 · final file · 2x revision"
    },
    note: {
      extra_revision: "+$5 setelah 2x revisi gratis.",
      payment: "PayPal / Wise, biaya transfer ditanggung client.",
      quote: "Durasi panjang, VOD scrubbing, atau edit kompleks bisa menyesuaikan quote."
    }
  };

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

  function parseDurationLine(line){
    const text = String(line == null ? "" : line).trim();
    if(!text) return null;
    const splitAt = text.indexOf("|");
    if(splitAt < 0) return null;
    const duration = cleanText(text.slice(0, splitAt), "", 40);
    const price = cleanText(text.slice(splitAt + 1), "", 40);
    return duration && price ? { duration, price } : null;
  }

  function normalizeDurationRows(value, fallback){
    if(value === undefined || value === null){
      return fallback.map(row => ({ ...row }));
    }

    let rows = value;
    if(typeof rows === "string"){
      rows = rows.split(/\r?\n/).map(parseDurationLine);
    }

    if(!Array.isArray(rows)) return fallback.map(row => ({ ...row }));

    return rows
      .map(row => {
        if(typeof row === "string") return parseDurationLine(row);
        if(!row || typeof row !== "object") return null;
        const duration = cleanText(row.duration, "", 40);
        const price = cleanText(row.price, "", 40);
        return duration && price ? { duration, price } : null;
      })
      .filter(Boolean)
      .slice(0, 12);
  }

  function normalizeLocalCard(value, fallback){
    const source = asObject(value);
    return {
      title: cleanText(source.title, fallback.title, 80),
      price: cleanText(source.price, fallback.price, 40),
      unit: cleanText(source.unit, fallback.unit, 60),
      includes: cleanList(source.includes, fallback.includes, 10, 80),
      note: cleanText(source.note, fallback.note, 240),
      cta: cleanText(source.cta, fallback.cta, 40)
    };
  }

  function normalizeGlobalCard(value, fallback){
    const source = asObject(value);
    return {
      label: cleanText(source.label, fallback.label, 80),
      price: cleanText(source.price, fallback.price, 40),
      unit: cleanText(source.unit, fallback.unit, 60),
      meta: cleanText(source.meta, fallback.meta, 180)
    };
  }

  function normalizeLocal(value){
    const source = asObject(value);
    const duration = asObject(source.duration);
    return {
      clip: normalizeLocalCard(source.clip, LOCAL_DEFAULT.clip),
      shorts: normalizeLocalCard(source.shorts, LOCAL_DEFAULT.shorts),
      bundle: normalizeLocalCard(source.bundle, LOCAL_DEFAULT.bundle),
      vod: normalizeLocalCard(source.vod, LOCAL_DEFAULT.vod),
      duration: {
        rows: normalizeDurationRows(duration.rows, LOCAL_DEFAULT.duration.rows),
        badge: cleanText(duration.badge, LOCAL_DEFAULT.duration.badge, 60),
        extra: cleanText(duration.extra, LOCAL_DEFAULT.duration.extra, 160),
        note: cleanText(duration.note, LOCAL_DEFAULT.duration.note, 600)
      }
    };
  }

  function normalizeGlobal(value){
    const source = asObject(value);
    const intro = asObject(source.intro);
    const note = asObject(source.note);
    return {
      intro: {
        badge: cleanText(intro.badge, GLOBAL_DEFAULT.intro.badge, 60),
        title: cleanText(intro.title, GLOBAL_DEFAULT.intro.title, 100),
        text: cleanText(intro.text, GLOBAL_DEFAULT.intro.text, 600),
        points: cleanList(intro.points, GLOBAL_DEFAULT.intro.points, 8, 80),
        cta: cleanText(intro.cta, GLOBAL_DEFAULT.intro.cta, 40)
      },
      shorts: normalizeGlobalCard(source.shorts, GLOBAL_DEFAULT.shorts),
      bundle: normalizeGlobalCard(source.bundle, GLOBAL_DEFAULT.bundle),
      clip: normalizeGlobalCard(source.clip, GLOBAL_DEFAULT.clip),
      vod: normalizeGlobalCard(source.vod, GLOBAL_DEFAULT.vod),
      note: {
        extra_revision: cleanText(note.extra_revision, GLOBAL_DEFAULT.note.extra_revision, 200),
        payment: cleanText(note.payment, GLOBAL_DEFAULT.note.payment, 200),
        quote: cleanText(note.quote, GLOBAL_DEFAULT.note.quote, 240)
      }
    };
  }

  function listFromText(value, maxItems = 10, maxLength = 80){
    return cleanList(value, [], maxItems, maxLength);
  }

  window.KATSUI_PRICING = {
    defaults: {
      local: LOCAL_DEFAULT,
      global: GLOBAL_DEFAULT
    },
    normalizeLocal,
    normalizeGlobal,
    parseList: listFromText,
    parseDurationRows: value => normalizeDurationRows(value, [])
  };
})();
