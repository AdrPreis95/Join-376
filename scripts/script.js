/**This if-else statement checks if the user is logged in, else
*it occurs a redirection to index.html, the login page.*/
let loggedUser = {};
if (sessionStorage.loggedUser != undefined) {
    loggedUser = JSON.parse(sessionStorage.loggedUser);
} else {
    window.location.href = "./index.html";
}

/**This function adds a random color for any user*/
(function () {
  if (window.__colorShimInstalled) return;
  window.__colorShimInstalled = true;

 /**Array with farbcodes for the usercolors*/
  const POOL =
    (Array.isArray(window.COLOR_POOL) && window.COLOR_POOL.length && window.COLOR_POOL) ||
    (Array.isArray(window.colorsUser) && window.colorsUser.length && window.colorsUser) ||
    ["#FF7A00","#FF5EB3","#6E52FF","#9327FF","#00BEE8","#1FD7C1","#FF745E","#FFA35E",
     "#FC71FF","#FFC701","#0038FF","#C3FF2B","#FFE62B","#FF4646","#FFBB2B"];

  function pick()   { return POOL[Math.floor(Math.random() * POOL.length)]; }
  function hash(s)  { s = String(s||""); let h=0,i=0; while(i<s.length) h=((h<<5)-h+s.charCodeAt(i++))|0; return Math.abs(h); }
  function derive(k){ return POOL[ hash(k) % POOL.length ]; }

   /**Fallback for the User Avatar Colors*/
//   function colorCore(arg){
//     if (arg == null) return pick(); 
//     if (typeof arg === "object") {
//       const key = (arg.email || String(arg.id) ||
//                   (`${arg.firstName||""} ${arg.lastName||arg.name||""}`))
//                   .trim().toLowerCase();
//       const lsKey = "contactColor:"+key;
//       let col = localStorage.getItem(lsKey);
//       if (!col) { col = derive(lsKey); localStorage.setItem(lsKey, col); }
//       arg.color = arg.color || col;
//       return arg.color;
//     }
//     const k = "contactColor:"+String(arg).trim().toLowerCase();
//     let col = localStorage.getItem(k);
//     if (!col) { col = derive(k); localStorage.setItem(k, col); }
//     return col;
//   }

//   window.generateColor  = colorCore;
//   window.getRandomColor = colorCore;
//   window.generateColor.__shim = true; 
// })();
/**Fallback for the User Avatar Colors*/
function colorCore(arg) {
  if (arg == null) return pick(); 
  if (typeof arg === "object") return handleObjectColor(arg);

  const k = "contactColor:" + String(arg).trim().toLowerCase();
  let col = localStorage.getItem(k);
  if (!col) { 
    col = derive(k); 
    localStorage.setItem(k, col); 
  }
  return col;
}

/**Handles color generation for contact objects*/
function handleObjectColor(arg) {
  const key = (arg.email || String(arg.id) ||
              (`${arg.firstName||""} ${arg.lastName||arg.name||""}`))
              .trim().toLowerCase();
  const lsKey = "contactColor:" + key;
  let col = localStorage.getItem(lsKey);
  if (!col) { 
    col = derive(lsKey); 
    localStorage.setItem(lsKey, col); 
  }
  arg.color = arg.color || col;
  return arg.color;}

window.generateColor  = colorCore;
window.getRandomColor = colorCore;
window.generateColor.__shim = true;
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
  window.closeSubmenu  = () => set(false);
  return { set };
}

// --- Events nur 1x binden ---
function bindSubmenuEvents() {
  if (window.__submenuInit) return;
  window.__submenuInit = true;
  addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('.submenu-content a')) return closeSubmenu();
    if (!t.closest('.submenu, .user-icon')) closeSubmenu();
  }, true);
  ['popstate','pageshow'].forEach(ev => addEventListener(ev, closeSubmenu));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSubmenu(); });
}

// --- Initialisieren ---
document.readyState !== 'loading'
  ? (initSubmenu(), bindSubmenuEvents())
  : addEventListener('DOMContentLoaded', () => { initSubmenu(); bindSubmenuEvents(); }, { once:true });

/**This function logs out the user and bring him to the mainpage for login and sign in*/
function logOut() {
    loggedUser = {};
    sessionStorage.removeItem("loggedUser");
    window.location.href = "./index.html";
}

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
        keynum = e.which;}

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

/* Function for the stable color shim ,checks the values and gets farbcoed from the POOL*/
(function () {
  if (window.__colorShimInstalled) return;  
  window.__colorShimInstalled = true;

  /*Array with Farbcodes for the User Avatars*/
  const POOL = (Array.isArray(window.COLOR_POOL) && window.COLOR_POOL.length && window.COLOR_POOL)
            || (Array.isArray(window.colorsUser) && window.colorsUser.length && window.colorsUser)
            || ["#FF7A00","#FF5EB3","#6E52FF","#9327FF","#00BEE8","#1FD7C1","#FF745E","#FFA35E","#FC71FF",
                "#FFC701","#0038FF","#C3FF2B","#FFE62B","#FF4646","#FFBB2B"];

/*Returns a random color from the defined POOL.
@returns {string} A hex color code randomly selected from the pool.*/
  function pick(){ return POOL[Math.floor(Math.random()*POOL.length)]; }

  /* Generates a numeric hash value based on a given string.*/
  function hash(s){ s=String(s||""); let h=0,i=0; while(i<s.length) h=((h<<5)-h+s.charCodeAt(i++))|0; return Math.abs(h); }

  /*Derives a stable color for a given key.*/
  function derive(key){ return POOL[ hash(key) % POOL.length ]; }

  /*Reference to an existing global color generator, if available.*/
  const core =
    (typeof window.__ctxGenerateColor === "function" && window.__ctxGenerateColor) ||
    (typeof window.generateColorCore === "function" && window.generateColorCore) ||
    (typeof window.generateColor === "function" && !window.generateColor.__shim && window.generateColor) ||
    null;

/**
 * Returns a stable and consistent color for a given argument.
 * If a custom core color generator is available, it is used.
 * If no argument is provided, a random color from the pool is returned.*/
  function stableColor(arg){
    if (core) return core(arg);                 
    if (arg == null) return pick();            
    if (typeof arg === "object") {              
      const key = (arg.email || String(arg.id) ||
                  (`${arg.firstName||""} ${arg.lastName||arg.name||""}`)).trim().toLowerCase();
      const lsKey = "contactColor:"+key;
      let col = localStorage.getItem(lsKey);
      if (!col) { col = derive(lsKey); localStorage.setItem(lsKey, col); }
      arg.color = arg.color || col;
      return arg.color;} 
      else {                                   
      const k = "contactColor:"+String(arg).trim().toLowerCase();
      let col = localStorage.getItem(k);
      if (!col) { col = derive(k); localStorage.setItem(k, col); }
      return col;}
  }

  /*Shim wrapper for the stableColor function.
 * Used to replace or provide a fallback for global color generation.*/
  function shim(arg){ return stableColor(arg); }
  shim.__shim = true;

  window.generateColor  = shim;
  window.getRandomColor = shim;
  window.ensureColor = function(c){ if(!c) return; c.color = c.color || shim(c); return c.color; };
})();
