/** Caches signup form elements. */
const inputEmail = document.getElementById("signup-email");
const passwordIcon = document.querySelector(".password-icon");
const confirmIcon = document.querySelector(".confirm-icon");
const inputPassword = document.querySelector(".password-signup");
const confirmPassword = document.querySelector(".password-confirm");
const checkBox = document.querySelector(".checkbox-privacy");
const inputCheckbox = document.querySelector(".input-checkbox");
const errorMsg = document.querySelector(".error-message");

/** Tracks main password visibility state. */
let password = true;

/** Tracks confirm password visibility state. */
let confirmPass = true;

/** Removes email error state while typing when field becomes empty. */
function onEmailKeyup() { if (inputEmail.value === "") inputEmail.classList.remove('wrong-input'); };

/** Validates email on blur or clears error when the field is empty. */
function onEmailBlur(e) {
  if (inputEmail.value !== "") validateEmailInput(e);
  else inputEmail.classList.remove('wrong-input');
};

/** Updates main password icon/type and resets confirm error when cleared. */
function onPasswordKeyup() {
  if (inputPassword.value !== "") {
    passwordIcon.classList.remove('lock-icon'); passwordIcon.classList.add('eye-slash-icon');
  } else {
    inputPassword.type = 'password';
    passwordIcon.classList.remove('eye-slash-icon', 'eye-icon'); passwordIcon.classList.add('lock-icon');
    if (confirmPassword.value === "") { confirmPassword.classList.remove('wrong-input'); errorMsg.classList.add('hidden'); }
  }
};

/** Updates confirm password icon/type and resets error when cleared. */
function onConfirmKeyup() {
  if (confirmPassword.value !== "") {
    confirmIcon.classList.remove('lock-icon'); confirmIcon.classList.add('eye-slash-icon');
  } else {
    confirmPassword.type = 'password';
    confirmIcon.classList.remove('eye-slash-icon', 'eye-icon'); confirmIcon.classList.add('lock-icon');
    if (inputPassword.value === "") { confirmPassword.classList.remove('wrong-input'); errorMsg.classList.add('hidden'); }
  }
};

/** Toggles visibility for the main password field when icon is clicked. */
function onPasswordIconClick() {
  if (inputPassword.value === "") return inputPassword.focus();
  if (password) { inputPassword.type = 'text'; passwordIcon.classList.remove('eye-icon'); passwordIcon.classList.add('eye-slash-icon'); }
  else          { inputPassword.type = 'password'; passwordIcon.classList.remove('eye-slash-icon'); passwordIcon.classList.add('eye-icon'); }
  inputPassword.focus(); password = !password;
};

/** Toggles visibility for confirm password when icon is clicked. */
function onConfirmIconClick() {
  if (confirmPassword.value === "") return confirmPassword.focus();
  if (confirmPass) { confirmPassword.type = 'text'; confirmIcon.classList.remove('eye-icon'); confirmIcon.classList.add('eye-slash-icon'); }
  else             { confirmPassword.type = 'password'; confirmIcon.classList.remove('eye-slash-icon'); confirmIcon.classList.add('eye-icon'); }
  confirmPassword.focus(); confirmPass = !confirmPass;
};

/** Updates checkbox value and removes visual error state when checked. */
function onPrivacyChange() {
  if (checkBox.checked) { checkBox.value = true; inputCheckbox.classList.remove('unchecked-privacy'); }
  else checkBox.value = false;
};

/** Wires all signup UI event listeners. */
function bindSignupListeners() {
  inputEmail.addEventListener('keyup', onEmailKeyup);
  inputEmail.addEventListener('focusout', onEmailBlur);
  inputPassword.addEventListener('keyup', onPasswordKeyup);
  confirmPassword.addEventListener('keyup', onConfirmKeyup);
  passwordIcon.addEventListener('click', onPasswordIconClick);
  confirmIcon.addEventListener('click', onConfirmIconClick);
  checkBox.addEventListener('change', onPrivacyChange);
};
bindSignupListeners();
