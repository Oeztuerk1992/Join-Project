// Variables //
 
const userMenu = document.getElementById("user-nav");
const userMenuMobile = document.getElementById("user-nav-mobile");
const circle = document.querySelector('.circle');
const circleMobile = document.querySelector('.circle-mobile');
const loggedInUser = sessionStorage.getItem('loggedInUser');
const userProfile = document.getElementById('initials-user');
const userProfileMobile = document.getElementById('initials-user-mobile');
 
let closeMenuTimeout;
let activeMenu = null;
 
 
/**
 * Returns the DOM element references for either the desktop or mobile
 * variant of the header user menu, so the toggle/close logic below can
 * work generically on either.
 *
 * @param {string} filterWord - "desktop" for the desktop menu, any
 *                               other value (e.g. "mobile") for the
 *                               mobile menu.
 * @returns {{userMenu: HTMLElement, userProfile: HTMLElement,
 *            circle: HTMLElement}} References for the requested
 *            variant.
 */
function getFormRefsForTemplate(filterWord) {
    return filterWord === "desktop"
        ? {
            userMenu,
            userProfile,
            circle
        }
        : {
            userMenu: userMenuMobile,
            userProfile: userProfileMobile,
            circle: circleMobile
        };
}
 
 
/**
 * Opens or closes the header user menu (desktop or mobile), tracking
 * which variant is currently active. If the menu is already open,
 * closes it; otherwise cancels any pending close timeout, shows the
 * menu, and plays its open animation on the next animation frame.
 *
 * @param {string} filterWord - "desktop" or "mobile", selects which
 *                               menu to toggle (see
 *                               getFormRefsForTemplate()).
 * @returns {void}
 */
function toggleUserMenu(filterWord) {
    activeMenu = filterWord;
    const { userMenu, circle } = getFormRefsForTemplate(filterWord);
    const isOpen = userMenu.classList.contains("open-animation");
 
    if (isOpen) {
        closeUserMenu(userMenu, circle);
    } else {
        clearTimeout(closeMenuTimeout);
        userMenu.style.display = "flex";
        requestAnimationFrame(() => {
            userMenu.classList.add("open-animation");
        });
        circle.classList.add("active");
    }
}
 
 
/**
 * Closes a given header user menu: removes its open-animation class
 * and, after the animation's duration, hides it via inline style.
 * Also deactivates the associated avatar circle immediately.
 *
 * @param {HTMLElement} userMenu - The menu element to close.
 * @param {HTMLElement} circle - The avatar circle element whose
 *                                "active" state should be removed.
 * @returns {void}
 */
function closeUserMenu(userMenu, circle) {
    clearTimeout(closeMenuTimeout);
    userMenu.classList.remove("open-animation");
 
    closeMenuTimeout = setTimeout(() => {
        userMenu.style.display = "none";
    }, 300);
    circle.classList.remove("active");
}
 
 
/**
 * Global click listener: closes the currently active header user menu
 * (desktop or mobile, per "activeMenu") when a click occurs outside
 * both the menu and its avatar circle. Does nothing if no menu is
 * currently tracked as active.
 *
 * @listens document#click
 * @param {MouseEvent} event - The click event.
 * @returns {void}
 */
document.addEventListener("click", (event) => {
    if (!activeMenu) return;
    const { userMenu, circle } = getFormRefsForTemplate(activeMenu);
    const isOpen = userMenu.classList.contains("open-animation");
 
    if (
        isOpen &&
        !userMenu.contains(event.target) &&
        !circle.contains(event.target)
    ) {
        closeUserMenu(userMenu, circle);
    }
});
 
 
/**
 * Logs out the current user by clearing all session storage and
 * redirecting to the login page.
 *
 * @returns {void}
 */
function logout() {
    sessionStorage.clear();
    window.location.href = "../index.html";
}
 
 
/**
 * Sets the logged-in user's initials in the header avatar badge (both
 * desktop and mobile, if present). Derives initials from the
 * "loggedInUser" value in sessionStorage: falls back to "G" for a
 * guest session, otherwise uses the first letter of the first word and
 * (if there is more than one word) the first letter of the last word.
 * Does nothing if no user is logged in.
 *
 * @returns {void}
 */
function getUserProfile() {
    const loggedInUser = sessionStorage.getItem("loggedInUser");
    if (!loggedInUser) return;
    let initials = "G";
 
    if (loggedInUser !== "guest") {
        const name = loggedInUser.trim().split(" ");
 
        initials =
            name[0][0].toUpperCase() +
            (name.length > 1
                ? name[name.length - 1][0].toUpperCase()
                : "");
    }
    if (userProfile) {
        userProfile.textContent = initials;
    }
    if (userProfileMobile) {
        userProfileMobile.textContent = initials;
    }
}