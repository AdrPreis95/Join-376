/**
 * This if statement checks if the user is logged in and
 * redirect the user to the summary page.
 */
let loggedUser = {};
if (sessionStorage.loggedUser != undefined) {
    window.location.href = "./summary.html";
}

let signedUser = {
    "email": "",
    "name": "",
    "password": ""
};

const emailLogin = document.getElementById("login-email");
const passwordLogin = document.getElementById("login-password");
const errorMsgLogin = document.getElementById("check-email-password");

const nameSignUp = document.getElementById("signup-name");
const emailSignUp = document.getElementById("signup-email");
const passwordSignUp = document.getElementById("signup-password");
const confirmSignUp = document.getElementById("confirm-password");
const errorMsgSignUp = document.getElementById("check-password");
const confirmPasswordSignUp = document.querySelector(".password-confirm");
const inputCheckboxSignUp = document.querySelector(".input-checkbox");

const BASE_URL = 'https://join-376-dd26c-default-rtdb.europe-west1.firebasedatabase.app/';

/**
 * This function loads tasks from Firebase according to their path.
 * @param {String} path 
 * @returns responseToJson
 */
async function loadData(path = "") {
    let response = await fetch(BASE_URL + path + ".json");
    return responseToJson = await response.json();
}

/**
 * This function update tasks from Firebase according to their path.
 * @param {String} path 
 * @param {Object} data - new values from a task
 * @returns responseToJson
 */
async function patchData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });

    return responseToJson = await response.json();
}

/**
 * This function loads an user
 */
// async function loadUser() {
//     errorMsgLogin.classList.add('hidden');
//     if (checkInputEmail(emailLogin)) {
//         if (checkInputPassword(passwordLogin)) {
//             let gettedUser = await loadData("users/" + editEmailToKey(emailLogin.value));
//             if (gettedUser) {
//                 if (matchingPassword(gettedUser.password, passwordLogin.value)) {
//                     redirectToSummary(gettedUser, emailLogin, passwordLogin);
//                 } else {                    
//                     showErrorMsg(errorMsgLogin, passwordLogin, emailLogin); //because passwords do not match
//                 }
//             } else {                
//                 showErrorMsg(errorMsgLogin, passwordLogin, emailLogin);//beacuse user does not exist
//             }
//         }
//     }
// }
async function loadUser() {
    // Fehleranzeige zurücksetzen
    errorMsgLogin.classList.add('hidden');
    emailLogin.classList.remove("wrong-input");
    passwordLogin.classList.remove("wrong-input");

    const email = emailLogin.value.trim();
    const password = passwordLogin.value;

    // Prüfe auf leeres Feld
    if (!email) {
        emailLogin.classList.add("wrong-input");
        emailLogin.focus();
        errorMsgLogin.textContent = "Please enter your email.";
        errorMsgLogin.classList.remove("hidden");
        return;
    }

    // E-Mail-Format prüfen
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        emailLogin.classList.add("wrong-input");
        emailLogin.focus();
        errorMsgLogin.textContent = "Please enter a valid email address.";
        errorMsgLogin.classList.remove("hidden");
        return;
    }

    // Passwort prüfen
    if (!password) {
        passwordLogin.classList.add("wrong-input");
        passwordLogin.focus();
        errorMsgLogin.textContent = "Please enter your password.";
        errorMsgLogin.classList.remove("hidden");
        return;
    }

    // Lade Benutzer aus Firebase
    let gettedUser = await loadData("users/" + editEmailToKey(email));
    if (gettedUser) {
        if (matchingPassword(gettedUser.password, password)) {
            redirectToSummary(gettedUser, emailLogin, passwordLogin);
        } else {
            showErrorMsg(errorMsgLogin, passwordLogin, emailLogin); // falsches Passwort
        }
    } else {
        showErrorMsg(errorMsgLogin, passwordLogin, emailLogin); // Benutzer nicht gefunden
    }
}

/**
 * This function checks if the email input field is not empty
 * @param {HTMLElement} email
 * @returns {boolean}
 */
function checkInputEmail(email){
    if (email.value != "") {
        email.classList.remove("wrong-input");
        return true;
    } else {
        email.classList.add("wrong-input");
        email.focus();
        return false;
    }
}

