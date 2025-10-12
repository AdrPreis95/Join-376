// /**
//  * Handles signup form UI behavior:
//  * - Validates and updates email, password, and confirm password fields
//  * - Toggles visibility icons for password fields
//  * - Updates checkbox value and styling based on user interaction
//  * - Shows or hides error messages depending on input state*/
// const inputEmail = document.getElementById("signup-email");
// const passwordIcon = document.querySelector(".password-icon");
// const confirmIcon = document.querySelector(".confirm-icon");
// const inputPassword = document.querySelector(".password-signup");
// const confirmPassword = document.querySelector(".password-confirm");
// const checkBox = document.querySelector(".checkbox-privacy");
// const inputCheckbox = document.querySelector(".input-checkbox");
// const errorMsg = document.querySelector(".error-message");

// /**Removes error state from email input when cleared.*/
// inputEmail.addEventListener('keyup', function(){
//     if (inputEmail.value === "") {
//         inputEmail.classList.remove('wrong-input');
//     }
// });

// /**Validates email format when the field loses focus,
//  * or removes error state if the field is empty.*/
// inputEmail.addEventListener('focusout', function(event){
//     if (inputEmail.value !== "") {
//         validateEmailInput(event);
//     } else {
//         inputEmail.classList.remove('wrong-input');
//     }
// });

// /**Updates password icon and input type based on content.
//  * Resets confirm password error state if password is cleared.*/
// inputPassword.addEventListener('keyup', function(){
//     if (inputPassword.value !== "") {
//         passwordIcon.classList.remove('lock-icon');
//         passwordIcon.classList.add('eye-slash-icon');
//     } else {
//         inputPassword.setAttribute('type', 'password');
//         passwordIcon.classList.remove('eye-slash-icon', 'eye-icon');
//         passwordIcon.classList.add('lock-icon');
//         if (confirmPassword.value === "") {
//             confirmPassword.classList.remove('wrong-input');
//             errorMsg.classList.add('hidden');
//         }
//     }
// });

// /**Updates confirm password icon and input type based on content.
//  *Resets error state if confirm password is cleared and password is empty.*/
// confirmPassword.addEventListener('keyup', function(){
//     if (confirmPassword.value !== "") {
//         confirmIcon.classList.remove('lock-icon');
//         confirmIcon.classList.add('eye-slash-icon');
//     } else {
//         confirmPassword.setAttribute('type', 'password');
//         confirmIcon.classList.remove('eye-slash-icon', 'eye-icon');
//         confirmIcon.classList.add('lock-icon');
//         if (inputPassword.value === "") {
//             confirmPassword.classList.remove('wrong-input');
//             errorMsg.classList.add('hidden');
//         }
//     }
// });

// // Tracks password visibility state
// var password = true;

// /**Toggles visibility of the main password field when clicking the icon.*/
// passwordIcon.addEventListener('click', function(){
//     if (inputPassword.value !== "") {
//         if (password) {
//             inputPassword.setAttribute('type', 'text');
//             passwordIcon.classList.remove('eye-icon');
//             passwordIcon.classList.add('eye-slash-icon');
//         } else {
//             inputPassword.setAttribute('type', 'password');
//             passwordIcon.classList.remove('eye-slash-icon');
//             passwordIcon.classList.add('eye-icon');
//         }
//         inputPassword.focus();
//         password = !password;   
//     } else {
//         inputPassword.focus();
//     }   
// });

// // Tracks confirm password visibility state
// var confirmPass = true;

// /**Toggles visibility of the confirm password field when clicking the icon.*/
// confirmIcon.addEventListener('click', function(){
//     if (confirmPassword.value !== "") {
//         if (confirmPass) {
//             confirmPassword.setAttribute('type', 'text');
//             confirmIcon.classList.remove('eye-icon');
//             confirmIcon.classList.add('eye-slash-icon');
//         } else {
//             confirmPassword.setAttribute('type', 'password');
//             confirmIcon.classList.remove('eye-slash-icon');
//             confirmIcon.classList.add('eye-icon');
//         }
//         confirmPassword.focus();
//         confirmPass = !confirmPass;   
//     } else {
//         confirmPassword.focus();}   
// });

