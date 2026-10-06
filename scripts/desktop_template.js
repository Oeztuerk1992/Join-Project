/* ========================================
Variables
======================================== */
 
const userMenu = document.getElementById("user-nav");
const userMenuMobile = document.getElementById("user-nav-mobile");
const circle = document.querySelector('.circle');
const circleMobile = document.querySelector('.circle-mobile');
const loggedInUser = sessionStorage.getItem('loggedInUser');
const userProfile = document.getElementById('initials-user');
const userProfileMobile = document.getElementById('initials-user-mobile');
 
let closeMenuTimeout;
let activeMenu = null;
 
 
/* ========================================
Desktop template functions
======================================== */

/**
 * Returns the user menu, profile and circle element references for the desktop or mobile header.
 *
 * @param {string} filterWord - "desktop" for the desktop menu, any other value for mobile.
 * @returns {{userMenu: HTMLElement, userProfile: HTMLElement, circle: HTMLElement}} The element references.
 */
function getFormRefsForTemplate(filterWord) {
    return filterWord === "desktop"
        ? { userMenu, userProfile, circle }
        : {
            userMenu: userMenuMobile,
            userProfile: userProfileMobile,
            circle: circleMobile
        };
}
 
 
/**
 * Opens or closes the header user menu (desktop or mobile) and tracks the active variant.
 *
 * @param {string} filterWord - "desktop" or "mobile", selects which menu to toggle.
 * @returns {void}
 */
function toggleUserMenu(filterWord) {
    activeMenu = filterWord;
    const { userMenu, circle } = getFormRefsForTemplate(filterWord);
    if (userMenu.classList.contains("open-animation")) {
        closeUserMenu(userMenu, circle);
        return;
    }
    openUserMenu(userMenu, circle);
}


/**
 * Cancels a pending close, shows the menu and plays its open animation.
 *
 * @param {HTMLElement} userMenu - The user menu element.
 * @param {HTMLElement} circle - The profile circle element.
 * @returns {void}
 */
function openUserMenu(userMenu, circle) {
    clearTimeout(closeMenuTimeout);
    userMenu.style.display = "flex";
    requestAnimationFrame(() => {
        userMenu.classList.add("open-animation");
    });
    circle.classList.add("active");
}
 
 
/**
 * Closes the user menu after its animation and deactivates the avatar circle.
 *
 * @param {HTMLElement} userMenu - The menu element to close.
 * @param {HTMLElement} circle - The avatar circle element whose "active" state is removed.
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
 * Sets the user's initials ("G" for guest) in the desktop and mobile header avatar badges.
 *
 * @returns {void}
 */
function getUserProfile() {
    const loggedInUser = sessionStorage.getItem("loggedInUser");
    if (!loggedInUser) return;
    const initials = getUserInitials(loggedInUser);
    if (userProfile) userProfile.textContent = initials;
    if (userProfileMobile) userProfileMobile.textContent = initials;
}


/**
 * Returns "G" for a guest, otherwise the first letter of the first and last name.
 *
 * @param {string} loggedInUser - The logged-in user's name or "guest".
 * @returns {string} The initials.
 */
function getUserInitials(loggedInUser) {
    if (loggedInUser === "guest") return "G";
    const name = loggedInUser.trim().split(" ");
    return name[0][0].toUpperCase() +
        (name.length > 1 ? name[name.length - 1][0].toUpperCase() : "");
}


/* ========================================
Event Listeners
======================================== */

/**
 * Closes the active header user menu when clicking outside the menu and its avatar circle.
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