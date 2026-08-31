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


// functions //

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


function closeUserMenu(userMenu, circle) {
    clearTimeout(closeMenuTimeout);

    userMenu.classList.remove("open-animation");

    closeMenuTimeout = setTimeout(() => {
        userMenu.style.display = "none";
    }, 300);

    circle.classList.remove("active");
}


document.addEventListener("click", (event) => {
    if (!activeMenu) return;

    const { userMenu, circle } =
        getFormRefsForTemplate(activeMenu);

    const isOpen = userMenu.classList.contains("open-animation");

    if (
        isOpen &&
        !userMenu.contains(event.target) &&
        !circle.contains(event.target)
    ) {
        closeUserMenu(userMenu, circle);
    }
});


function logout() {
    sessionStorage.clear();
    window.location.href = "../index.html";
}

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