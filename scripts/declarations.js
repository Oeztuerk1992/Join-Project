const rightHeader = document.getElementById('right-header');
const rightHeaderMobile = document.getElementById('right-header-mobile');
const leftSideBar = document.getElementById('nav-sidebar');
const leftSideBarMobile = document.getElementById('nav-sidebar-mobile');
const sideBarGuest = document.getElementById('sidebar-guest');
const sideBarGuestMobile = document.getElementById('sidebar-guest-mobile');
const helpBtn = document.getElementById('help-btn');
const currentPage = window.location.pathname;
 

/**
 * Sets up header, sidebar and user profile on load, then marks the page as ready.
 *
 * @returns {void}
 */
function initDeclarations() {
    checkForHeader();
    checkForSidebar();
    if (loggedInUser) getUserProfile();
    document.body.classList.add('ready');
}


/**
 * Hides the right-side header (desktop and mobile) on info pages
 * (legal notice, privacy policy) when no user is logged in.
 *
 * @returns {void}
 */
function checkForHeader() {
    const isInfoPage =
        currentPage.includes('legal_notice.html') ||
        currentPage.includes('privacy_policy.html');
 
    if (isInfoPage && !loggedInUser) {
        rightHeader?.classList.add('hidden');
        rightHeaderMobile?.classList.add('hidden');
    }
}
 
 
/**
 * Shows the appropriate sidebar variant (desktop and mobile) based on
 * login state: the guest sidebar when no user is logged in, or the full navigation sidebar otherwise.
 *
 * @returns {void}
 */
function checkForSidebar() {
    if (!loggedInUser) {
        leftSideBar?.classList.add('hidden');
        leftSideBarMobile?.classList.add('hidden');
        sideBarGuest?.classList.remove('hidden');
        sideBarGuestMobile?.classList.remove('hidden');
    } else {
        leftSideBar?.classList.remove('hidden');
        leftSideBarMobile?.classList.remove('hidden');
        sideBarGuest?.classList.add('hidden');
        sideBarGuestMobile?.classList.add('hidden');
    }
}
 
 
/**
 * Navigates back to the previous page in the browser's history.
 *
 * @returns {void}
 */
function goBack() {
    window.history.back();
}