/**
 * This function checks if the password input field is not empty
 * @param {HTMLElement} password
 * @returns {boolean}
 */
function checkInputPassword(password) {
    if (password.value != "") {
        password.classList.remove("wrong-input");
        return true;
    } else {
        password.classList.add("wrong-input");
        password.focus();
        return false;
    }
}

/**
 * This function redirects the user to summary page
 * @param {Object} gettedUser
 * @param {HTMLElement} email
 * @param {HTMLElement} password
 */
function redirectToSummary(gettedUser, email, password){
    loggedUser = gettedUser;
    sessionStorage.setItem("loggedUser", JSON.stringify(loggedUser));
    checkRememberMe(); //The user's email will be stored in a storage, if checkbox Remember me is checked 
    email.value = "";
    password.value = "";
    rememberMe();
    window.location.href = "./summary.html";
}

/**
 * This function shows the error message
 * @param {HTMLElement} errorMsg
 * @param {HTMLElement} password
 * @param {HTMLElement} email
 */
function showErrorMsg(errorMsg, password, email) {
    errorMsg.innerHTML = "Check your email and password. Please try again.";
    errorMsg.classList.remove('hidden');
    password.classList.add("wrong-input");
    email.classList.add("wrong-input");
    sessionStorage.removeItem("loggedUser");
}

/**
 * This function loads user as guest
 */
async function loadGuestUser() {
    loggedUser = await loadData("users/guest");
    sessionStorage.setItem("loggedUser", JSON.stringify(loggedUser));
    window.location.href = "./summary.html";
}

/**
 * This function matches two passwords input values.
 * @param {String} firstPassword 
 * @param {String} secondPassword 
 * @returns {boolean}
 */
function matchingPassword(firstPassword = "", secondPassword = "") {
    return firstPassword === secondPassword;
}

/**
 * This function converts email input value to firebase key
 * by replacing . to , according to the firebase's rules.
 * @param {String} email
 * @returns {String}
 */
function editEmailToKey(email = "") {
    let editedEmail = email.replaceAll(".", ",");
    return editedEmail;
}


async function signUpUser() {
    resetConfirmCheckBoxMsgError();

    const name = nameSignUp.value.trim();
    const email = emailSignUp.value.trim();
    const password = passwordSignUp.value;
    const confirmPassword = confirmSignUp.value;

   
    nameSignUp.classList.remove('wrong-input');
    emailSignUp.classList.remove('wrong-input');
    passwordSignUp.classList.remove('wrong-input');
    confirmSignUp.classList.remove('wrong-input');
    errorMsgSignUp.classList.add('hidden');

    
    if (!name || name.length < 2) {
        nameSignUp.classList.add('wrong-input');
        nameSignUp.focus();
        notificationPopUp("Please enter your full name (at least 2 characters)");
        return;
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        emailSignUp.classList.add("wrong-input");
        emailSignUp.focus();
        notificationPopUp("Please enter a valid email address");
        return;
    }

   
    if (password.length < 6) {
        passwordSignUp.classList.add('wrong-input');
        passwordSignUp.focus();
        notificationPopUp("Password must be at least 6 characters long");
        return;
    }

   
    if (!matchingPassword(password, confirmPassword)) {
        errorPasswords(errorMsgSignUp, passwordSignUp, confirmPasswordSignUp);
        return;
    }

   
    if (!checkPrivacyPolicy(inputCheckboxSignUp)) return;

    
    setSignedUser(nameSignUp, emailSignUp, passwordSignUp);
    let users = await loadData("users");

    if (checkFoundUser(emailSignUp, users)) {
        emailAlreadyLinked(emailSignUp);
        return;
    }

   
    await patchData("users/" + editEmailToKey(email), signedUser);
    resetSignUpInputs(emailSignUp, nameSignUp, passwordSignUp, confirmSignUp);
    showSucessSignedUp();
}


/**
 * This function checks if a user already exists
 * @param {HTMLElement} email 
 * @param {Array} users
 */
function checkFoundUser(email, users) {
    const userArray = Object.values(users);
    const foundUser = userArray.find(u => u.email === email.value);

    return foundUser != undefined;
}

/**
 * This function resets the error messages
 */
