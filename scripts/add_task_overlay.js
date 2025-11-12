/**Currently registered matchMedia change listener; null until initialized*/
let mediaQueryListener = null;

/** Monitors media query and redirects when overlay is active on wide screens. */
function monitorMediaQuery() {
  const mq = window.matchMedia('(min-width: 1150px)');
  mediaQueryListener = handleMediaChange;
  mq.addEventListener('change', handleMediaChange);
  if (mq.matches && isOverlayModeActive()) window.location.href = 'main.html';
};

/** Handles media query changes and redirects when needed. */
function handleMediaChange(e) {
  if (!e.matches) return;
  if (!isOverlayModeActive()) return;
  console.log("Screen width > 1150px and overlay is active. Redirecting.");
  window.location.href = 'main.html';
};

/** Stops monitoring the media query by removing the listener. */
function stopMediaQueryMonitoring() {
  const mq = window.matchMedia('(min-width: 1150px)');
  if (!mediaQueryListener) return;
  mq.removeEventListener('change', mediaQueryListener);
  mediaQueryListener = null;
};

/** Creates the close button in the overlay container if in overlay mode. */
function createOverlayCloseButton() {
  if (document.getElementById("closeOverlay")) return;
  const overlay = document.getElementById("taskoverlay");
  if (!overlay) return;
  const btn = document.createElement("button");
  btn.id = "closeOverlay";
  btn.className = "overlay-close";
  btn.setAttribute("aria-label", "Close overlay");
  const img = document.createElement("img");
  img.src = "./assets/icons/clear-icon.png";
  img.alt = "Close";
  img.className = "closebttn";
  btn.appendChild(img);
  overlay.appendChild(btn);
  btn.addEventListener("click", closeTaskOverlay);
};

/** Detects overlay mode by reading the iframe body id. */
function isOverlayModeActive() {
  const iframe = document.getElementById("overlayContent");
  if (!iframe) return false;
  const d = iframe.contentDocument || iframe.contentWindow.document;
  const b = d && d.body;
  return !!(b && b.id === "overlay-mode");
};

/** Opens the overlay, styles it, hides chrome, injects close, loads iframe css. */
function openTaskOverlay(){
  showOverlay();
  setOverlayStyles?.();
  enableBackdropClose?.();
  const iframe=document.getElementById('overlayContent');
  _ensureIframeFreshLoad(iframe,()=>{
    hideUnnecessaryElementsInIframe?.(); injectCloseButtonIntoIframe?.(iframe); loadIframeStyles?.();
    const d=iframe.contentDocument||iframe.contentWindow.document;
    if(d&&d.body){ d.body.id='overlay-mode'; d.body.classList.add('overlay-mode'); d.body.style.position||='relative'; }
  });
};

/** Injects a close button inside the iframe that calls parent close. */
function injectCloseButtonIntoIframe(iframe) {
  const d = iframe.contentDocument || iframe.contentWindow.document;
  if (!d || !d.body) return;
  if (d.getElementById("iframeCloseOverlay")) return;
  const btn = d.createElement("button");
  btn.id = "iframeCloseOverlay";
  btn.textContent = "✕";
  styleCloseButton(btn);
  d.body.appendChild(btn);
  d.body.style.position = "relative";
  btn.addEventListener("click", () => window.parent?.closeTaskOverlay?.());
};

/** Applies visual styles to the iframe close button. */
function styleCloseButton(btn) {
  btn.style.position = "absolute";
  btn.style.top = "10px";
  btn.style.right = "10px";
  btn.style.zIndex = "9999";
  btn.style.background = "transparent";
  btn.style.color = "#2A3647";
  btn.style.border = "none";
  btn.style.padding = "8px";
  btn.style.cursor = "pointer";
  btn.style.fontSize = "26px";
  btn.style.width = "48px";
  btn.style.height = "48px";
  btn.style.fontWeight = "bolder";
};

/** Closes the overlay and resets state, optionally reloading tasks. */
function closeTaskOverlay() {
  hideOverlay();
  removeOverlayActiveClass();
  refreshTasksIfAvailable();
};

/** Shows the overlay by toggling classes. */
function showOverlay() {
  const o = document.getElementById("taskoverlay");
  if (o) o.classList.add("nohidden");
  document.body.classList.add("overlay-active");
};

/** Hides the overlay by toggling classes. */
function hideOverlay() {
  const o = document.getElementById("taskoverlay");
  if (!o) return;
  o.classList.remove("nohidden");
  o.classList.add("gethidden");
};

