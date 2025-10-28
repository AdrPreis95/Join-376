// /**Monitors media query changes and redirects to the main page if the overlay is active and the screen width exceeds 1150px. */
// function monitorMediaQuery() {
//   const mediaQuery = window.matchMedia('(min-width: 1150px)');

//   /**Handles media query changes.Redirects to 'main.html' if overlay mode is active and media query matches.*/
//   function handleMediaChange(e) {
//       if (e.matches && isOverlayModeActive()) {
//           console.log("Screen width > 1150px and overlay is active. Redirecting to the main page.");
//           window.location.href = 'main.html'; 
//       }
//   }

//   mediaQueryListener = handleMediaChange; 
//   mediaQuery.addEventListener('change', handleMediaChange);

  
//   if (mediaQuery.matches && isOverlayModeActive()) {
//       window.location.href = 'main.html'; 
//   }
// }

// /**Stops monitoring media query changes by removing the event listener.*/
// function stopMediaQueryMonitoring() {
//   const mediaQuery = window.matchMedia('(min-width: 1150px)');
//   if (mediaQueryListener) {
//       mediaQuery.removeEventListener('change', mediaQueryListener);
//       mediaQueryListener = null; 
//   }
// }

// /**Creates the Close Overlay Iframe Add Task Button if overlay mode is active*/
// function createOverlayCloseButton() {
//   if (document.getElementById("closeOverlay")) return;
//   const overlay = document.getElementById("taskoverlay");
//   if (!overlay) return;

//   const btn = document.createElement("button");
//   btn.id = "closeOverlay";
//   btn.className = "overlay-close";
//   btn.setAttribute("aria-label", "Close overlay");

//   const img = document.createElement("img");
//   img.src = "./assets/icons/clear-icon.png";
//   img.alt = "Close";
//   img.className = "closebttn";

//   btn.appendChild(img);
//   overlay.appendChild(btn);
//   btn.addEventListener("click", closeTaskOverlay);
// }


// /**Checks if the overlay mode is active by inspecting the ID of the `<body>` element inside the iframe.*/
// function isOverlayModeActive() {
//   const iframe = document.getElementById("overlayContent");
//   if (iframe) {
//       const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
//       const body = iframeDocument.body;
//       return body && body.id === "overlay-mode";
//   }
//   return false;
// }

// /**Opens the task overlay by showing the overlay and applying necessary styles.*/
// function openTaskOverlay() {
//   showOverlay();
//   setOverlayStyles();
//   hideUnnecessaryElementsInIframe();

//   const iframe = document.getElementById("overlayContent");
//   if (!iframe) return;

//    injectCloseButtonIntoIframe(iframe);
//  iframe.addEventListener("load", () => injectCloseButtonIntoIframe(iframe));
// }

// /**Injects a close button into the given iframe.
//  * The button will close the overlay in the parent window.*/
// function injectCloseButtonIntoIframe(iframe) {
//   const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
//   if (!iframeDoc || !iframeDoc.body) return;
//   if (iframeDoc.getElementById("iframeCloseOverlay")) return;
//   const btn = iframeDoc.createElement("button");
//   btn.id = "iframeCloseOverlay";
//   btn.textContent = "✕";

//   styleCloseButton(btn);

//   iframeDoc.body.style.position = "relative";
//   iframeDoc.body.appendChild(btn);
//   btn.addEventListener("click", () => {
//     if (window.parent && typeof window.parent.closeTaskOverlay === "function") {
//       window.parent.closeTaskOverlay();}});
// }

// /*Applies styles to the close button element.*/
// function styleCloseButton(btn) {
//   btn.style.position = "absolute";
//   btn.style.top = "10px";
//   btn.style.right = "10px";
//   btn.style.zIndex = "9999";
//   btn.style.background = "transparent";
//   btn.style.color = "#2A3647";
//   btn.style.border = "none";
//   btn.style.padding = "8px";
//   btn.style.cursor = "pointer";
//   btn.style.fontSize = "26px !important";
//   btn.style.width = "48px";
//   btn.style.height = "48px";
//   btn.style.fontWeight = "bolder";
// }

