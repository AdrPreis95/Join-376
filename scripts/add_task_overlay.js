
function openTaskOverlay() {
  document.getElementById("taskoverlay").classList.remove("hidden");
  document.body.classList.add("overlay-active");

  const contLeft = document.querySelector("#taskoverlay #cont-left.content-left");
  const contentRight = document.querySelector("#taskoverlay .content-right");
  const taskoverCont = document.querySelector("#taskoverlay #taskover-cont");

  if (contLeft) {
    contLeft.style.width = "-webkit-fill-available";
    contLeft.style.height = "auto";
    contLeft.style.display = "flex";
    contLeft.style.flexDirection = "column";
  }

  if (contentRight) {
    contentRight.style.width = "-webkit-fill-available";
    contentRight.style.height = "auto";
    contentRight.style.display = "flex";
    contentRight.style.flexDirection = "column";
  }

  if (taskoverCont) {
    taskoverCont.style.display = "flex";
    taskoverCont.style.paddingLeft = "0px";
    taskoverCont.style.paddingRight = "0px";
    taskoverCont.style.gap = "0px";
    taskoverCont.style.flexDirection = "row";
  }

  document.querySelectorAll("#overlayContent").forEach(function(iframe) {
    var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    var noneElements = iframeDoc.querySelectorAll(".sidebar, .header, .responsive-footer");
    noneElements.forEach(function(noneElement) {
      noneElement.style.display = "none";
    });
  });
}


function closeTaskOverlay() {
  document.getElementById("taskoverlay").classList.add("hidden");
  document.body.classList.remove("overlay-active");
}

  