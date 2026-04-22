import { projects } from "../data/projects.js";
import { animate } from "https://cdn.jsdelivr.net/npm/motion@11.13.5/+esm";

function setActiveFilterButton(activeButton) {
  document.querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.toggle("active", b === activeButton);
    b.setAttribute("aria-pressed", b === activeButton ? "true" : "false");
  });
}

function applyFilter(category) {
  document.querySelectorAll(".portfolio-item").forEach((item) => {
    const show = category === "all" || item.classList.contains(category);
    item.style.display = show ? "block" : "none";
  });
}

function getCurrentLang() {
  return document.body.dataset.currentLang || document.documentElement.lang || "ka";
}

function getBasePath() {
  return document.body.dataset.basePath || "";
}

let lastFocusedBeforeModal = null;
let focusTrapHandler = null;
let closeModalAnimation = null;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function initImageZoomPan(modal) {
  const img = modal.querySelector("#modalImage");
  if (!img) return () => {};

  let scale = 1;
  let tx = 0;
  let ty = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartTx = 0;
  let dragStartTy = 0;

  const MIN_SCALE = 1;
  const MAX_SCALE = 4;
  const DOUBLE_TAP_MS = 280;
  let lastTapAt = 0;

  function applyTransform() {
    img.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
  }

  function resetTransform() {
    scale = 1;
    tx = 0;
    ty = 0;
    applyTransform();
    img.style.cursor = "zoom-in";
  }

  function setScale(nextScale, anchorClientX, anchorClientY) {
    const newScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    if (newScale === scale) return;

    // Anchor zoom around cursor point relative to image rect
    const rect = img.getBoundingClientRect();
    const ax = anchorClientX ?? rect.left + rect.width / 2;
    const ay = anchorClientY ?? rect.top + rect.height / 2;
    const dx = ax - (rect.left + rect.width / 2);
    const dy = ay - (rect.top + rect.height / 2);

    const ratio = newScale / scale;
    tx = tx - dx * (ratio - 1);
    ty = ty - dy * (ratio - 1);
    scale = newScale;
    applyTransform();
    img.style.cursor = scale > 1 ? "grab" : "zoom-in";
  }

  function onWheel(e) {
    if (!modal || modal.getAttribute("aria-hidden") !== "false") return;
    e.preventDefault();
    const delta = -e.deltaY;
    const zoomIntensity = 0.0018;
    const nextScale = scale * (1 + delta * zoomIntensity);
    setScale(nextScale, e.clientX, e.clientY);
  }

  function onPointerDown(e) {
    if (scale <= 1) return;
    isDragging = true;
    img.setPointerCapture?.(e.pointerId);
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartTx = tx;
    dragStartTy = ty;
    img.style.cursor = "grabbing";
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    tx = dragStartTx + dx;
    ty = dragStartTy + dy;
    applyTransform();
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    img.style.cursor = scale > 1 ? "grab" : "zoom-in";
  }

  function toggleZoom(e) {
    const now = Date.now();
    const isDoubleTap = now - lastTapAt < DOUBLE_TAP_MS;
    lastTapAt = now;
    if (!isDoubleTap) return;

    if (scale === 1) setScale(2.2, e.clientX, e.clientY);
    else resetTransform();
  }

  function onKeyDown(e) {
    if (modal.getAttribute("aria-hidden") !== "false") return;
    if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      setScale(scale * 1.15);
    } else if (e.key === "-") {
      e.preventDefault();
      setScale(scale / 1.15);
    } else if (e.key === "0") {
      e.preventDefault();
      resetTransform();
    }
  }

  // Prep styles for smooth transforms
  img.style.transformOrigin = "center center";
  img.style.willChange = "transform";
  img.style.transition = "transform 120ms ease-out";
  img.style.cursor = "zoom-in";

  img.addEventListener("wheel", onWheel, { passive: false });
  img.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  img.addEventListener("pointercancel", onPointerUp);
  img.addEventListener("click", toggleZoom);
  document.addEventListener("keydown", onKeyDown);

  // Reset when the image source changes
  img.addEventListener("load", resetTransform);
  resetTransform();

  return () => {
    img.removeEventListener("wheel", onWheel);
    img.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    img.removeEventListener("pointercancel", onPointerUp);
    img.removeEventListener("click", toggleZoom);
    document.removeEventListener("keydown", onKeyDown);
    img.removeEventListener("load", resetTransform);
    img.style.willChange = "";
    img.style.transition = "";
    img.style.transform = "";
    img.style.cursor = "";
  };
}

