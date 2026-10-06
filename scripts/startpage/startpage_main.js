/* ========================================
Variables
======================================== */
 
const logo = document.querySelector(".logo");
const splash = document.querySelector(".logo-splash");
const container = document.querySelector(".hidden-splash");
const logoContainer = document.querySelector(".logo-container");
 
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
 

/* ========================================
Array for users
======================================== */

const signUpNewUser = [];
const registeredUser = [];
 

/* ========================================
Init, startpage functions
======================================== */
 
/**
 * Preloads registered users and contacts from Firebase for login/signup validation.
 *
 * @returns {Promise<void>}
 */
async function initLogin() {
    await onloadUsers();
    await loadContactsFromFirebase();
}

 
/**
 * Initializes the signup page and loads all users and contacts
 * required for signup validation.
 *
 * @returns {Promise<void>}
 */
async function initSignup() {
    await onloadUsers();
    await loadContactsFromFirebase();
}


/**
 * Starts the splash screen sequence (mobile animation, or desktop immediately/animated once per session).
 *
 * @returns {void}
 */
function initSplashScreen() {
    if (document.body.classList.contains('signup-page')) return;
    if (!hasSplashElements()) return;
    if (isMobileView()) {
        getMobileAnimation();
        return;
    }
    const splashShown = sessionStorage.getItem("splashShown");
    splashShown ? showDesktopSplashImmediately() : playDesktopSplashAnimation();
}


/**
 * Checks whether all splash elements exist.
 *
 * @returns {boolean} True if all elements are available.
 */
function hasSplashElements() {
    return logo && splash && container;
}


/**
 * Plays the desktop splash animation.
 *
 * @returns {void}
 */
function playDesktopSplashAnimation() {
    logo.style.visibility = "visible";
    sessionStorage.setItem("splashShown", "true");
    setTimeout(() => movingLogoToPos(true), 500);
    setTimeout(() => {
        splash.classList.add("hide");
        container.classList.remove("hidden-splash");
    }, 1000);
    setTimeout(() => {
        splashFinished = true;
    }, 1700);
}


/**
 * Displays the desktop splash end state immediately.
 *
 * @returns {void}
 */
function showDesktopSplashImmediately() {
    logo.style.visibility = "visible";
    logo.style.transition = "none";
    movingLogoToPos(false);
    splash.style.transition = "none";
    splash.classList.add("hide");
    container.classList.remove("hidden-splash");
    splashFinished = true;
}


/**
 * Initializes the mobile splash animation.
 *
 * @returns {void}
 */
function getMobileAnimation() {
    if (!hasSplashElements()) return;
    prepareMobileSplash();
    const splashShown = sessionStorage.getItem("splashShown");
    splashShown ? showMobileSplashImmediately() : playMobileSplashAnimation();
}


/**
 * Prepares splash elements for mobile view.
 *
 * @returns {void}
 */
function prepareMobileSplash() {
    logo.src ="./assets/img/desktop_template/join-logo.png";
}


/**
 * Plays the mobile splash animation.
 *
 * @returns {void}
 */
function playMobileSplashAnimation() {
    logo.style.visibility = "visible";
    sessionStorage.setItem("splashShown", "true");
    setTimeout(() => movingLogoToPos(true), 500);
    setTimeout(() => {
        container.classList.remove("hidden-splash");
        logo.src = "./assets/img/login/join_logo_big.svg";
        splash.classList.add("hide");
    }, 1100);
    setTimeout(() => {
        splashFinished = true;
    }, 1700);
}


/**
 * Displays the mobile splash end state immediately.
 *
 * @returns {void}
 */
function showMobileSplashImmediately() {
    logo.style.visibility = "visible";
    logo.style.transition = "none";
    logo.src = "./assets/img/login/join_logo_big.svg";
    movingLogoToPos(false);
    splash.style.transition = "none";
    splash.classList.add("hide");
    container.classList.remove("hidden-splash");
    splashFinished = true;
}
 
 
/**
 * Moves and resizes the splash logo onto the logo container, optionally animated.
 *
 * @param {boolean} withAnimation - Whether to apply a CSS transition (false snaps instantly).
 * @returns {void}
 */
function movingLogoToPos(withAnimation) {
    const rect = logoContainer.getBoundingClientRect();
    logo.style.transition = withAnimation
        ? "top 1.2s ease, left 1.2s ease, width 1.2s ease, height 1.2s ease, transform 1.2s ease"
        : "none";
    logo.style.top = `${rect.top + rect.height / 2}px`;
    logo.style.left = `${rect.left + rect.width / 2}px`;
    setLogoSize();
    logo.style.transform = "translate(-50%, -50%)";
}


/**
 * Sets the splash logo size depending on mobile or desktop view.
 *
 * @returns {void}
 */
function setLogoSize() {
    const mobile = isMobileView();
    logo.style.width = mobile ? "64px" : "100px";
    logo.style.height = mobile ? "78px" : "122px";
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
 

/* ========================================
Go to other pages
======================================== */

/**
 *  Navigates the user to the signup page.
 *
 * @returns {void}
 */
function getToSignup() {
    window.location.href = "./html/signup.html";
}


/**
 *  Navigates the user to the login page.
 *
 * @returns {void}
 */
function getToLogin() {
    window.location.href = "../index.html";
}


/**
 * Determines whether the current viewport width matches the mobile
 * breakpoint.
 *
 * @returns {boolean} True if the viewport width is 992px or less, otherwise false.
 */
function isMobileView() {
    return window.innerWidth <= 992 || window.innerHeight <= 800;
}


/**
 * Logs a user in: stores their name and email in sessionStorage, then
 * navigates to the summary page.
 *
 * @param {string} userName - Display name to store as "loggedInUser".
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
 * @param {string} guest - Display name of the guest session, passed to getToSummary().
 * @returns {void}
 */
function logInGuest(guest) {
    getToSummary(guest);
}
 

/* ========================================
Event Listeners
======================================== */

// Initializes the splash screen animation after the page has loaded.

window.addEventListener("load", initSplashScreen);


// Wires up lock-icon state and show/hide toggling for the login, signup and confirm password fields.

[
    { input: loginPw, button: btnPwOne },
    { input: pwUser, button: btnPwTwo },
    { input: checkPw, button: btnPwThree }
].forEach(({ input, button }) => {
    if (!input || !button) return;
    input.addEventListener('input', () => {
        button.classList.toggle('change-icon-lock', input.value.length > 0);
    });
    button.addEventListener('click', () => {
        input.type = input.type === 'password' ? 'text' : 'password';
        button.classList.toggle('make-pw-visible');
    });
});