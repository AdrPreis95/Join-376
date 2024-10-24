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

<<<<<<< HEAD
function logOut() {
    loggedUser = {};
    sessionStorage.removeItem("loggedUser");
    window.location.href = "./index.html";
}
=======
let colorsUser = ['#6E52FF', '#FF7A00', '#FF5EB3', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'];
>>>>>>> ebe8931878d77678103054cc3de353ca4ce21521
