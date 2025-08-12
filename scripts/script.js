/**This if-else statement checks if the user is logged in, else
*it occurs a redirection to index.html, the login page.*/
let loggedUser = {};
if (sessionStorage.loggedUser != undefined) {
    loggedUser = JSON.parse(sessionStorage.loggedUser);
} else {
    window.location.href = "./index.html";
}

/**Array with farbcodes for the usercolors*/
const colors = [
    "#FF7F00", "#FF66CC", "#A349A4",
    "#8A2BE2", "#00C5CD", "#00CED1",
    "#FF6A6A", "#FF9C00", "#FF77FF",
    "#FFFF33", "#4169E1", "#ADFF2F",
    "#FFFF00", "#FF4040", "#FFA500"
];

/**This function adds a random color for any user*/
function generateColor() {
    const colors = [
        "#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8", "#1FD7C1",
        "#FF745E", "#FFA35E", "#FC71FF", "#FFC701", "#0038FF", "#C3FF2B",
        "#FFE62B", "#FF4646", "#FFBB2B"];
    let length = colors.length;
    let color = colors[Math.floor(Math.random() * length)];
    return color;
}

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
let colorsUser = ['#6E52FF', '#FF7A00', '#FF5EB3', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'];

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

