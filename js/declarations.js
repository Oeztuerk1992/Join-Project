const rightHeader = document.getElementById('right-header');
const leftSideBar = document.getElementById('nav-sidebar');
const sideBarGuest = document.getElementById('sidebar-guest');
const helpBtn = document.getElementById('help-btn');

const currentPage = window.location.pathname;


function initDeclarations() {
    
    checkForHeader();
    checkForSidebar();
    checkForHelpBtn();

    getUserProfile();
}

function checkForHeader() {

    const isInfoPage =
        currentPage.includes('legal_notice.html') ||
        currentPage.includes('privacy_policy.html');

    if (isInfoPage && !loggedInUser) {
        rightHeader.classList.add('hidden');
    }
    if (isInfoPage && !loggedInUser) {
        rightHeader.classList.add('hidden');
    }
}

function checkForSidebar() {

    if (!loggedInUser) {
        leftSideBar.classList.add('hidden');
        sideBarGuest.classList.remove('hidden');
    } else {

        leftSideBar.classList.remove('hidden');
        sideBarGuest.classList.add('hidden');
    }
}

function checkForHelpBtn() {
    helpBtn.style.display = 'none';
}

// functions for help-html //

function goBack() {
    window.history.back();
}