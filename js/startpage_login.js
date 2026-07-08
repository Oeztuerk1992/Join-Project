// Variables //

const splash = document.getElementById("splash");
const logo = document.getElementById("animated-logo");
const container = document.querySelector(".container");

const modalLogin = document.getElementById('login-modal');
const modalSignup = document.getElementById('signup-modal');
const signupBtn = document.getElementById('open-signup');

const nameUser = document.getElementById('signup-name');
const mailUser = document.getElementById('signup-mail');
const pwUser = document.getElementById('signup-pw');
const checkPw = document.getElementById('check-pw');
const privacyPolicy = document.getElementById('privacy-policy');

const loginMail = document.getElementById('login-mail');
const loginPw = document.getElementById('login-password');

// Array for users //

const signUpNewUser = [];
const registeredUser = [];

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

// Init //

async function initLogin() {
    modalLogin.show();
    onloadUsers();
}

// Modal overlays //

function getSignupModal() {
    modalLogin.close();
    document.getElementById('form-for-signup').reset();
    modalSignup.show();
    signupBtn.style.display = 'none';
}

function getLoginModal() {
    modalSignup.close();
    modalLogin.show();
    signupBtn.style.display = 'flex';
}

// Go to other pages //

function getToSummary() {
    window.location.href = './html/summary.html';
}