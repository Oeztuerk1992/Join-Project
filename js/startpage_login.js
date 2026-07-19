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

const btnPwOne = document.getElementById('btn-pw-one');
const btnPwTwo = document.getElementById('btn-pw-two');
const btnPwThree = document.getElementById('btn-pw-three');

// Array for users //

const signUpNewUser = [];
const registeredUser = [];

// Loading logo //

window.addEventListener("load", () => {
    setTimeout(() => {
        logo.classList.add("move-logo");
    }, 500);

    setTimeout(() => {
        splash.classList.add("hide");
        container.classList.remove("hidden-splash");
    }, 1200);
});

// Init //

async function initLogin() {
    modalLogin.show();
    await onloadUsers();
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

function getToSummary(userName) {
    sessionStorage.setItem('loggedInUser', userName);
    window.location.href = './html/summary.html';
}

function logInGuest(guest) {
    getToSummary(guest);
}

/* visibility icon for pw input fields */

[
    { input: loginPw, button: btnPwOne },
    { input: pwUser, button: btnPwTwo },
    { input: checkPw, button: btnPwThree }

].forEach(({ input, button }) => {

    input.addEventListener('input', () => {
        button.classList.toggle(
            'change-icon-lock',
            input.value.length > 0
        );
    });

    button.addEventListener('click', () => {
        input.type =
            input.type === 'password'
                ? 'text'
                : 'password';

        button.classList.toggle('make-pw-visible');
    });

});