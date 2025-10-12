/**This if statement checks if the user is logged in and
* redirect the user to the summary page.*/
let loggedUser = {};
if (sessionStorage.loggedUser != undefined) {
    window.location.href = "./summary.html";
}

/**Mail,Name,Password of the Signed Users Value */
let signedUser = {
    "email": "",
    "name": "",
    "password": ""
};

/**All Inputs,Checkboxes,Errormessages Handling and the Base URL of Firebase */
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

/**This function loads tasks from Firebase according to their path. */
async function loadData(path = "") {
    let response = await fetch(BASE_URL + path + ".json");
    return responseToJson = await response.json();
}

/**This function update tasks from Firebase according to their path.*/
async function patchData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)});

    return responseToJson = await response.json();
}

/** Loads a user by validating input and checking credentials. */
async function loadUser() {
    resetLoginErrors();
    const email = emailLogin.value.trim();
    const password = passwordLogin.value;

    if (!validateEmailInput(email)) return;
    if (!validatePasswordInput(password)) return;

    const user = await loadData("users/" + editEmailToKey(email));
    handleUserLogin(user, email, password);
}

/** Resets all login-related error messages and styles. */
function resetLoginErrors() {
    errorMsgLogin.classList.add('hidden');
    emailLogin.classList.remove("wrong-input");
    passwordLogin.classList.remove("wrong-input");
}

/** Validates the email input and shows errors if needed. */
function validateEmailInput(email) {
    if (!email) {
        showLoginError(emailLogin, "Please enter your email.");
        return false;}

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showLoginError(emailLogin, "Please enter a valid email address.");
        return false; }
        return true;
}

/** Validates the password input and shows errors if missing. */
function validatePasswordInput(password) {
    if (!password) {
        showLoginError(passwordLogin, "Please enter your password.");
        return false;
    }
    return true;
}

/** Displays a login error message and focuses the input field. */
function showLoginError(inputElement, message) {
    inputElement.classList.add("wrong-input");
    inputElement.focus();
    errorMsgLogin.textContent = message;
    errorMsgLogin.classList.remove("hidden");
}

/** Handles user login logic based on validation results. */
function handleUserLogin(user, email, password) {
    if (user) {
        if (matchingPassword(user.password, password)) {
            redirectToSummary(user, emailLogin, passwordLogin);
        } else {
            showErrorMsg(errorMsgLogin, passwordLogin, emailLogin);
        }
    } else {
        showErrorMsg(errorMsgLogin, passwordLogin, emailLogin);
    }
}

/**This function checks if the email input field is not empty*/
function checkInputEmail(email) {
    if (email.value != "") {
        email.classList.remove("wrong-input");
        return true;
    } else {
        email.classList.add("wrong-input");
        email.focus();
        return false;
    }
}

/**This function checks if the password input field is not empty */
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

/**This function redirects the user to summary page*/
function redirectToSummary(gettedUser, email, password) {
    loggedUser = gettedUser;
    sessionStorage.setItem("loggedUser", JSON.stringify(loggedUser));
    checkRememberMe(); //The user's email will be stored in a storage, if checkbox Remember me is checked 
    email.value = "";
    password.value = "";
    rememberMe();
    window.location.href = "./summary.html";
}

/**This function shows the error message*/
function showErrorMsg(errorMsg, password, email) {
    errorMsg.innerHTML = "Check your email and password. Please try again.";
    errorMsg.classList.remove('hidden');
    password.classList.add("wrong-input");
    email.classList.add("wrong-input");
    sessionStorage.removeItem("loggedUser");
}

/**This function loads user as guest */
async function loadGuestUser() {
    loggedUser = await loadData("users/guest");
    sessionStorage.setItem("loggedUser", JSON.stringify(loggedUser));
    window.location.href = "./summary.html";
}

/**This function matches two passwords input values. */
function matchingPassword(firstPassword = "", secondPassword = "") {
    return firstPassword === secondPassword;
}

/**This function converts email input value to firebase key */
function editEmailToKey(email = "") {
    let editedEmail = email.replaceAll(".", ",");
    return editedEmail;
}


/**Handles the complete sign-up process: */
async function signUpUser() {
    resetConfirmCheckBoxMsgError();
    clearSignUpErrors();

    const name = nameSignUp.value.trim();
    const email = emailSignUp.value.trim();
    const password = passwordSignUp.value;
    const confirmPassword = confirmSignUp.value;

    if (!validateInputs(name, email, password, confirmPassword)) return;
    if (!checkPrivacyPolicy(inputCheckboxSignUp)) return;

    await handleUserSignUp(name, email, password);
}

/**Clears Signup Errors from all Inputs */
function clearSignUpErrors() {
    nameSignUp.classList.remove('wrong-input');
    emailSignUp.classList.remove('wrong-input');
    passwordSignUp.classList.remove('wrong-input');
    confirmSignUp.classList.remove('wrong-input');
    errorMsgSignUp.classList.add('hidden');
}

