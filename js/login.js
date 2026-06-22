const splash = document.getElementById("splash");
const logo = document.getElementById("animated-logo");
const container = document.querySelector(".container");

window.addEventListener("load", () => {

    setTimeout(() => {
        logo.classList.add("move-logo");
    }, 500);

    setTimeout(() => {
        splash.style.display = "none";
        container.classList.remove("hidden");
    }, 1800);

});