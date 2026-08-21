const rightHeader = document.getElementById('right-header');
const rightHeaderMobile = document.getElementById('right-header-mobile');

const leftSideBar = document.getElementById('nav-sidebar');
const leftSideBarMobile = document.getElementById('nav-sidebar-mobile');

const sideBarGuest = document.getElementById('sidebar-guest');
const sideBarGuestMobile = document.getElementById('sidebar-guest-mobile');

const helpBtn = document.getElementById('help-btn');
const currentPage = window.location.pathname;


function initDeclarations() {
    checkForHeader();
    checkForSidebar();

    if (loggedInUser) {
        getUserProfile();
    }

    document.body.classList.add('ready');
}

function checkForHeader() {
    const isInfoPage =
        currentPage.includes('legal_notice.html') ||
        currentPage.includes('privacy_policy.html');

    if (isInfoPage && !loggedInUser) {
        rightHeader?.classList.add('hidden');
        rightHeaderMobile?.classList.add('hidden');
    }
}


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


// functions for back-btn //

function goBack() {
    window.history.back();
}