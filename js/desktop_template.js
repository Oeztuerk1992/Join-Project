// Variables //

const userMenu = document.getElementById("user-nav");
const circle = document.querySelector('.circle');

const loggedInUser = sessionStorage.getItem('loggedInUser');
const userProfile = document.getElementById('initials-user');

// functions //

function toggleUserMenu() {
    
    if (userMenu.open) {
        userMenu.close();
    } else {
        userMenu.show();
    }

    circle.classList.toggle('active', userMenu.open);
}

// Event Listeners //

document.addEventListener("click", (event) => {
    if (
        userMenu.open &&
        !userMenu.contains(event.target) &&
        !event.target.closest(".user-menu")
    ) {
        userMenu.close();
        circle.classList.toggle('active', userMenu.open);
    }
});

function logout() {
    sessionStorage.clear();
}

function getUserProfile() {

    if (loggedInUser === 'guest') {
        userProfile.textContent = "G";
    } else {

    const name = loggedInUser.split(" ");
    
    const initials =
        name[0][0].toUpperCase() +
        (name.length > 1
            ? name[name.length - 1][0].toUpperCase()
            : '');

    userProfile.textContent = initials;

    }
}