// /**Closes the task overlay by hiding the overlay and resetting styles.*/
// function closeTaskOverlay() {
//   hideOverlay();
//   removeOverlayActiveClass();
//   refreshTasksIfAvailable();
  
// }

// /**Shows the task overlay by adding necessary classes to display it.*/
// function showOverlay() {
//   const overlay = document.getElementById("taskoverlay");
//   if (overlay) {
//       overlay.classList.add("nohidden");
//   }
//   document.body.classList.add("overlay-active");
// }

// /**Hides the task overlay by toggling visibility-related classes.*/
// function hideOverlay() {
//   const overlay = document.getElementById("taskoverlay");
//   if (overlay) {
//       overlay.classList.remove("nohidden");
//       overlay.classList.add("gethidden");
//   }
// }

// /**Applies necessary styles to the overlay containers.*/
// function setOverlayStyles() {
//   adjustContainerStyle("#taskoverlay #cont-left.content-left", "column");
//   adjustContainerStyle("#taskoverlay .content-right", "column");
//   adjustTaskOverlayContainer();
// }

// /**Adjusts the style of a container to the specified flex direction.*/
// function adjustContainerStyle(selector, flexDirection) {
//   const element = document.querySelector(selector);
//   if (element) {
//       element.style.height = "auto";
//       element.style.display = "flex";
//       element.style.flexDirection = flexDirection;
//   }
// }

// /**Adjusts styles for the main task overlay container.*/
// function adjustTaskOverlayContainer() {
//   const taskoverCont = document.querySelector("#taskoverlay #taskover-cont");
//   if (taskoverCont) {
//       taskoverCont.style.display = "flex";
//       taskoverCont.style.paddingLeft = "0px";
//       taskoverCont.style.paddingRight = "0px";
//       taskoverCont.style.gap = "0px";
//       taskoverCont.style.flexDirection = "row";
//   }
// }

// /**Hides unnecessary elements inside all iframes of the overlay.*/
// function hideUnnecessaryElementsInIframe() {
//   const iframes = document.querySelectorAll("#overlayContent");
//   iframes.forEach(function (iframe) {
//       const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
//       if (iframeDoc) {
//           const elementsToHide = iframeDoc.querySelectorAll(".sidebar, .header, .responsive-footer");
//           elementsToHide.forEach(function (element) {
//               element.style.display = "none";});}});
// }

// /**Removes the overlay-active class from the body element.*/
// function removeOverlayActiveClass() {
//   document.body.classList.remove("overlay-active");
// }

// /**Refreshes tasks if a task loading function is available.*/
// function refreshTasksIfAvailable() {
//   if (typeof loadTasks === "function") {
//       loadTasks();
//   }
// }

// /**Eventlistener for the Overlay Button and the Iframe Styles*/
// document.addEventListener("DOMContentLoaded", function () {
//   initializeCloseOverlayButton();
//   loadIframeStyles();
// });

// /**Initializes the close button for the overlay.*/
// function initializeCloseOverlayButton() {
//   const closeOverlayButton = document.getElementById("closeOverlay");
//   if (closeOverlayButton) {
//       closeOverlayButton.addEventListener("click", closeTaskOverlay);
//   }
// }

// /**Loads and applies styles for the iframe content.*/
// function loadIframeStyles() {
//   const iframe = document.getElementById("overlayContent");
//   if (iframe) {
//       fetch("./style/iframe_overlay_content.css")
//           .then((response) => {
//               if (!response.ok) {
//                   throw new Error("Failed to load CSS");
//               }
//               return response.text();
//           })
//           .then((cssContent) => applyStylesToIframe(iframe, cssContent))
//           .catch((error) => console.error("Error loading CSS:", error));
//   } else {
//       console.error("Iframe with ID 'overlayContent' not found");
//   }
// }