/** Applies layout styles to overlay containers. */
function setOverlayStyles() {
  adjustContainerStyle("#taskoverlay #cont-left.content-left", "column");
  adjustContainerStyle("#taskoverlay .content-right", "column");
  adjustTaskOverlayContainer();
};

/** Sets base flex styles on a given container. */
function adjustContainerStyle(selector, dir) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.style.height = "auto";
  el.style.display = "flex";
  el.style.flexDirection = dir;
};

/** Applies layout tweaks to the main overlay container. */
function adjustTaskOverlayContainer() {
  const c = document.querySelector("#taskoverlay #taskover-cont");
  if (!c) return;
  c.style.display = "flex";
  c.style.paddingLeft = "0px";
  c.style.paddingRight = "0px";
  c.style.gap = "0px";
  c.style.flexDirection = "row";
};

/** Hides sidebar/header/footer inside the overlay iframe. */
function hideUnnecessaryElementsInIframe() {
  const iframe = document.getElementById("overlayContent");
  if (!iframe) return;
  const d = iframe.contentDocument || iframe.contentWindow.document;
  if (!d) return;
  d.querySelectorAll(".sidebar, .header, .responsive-footer")
    .forEach(el => el.style.display = "none");
};

/** Removes the overlay-active class from body. */
function removeOverlayActiveClass() {
  document.body.classList.remove("overlay-active");
};

/** Reloads tasks if the loader function exists. */
function refreshTasksIfAvailable() {
  if (typeof loadTasks === "function") loadTasks();
};

/** DOM ready: wire close button + iframe styles. */
document.addEventListener("DOMContentLoaded", () => {
  initializeCloseOverlayButton();
  loadIframeStyles();
});

/** Adds a click handler to the global close-overlay button. */
function initializeCloseOverlayButton() {
  const b = document.getElementById("closeOverlay");
  if (b) b.addEventListener("click", closeTaskOverlay);
};

/** Loads CSS for the iframe and applies it safely. */
function loadIframeStyles() {
  const iframe = document.getElementById("overlayContent");
  if (!iframe) { console.error("Iframe 'overlayContent' not found"); return; }
  fetchCss("./style/iframe_overlay_content.css")
    .then(css => applyStylesToIframe(iframe, css))
    .catch(err => console.error("Error loading CSS:", err));
};

/** Fetches a CSS text resource with error handling. */
function fetchCss(path) {
  return fetch(path).then(r => {
    if (!r.ok) throw new Error("Failed to load CSS: " + path);
    return r.text();
  });
};

/** Applies provided CSS to the iframe (works early + late). */
function applyStylesToIframe(iframe, css) {
  const inject = () => {
    const d = iframe.contentDocument || iframe.contentWindow.document;
    if (!d) return console.error("Iframe document not accessible");
    markIframeAsOverlay(d);
    injectIframeStyles(d, css);
  };
  const d = iframe.contentDocument;
  if (d && d.readyState === "complete") inject();
  else iframe.addEventListener("load", inject, { once: true });
};

/** Injects a <style> tag into the iframe document. */
function injectIframeStyles(d, css) {
  const s = d.createElement("style");
  s.type = "text/css";
  s.textContent = css;
  const h = d.head || d.getElementsByTagName("head")[0];
  if (h) h.appendChild(s);
  else console.error("Iframe head not found");
};

/** Marks iframe body as overlay for iframe-only CSS. */
function markIframeAsOverlay(d) {
  const b = d.body;
  if (!b) return;
  if (!b.classList.contains("overlay-mode")) b.classList.add("overlay-mode");
  if (b.id !== "overlay-mode") b.id = "overlay-mode";
  if (!b.style.position) b.style.position = "relative";
};

/** Forces a fresh iframe load, then runs cb(), and prevents FOUC (flash of unstyled content). */
function _ensureIframeFreshLoad(iframe, cb){
  if(!iframe) return;
  iframe.style.visibility = 'hidden';
  const onload = () => { try { cb?.(); } finally { iframe.style.visibility = 'visible'; } };
  const base = iframe.src ? iframe.src.split('#')[0].split('?')[0] : iframe.getAttribute('src') || '';
  const url  = base + (base.includes('?') ? '&' : '?') + '_=' + Date.now();
  iframe.addEventListener('load', onload, { once:true });
  iframe.src = url; 
};
