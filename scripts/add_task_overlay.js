function openTaskOverlay() {
 
  document.getElementById("taskoverlay").classList.add('nohidden');
  document.body.classList.add("overlay-active");

 
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

  
  document.querySelectorAll("#overlayContent").forEach(function(iframe) {
    var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    var noneElements = iframeDoc.querySelectorAll(".sidebar, .header, .responsive-footer");
    noneElements.forEach(function(noneElement) {
      noneElement.style.display = "none";
    });
  });
}

function closeTaskOverlay() {
 
  document.getElementById("taskoverlay").classList.remove("nohidden");
  document.body.classList.remove("nohidden");
loadTasks();
}
document.addEventListener('DOMContentLoaded', function() {
  const iframe = document.getElementById('overlayContent');
  fetch('./style/iframe_overlay_content.css')
  .then(response => {
      if (!response.ok) throw new Error('Failed to load CSS');
      return response.text();
  })
  .then(cssContent => {
      iframe.onload = function () {
          const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
         
          const styleElement = iframeDocument.createElement('style');
          styleElement.type = 'text/css';
         styleElement.textContent = cssContent;
         iframeDocument.head.appendChild(styleElement);
      };
  })
  .catch(error => console.error('Error loading CSS:', error));
  
});

