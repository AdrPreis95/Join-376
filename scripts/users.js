let loggedUser = {};
let signedUser = { 
    "email": "",
    "name": "",
    "password": ""
};
const BASE_URL = 'https://join-376-dd26c-default-rtdb.europe-west1.firebasedatabase.app/';

async function loadData(path = "") {
    let response = await fetch(BASE_URL + path + ".json");
    return responseToJson = await response.json();    
}

async function patchData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method : "PATCH",
        headers : {
            "Content-Type" : "application/json",
        },
        body : JSON.stringify(data)
    });
    
    return responseToJson = await response.json();    
}

async function loadUser() {
    let email = document.getElementById("login-email");
    let password = document.getElementById("login-password");
    let errorMsg = document.getElementById("check-email-password");
    errorMsg.innerHTML = "";

    if (email.value != "") {
        email.classList.remove("wrong-input");

        if(password.value != "") {
            password.classList.remove("wrong-input");

            let gettedUser = await loadData("users/" + editEmailToKey(email.value)); 
            
            if (gettedUser) {
                if (matchingPassword(gettedUser.password, password.value)){
                    
                    loggedUser = gettedUser;
                    checkRememberMe(); //The user's email will be stored in a storage, if checkbox Remember me is checked 
                    email.value = "";
                    password.value = "";

                    console.log("You are logged in");
                    console.log(loggedUser);
                    rememberMe();

                } else {
                    //passwords do not match
                    errorMsg.innerHTML = "Check your email and password. Please try again.";
                    password.classList.add("wrong-input");
                    email.classList.add("wrong-input");
                }
            } else {
                //user does not exist
                errorMsg.innerHTML = "Check your email and password. Please try again.";
                password.classList.add("wrong-input");
                email.classList.add("wrong-input");
            }

        } else {
            password.classList.add("wrong-input");
            password.focus();
        }
    } else {
        email.classList.add("wrong-input");
        email.focus();
    }
}

async function loadGuestUser() {
    loggedUser = await loadData("users/guest");
    console.log("You are logged in as guest");
    console.log(loggedUser);
}

function matchingPassword (firstPassword = "", secondPassword = "") {
    return firstPassword === secondPassword;
}

function editEmailToKey (email = "") {
    let editedEmail = email.replaceAll(".", ",");
    return editedEmail;
}

async function signUpUser() {
    let name = document.getElementById("signup-name");
    let email = document.getElementById("signup-email");
    let password = document.getElementById("signup-password");
    let confirm = document.getElementById("confirm-password");
    
    const confirmPassword = document.querySelector(".password-confirm");
    confirmPassword.classList.remove('wrong-input');
    const inputCheckbox = document.querySelector(".input-checkbox");
    inputCheckbox.classList.remove('unchecked-privacy');
    
    var privacyAccepted = document.getElementById("privacy-checkbox");
    let errorMsg = document.getElementById("check-password");
    errorMsg.innerHTML = "";

    if (privacyAccepted.value == 'true') {

        if (matchingPassword(password.value, confirm.value)) {
            signedUser.name = name.value;
            signedUser.email = email.value;
            signedUser.password = password.value;

            // Load users data
            let users = await loadData("users");

            // Ensure users is an object or array before processing
            if (!users || typeof users !== 'object') {
                console.error("Users data is not an object or is undefined:", users);
                return false;
            }

            // Use Object.values() to get an array of user objects.
            const userArray = Object.values(users);

            // Use .find() to locate the user with the desired email.
            const foundUser = userArray.find(u => u.email === email.value);


            if (foundUser != undefined) {
                //Email is already linked to an account
                notificationPopUp("Email is already linked to an account!");
                email.classList.add('wrong-input');
                email.focus();
            } else {
                await patchData("users/" + editEmailToKey(email.value) , signedUser);
                email.classList.remove('wrong-input');

                name.value = "";
                email.value = "";
                password.value = "";
                confirm.value = "";

                showSucessSignedUp();
            }
            
        } else {
            //passwords do not match
            errorMsg.innerHTML = "Your passwords don't match. Please try again.";
            confirmPassword.classList.add('wrong-input');
            password.focus();
        }
    }else {
        //privacy policy must be accepted
        notificationPopUp("Privacy policy must be accepted!");
        inputCheckbox.classList.add('unchecked-privacy');
        privacyAccepted.focus();
    }
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

function rememberMe(){
    let savedEmail = localStorage.getItem("join-saved-email");
    if(savedEmail != null){
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