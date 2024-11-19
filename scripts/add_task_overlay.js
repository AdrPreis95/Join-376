function openTaskOverlay() {
  document.getElementById("taskoverlay").classList.add('nohidden');
  document.body.classList.add("overlay-active");

  const contLeft = document.querySelector("#taskoverlay #cont-left.content-left");
  if (contLeft) {
    contLeft.style.height = "auto";
    contLeft.style.display = "flex";
    contLeft.style.flexDirection = "column";
  }

  const contentRight = document.querySelector("#taskoverlay .content-right");
  if (contentRight) {
    contentRight.style.height = "auto";
    contentRight.style.display = "flex";
    contentRight.style.flexDirection = "column";
  }

  const taskoverCont = document.querySelector("#taskoverlay #taskover-cont");
  if (taskoverCont) {
    taskoverCont.style.display = "flex";
    taskoverCont.style.paddingLeft = "0px";
    taskoverCont.style.paddingRight = "0px";
    taskoverCont.style.gap = "0px";
    taskoverCont.style.flexDirection = "row";
  }

  document.querySelectorAll("#overlayContent").forEach(function (iframe) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const noneElements = iframeDoc.querySelectorAll(".sidebar, .header, .responsive-footer");
    noneElements.forEach(function (noneElement) {
      noneElement.style.display = "none";
    });
  });
}


function closeTaskOverlay() {
  const taskOverlay = document.getElementById("taskoverlay");
  if (taskOverlay) {
    taskOverlay.classList.remove("nohidden"); 
    taskOverlay.classList.add("gethidden"); 
  }
  document.body.classList.remove("overlay-active");
  if (typeof loadTasks === "function") {
    loadTasks();
  }
}


document.addEventListener("DOMContentLoaded", function () {
  const closeOverlayButton = document.getElementById("closeOverlay"); 
  if (closeOverlayButton) {
    closeOverlayButton.addEventListener("click", closeTaskOverlay); 
  }

  const iframe = document.getElementById("overlayContent");
  if (iframe) {
    fetch("./style/iframe_overlay_content.css")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load CSS");
        }
        return response.text();
      })
      .then((cssContent) => {
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
      })
      .catch((error) => console.error("Error loading CSS:", error));
  } else {
    console.error("Iframe with ID 'overlayContent' not found");
  }
});
