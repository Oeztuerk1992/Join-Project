// Variables //

const userMenu = document.getElementById("user-nav");

// functions //

function toggleUserMenu() {
    if (userMenu.open) {
        userMenu.close();
    } else {
        userMenu.show();
    }
}

// Event Listeners //

document.addEventListener("click", (event) => {
    if (
        userMenu.open &&
        !userMenu.contains(event.target) &&
        !event.target.closest(".user-menu")
    ) {
        userMenu.close();
    }
});