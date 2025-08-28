/**This if-else statement checks if the user is logged in, else
*it occurs a redirection to index.html, the login page.*/
let loggedUser = {};
if (sessionStorage.loggedUser != undefined) {
    loggedUser = JSON.parse(sessionStorage.loggedUser);
} else {
    window.location.href = "./index.html";
}

// /**Array with farbcodes for the usercolors*/
// const colors = [
//     "#FF7F00", "#FF66CC", "#A349A4",
//     "#8A2BE2", "#00C5CD", "#00CED1",
//     "#FF6A6A", "#FF9C00", "#FF77FF",
//     "#FFFF33", "#4169E1", "#ADFF2F",
//     "#FFFF00", "#FF4040", "#FFA500"
// ];

// /**This function adds a random color for any user*/
// function generateColor() {
//     const colors = [
//         "#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8", "#1FD7C1",
//         "#FF745E", "#FFA35E", "#FC71FF", "#FFC701", "#0038FF", "#C3FF2B",
//         "#FFE62B", "#FF4646", "#FFBB2B"];
//     let length = colors.length;
//     let color = colors[Math.floor(Math.random() * length)];
//     return color;
// }
// --- stabile Farb-API global bereitstellen ---
// === Farb-Alias: nutzt die stabile Core-Implementierung aus contactsCache.js ===
(function () {
  function pick(pool){ return pool[Math.floor(Math.random() * pool.length)]; }
  function fallback(arg){
    const pool = (window.COLOR_POOL && window.COLOR_POOL.length)
      || (window.colorsUser && window.colorsUser.length && window.colorsUser)
      || ["#FF7A00","#FF5EB3","#6E52FF","#9327FF","#00BEE8","#1FD7C1","#FF745E","#FFA35E","#FC71FF","#FFC701","#0038FF","#C3FF2B","#FFE62B","#FF4646","#FFBB2B"];
    if (arg == null) return pick(pool);
    return pick(pool);
  }
  function core(){ return window.__ctxGenerateColor || window.generateColor; }

  window.generateColor  = function(arg){ const fn = core(); return (typeof fn==='function') ? fn(arg) : fallback(arg); };
  window.getRandomColor = function(arg){ const fn = core(); return (typeof fn==='function') ? fn(arg) : fallback(arg); };
})();


/**This Function initializes alls the Task */
function init() {
    loadTasks();
}

/**This Function sets the user Initials*/
function setUserInitials() {
    const userInitiials = document.getElementById('user-initials');
    userInitiials.innerHTML = getUserInitials(loggedUser.name);
}

/**This functon sets the user initials by the name and lastname for the usericon*/
function getUserInitials(name) {
name = name.trim();
const words = name.split(' ');
    let initials = '';
    initials += words[0].charAt(0).toUpperCase();
    if (words.length > 1) {
        initials += words[words.length - 1].charAt(0).toUpperCase();
    }

    return initials;
}

/**Function for toggling the user submenu */
(()=>{const q=s=>document.querySelector(s);
const set=o=>{const sm=q('.submenu'),sc=q('.submenu-content'),ui=q('.user-icon');if(!sm||!sc||!ui)return;sc.classList.toggle('opened',o);sc.classList.toggle('closed',!o);sm.classList.toggle('d-none',!o);ui.classList.toggle('user-icon-activated',o);};
window.toggleSubmenu=()=>set(!q('.submenu-content')?.classList.contains('opened'));
window.closeSubmenu=()=>set(false);
const init=()=>{if(window.__submenuInit)return;window.__submenuInit=1;
addEventListener('click',e=>{const t=e.target;if(t.closest('.submenu-content a'))return closeSubmenu(); if(!t.closest('.submenu, .user-icon'))closeSubmenu();},true);
['popstate','pageshow'].forEach(ev=>addEventListener(ev,closeSubmenu));
addEventListener('keydown',e=>{if(e.key==='Escape')closeSubmenu();});};
document.readyState!=='loading'?init():addEventListener('DOMContentLoaded',init,{once:true});
})();

/**This function logs out the user and bring him to the mainpage for login and sign in*/
function logOut() {
    loggedUser = {};
    sessionStorage.removeItem("loggedUser");
    window.location.href = "./index.html";
}
/**Array of all available Colors for the User Avatar Background*/
// let colorsUser = ['#6E52FF', '#FF7A00', '#FF5EB3', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'];

