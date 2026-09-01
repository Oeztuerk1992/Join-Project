// Variables //
 
const logo = document.querySelector(".logo");
const splash = document.querySelector(".logo-splash");
const container = document.querySelector(".hidden-splash");
const logoContainer = document.querySelector(".logo-container");
const isMobile = window.innerWidth <= 992;
 
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
 
let splashFinished = false;
 
// Array for users //
 
const signUpNewUser = [];
const registeredUser = [];
 
/**
 * Runs once per page load: plays the splash/logo intro. On mobile,
 * delegates entirely to getMobileAnimation(). On desktop, if the
 * splash hasn't been shown yet this browser session, plays the full
 * animated sequence (move logo, hide splash, mark as finished) and
 * records in sessionStorage ("splashShown") that it has run; if it has
 * already been shown, skips straight to the final state without
 * transitions. Does nothing if the required DOM elements are missing.
 *
 * @listens window#load
 */
window.addEventListener("load", () => {
 
    if (!logo || !splash || !container) return;
    // Uncomment while testing
    /* sessionStorage.removeItem("splashShown"); */
 
    const splashShown = sessionStorage.getItem("splashShown");
 
    if (isMobile) {
        getMobileAnimation();
        return;
    }
    
    if (!splashShown) {
        sessionStorage.setItem("splashShown", "true");
 
    setTimeout(() => {
        movingLogoToPos(true);
    }, 500);
 
    setTimeout(() => {
        splash.classList.add("hide");
        container.classList.remove("hidden-splash");
    }, 1000);
 
    setTimeout(() => {
        splashFinished = true;
    }, 1700);
 
    } else {
        logo.style.transition = "none";
        movingLogoToPos(false);
        splash.style.transition = "none";
        splash.classList.add("hide");
        container.classList.remove("hidden-splash");
        splashFinished = true;
    }
});
 
/**
 * Mobile variant of the splash/logo intro animation: swaps in the
 * mobile splash logo image, then either plays the full animated
 * sequence (first time this session) or jumps straight to the final
 * state (if already shown), swapping to the final logo image at the
 * appropriate point either way. Does nothing if the required DOM
 * elements are missing.
 *
 * @returns {void}
 */
function getMobileAnimation() {
    if (!logo || !splash || !container) return;
    const splashShown = sessionStorage.getItem("splashShown");
 
    splash.classList.add("mobile-splash");
    logo.src = "./assets/img/desktop_template/join-logo.png";
 
    if (!splashShown) {
        sessionStorage.setItem("splashShown", "true");
 
        setTimeout(() => {
            movingLogoToPos(true);
        }, 500);
 
        setTimeout(() => {
            container.classList.remove("hidden-splash");
            logo.src = "./assets/img/login/join_logo_big.svg";
            splash.classList.add("hide");
        }, 1100);
 
        setTimeout(() => {
            
            splashFinished = true;
        }, 1700);
 
    } else {
        logo.style.transition = "none";
        logo.src = "./assets/img/login/join_logo_big.svg";
        movingLogoToPos(false);
        splash.style.transition = "none";
        splash.classList.add("hide");
        container.classList.remove("hidden-splash");
        splashFinished = true;
    }
}
 
 
/**
 * Moves and resizes the splash logo to align with the position of the
 * page's actual logo container, optionally animating the transition.
 * Sizing differs between mobile and desktop.
 *
 * @param {boolean} withAnimation - Whether to apply a CSS transition
 *                                  while moving/resizing the logo
 *                                  (false snaps it instantly).
 * @returns {void}
 */
function movingLogoToPos(withAnimation) {
    const rect = logoContainer.getBoundingClientRect();
 
    logo.style.transition = withAnimation
        ? "top 1.2s ease, left 1.2s ease, width 1.2s ease, height 1.2s ease, transform 1.2s ease"
        : "none";
 
    logo.style.top = `${rect.top + rect.height / 2}px`;
    logo.style.left = `${rect.left + rect.width / 2}px`;
 
    if (isMobile) {
        logo.style.width = "64px";
        logo.style.height = "78px";
 
    } else {
        logo.style.width = "100px";
    }
    logo.style.transform = "translate(-50%, -50%)";
}
 
 
// Init //
 
/**
 * Initializes the login page: shows the login modal and preloads
 * registered users and contacts from Firebase (used for login/signup
 * validation).
 *
 * @returns {Promise<void>}
 */
async function initLogin() {
    modalLogin.show();
    await onloadUsers();
    await loadContactsFromFirebase();
}
 
// Modal overlays //
 
/**
 * Switches from the login modal to the signup modal: closes the login
 * modal, resets the signup form and its validation state, opens the
 * signup modal (as a true modal dialog), and hides the "open signup"
 * button.
 *
 * @returns {void}
 */
function getSignupModal() {
    modalLogin.close();
    document.getElementById('form-for-signup').reset();
    resetValidation();
 
    modalSignup.showModal();
    signupBtn.style.display = 'none';
}
 
/**
 * Switches from the signup modal to the login modal: closes the signup
 * modal, resets the login form and its validation state, opens the
 * login modal, and shows the "open signup" button again.
 *
 * @returns {void}
 */
function getLoginModal() {
    modalSignup.close();
    document.getElementById('form-for-login').reset();
    resetValidation();
 
    modalLogin.show();
    signupBtn.style.display = 'flex';
}
 
/**
 * Clears all validation error styling and messages currently shown on
 * the page (login/signup forms).
 *
 * @returns {void}
 */
function resetValidation() {
    document.querySelectorAll(".fail-red-border").forEach(element => {
        element.classList.remove("fail-red-border");
    });
 
    document.querySelectorAll(".info-failed").forEach(element => {
        element.classList.add("hidden-feedback");
    });
}
 
// Go to other pages //
 
/**
 * Logs a user in: stores their name and email in sessionStorage, then
 * navigates to the summary page.
 *
 * @param {string} userName - Display name to store as
 *                             "loggedInUser".
 * @param {string} userMail - Email to store as "loggedInUserEmail".
 * @returns {void}
 */
function getToSummary(userName, userMail) {
    sessionStorage.setItem('loggedInUser', userName);
    sessionStorage.setItem('loggedInUserEmail', userMail);
    window.location.href = './html/summary.html';
}
 
/**
 * Logs in as a guest and navigates to the summary page.
 *
 * @param {string} guest - Display name to use for the guest session,
 *                          passed through to getToSummary() as the
 *                          user name. Note: getToSummary() also expects
 *                          a "userMail" argument, which is not
 *                          supplied here, so "loggedInUserEmail" will
 *                          be set to undefined.
 * @returns {void}
 */
function logInGuest(guest) {
    if(isMobile) {
 
        
    
    }
    getToSummary(guest);
}
 
/**
 * Wires up show/hide password behavior for the login, signup, and
 * confirm-password fields: toggles a "filled" lock-icon state as the
 * user types, and toggles the input's visibility (type
 * "password"/"text") plus a "visible" icon state when its associated
 * eye button is clicked. Pairs with missing input or button elements
 * are skipped.
 */
[
    { input: loginPw, button: btnPwOne },
    { input: pwUser, button: btnPwTwo },
    { input: checkPw, button: btnPwThree }
 
].forEach(({ input, button }) => {
 
    if (!input || !button) return;
 
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