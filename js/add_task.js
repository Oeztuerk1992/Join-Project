const BASE_URL = "https://remotestoragejoin-8faac-default-rtdb.europe-west1.firebasedatabase.app/";



async function initAddTask() {
        await loadContacts();

    getUserProfile();


}

function setPriority(selectedButton) {

    let buttons = document.querySelectorAll(".priority");

    buttons.forEach(button => {
        button.classList.remove("active");
    });

    selectedButton.classList.add("active");
}

function toggleDropdown() {

    document
        .getElementById("dropdownMenu")
        .classList.toggle("show");

    document
        .getElementById("dropdownArrow")
        .classList.toggle("rotate");
}

function toggleCategoryDropdown() {

    document
        .getElementById("categoryMenu")
        .classList.toggle("show");


    document
        .getElementById("categoryArrow")
        .classList.toggle("rotate");

}



function selectCategory(category) {

    document
        .getElementById("selectedCategory")
        .innerText = category;


    document
        .getElementById("categoryMenu")
        .classList.remove("show");


    document
        .getElementById("categoryArrow")
        .classList.remove("rotate");

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

function toggleDropdown() {

  document
      .getElementById("dropdownMenu")
      .classList.toggle("show");

  document
      .getElementById("dropdownArrow")
      .classList.toggle("rotate");
}
async function postTaskData(task) {

    let response = await fetch(BASE_URL + "tasks.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task)
    });

    return await response.json();
}


async function createTask() {

    let taskData = {

        title: document.getElementById("taskTitle").value,

        description: document.getElementById("taskDescription").value,

        dueDate: document.getElementById("taskDate").value,

        priority: getPriority(),

        assignedTo: getAssignedUsers(),

        category: getCategory(),

        subtasks: getSubtasks(),

        status: "todo"
    };


    await postTaskData(taskData);

    console.log("Task wurde gespeichert");
}

function getPriority() {

    let activePriority = document.querySelector(".priority.active");

    if (!activePriority) {
        return "";
    }

    return activePriority.querySelector("span").innerText;
}

function getAssignedUsers() {

    let assignedUsers = [];

    let checkedUsers = document.querySelectorAll(
        "#dropdownMenu input[type='checkbox']:checked"
    );

    checkedUsers.forEach(user => {
        assignedUsers.push(user.value);
    });

    return assignedUsers;
}



function getCategory(){

    let category = document
        .getElementById("selectedCategory")
        .innerText;


    if(category === "Select task category"){
        return "";
    }


    return category;
}

function getSubtasks() {

    let subtasks = [];

    let subtaskInputs = document.querySelectorAll(
        ".subtask-input input"
    );


    subtaskInputs.forEach(input => {

        if(input.value.trim() !== "") {

            subtasks.push(input.value.trim());

        }

    });


    return subtasks;
}

async function loadContacts() {
    let response = await fetch(BASE_URL + "contacts.json");
    let contacts = await response.json();
    renderContacts(contacts);
}

function renderContacts(contacts) {

    let dropdownMenu = document.getElementById("dropdownMenu");

    dropdownMenu.innerHTML = "";

    for (const id in contacts) {

        let contact = contacts[id];

        dropdownMenu.innerHTML += `
            <div class="dropdown-item">

                <div class="contact-info">

                    <div
                        class="contact-circle"
                        style="background:${contact.randomColor};">

                        ${contact.initials}

                    </div>

                    <span>${contact.capitalizedName}</span>

                </div>

                <input
                    type="checkbox"
                    value="${id}"
                >

            </div>
        `;
    }
}