/**Validates the Values of Signup Inputs */
function validateInputs(name, email, password, confirmPassword) {
    if (!validateName(name)) return false;
    if (!validateEmail(email)) return false;
    if (!validatePassword(password)) return false;
    if (!matchingPassword(password, confirmPassword)) {
        errorPasswords(errorMsgSignUp, passwordSignUp, confirmSignUp);
        return false;
    }
    return true;
}

/**Validates the Namefield of Signup Input */
function validateName(name) {
    if (!name || name.length < 2) {
        nameSignUp.classList.add('wrong-input');
        nameSignUp.focus();
        notificationPopUp("Please enter your full name (at least 2 characters)");
        return false;
    }
    return true;
}

/**Validates the Mailfield of Signup Input */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        emailSignUp.classList.add("wrong-input");
        emailSignUp.focus();
        notificationPopUp("Please enter a valid email address");
        return false;
    }
    return true;
}

/**Validates the Password Value of Signup Input */
function validatePassword(password) {
    if (password.length < 6) {
        passwordSignUp.classList.add('wrong-input');
        passwordSignUp.focus();
        notificationPopUp("Password must be at least 6 characters long");
        return false;
    }
    return true;
}

/**Handles the User Signup (Name,Mail,Password) */
async function handleUserSignUp(name, email, password) {
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


/**This function checks if a user already exists*/
function checkFoundUser(email, users) {
    const userArray = Object.values(users);
    const foundUser = userArray.find(u => u.email === email.value);

    return foundUser != undefined;
}


/**This function resets the error messages*/
function resetConfirmCheckBoxMsgError() {
    confirmPasswordSignUp.classList.remove('wrong-input');
    inputCheckboxSignUp.classList.remove('unchecked-privacy');
    errorMsgSignUp.classList.add('hidden');
}

/**This function checks if the privacy policy is accepted*/
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

/**This function sets new values to the global object signedUser*/
function setSignedUser(name, email, password) {
    signedUser.name = capitalizeNames(name.value);
    signedUser.email = email.value;
    signedUser.password = password.value;
}

/**This function shows the error messages when the passwords do not match*/
function errorPasswords(errorMsg, password, confirmPassword) {
    
    errorMsg.innerHTML = "Your passwords don't match. Please try again.";
    errorMsg.classList.remove('hidden');
    confirmPassword.classList.add('wrong-input');
    password.focus();
}

/**This function shows error message if an email is already linked*/
function emailAlreadyLinked(email) {
    notificationPopUp("Email is already linked to an account!");
    email.classList.add('wrong-input');
    email.focus();
}

/**This function resets the sign up inputs values*/
function resetSignUpInputs(email, name, password, confirm) {
    email.classList.remove('wrong-input');
    name.value = "";
    email.value = "";
    password.value = "";
    confirm.value = "";
}

/**This function capitalizes the name value*/
function capitalizeNames(name) {
    return name.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

/**This function shows the successful message of a new signed up user*/
function showSucessSignedUp() {
    const successMessage = document.querySelector('.success-signed');
    successMessage.style.display = 'flex';
    setTimeout(() => {
        successMessage.style.display = 'none';
        window.location.href = "./index.html";
    }, 2000); 
}

/**This function shows a pop up notification with its message value.*/
function notificationPopUp(msg = "") {
    const notificationMessage = document.querySelector('.notification');
    let spanMessage = document.getElementById("pop-up-notification");

    spanMessage.innerHTML = msg;
    notificationMessage.style.display = 'flex';

    setTimeout(() => {
        notificationMessage.style.display = 'none';
    }, 1500); 
}

/**This function checks and sets the last saved email address to the email input field.*/
function rememberMe() {
    let savedEmail = localStorage.getItem("join-saved-email");
    if (savedEmail != null) {
        document.getElementById("login-email").value = savedEmail;
        document.querySelector(".checkbox-login").checked = true;
    }
}

/**This function checks if remember me checkbox is checked.*/
function checkRememberMe() {
    const checkBox = document.querySelector(".checkbox-login");
    if (checkBox.checked) {
        const email = document.getElementById("login-email").value;
        localStorage.setItem("join-saved-email", email);
    } else {
        localStorage.removeItem("join-saved-email");
    }
}

/**This function checks if the typed email is valid.*/
function isValidEmail(s){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }

/**This function checks if the typed email input is valid.*/
function validateEmailInput(email){
  if (!email) {
    showLoginError(emailLogin, "Please enter your email.");
    return false;
  }
  if (!isValidEmail(email)) {
    showLoginError(emailLogin, "Please enter a valid email address.");
    return false;
  }
  return true;
}

/**This function checks if the typed email input is valid.*/
function validateEmailField(event){
  const el = event?.target || emailLogin;
  if (isValidEmail(el.value)) {
    el.classList.remove('wrong-input');
    return true;
  }
  el.classList.add('wrong-input');
  notificationPopUp("Please enter a valid email address");
  el.focus();
  return false;
}
