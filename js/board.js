// variables //
const taskOverlay = document.getElementById('task-overlay');
const editOverlay = document.getElementById('edit-overlay');

// functions //


// es wird der login checkup benötigt //
function initBoard() {
    getUserProfile();
}

function getUserProfile() {

    if (loggedInUser === 'guest') {
        userProfile.textContent = "G";
    } else {

    const name = loggedInUser.split(" ");
    const initials = name[0][0].toUpperCase() + name[1][0].toUpperCase();
    userProfile.textContent = initials;

    }

}

function getToAddTask() {
    window.location.href = 'add_task.html';
}

// Task Overlay //

function openTaskOverlay() {
    taskOverlay.showModal();
}

function closeTaskOverlay() {
    taskOverlay.close();
}

// Edit Overlay //

function getEditOverlay() {
    taskOverlay.close();
    editOverlay.showModal();
}

function closeEditOverlay() {
    editOverlay.close();
}
