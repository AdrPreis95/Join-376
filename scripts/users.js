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

async function loadData(path = "") {
    let response = await fetch(BASE_URL + path + ".json");
    return responseToJson = await response.json();
}

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

async function loadUser() {
    errorMsgLogin.classList.add('hidden');
    if (checkInputEmail(emailLogin)) {
        if (checkInputPassword(passwordLogin)) {
            let gettedUser = await loadData("users/" + editEmailToKey(emailLogin.value));
            if (gettedUser) {
                if (matchingPassword(gettedUser.password, passwordLogin.value)) {
                    redirectToSummary(gettedUser, emailLogin, passwordLogin);
                } else {                    
                    showErrorMsg(errorMsgLogin, passwordLogin, emailLogin); //because passwords do not match
                }
            } else {                
                showErrorMsg(errorMsgLogin, passwordLogin, emailLogin);//beacuse user does not exist
            }
        }
    }
}

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

function redirectToSummary(gettedUser, email, password){
    loggedUser = gettedUser;
    sessionStorage.setItem("loggedUser", JSON.stringify(loggedUser));
    checkRememberMe(); //The user's email will be stored in a storage, if checkbox Remember me is checked 
    email.value = "";
    password.value = "";
    rememberMe();
    window.location.href = "./summary.html";
}

function showErrorMsg(errorMsg, password, email) {
    errorMsg.innerHTML = "Check your email and password. Please try again.";
    errorMsg.classList.remove('hidden');
    password.classList.add("wrong-input");
    email.classList.add("wrong-input");
    sessionStorage.removeItem("loggedUser");
}

async function loadGuestUser() {
    loggedUser = await loadData("users/guest");
    sessionStorage.setItem("loggedUser", JSON.stringify(loggedUser));
    window.location.href = "./summary.html";
}

function matchingPassword(firstPassword = "", secondPassword = "") {
    return firstPassword === secondPassword;
}

function editEmailToKey(email = "") {
    let editedEmail = email.replaceAll(".", ",");
    return editedEmail;
}

async function signUpUser() {
    resetConfirmCheckBoxMsgError();
    if (checkPrivacyPolicy(inputCheckboxSignUp)) {
        if (matchingPassword(passwordSignUp.value, confirmSignUp.value)) {
            setSignedUser (nameSignUp, emailSignUp, passwordSignUp);
            let users = await loadData("users");// Load users data
            if (checkFoundUser(emailSignUp, users)) {
                emailAlreadyLinked(emailSignUp);
            } else {
                await patchData("users/" + editEmailToKey(emailSignUp.value), signedUser);
                resetSignUpInputs(emailSignUp, nameSignUp, passwordSignUp, confirmSignUp);
                showSucessSignedUp();
            }
        } else
            errorPasswords(errorMsgSignUp, passwordSignUp, confirmPasswordSignUp);
    }
}

function checkFoundUser(email, users) {
    // Use Object.values() to get an array of user objects.
    const userArray = Object.values(users);
    // Use .find() to locate the user with the desired email.
    const foundUser = userArray.find(u => u.email === email.value);

    if(foundUser != undefined){
        return true;
    } else
        return false;
}

function resetConfirmCheckBoxMsgError() {
    confirmPasswordSignUp.classList.remove('wrong-input');
    inputCheckboxSignUp.classList.remove('unchecked-privacy');
    errorMsgSignUp.classList.add('hidden');
}

function checkPrivacyPolicy(inputCheckbox) {
    let privacyAccepted = document.getElementById("privacy-checkbox");
    if (privacyAccepted.value == 'true') {
        return true;
    } else {
        //privacy policy must be accepted
        notificationPopUp("Privacy policy must be accepted!");
        inputCheckbox.classList.add('unchecked-privacy');
        privacyAccepted.focus();
        return false;
    }
}

function setSignedUser (name, email, password) {
    signedUser.name = capitalizeNames(name.value);
    signedUser.email = email.value;
    signedUser.password = password.value;
}

function errorPasswords(errorMsg, password, confirmPassword) {
    //passwords do not match
    errorMsg.innerHTML = "Your passwords don't match. Please try again.";
    errorMsg.classList.remove('hidden');
    confirmPassword.classList.add('wrong-input');
    password.focus();
}

function emailAlreadyLinked(email) {
    //Email is already linked to an account
    notificationPopUp("Email is already linked to an account!");
    email.classList.add('wrong-input');
    email.focus();
}

function resetSignUpInputs(email, name, password, confirm) {
    email.classList.remove('wrong-input');
    name.value = "";
    email.value = "";
    password.value = "";
    confirm.value = "";
}

function capitalizeNames(name) {
    return name.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

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

function rememberMe() {
    let savedEmail = localStorage.getItem("join-saved-email");
    if (savedEmail != null) {
        document.getElementById("login-email").value = savedEmail;
        document.querySelector(".checkbox-login").checked = true;
    }
}

function checkRememberMe() {
    const checkBox = document.querySelector(".checkbox-login");
    if (checkBox.checked) {
        const email = document.getElementById("login-email").value;
        localStorage.setItem("join-saved-email", email);
    } else {
        localStorage.removeItem("join-saved-email");
    }
}

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