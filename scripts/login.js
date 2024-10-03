const passwordIcon = document.querySelector(".password-icon");
const inputPassword = document.querySelector(".password-login");
const checkBox = document.querySelector(".checkbox-login");

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

var password = true;

passwordIcon.addEventListener('click', function(){
    if (inputPassword.value !== "") {
        if(password) {
            // change the input type attribute from "password" to "text"
            inputPassword.setAttribute('type','text'); 
            passwordIcon.classList.remove('eye-icon');
            passwordIcon.classList.add('eye-slash-icon');
        } else {
            // change the input type attribute from "text" to "password"
            inputPassword.setAttribute('type','password');
            passwordIcon.classList.remove('eye-slash-icon');
            passwordIcon.classList.add('eye-icon');
        }
        password = !password;   
    } else {
        inputPassword.focus();
    }   
});

checkBox.addEventListener('change', function(){
    if (checkBox.checked){
        checkBox.value = true;
    }else{
        checkBox.value = false;
    }
});