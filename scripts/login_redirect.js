/**
 * Sends visitors who are not logged in to the login page.
 *
 * @returns {void}
 */
function redirectLoggedOutVisitor() {
    const userName = sessionStorage.getItem("loggedInUser");
    if (userName) return;
    window.location.replace("../index.html");
}


redirectLoggedOutVisitor();
window.addEventListener("pageshow", redirectLoggedOutVisitor);