function resetConfirmCheckBoxMsgError() {
    confirmPasswordSignUp.classList.remove('wrong-input');
    inputCheckboxSignUp.classList.remove('unchecked-privacy');
    errorMsgSignUp.classList.add('hidden');
}

/**
 * This function checks if the privacy policy is accepted
 * @param {HTMLElement} inputCheckbox 
 */
function checkPrivacyPolicy(inputCheckbox) {
    let privacyAccepted = document.getElementById("privacy-checkbox");
    if (privacyAccepted.value == 'true') {
        return true;
    } else {
    
        notificationPopUp("Privacy policy must be accepted!");
        inputCheckbox.classList.add('unchecked-privacy');
        privacyAccepted.focus();
        return false;
    }
}

/**
 * This function sets new values to the global object signedUser
 * @param {HTMLElement} email 
 * @param {HTMLElement} name  
 * @param {HTMLElement} password 
 */
function setSignedUser (name, email, password) {
    signedUser.name = capitalizeNames(name.value);
    signedUser.email = email.value;
    signedUser.password = password.value;
}

/**
 * This function shows the error messages when the passwords do not match
 * @param {HTMLElement} errorMsg 
 * @param {HTMLElement} confirmPassword  
 * @param {HTMLElement} password 
 */
function errorPasswords(errorMsg, password, confirmPassword) {
    //passwords do not match
    errorMsg.innerHTML = "Your passwords don't match. Please try again.";
    errorMsg.classList.remove('hidden');
    confirmPassword.classList.add('wrong-input');
    password.focus();
}

/**
 * This function shows error message if an email is already linked
 * @param {HTMLElement} email
 */
function emailAlreadyLinked(email) {
    //Email is already linked to an account
    notificationPopUp("Email is already linked to an account!");
    email.classList.add('wrong-input');
    email.focus();
}

/**
 * This function resets the sign up inputs values
 * @param {HTMLElement} confirm 
 * @param {HTMLElement} email 
 * @param {HTMLElement} name  
 * @param {HTMLElement} password 
 */
function resetSignUpInputs(email, name, password, confirm) {
    email.classList.remove('wrong-input');
    name.value = "";
    email.value = "";
    password.value = "";
    confirm.value = "";
}

/**
 * This function capitalizes the name value
 * @param {String} name
 */
function capitalizeNames(name) {
    return name.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

/**
 * This function shows the successful message of a new signed up user
 * and redirect the user to index.html, the login page.
 */
function showSucessSignedUp() {
    // Show success message on successful sign-up
    const successMessage = document.querySelector('.success-signed');
    successMessage.style.display = 'flex';

    // Hide the success message after a few seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
        window.location.href = "./index.html";
    }, 2000); // Duration as needed
}

/**
 * This function shows a pop up notification with its message value.
 * @param {String} msg
 */
function notificationPopUp(msg = "") {
    // Show notification
    const notificationMessage = document.querySelector('.notification');
    let spanMessage = document.getElementById("pop-up-notification");

    spanMessage.innerHTML = msg;
    notificationMessage.style.display = 'flex';

    // Hide the notification after a few seconds
    setTimeout(() => {
        notificationMessage.style.display = 'none';
    }, 1500); // Duration as needed
}

/**
 * This function checks and sets the last saved email address to the email input field.
 */
function rememberMe() {
    let savedEmail = localStorage.getItem("join-saved-email");
    if (savedEmail != null) {
        document.getElementById("login-email").value = savedEmail;
        document.querySelector(".checkbox-login").checked = true;
    }
}

/**
 * This function checks if remember me checkbox is checked.
 */
function checkRememberMe() {
    const checkBox = document.querySelector(".checkbox-login");
    if (checkBox.checked) {
        const email = document.getElementById("login-email").value;
        localStorage.setItem("join-saved-email", email);
    } else {
        localStorage.removeItem("join-saved-email");
    }
}

/**
 * This function checks if the typed email is valid.
 * @param {Event} event 
 */
function validateEmailInput(event) {
    const emailInput = event.target;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(emailInput.value)) {
        emailInput.classList.remove('wrong-input');
    } else {
        emailInput.classList.add('wrong-input');
        notificationPopUp("Please enter a valid email address");
        emailInput.focus();
    }
}