// Variables //

const userMenu = document.getElementById("user-nav");
const userMenuMobile = document.getElementById("user-nav-mobile");
const circle = document.querySelector('.circle');
const circleMobile = document.querySelector('.circle-mobile');

const loggedInUser = sessionStorage.getItem('loggedInUser');
const userProfile = document.getElementById('initials-user');
const userProfileMobile = document.getElementById('initials-user-mobile');


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
    const { userMenu, circle } = getFormRefsForTemplate(filterWord);

    if (userMenu.open) {
        userMenu.classList.remove('open-animation');

        setTimeout(() => {
            userMenu.close();
        }, 300);

        circle.classList.remove('active');
    } else {
        userMenu.show();

        requestAnimationFrame(() => {
            userMenu.classList.add('open-animation');
        });

        circle.classList.add('active');
    }
}

// Event Listeners //

document.addEventListener("click", (event) => {
    const filterWord =
        window.innerWidth > 768 ? "desktop" : "mobile";

    const { userMenu, circle } =
        getFormRefsForTemplate(filterWord);

    if (!userMenu || !circle) return;

    if (
        userMenu.open &&
        !userMenu.contains(event.target) &&
        !circle.contains(event.target)
    ) {
        userMenu.classList.remove("open-animation");

        setTimeout(() => {
            userMenu.close();
        }, 300);

        circle.classList.remove("active");
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