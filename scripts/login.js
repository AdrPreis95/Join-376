/**Handles login form UI behavior:
 * - Updates the error message and input styling dynamically based on user input
 * - Changes the password field icon and toggles visibility
 * - Controls the checkbox value for "remember me" functionality*/
const inputEmail = document.getElementById("login-email");
const passwordIcon = document.querySelector(".password-icon");
const inputPassword = document.querySelector(".password-login");
const checkBox = document.querySelector(".checkbox-login");
const errorMsg = document.querySelector(".error-message");

/**Removes error state from the email field when cleared,
 *and hides the error message if both email and password fields are empty. */
inputEmail.addEventListener('keyup', function(){
    if(inputEmail.value === "") {
        inputEmail.classList.remove('wrong-input');
        if(inputPassword.value === "") {
            errorMsg.classList.add('hidden');
        }
    }
});

/**Updates the password icon depending on whether the password field has content.
 *Resets the icon and field styling if the field is empty.*/
inputPassword.addEventListener('keyup', function(){
    if(inputPassword.value !== "") {
        passwordIcon.classList.remove('lock-icon');
        passwordIcon.classList.add('eye-slash-icon');
    } else {
        inputPassword.setAttribute('type','password');
        inputPassword.classList.remove('wrong-input');
        passwordIcon.classList.remove('eye-slash-icon');
        passwordIcon.classList.remove('eye-icon');
        passwordIcon.classList.add('lock-icon');
        if(inputEmail.value === "") {
            errorMsg.classList.add('hidden');
        }
    }
});

// Tracks the current password visibility state
var password = true;

/**Toggles password visibility when clicking the password icon.
*Shows the password as plain text or hides it as dots based on the current state.*/
passwordIcon.addEventListener('click', function(){
    if (inputPassword.value !== "") {
        if(password) {
            inputPassword.setAttribute('type','text'); 
            passwordIcon.classList.remove('eye-icon');
            passwordIcon.classList.add('eye-slash-icon');
            inputPassword.focus();
        } else {
            inputPassword.setAttribute('type','password');
            passwordIcon.classList.remove('eye-slash-icon');
            passwordIcon.classList.add('eye-icon');
            inputPassword.focus();
        }
        password = !password;   
    } else {
        inputPassword.focus();
    }   
});

/**Updates the checkbox value to reflect its checked state.*/
checkBox.addEventListener('change', function(){
    if (checkBox.checked){
        checkBox.value = true;
    } else {
        checkBox.value = false;
    }
});
