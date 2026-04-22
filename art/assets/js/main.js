import { applyTranslations } from "./i18n.js";
import { initPortfolio, refreshOpenModalText } from "./portfolio.js";
import { animate, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@11.13.5/+esm";

function initHamburger() {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");
  const navList = navMenu?.querySelector("ul");
  if (!hamburger || !navMenu || !navList) return;

  hamburger.setAttribute("aria-controls", "nav-menu-list");
  hamburger.setAttribute("aria-expanded", "false");
  navList.id = "nav-menu-list";

  function setOpen(isOpen) {
    navList.classList.toggle("active", isOpen);
    hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  hamburger.addEventListener("click", () => {
    setOpen(!navList.classList.contains("active"));
  });

  // Close on link click (mobile)
  navList.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) setOpen(false);
  });

  // Close on ESC when open
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

function initLanguage() {
  const lang = document.documentElement.getAttribute("lang") || "ka";
  applyTranslations(lang);

  // Optional: if language buttons are # links, allow switching without reload.
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const href = btn.getAttribute("href") || "";
      if (href === "#" || href === "") {
        e.preventDefault();
        applyTranslations(btn.dataset.lang);
        refreshOpenModalText();
      }
    });
  });
}

function initMotion() {
  // Respect reduced-motion users (also backed by CSS).
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

  // Hero content
  const heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    animate(
      heroContent.querySelectorAll("h1, p, .btn"),
      { opacity: [0, 1], transform: ["translate3d(0, 14px, 0)", "translate3d(0, 0, 0)"] },
      { duration: 0.6, delay: stagger(0.08), easing: "cubic-bezier(0.2, 0.9, 0.2, 1)" }
    );
  }

  // Section titles
  inView(
    ".section-title",
    (el) => {
      el.style.opacity = "0";
      el.style.transform = "translate3d(0, 16px, 0)";
      animate(
        el,
        { opacity: [0, 1], transform: ["translate3d(0, 16px, 0)", "translate3d(0, 0, 0)"] },
        { duration: 0.55, easing: "cubic-bezier(0.2, 0.9, 0.2, 1)" }
      );
    },
    { margin: "-10% 0px -10% 0px" }
  );

  // Card grids (stagger)
  const gridSelectors = [
    { container: "#why-us .why-grid", items: "#why-us .why-card" },
    { container: "#services .services-grid", items: "#services .service-card" },
    { container: "#portfolio .portfolio-grid", items: "#portfolio .portfolio-item" },
  ];

  gridSelectors.forEach(({ container, items }) => {
    inView(
      container,
      () => {
        const nodes = document.querySelectorAll(items);
        nodes.forEach((n) => {
          n.style.opacity = "0";
          n.style.transform = "translate3d(0, 18px, 0)";
        });
        animate(
          nodes,
          { opacity: [0, 1], transform: ["translate3d(0, 18px, 0)", "translate3d(0, 0, 0)"] },
          { duration: 0.55, delay: stagger(0.06, { from: "center" }), easing: "ease-out" }
        );
      },
      { margin: "-15% 0px -15% 0px" }
    );
  });

  // Contact block
  inView(
    "#contact .contact-container",
    (el) => {
      el.style.opacity = "0";
      el.style.transform = "translate3d(0, 18px, 0)";
      animate(
        el,
        { opacity: [0, 1], transform: ["translate3d(0, 18px, 0)", "translate3d(0, 0, 0)"] },
        { duration: 0.6, easing: "cubic-bezier(0.2, 0.9, 0.2, 1)" }
      );
    },
    { margin: "-20% 0px -10% 0px" }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  initHamburger();
  initLanguage();
  initPortfolio();
  initMotion();
});

