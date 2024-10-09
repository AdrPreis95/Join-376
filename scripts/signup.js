const passwordIcon = document.querySelector(".password-icon");
const confirmIcon = document.querySelector(".confirm-icon");
const inputPassword = document.querySelector(".password-signup");
const confirmPassword = document.querySelector(".password-confirm");
const checkBox = document.querySelector(".checkbox-privacy");

inputPassword.addEventListener('keyup', function(){
    if(inputPassword.value !== "") {
        passwordIcon.classList.remove('lock-icon');
        passwordIcon.classList.add('eye-slash-icon');
    }else {
        inputPassword.setAttribute('type','password');
        passwordIcon.classList.remove('eye-slash-icon');
        passwordIcon.classList.remove('eye-icon');
        passwordIcon.classList.add('lock-icon');
    }
});

confirmPassword.addEventListener('keyup', function(){
    if(confirmPassword.value !== "") {
        confirmIcon.classList.remove('lock-icon');
        confirmIcon.classList.add('eye-slash-icon');
    }else {
        confirmPassword.setAttribute('type','password');
        confirmIcon.classList.remove('eye-slash-icon');
        confirmIcon.classList.remove('eye-icon');
        confirmIcon.classList.add('lock-icon');
    }
});

var password = true;

passwordIcon.addEventListener('click', function(){
    if (inputPassword.value !== "") {
        if(password) {
            // change the input type attribute from "password" to "text"
            inputPassword.setAttribute('type','text'); 
            passwordIcon.classList.remove('eye-icon');
            passwordIcon.classList.add('eye-slash-icon');
            inputPassword.focus();
        } else {
            // change the input type attribute from "text" to "password"
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

var confirmPass = true;

confirmIcon.addEventListener('click', function(){
    if (confirmPassword.value !== "") {
        if(confirmPass) {
            // change the input type attribute from "password" to "text"
            confirmPassword.setAttribute('type','text'); 
            confirmIcon.classList.remove('eye-icon');
            confirmIcon.classList.add('eye-slash-icon');
            confirmPassword.focus();
        } else {
            // change the input type attribute from "text" to "password"
            confirmPassword.setAttribute('type','password');
            confirmIcon.classList.remove('eye-slash-icon');
            confirmIcon.classList.add('eye-icon');
            confirmPassword.focus();
        }
        confirmPass = !confirmPass;   
    } else {
        confirmPassword.focus();
    }   
});

checkBox.addEventListener('change', function(){
    if (checkBox.checked){
        checkBox.value = true;
    }else{
        checkBox.value = false;
    }
});