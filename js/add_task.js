function initAddTask() {
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

function openAddTaskOverlay() {
  document.getElementById("add-task-overlay").classList.add("show");
}

function closeAddTaskOverlay() {
  document.getElementById("add-task-overlay").classList.remove("show");
}


