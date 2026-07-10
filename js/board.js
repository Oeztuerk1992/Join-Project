// variables //
const taskOverlay = document.getElementById('task-overlay');
const editOverlay = document.getElementById('edit-overlay');

// functions //


// es wird der login checkup benötigt //
function init() {

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

