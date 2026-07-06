// variables //

const splash = document.getElementById("splash");
const logo = document.getElementById("animated-logo");
const container = document.querySelector(".container");

const modalLogin = document.getElementById('login-modal');
const modalSignup = document.getElementById('signup-modal');
const signupBtn = document.getElementById('open-signup');

// array for users //

const registeredUsers = [];

// Loading logo //

window.addEventListener("load", () => {

    setTimeout(() => {
        logo.classList.add("move-logo");
    }, 500);

    setTimeout(() => {
        splash.style.display = "none";
        container.classList.remove("hidden");
    }, 1800);

});

// signup //

window.addEventListener('DOMContentLoaded', () => { modalLogin.show(); });

function getSignupModal() {
    modalLogin.close();
    modalSignup.show();
    signupBtn.style.display = 'none';
}

function getLoginModal() {
    modalSignup.close();
    modalLogin.show();
    signupBtn.style.display = 'flex';
}

function checkFormData () {
    const checkForm = document.getElementById('form-for-signup');
    const pw = document.getElementById('signup-pw').value;
    const checkPw = document.getElementById('check-pw').value;
    const failPw = document.getElementById('pw-info');

    if (checkForm.checkValidity() && pw === checkPw) {
        failPw.classList.add("hidden");
        registerNewUser();
    } else if (pw !== checkPw) {
        failPw.classList.remove("hidden");
    } else {
        checkForm.reportValidity();
    }
}

function registerNewUser() {
    const fullName = document.getElementById('signup-name').value.trim();
    const nameParts = fullName.split(' ');

    registeredUsers.push({
        name: {
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' '),
        },
        mail: document.getElementById('signup-mail').value,
        password: document.getElementById('signup-pw').value,
        phoneNo: ""
    });

    document.getElementById('form-for-signup').reset();
    getLoginModal();
}