// /**Applies the given CSS content to the iframe.*/
// function applyStylesToIframe(iframe, cssContent) {
//   iframe.onload = function () {
//       const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
//       if (iframeDocument) {
//           const styleElement = iframeDocument.createElement("style");
//           styleElement.type = "text/css";
//           styleElement.textContent = cssContent;
//           const head = iframeDocument.head || iframeDocument.getElementsByTagName("head")[0];
//           if (head) {
//               head.appendChild(styleElement);
//           } else {
//               console.error("Iframe head not found");
//           }
//       } else {
//           console.error("Iframe document not accessible");}};
// }

/** Monitors media query and redirects when overlay is active on wide screens. */
function monitorMediaQuery() {
  const mq = window.matchMedia('(min-width: 1150px)');
  mediaQueryListener = handleMediaChange;
  mq.addEventListener('change', handleMediaChange);
  if (mq.matches && isOverlayModeActive()) window.location.href = 'main.html';
}

/** Handles media query changes and redirects when needed. */
function handleMediaChange(e) {
  if (e.matches && isOverlayModeActive()) {
    console.log("Screen width > 1150px and overlay is active. Redirecting to the main page.");
    window.location.href = 'main.html';
  }
}

/** Stops monitoring the media query by removing the listener. */
function stopMediaQueryMonitoring() {
  const mq = window.matchMedia('(min-width: 1150px)');
  if (mediaQueryListener) { mq.removeEventListener('change', mediaQueryListener); mediaQueryListener = null; }
}

/** Creates the close button in the overlay container if in overlay mode. */
function createOverlayCloseButton() {
  if (document.getElementById("closeOverlay")) return;
  const overlay = document.getElementById("taskoverlay"); if (!overlay) return;
  const btn = document.createElement("button"); btn.id = "closeOverlay"; btn.className = "overlay-close"; btn.setAttribute("aria-label", "Close overlay");
  const img = document.createElement("img"); img.src = "./assets/icons/clear-icon.png"; img.alt = "Close"; img.className = "closebttn";
  btn.appendChild(img); overlay.appendChild(btn); btn.addEventListener("click", closeTaskOverlay);
}

/** Detects overlay mode by reading the iframe body id. */
function isOverlayModeActive() {
  const iframe = document.getElementById("overlayContent");
  if (iframe) { const d = iframe.contentDocument || iframe.contentWindow.document; const b = d && d.body; return b && b.id === "overlay-mode"; }
  return false;
}

/** Opens the overlay, sets styles, hides chrome, and injects close in iframe. */
function openTaskOverlay() {
  showOverlay(); setOverlayStyles(); hideUnnecessaryElementsInIframe();
  const iframe = document.getElementById("overlayContent"); if (!iframe) return;
  injectCloseButtonIntoIframe(iframe); iframe.addEventListener("load", () => injectCloseButtonIntoIframe(iframe));
}

/** Injects a close button inside the iframe that calls parent close. */
function injectCloseButtonIntoIframe(iframe) {
  const d = iframe.contentDocument || iframe.contentWindow.document; if (!d || !d.body) return;
  if (d.getElementById("iframeCloseOverlay")) return;
  const btn = d.createElement("button"); btn.id = "iframeCloseOverlay"; btn.textContent = "✕"; styleCloseButton(btn);
  d.body.style.position = "relative"; d.body.appendChild(btn);
  btn.addEventListener("click", () => { if (window.parent && typeof window.parent.closeTaskOverlay === "function") window.parent.closeTaskOverlay(); });
}

/** Applies visual styles to the iframe close button. */
function styleCloseButton(btn) {
  btn.style.position = "absolute"; btn.style.top = "10px"; btn.style.right = "10px"; btn.style.zIndex = "9999";
  btn.style.background = "transparent"; btn.style.color = "#2A3647"; btn.style.border = "none"; btn.style.padding = "8px";
  btn.style.cursor = "pointer"; btn.style.fontSize = "26px !important"; btn.style.width = "48px"; btn.style.height = "48px"; btn.style.fontWeight = "bolder";
}

