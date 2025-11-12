/**This if-else statement checks if the user is logged in, else
*it occurs a redirection to index.html, the login page.*/
let loggedUser = {};
if (sessionStorage.loggedUser != undefined) {
  loggedUser = JSON.parse(sessionStorage.loggedUser);
} else {
  window.location.href = "./index.html";
};

/** Generates a numeric hash from a given string. */
  function hash(s) {
    s = String(s || ""); let h = 0, i = 0;
    while (i < s.length) h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
    return Math.abs(h);
  };

/**This Function initializes alls the Task */
function init() { loadTasks(); }

/**This Function sets the user Initials*/
function setUserInitials() {
  const userInitiials = document.getElementById('user-initials');
  userInitiials.innerHTML = getUserInitials(loggedUser.name);
};

/**This functon sets the user initials by the name and lastname for the usericon*/
function getUserInitials(name) {
  name = name.trim();
  const words = name.split(' ');
  let initials = words[0].charAt(0).toUpperCase();
  if (words.length > 1) initials += words[words.length - 1].charAt(0).toUpperCase();
  return initials;
};

/**Function for toggling and initialize the user submenu */
function initSubmenu() {
  const $ = (s) => document.querySelector(s);
  const set = (open) => {
    const sm = $('.submenu'), sc = $('.submenu-content'), ui = $('.user-icon');
    if (!sm || !sc || !ui) return;
    sc.classList.toggle('opened', open);
    sc.classList.toggle('closed', !open);
    sm.classList.toggle('d-none', !open);
    ui.classList.toggle('user-icon-activated', open);
  };
  window.toggleSubmenu = () => set(!$('.submenu-content')?.classList.contains('opened'));
  window.closeSubmenu = () => set(false);
  return { set };
};

/** Binds submenu-related event listeners only once. */
function bindSubmenuEvents() {
  if (window.__submenuInit) return;
  window.__submenuInit = true;
  addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('.submenu-content a')) return closeSubmenu();
    if (!t.closest('.submenu, .user-icon')) closeSubmenu();
  }, true);
  ['popstate', 'pageshow'].forEach(ev => addEventListener(ev, closeSubmenu));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSubmenu(); });
};

/** Initializes submenu when document is ready. */
document.readyState !== 'loading'
  ? (initSubmenu(), bindSubmenuEvents())
  : addEventListener('DOMContentLoaded', () => { initSubmenu(); bindSubmenuEvents(); }, { once: true });

/**This function logs out the user and bring him to the mainpage for login and sign in*/
function logOut() {
  loggedUser = {};
  sessionStorage.removeItem("loggedUser");
  window.location.href = "./index.html";
};

/**This function converts the date input from dd/mm/yyyy to the 
*format yyyy-mm-dd*/
function convertDateFormat(date) { return date.split("/").reverse().join("-"); };

/**This function converts the date input from yyyy-mm-dd to the 
*format dd/mm/yyyy*/
function dateFormatter(date) { return date.split("-").reverse().join("/"); };

/**This function formats automatically the date input to the 
 *format dd/mm/yyyy*/
function formatDueDate(e) {
  const date = document.getElementById("due-date-input");
  const k = (typeof e.which === 'number') ? e.which : e.keyCode;
  const ch = String.fromCharCode(k);
  const len = date.value.length;
  if (ch !== "/" && (len === 2 || len === 5)) date.value += '/';
};

/**This Function loads all the task by the id*/
async function loadTaskWithID(id) {
  let response = await fetch(BASE_URL + "/tasks/" + id + ".json");
  let responseJson = await response.json();
  return responseJson;
};

/**closes the Overlay in Board after clicking the close button*/
function closeOverlay() {
  document.getElementById('task-details').style.display = 'none';
  document.getElementById('all-content').style.filter = 'brightness(1)';
  document.getElementById('overlay-blocker').classList.add('hidden');
  loadTasks();
};