// /**Updates checkbox value and removes visual error state when checked.*/
// checkBox.addEventListener('change', function(){
//     if (checkBox.checked) {
//         checkBox.value = true;
//         inputCheckbox.classList.remove('unchecked-privacy');
//     } else {
//         checkBox.value = false;
//     }
// });
/**
 * Handles signup form UI behavior:
 * - Validates and updates email, password, and confirm password fields
 * - Toggles visibility icons for password fields
 * - Updates checkbox value and styling based on user interaction
 * - Shows or hides error messages depending on input state
 */
const inputEmail = document.getElementById("signup-email");
const passwordIcon = document.querySelector(".password-icon");
const confirmIcon = document.querySelector(".confirm-icon");
const inputPassword = document.querySelector(".password-signup");
const confirmPassword = document.querySelector(".password-confirm");
const checkBox = document.querySelector(".checkbox-privacy");
const inputCheckbox = document.querySelector(".input-checkbox");
const errorMsg = document.querySelector(".error-message");

/**Removes error state from email input when cleared.*/
inputEmail.addEventListener('keyup', function () {
  if (inputEmail.value === "") inputEmail.classList.remove('wrong-input');
});

/**Validates email format when the field loses focus,
 * or removes error state if the field is empty.*/
inputEmail.addEventListener('focusout', function (event) {
  if (inputEmail.value !== "") {
    validateEmailInput(event);
  } else {
    inputEmail.classList.remove('wrong-input');
  }
});

/**Updates password icon and input type based on content.
 * Resets confirm password error state if password is cleared.*/
inputPassword.addEventListener('keyup', function () {
  if (inputPassword.value !== "") {
    passwordIcon.classList.remove('lock-icon');
    passwordIcon.classList.add('eye-slash-icon');
  } else {
    inputPassword.setAttribute('type', 'password');
    passwordIcon.classList.remove('eye-slash-icon', 'eye-icon');
    passwordIcon.classList.add('lock-icon');
    if (confirmPassword.value === "") {
      confirmPassword.classList.remove('wrong-input');
      errorMsg.classList.add('hidden');
    }
  }
});

/**Updates confirm password icon and input type based on content.
 *Resets error state if confirm password is cleared and password is empty.*/
confirmPassword.addEventListener('keyup', function () {
  if (confirmPassword.value !== "") {
    confirmIcon.classList.remove('lock-icon');
    confirmIcon.classList.add('eye-slash-icon');
  } else {
    confirmPassword.setAttribute('type', 'password');
    confirmIcon.classList.remove('eye-slash-icon', 'eye-icon');
    confirmIcon.classList.add('lock-icon');
    if (inputPassword.value === "") {
      confirmPassword.classList.remove('wrong-input');
      errorMsg.classList.add('hidden');
    }
  }
});

// Tracks password visibility state
var password = true;

/**Toggles visibility of the main password field when clicking the icon.*/
passwordIcon.addEventListener('click', function () {
  if (inputPassword.value !== "") {
    if (password) {
      inputPassword.setAttribute('type', 'text');
      passwordIcon.classList.remove('eye-icon');
      passwordIcon.classList.add('eye-slash-icon');
    } else {
      inputPassword.setAttribute('type', 'password');
      passwordIcon.classList.remove('eye-slash-icon');
      passwordIcon.classList.add('eye-icon');
    }
    inputPassword.focus();
    password = !password;
  } else {
    inputPassword.focus();
  }
});

// Tracks confirm password visibility state
var confirmPass = true;

/**Toggles visibility of the confirm password field when clicking the icon.*/
confirmIcon.addEventListener('click', function () {
  if (confirmPassword.value !== "") {
    if (confirmPass) {
      confirmPassword.setAttribute('type', 'text');
      confirmIcon.classList.remove('eye-icon');
      confirmIcon.classList.add('eye-slash-icon');
    } else {
      confirmPassword.setAttribute('type', 'password');
      confirmIcon.classList.remove('eye-slash-icon');
      confirmIcon.classList.add('eye-icon');
    }
    confirmPassword.focus();
    confirmPass = !confirmPass;
  } else {
    confirmPassword.focus();
  }
});

/**Updates checkbox value and removes visual error state when checked.*/
checkBox.addEventListener('change', function () {
  if (checkBox.checked) {
    checkBox.value = true;
    inputCheckbox.classList.remove('unchecked-privacy');
  } else {
    checkBox.value = false;
  }
});
