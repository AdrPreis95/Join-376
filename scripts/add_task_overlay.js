
function openTaskOverlay() {
  document.getElementById("taskoverlay").classList.remove("hidden");
  document.body.classList.add("overlay-active");
  document.querySelectorAll("#overlayContent").forEach(function(iframe) {
    var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    var noneElements = iframeDoc.querySelectorAll(".sidebar,  .header, .responsive-footer");
    noneElements.forEach(function(noneElement) {
        noneElement.style.display = "none";
    });
});
}

function closeTaskOverlay() {
  document.getElementById("taskoverlay").classList.add("hidden");
  document.body.classList.remove("overlay-active");
}

  