/**This function converts the date input from dd/mm/yyyy to the 
*format yyyy-mm-dd*/
function convertDateFormat(date) {
    return date.split("/").reverse().join("-");
}

/**This function converts the date input from yyyy-mm-dd to the 
*format dd/mm/yyyy*/
function dateFormatter(date) {
    return date.split("-").reverse().join("/");
}

/**This function formats automatically the date input to the 
 *format dd/mm/yyyy*/
function formatDueDate(e) {
    let date = document.getElementById("due-date-input");

    var keynum;

    if (window) {                  
        keynum = e.keyCode;
    } else if (e.which) {               
        keynum = e.which;
    }

    let lastChar = String.fromCharCode(keynum);

    if (lastChar != "/" && (date.value.length == 2 || date.value.length == 5)) {
        date.value += '/';
    }
}

/**This Function loads all the task by the id*/
async function loadTaskWithID(id) {
    let response = await fetch(BASE_URL + "/tasks/" + id + ".json");
    let responseJson = await response.json();
    return responseJson;
}

/**closes the Overlay in Board after clicking the close button*/
function closeOverlay() {

    document.getElementById('task-details').style.display = 'none';
    document.getElementById('all-content').style.filter = 'brightness(1)';
    document.getElementById('overlay-blocker').classList.add('hidden');

    loadTasks();
}

/* === STABILER COLOR-SHIM (einmal ans Ende von script.js einfügen) === */
(function () {
  if (window.__colorShimInstalled) return;  // nur 1x installieren
  window.__colorShimInstalled = true;

  // Pool wählen (nimmt vorhandene, sonst Fallback)
  const POOL = (Array.isArray(window.COLOR_POOL) && window.COLOR_POOL.length && window.COLOR_POOL)
            || (Array.isArray(window.colorsUser) && window.colorsUser.length && window.colorsUser)
            || ["#FF7A00","#FF5EB3","#6E52FF","#9327FF","#00BEE8","#1FD7C1","#FF745E","#FFA35E","#FC71FF",
                "#FFC701","#0038FF","#C3FF2B","#FFE62B","#FF4646","#FFBB2B"];

  function pick(){ return POOL[Math.floor(Math.random()*POOL.length)]; }
  function hash(s){ s=String(s||""); let h=0,i=0; while(i<s.length) h=((h<<5)-h+s.charCodeAt(i++))|0; return Math.abs(h); }
  function derive(key){ return POOL[ hash(key) % POOL.length ]; }

  // Falls ein Core existiert, benutzen – aber nie rekursiv
  const core =
    (typeof window.__ctxGenerateColor === "function" && window.__ctxGenerateColor) ||
    (typeof window.generateColorCore === "function" && window.generateColorCore) ||
    (typeof window.generateColor === "function" && !window.generateColor.__shim && window.generateColor) ||
    null;

  function stableColor(arg){
    if (core) return core(arg);                 // vorhandene Core-Logik nutzen
    if (arg == null) return pick();             // kompatibel: echt zufällig ohne Arg
    if (typeof arg === "object") {              // Kontaktobjekt → stabil + am Objekt speichern
      const key = (arg.email || String(arg.id) ||
                  (`${arg.firstName||""} ${arg.lastName||arg.name||""}`)).trim().toLowerCase();
      const lsKey = "contactColor:"+key;
      let col = localStorage.getItem(lsKey);
      if (!col) { col = derive(lsKey); localStorage.setItem(lsKey, col); }
      arg.color = arg.color || col;
      return arg.color;
    } else {                                    // String-Key (email/id/name) → stabil
      const k = "contactColor:"+String(arg).trim().toLowerCase();
      let col = localStorage.getItem(k);
      if (!col) { col = derive(k); localStorage.setItem(k, col); }
      return col;
    }
  }

  function shim(arg){ return stableColor(arg); }
  shim.__shim = true;

  // Globale API bereitstellen/überschreiben – ohne Rekursion
  window.generateColor  = shim;
  window.getRandomColor = shim;

  // praktischer Helper für Renderer
  window.ensureColor = function(c){ if(!c) return; c.color = c.color || shim(c); return c.color; };
})();
