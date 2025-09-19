/**Monitors media query changes and redirects to the main page if the overlay is active and the screen width exceeds 1150px. */
function monitorMediaQuery() {
  const mediaQuery = window.matchMedia('(min-width: 1150px)');

  /**Handles media query changes.Redirects to 'main.html' if overlay mode is active and media query matches.*/
  function handleMediaChange(e) {
      if (e.matches && isOverlayModeActive()) {
          console.log("Screen width > 1150px and overlay is active. Redirecting to the main page.");
          window.location.href = 'main.html'; 
      }
  }

  mediaQueryListener = handleMediaChange; 
  mediaQuery.addEventListener('change', handleMediaChange);

  
  if (mediaQuery.matches && isOverlayModeActive()) {
      window.location.href = 'main.html'; 
  }
}

/**Stops monitoring media query changes by removing the event listener.*/
function stopMediaQueryMonitoring() {
  const mediaQuery = window.matchMedia('(min-width: 1150px)');
  if (mediaQueryListener) {
      mediaQuery.removeEventListener('change', mediaQueryListener);
      mediaQueryListener = null; 
  }
}

/**Creates the Close Overlay Iframe Add Task Button if overlay mode is active*/
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
}


/**Checks if the overlay mode is active by inspecting the ID of the `<body>` element inside the iframe.*/
function isOverlayModeActive() {
  const iframe = document.getElementById("overlayContent");
  if (iframe) {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      const body = iframeDocument.body;
      return body && body.id === "overlay-mode";
  }
  return false;
}

/**Opens the task overlay by showing the overlay and applying necessary styles.*/
function openTaskOverlay() {
  showOverlay();
  setOverlayStyles();
  hideUnnecessaryElementsInIframe();

  const iframe = document.getElementById("overlayContent");
  if (!iframe) return;

   injectCloseButtonIntoIframe(iframe);
 iframe.addEventListener("load", () => injectCloseButtonIntoIframe(iframe));
}

/**Injects a close button into the given iframe.
 * The button will close the overlay in the parent window.*/
function injectCloseButtonIntoIframe(iframe) {
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  if (!iframeDoc || !iframeDoc.body) return;
  if (iframeDoc.getElementById("iframeCloseOverlay")) return;
  const btn = iframeDoc.createElement("button");
  btn.id = "iframeCloseOverlay";
  btn.textContent = "✕";

  styleCloseButton(btn);

  iframeDoc.body.style.position = "relative";
  iframeDoc.body.appendChild(btn);

  btn.addEventListener("click", () => {
    if (window.parent && typeof window.parent.closeTaskOverlay === "function") {
      window.parent.closeTaskOverlay();}});
}

/*Applies styles to the close button element.*/
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
  btn.style.fontSize = "26px !important";
  btn.style.width = "48px";
  btn.style.height = "48px";
  btn.style.fontWeight = "bolder";
}

/**Closes the task overlay by hiding the overlay and resetting styles.*/
function closeTaskOverlay() {
  hideOverlay();
  removeOverlayActiveClass();
  refreshTasksIfAvailable();
  
}

/**Shows the task overlay by adding necessary classes to display it.*/
function showOverlay() {
  const overlay = document.getElementById("taskoverlay");
  if (overlay) {
      overlay.classList.add("nohidden");
  }
  document.body.classList.add("overlay-active");
}

/**Hides the task overlay by toggling visibility-related classes.*/
function hideOverlay() {
  const overlay = document.getElementById("taskoverlay");
  if (overlay) {
      overlay.classList.remove("nohidden");
      overlay.classList.add("gethidden");
  }
}

/**Applies necessary styles to the overlay containers.*/
function setOverlayStyles() {
  adjustContainerStyle("#taskoverlay #cont-left.content-left", "column");
  adjustContainerStyle("#taskoverlay .content-right", "column");
  adjustTaskOverlayContainer();
}

/**Adjusts the style of a container to the specified flex direction.*/
function adjustContainerStyle(selector, flexDirection) {
  const element = document.querySelector(selector);
  if (element) {
      element.style.height = "auto";
      element.style.display = "flex";
      element.style.flexDirection = flexDirection;
  }
}

/**Adjusts styles for the main task overlay container.*/
function adjustTaskOverlayContainer() {
  const taskoverCont = document.querySelector("#taskoverlay #taskover-cont");
  if (taskoverCont) {
      taskoverCont.style.display = "flex";
      taskoverCont.style.paddingLeft = "0px";
      taskoverCont.style.paddingRight = "0px";
      taskoverCont.style.gap = "0px";
      taskoverCont.style.flexDirection = "row";
  }
}

/**Hides unnecessary elements inside all iframes of the overlay.*/
function hideUnnecessaryElementsInIframe() {
  const iframes = document.querySelectorAll("#overlayContent");
  iframes.forEach(function (iframe) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (iframeDoc) {
          const elementsToHide = iframeDoc.querySelectorAll(".sidebar, .header, .responsive-footer");
          elementsToHide.forEach(function (element) {
              element.style.display = "none";});}});
}

/**Removes the overlay-active class from the body element.*/
function removeOverlayActiveClass() {
  document.body.classList.remove("overlay-active");
}

/**Refreshes tasks if a task loading function is available.*/
function refreshTasksIfAvailable() {
  if (typeof loadTasks === "function") {
      loadTasks();
  }
}

/**Eventlistener for the Overlay Button and the Iframe Styles*/
document.addEventListener("DOMContentLoaded", function () {
  initializeCloseOverlayButton();
  loadIframeStyles();
});

/**Initializes the close button for the overlay.*/
function initializeCloseOverlayButton() {
  const closeOverlayButton = document.getElementById("closeOverlay");
  if (closeOverlayButton) {
      closeOverlayButton.addEventListener("click", closeTaskOverlay);
  }
}

/**Loads and applies styles for the iframe content.*/
function loadIframeStyles() {
  const iframe = document.getElementById("overlayContent");
  if (iframe) {
      fetch("./style/iframe_overlay_content.css")
          .then((response) => {
              if (!response.ok) {
                  throw new Error("Failed to load CSS");
              }
              return response.text();
          })
          .then((cssContent) => applyStylesToIframe(iframe, cssContent))
          .catch((error) => console.error("Error loading CSS:", error));
  } else {
      console.error("Iframe with ID 'overlayContent' not found");
  }
}

/**Applies the given CSS content to the iframe.*/
function applyStylesToIframe(iframe, cssContent) {
  iframe.onload = function () {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      if (iframeDocument) {
          const styleElement = iframeDocument.createElement("style");
          styleElement.type = "text/css";
          styleElement.textContent = cssContent;
          const head = iframeDocument.head || iframeDocument.getElementsByTagName("head")[0];
          if (head) {
              head.appendChild(styleElement);
          } else {
              console.error("Iframe head not found");
          }
      } else {
          console.error("Iframe document not accessible");}};
}

