
function openTaskOverlay() {
  document.getElementById("taskoverlay").classList.remove("hidden");
  document.body.classList.add("overlay-active");
}

function closeTaskOverlay() {
  document.getElementById("taskoverlay").classList.add("hidden");
  document.body.classList.remove("overlay-active");
}

  