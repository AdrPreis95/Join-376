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

    if (email.value != "") {
        email.classList.remove("wrong-input");

        if(password.value != "") {
            password.classList.remove("wrong-input");

            let gettedUser = await loadData("users/" + editEmailToKey(email.value)); 
            
            if (gettedUser) {
                if (matchingPassword(gettedUser.password, password.value)){
                    
                    loggedUser = gettedUser;

                    console.log("You are logged in");

                } else {
                    //passwords do not match
                    console.log("passwords do not match");
                }
            } else {
                //user does not exist
                console.log("user does not exist");
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
    let name = document.getElementById("signup-name").value;
    let email = document.getElementById("signup-email").value;
    let password = document.getElementById("signup-password").value;
    let confirm = document.getElementById("confirm-password").value;
    var privacyAccepted = document.getElementById("privacy-checkbox").value;

    if (privacyAccepted == 'true') {

        if (matchingPassword(password, confirm)) {
            signedUser.name = name;
            signedUser.email = email;
            signedUser.password = password;
            
            console.log(signedUser);

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
            const foundUser = userArray.find(u => u.email === email);


            if (foundUser != undefined) {
                //Email is already linked to an account
                notificationPopUp("Email is already linked to an account!");
            } else {
                await patchData("users/" + editEmailToKey(email) , signedUser);
                showSucessSignedUp();
            }
            
        } else {
            //passwords do not match
            notificationPopUp("Passwords do not match!");
        }
    }else {
        //privacy policy must be accepted
        notificationPopUp("Privacy policy must be accepted!");
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