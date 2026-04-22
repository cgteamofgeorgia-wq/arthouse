import { translations } from "../data/translations.js";

function getLangFromDocument() {
  const langAttr = document.documentElement.getAttribute("lang");
  if (langAttr && translations[langAttr]) return langAttr;
  return "ka";
}

export function applyTranslations(lang = getLangFromDocument()) {
  const dict = translations[lang] || translations.ka;

  document.documentElement.setAttribute("lang", lang);
  document.body.dataset.currentLang = lang;

  // Text nodes
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!key) return;
    if (dict[key] != null) el.textContent = dict[key];
  });

  // Placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (!key) return;
    if (dict[key] != null) el.setAttribute("placeholder", dict[key]);
  });

  // Title
  const titleEl = document.querySelector("[data-i18n-title]");
  if (titleEl) {
    const key = titleEl.dataset.i18nTitle;
    if (key && dict[key] != null) document.title = dict[key];
  }

  // Meta content
  document.querySelectorAll('meta[data-i18n-content]').forEach((el) => {
    const key = el.dataset.i18nContent;
    if (!key) return;
    if (dict[key] != null) el.setAttribute("content", dict[key]);
  });

  // OpenGraph title (optional)
  const ogTitle = document.querySelector('meta[property="og:title"][data-i18n-content]');
  if (ogTitle && dict["og.title"] != null) ogTitle.setAttribute("content", dict["og.title"]);

  // Mark active language button (works both for link-based and JS-based switchers)
  document.querySelectorAll(".lang-btn").forEach((b) => {
    b.classList.toggle("active-lang", b.dataset.lang === lang);
    if (b.matches("a")) b.setAttribute("aria-current", b.dataset.lang === lang ? "page" : "false");
  });
}

export function getTranslations() {
  return translations;
}

