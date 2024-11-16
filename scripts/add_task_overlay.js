function openTaskOverlay() {
  // Entfernt die 'hidden' Klasse und fügt die 'overlay-active' Klasse zum Body hinzu
  document.getElementById("taskoverlay").classList.remove("hidden");
  document.body.classList.add("overlay-active");

  // Stile für 'cont-left' innerhalb des Overlays anwenden
  const contLeft = document.querySelector("#taskoverlay #cont-left.content-left");
  if (contLeft) {
    contLeft.style.height = "auto";
    contLeft.style.display = "flex";
    contLeft.style.flexDirection = "column";
  }
  const closeOverlayButton = document.getElementById("closeOverlay");
  if (closeOverlayButton) {
    closeOverlayButton.style.display = "inline-block"; // Macht den Button sichtbar
  }

  // Stile für 'content-right' innerhalb des Overlays anwenden
  const contentRight = document.querySelector("#taskoverlay .content-right");
  if (contentRight) {
    contentRight.style.height = "auto";
    contentRight.style.display = "flex";
    contentRight.style.flexDirection = "column";
  }

  // Stile für 'taskover-cont' innerhalb des Overlays anwenden
  const taskoverCont = document.querySelector("#taskoverlay #taskover-cont");
  if (taskoverCont) {
    taskoverCont.style.display = "flex";
    taskoverCont.style.paddingLeft = "0px";
    taskoverCont.style.paddingRight = "0px";
    taskoverCont.style.gap = "0px";
    taskoverCont.style.flexDirection = "row";
  }

  // Elemente innerhalb der iframes ausblenden
  document.querySelectorAll("#overlayContent").forEach(function(iframe) {
    var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    var noneElements = iframeDoc.querySelectorAll(".sidebar, .header, .responsive-footer");
    noneElements.forEach(function(noneElement) {
      noneElement.style.display = "none";
    });
  });
}

function closeTaskOverlay() {
  // Verbirgt das Overlay und entfernt die 'overlay-active' Klasse vom Body
  document.getElementById("taskoverlay").classList.add("hidden");
  document.body.classList.remove("overlay-active");

  // Stellt sicher, dass alle Aufgaben neu geladen werden, wenn das Overlay geschlossen wird
  loadTasks();
}
