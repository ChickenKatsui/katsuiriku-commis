/* ============================================================
   KatsuiRiku Ch — Commission
   EDIT AREA: ganti link / teks di sini
   ============================================================ */
const BRAND = {
  name: "KatsuiRiku Ch",
  tagline: "Doggo Clipper",
  logoImage: "assets/img/logo-character.png",
};

const SOCIALS = [
  { label: "YouTube",   url: "https://www.youtube.com/channel/UCe2LsxoXTqj-yH8ePaHjYEA", icon: "youtube" },
  { label: "Twitter",   url: "https://twitter.com/KatsuiRikuCh", icon: "x" },
  { label: "Instagram", url: "https://instagram.com/KatsuiRikuCh", icon: "instagram" },
  { label: "Facebook",  url: "https://facebook.com/KatsuiRikuCh", icon: "facebook" },
  { label: "TikTok",    url: "https://www.tiktok.com/@KatsuiRikuCh", icon: "tiktok" },
  { label: "Trakteer",  url: "https://trakteer.id/KatsuiRiku", icon: "heart" },
];

const CONTACT = {
  twitter: "https://twitter.com/messages/compose?recipient_id=",
  instagram: "https://instagram.com/direct/t/",
  discord: "https://discord.gg/",
  email: "mailto:katsuiriku@email.com",
};

const PORTFOLIO_PLAYLIST = "https://youtube.com/playlist?list=PLNJ5KH9O1soM&si=lMcD65zGpCHeEC8i";

/* ============================================================
   Icon set (inline SVG — more elegant than text symbols)
   ============================================================ */
const ICONS = {
  youtube: '<path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/>',
  x: '<path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.2l7.3-8.3L2.8 2h6.5l4.4 5.8L18.9 2zm-1.1 18h1.7L7.9 3.9H6.1L17.8 20z"/>',
  instagram: '<path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1.1.4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.3-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1.1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.3.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.3 2.3-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.2.7-.3.3-.5.7-.7 1.2-.2.4-.3 1-.4 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.7 1.2.3.3.7.5 1.2.7.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.2-.7.3-.3.5-.7.7-1.2.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.7-1.2-.3-.3-.7-.5-1.2-.7-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 8.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zm6.2-8.3a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z"/>',
  facebook: '<path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.5V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/>',
  tiktok: '<path d="M16.6 2h-3.1v13.6a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.9a5.8 5.8 0 1 0 4.9 5.7V8.2a6.6 6.6 0 0 0 3.9 1.3V6.4a3.7 3.7 0 0 1-3.9-3.7V2z"/>',
  heart: '<path d="M12 21s-7.5-4.7-9.5-9A5.4 5.4 0 0 1 12 5.6 5.4 5.4 0 0 1 21.5 12c-2 4.3-9.5 9-9.5 9z"/>',
  discord: '<path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18.3 18.3 0 0 0-5.6 0L8.6 3a19.8 19.8 0 0 0-4.9 1.4C.6 9.1-.3 13.7.2 18.2a19.9 19.9 0 0 0 6 3l1.3-1.8a12.7 12.7 0 0 1-2-1c.2-.1.3-.3.5-.4a14.3 14.3 0 0 0 12 0c.2.1.3.3.5.4-.6.4-1.3.7-2 1l1.3 1.8a19.9 19.9 0 0 0 6-3c.6-5.2-.9-9.8-3.5-13.8zM8.3 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4zm7.4 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4z"/>',
  sparkle: '<path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2zm6.5 12l.8 2.7 2.7.8-2.7.8-.8 2.7-.8-2.7-2.7-.8 2.7-.8.8-2.7z"/>',
  refresh: '<path d="M17.65 6.35A8 8 0 1 0 19.73 14h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>',
  music: '<path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>',
  clock: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 5h-2v6l5 3 1-1.7-4-2.3V7z"/>',
  home: '<path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z"/>',
  film: '<path d="M4 4h16v16H4V4zm2 2v3h3V6H6zm5 0v3h3V6h-3zm5 0v3h3V6h-3zM6 11v3h3v-3H6zm5 0v3h3v-3h-3zm5 0v3h3v-3h-3zM6 16v3h3v-3H6zm5 0v3h3v-3h-3zm5 0v3h3v-3h-3z"/>',
  shorts: '<path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm5 4v8l6-4-6-4z"/>',
  play: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 5l6 5-6 5V7z"/>',
  mail: '<path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 8L4 7v10h16V7l-8 6z"/>',
};

function icon(name){
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

/* ============================================================
   Render
   ============================================================ */
function renderBrand(){
  const logo = document.querySelector(".logo");
  if(logo && BRAND.logoImage){
    logo.innerHTML = `<img src="${BRAND.logoImage}" alt="${BRAND.name} logo">`;
  }
  const name = document.getElementById("brand-name");
  if(name) name.textContent = BRAND.name;
  const name2 = document.getElementById("brand-name2");
  if(name2) name2.textContent = BRAND.name;
  const tag = document.getElementById("brand-tagline");
  if(tag) tag.textContent = BRAND.tagline;
  document.title = BRAND.name + " — Commission";
}

function renderSocials(){
  const el = document.getElementById("socials");
  if(!el) return;
  el.innerHTML = SOCIALS.map(s =>
    `<a href="${s.url}" target="_blank" rel="noopener" title="${s.label}" aria-label="${s.label}">${icon(s.icon)}</a>`
  ).join("");
}

function renderContactIcons(){
  document.querySelectorAll("[data-icon]").forEach(el => {
    el.innerHTML = icon(el.dataset.icon);
  });
}

function fillContact(){
  const set = (id, url) => { const el = document.getElementById(id); if(el) el.href = url; };
  set("contact-twitter", CONTACT.twitter);
  set("contact-instagram", CONTACT.instagram);
  set("contact-discord", CONTACT.discord);
  set("contact-email", CONTACT.email);
}

/* ============================================================
   Interactions
   ============================================================ */
function initNav(){
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  if(toggle && nav){
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }
}

function initActiveLinks(){
  const links = [...document.querySelectorAll('.nav a, .dock-item')];
  const sections = [...document.querySelectorAll("section[id]")];
  if(!sections.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(!e.isIntersecting) return;
      links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
  sections.forEach(s => obs.observe(s));
}

function initReveal(){
  const items = document.querySelectorAll(".reveal");
  if(!items.length) return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    items.forEach(i => i.classList.add("visible"));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(i => obs.observe(i));

  // safety net: never leave content hidden if the observer is paused
  setTimeout(() => {
    items.forEach(i => i.classList.add("visible"));
  }, 1500);
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  renderBrand();
  renderSocials();
  renderContactIcons();
  fillContact();
  initNav();
  initActiveLinks();
  initReveal();
  document.getElementById("year").textContent = new Date().getFullYear();
});