function openModal(key) {
  const data = projects[key];
  if (!data) return;

  const lang = getCurrentLang();

  const modal = document.getElementById("galleryModal");
  const img = document.getElementById("modalImage");
  const caption = document.getElementById("modalCaption");
  const subcaption = document.getElementById("modalSubcaption");
  const content = modal?.querySelector(".modal-content");

  lastFocusedBeforeModal = document.activeElement;

  const titleEl = document.querySelector(`[data-i18n="projects.${key}.title"]`);
  const detailsEl = document.querySelector(`[data-i18n="projects.${key}.details"]`);
  const title = titleEl?.textContent?.trim() || "";
  const details = detailsEl?.textContent?.trim() || "";

  img.src = `${getBasePath()}${data.images[0]}`;
  img.alt = title || "Project image";
  caption.textContent = title;
  subcaption.textContent = details;

  // Cancel any in-flight close animation
  if (typeof closeModalAnimation === "function") {
    closeModalAnimation();
    closeModalAnimation = null;
  }

  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  // Focus close button for keyboard users
  const closeBtn = modal.querySelector(".close-btn");
  closeBtn?.focus();

  // Animate in (Motion)
  modal.style.opacity = "0";
  if (content) content.style.transform = "translate3d(0, 10px, 0) scale(0.98)";
  animate(modal, { opacity: [0, 1] }, { duration: 0.22, easing: "ease-out" });
  if (content) {
    animate(
      content,
      { transform: ["translate3d(0, 10px, 0) scale(0.98)", "translate3d(0, 0, 0) scale(1)"] },
      { duration: 0.28, easing: "cubic-bezier(0.2, 0.9, 0.2, 1)" }
    );
  }

  // Zoom/Pan behavior
  if (modal._zoomCleanup) modal._zoomCleanup();
  modal._zoomCleanup = initImageZoomPan(modal);

  // Focus trap inside modal
  const focusableSelector =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const getFocusable = () =>
    Array.from(modal.querySelectorAll(focusableSelector)).filter(
      (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
    );

  focusTrapHandler = (e) => {
    if (e.key !== "Tab") return;
    const focusables = getFocusable();
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || active === modal) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  modal.addEventListener("keydown", focusTrapHandler);

  // Store key for language refresh if needed
  modal.dataset.currentProjectKey = key;
  modal.dataset.currentLang = lang;
}

function closeModal() {
  const modal = document.getElementById("galleryModal");
  if (!modal || modal.getAttribute("aria-hidden") === "true") return;

  const content = modal.querySelector(".modal-content");
  const finish = () => {
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    delete modal.dataset.currentProjectKey;

    if (modal._zoomCleanup) {
      modal._zoomCleanup();
      modal._zoomCleanup = null;
    }
  };

  // Animate out (Motion), then hide
  const a1 = animate(modal, { opacity: [1, 0] }, { duration: 0.18, easing: "ease-in" });
  const a2 = content
    ? animate(
        content,
        { transform: ["translate3d(0, 0, 0) scale(1)", "translate3d(0, 10px, 0) scale(0.98)"] },
        { duration: 0.18, easing: "ease-in" }
      )
    : null;

  closeModalAnimation = () => {
    a1?.cancel?.();
    a2?.cancel?.();
    finish();
  };

  Promise.allSettled([a1?.finished, a2?.finished].filter(Boolean)).then(() => {
    closeModalAnimation = null;
    finish();
  });

  if (focusTrapHandler) {
    modal.removeEventListener("keydown", focusTrapHandler);
    focusTrapHandler = null;
  }

  if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === "function") {
    lastFocusedBeforeModal.focus();
  }
}

function wirePortfolioItems() {
  document.querySelectorAll(".portfolio-item").forEach((item) => {
    const key = item.dataset.projectKey;
    if (!key) return;

    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");

    item.addEventListener("click", () => openModal(key));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(key);
      }
    });
  });
}

function wireFilterButtons() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    const category = btn.dataset.filter;
    if (!category) return;

    btn.setAttribute("type", "button");
    btn.setAttribute("aria-pressed", btn.classList.contains("active") ? "true" : "false");

    btn.addEventListener("click", (e) => {
      setActiveFilterButton(btn);
      applyFilter(category);
      e.preventDefault();
    });
  });
}

function wireModal() {
  const modal = document.getElementById("galleryModal");
  const closeBtn = modal?.querySelector(".close-btn");

  closeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
  });

  modal?.addEventListener("click", (e) => {
    // Click outside content closes
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

export function initPortfolio() {
  wireFilterButtons();
  wirePortfolioItems();
  wireModal();

  // Default filter to "all" without relying on inline handlers
  const defaultBtn = document.querySelector('.filter-btn[data-filter="all"]');
  if (defaultBtn) {
    setActiveFilterButton(defaultBtn);
    applyFilter("all");
  }
}

export function refreshOpenModalText() {
  const modal = document.getElementById("galleryModal");
  const key = modal?.dataset.currentProjectKey;
  if (!key) return;

  // Re-open with updated text (image stays same)
  openModal(key);
}

export function closeGalleryModal() {
  closeModal();
}

