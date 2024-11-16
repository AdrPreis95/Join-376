const colors = [
    "#FF7F00", "#FF66CC", "#A349A4",
    "#8A2BE2", "#00C5CD", "#00CED1",
    "#FF6A6A", "#FF9C00", "#FF77FF",
    "#FFFF33", "#4169E1", "#ADFF2F",
    "#FFFF00", "#FF4040", "#FFA500"
];

function generateColor() {
    const colors = ["#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8", "#1FD7C1", "#FF745E", "#FFA35E", "#FC71FF", "#FFC701", "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"];
    let length = colors.length;
    let color = colors[Math.floor(Math.random() * length)];
    return color;
}

let loggedUser = {};
if (sessionStorage.loggedUser != undefined){
    loggedUser = JSON.parse(sessionStorage.loggedUser);
} else {
    window.location.href = "./index.html";
}

function init() {
    loadTasks();
}

function setUserInitials() {
    const userInitiials = document.getElementById('user-initials');
    userInitiials.innerHTML = getUserInitials(loggedUser.name);
}

function getUserInitials(name) {
    // Remove whitespaces
    name = name.trim();
    
    // Get names
    const words = name.split(' ');

    // Get first char from First and Last name
    let initials = '';
    initials += words[0].charAt(0).toUpperCase();
    if (words.length > 1) {
        initials += words[words.length - 1].charAt(0).toUpperCase();
    } 

    return initials;
}

function toggleSubmenu() {
    const submenu = document.querySelector('.submenu');
    const submenuContent = document.querySelector('.submenu-content');
    const userIcon = document.querySelector('.user-icon');
    
    submenuContent.classList.toggle('opened');
    submenuContent.classList.toggle('closed');

    submenu.classList.toggle('d-none');
    
    userIcon.classList.toggle('user-icon-activated');
}

function logOut() {
    loggedUser = {};
    sessionStorage.removeItem("loggedUser");
    window.location.href = "./index.html";
}

let colorsUser = ['#6E52FF', '#FF7A00', '#FF5EB3', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'];

function convertDateFormat(date) {
    return date.split("/").reverse().join("-");
}

function dateFormatter(date){
    return date.split("-").reverse().join("/");
}

function formatDueDate(e) {
    let date = document.getElementById("due-date-input");

    var keynum;

    if(window) { // IE                  
        keynum = e.keyCode;
    } else if(e.which){ // Netscape/Firefox/Opera                 
        keynum = e.which;
    }

    let lastChar = String.fromCharCode(keynum);

    if(lastChar != "/" && (date.value.length == 2|| date.value.length == 5)){
        date.value += '/';
    }
}
