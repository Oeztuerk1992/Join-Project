function initAddTask() {
  getUserProfile();
}

function openAddTaskOverlay() {
  document.getElementById("add-task-overlay").classList.add("show");
}

function closeAddTaskOverlay() {
  document.getElementById("add-task-overlay").classList.remove("show");
}

function toggleDropdown() {

  document
      .getElementById("dropdownMenu")
      .classList.toggle("show");

  document
      .getElementById("dropdownArrow")
      .classList.toggle("rotate");
}



