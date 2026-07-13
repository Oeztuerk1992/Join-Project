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