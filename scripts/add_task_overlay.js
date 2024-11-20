let mediaQueryListener;

function monitorMediaQuery() {
    const mediaQuery = window.matchMedia('(min-width: 1150px)');

    function handleMediaChange(e) {
        if (e.matches && isOverlayModeActive()) {
            console.log("Bildschirmbreite > 1150px und Overlay aktiv. Weiterleitung zur Hauptseite.");
            window.location.href = 'main.html'; // Passe die Zielseite an
        }
    }

    // Event-Listener hinzufügen
    mediaQueryListener = handleMediaChange; // Speichern, um später zu entfernen
    mediaQuery.addEventListener('change', handleMediaChange);

    // Initial prüfen, ob die Bedingung erfüllt ist
    if (mediaQuery.matches && isOverlayModeActive()) {
        window.location.href = 'main.html'; // Passe die Zielseite an
    }
}

function stopMediaQueryMonitoring() {
    const mediaQuery = window.matchMedia('(min-width: 1150px)');
    if (mediaQueryListener) {
        mediaQuery.removeEventListener('change', mediaQueryListener);
        mediaQueryListener = null; // Listener zurücksetzen
    }
}


function isOverlayModeActive() {
  const iframe = document.getElementById("overlayContent");
  if (iframe) {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      const body = iframeDocument.body;
      return body && body.id === "overlay-mode";
  }
  return false;
}









function openTaskOverlay() {
  showOverlay();
  setOverlayStyles();
  hideUnnecessaryElementsInIframe();
}

function closeTaskOverlay() {
  hideOverlay();
  removeOverlayActiveClass();
  refreshTasksIfAvailable();
}

function showOverlay() {
  const overlay = document.getElementById("taskoverlay");
  if (overlay) {
    overlay.classList.add("nohidden");
  }
  document.body.classList.add("overlay-active");
}

function hideOverlay() {
  const overlay = document.getElementById("taskoverlay");
  if (overlay) {
    overlay.classList.remove("nohidden");
    overlay.classList.add("gethidden");
  }
}

function setOverlayStyles() {
  adjustContainerStyle("#taskoverlay #cont-left.content-left", "column");
  adjustContainerStyle("#taskoverlay .content-right", "column");
  adjustTaskOverlayContainer();
}

function adjustContainerStyle(selector, flexDirection) {
  const element = document.querySelector(selector);
  if (element) {
    element.style.height = "auto";
    element.style.display = "flex";
    element.style.flexDirection = flexDirection;
  }
}

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

function hideUnnecessaryElementsInIframe() {
  const iframes = document.querySelectorAll("#overlayContent");
  iframes.forEach(function (iframe) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (iframeDoc) {
      const elementsToHide = iframeDoc.querySelectorAll(".sidebar, .header, .responsive-footer");
      elementsToHide.forEach(function (element) {
        element.style.display = "none";
      });
    }
  });
}

function removeOverlayActiveClass() {
  document.body.classList.remove("overlay-active");
}

function refreshTasksIfAvailable() {
  if (typeof loadTasks === "function") {
    loadTasks();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initializeCloseOverlayButton();
  loadIframeStyles();
});

function initializeCloseOverlayButton() {
  const closeOverlayButton = document.getElementById("closeOverlay");
  if (closeOverlayButton) {
    closeOverlayButton.addEventListener("click", closeTaskOverlay);
  }
}

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
      console.error("Iframe document not accessible");
    }
  };
}