/** Closes the overlay and resets state, optionally reloading tasks. */
function closeTaskOverlay() { hideOverlay(); removeOverlayActiveClass(); refreshTasksIfAvailable(); }

/** Shows the overlay by toggling classes. */
function showOverlay() {
  const o = document.getElementById("taskoverlay"); if (o) o.classList.add("nohidden");
  document.body.classList.add("overlay-active");
}

/** Hides the overlay by toggling classes. */
function hideOverlay() {
  const o = document.getElementById("taskoverlay");
  if (o) { o.classList.remove("nohidden"); o.classList.add("gethidden"); }
}

/** Applies layout styles to overlay containers. */
function setOverlayStyles() {
  adjustContainerStyle("#taskoverlay #cont-left.content-left", "column");
  adjustContainerStyle("#taskoverlay .content-right", "column");
  adjustTaskOverlayContainer();
}

/** Sets base flex styles on a given container. */
function adjustContainerStyle(selector, dir) {
  const el = document.querySelector(selector); if (!el) return;
  el.style.height = "auto"; el.style.display = "flex"; el.style.flexDirection = dir;
}

/** Applies layout tweaks to the main overlay container. */
function adjustTaskOverlayContainer() {
  const c = document.querySelector("#taskoverlay #taskover-cont"); if (!c) return;
  c.style.display = "flex"; c.style.paddingLeft = "0px"; c.style.paddingRight = "0px"; c.style.gap = "0px"; c.style.flexDirection = "row";
}

/** Hides sidebar/header/footer inside the overlay iframe(s). */
function hideUnnecessaryElementsInIframe() {
  const iframes = document.querySelectorAll("#overlayContent");
  iframes.forEach(iframe => { const d = iframe.contentDocument || iframe.contentWindow.document;
    if (d) d.querySelectorAll(".sidebar, .header, .responsive-footer").forEach(el => { el.style.display = "none"; });
  });
}

/** Removes the overlay-active class from body. */
function removeOverlayActiveClass() { document.body.classList.remove("overlay-active"); }

/** Reloads tasks if the loader function exists. */
function refreshTasksIfAvailable() { if (typeof loadTasks === "function") loadTasks(); }

/** Wires overlay close button and iframe CSS on DOM ready. */
document.addEventListener("DOMContentLoaded", function () { initializeCloseOverlayButton(); loadIframeStyles(); });

/** Adds a click handler to the global close-overlay button. */
function initializeCloseOverlayButton() {
  const b = document.getElementById("closeOverlay"); if (b) b.addEventListener("click", closeTaskOverlay);
}

/** Loads CSS for the iframe and applies it. */
function loadIframeStyles() {
  const iframe = document.getElementById("overlayContent");
  if (!iframe) { console.error("Iframe with ID 'overlayContent' not found"); return; }
  fetchCss("./style/iframe_overlay_content.css")
    .then(css => applyStylesToIframe(iframe, css))
    .catch(err => console.error("Error loading CSS:", err));
}

/** Fetches a CSS text resource with error handling. */
function fetchCss(path) {
  return fetch(path).then(r => { if (!r.ok) throw new Error("Failed to load CSS"); return r.text(); });
}

/** Applies provided CSS to the iframe after it loads. */
function applyStylesToIframe(iframe, cssContent) {
  iframe.onload = function () {
    const d = iframe.contentDocument || iframe.contentWindow.document; if (!d) return console.error("Iframe document not accessible");
    const style = d.createElement("style"); style.type = "text/css"; style.textContent = cssContent;
    const head = d.head || d.getElementsByTagName("head")[0]; if (head) head.appendChild(style); else console.error("Iframe head not found");
  };
}
