// Variables //

const titleForm = document.getElementById("taskTitle");
const descriptionForm = document.getElementById("taskDescription");
const dateForm = document.getElementById("taskDate");
const categoryForm = document.getElementById("selectedCategory");
const subtasksForm = document.getElementById("ul-subtask-add-task");
const dropDownMenuCategories = document.getElementById('categoryMenu');
const container = document.getElementById('toggle-default');
const dropDownMenuAssignments = document.querySelector("#toggle-default .dropdown-menu");

const feedbackTitle = document.getElementById("feedback-title");
const feedbackDuedate = document.getElementById("feedback-duedate");
const feedbackCategory = document.getElementById("feedback-category");
const borderCategory = document.getElementById("category-border");

let contacts = {};

// Functions //

// Init and Loading //

async function initAddTask() {
    getUserProfile();
    await loadContacts();

    const menu = document.querySelector("#toggle-default .dropdown-menu");
    renderContacts(contacts, menu);
}

// functions for form validation //

function checkFormDataAddTask(event, column) {
    event.preventDefault();

    const isNameValid = checkTitleName();
    const isDateValid = checkDueDate();
    const isCategoryValid = checkTaskCategory();
        
    const isValid = isNameValid && isDateValid && isCategoryValid;

    if (isValid) {
        createTask(column);
    }

    return false;
}

function checkTitleName() {
    if (titleForm.value.trim()) {
        feedbackTitle.classList.add("hidden");
        titleForm.classList.remove("fail-red-border");
        return true;
    }
    feedbackTitle.classList.remove("hidden");
    titleForm.classList.add("fail-red-border");
    return false;
}

function checkDueDate() {
    if (dateForm.value) {
        feedbackDuedate.classList.add("hidden");
        dateForm.classList.remove("fail-red-border");
        return true;
    }
    feedbackDuedate.classList.remove("hidden");
    dateForm.classList.add("fail-red-border");
    return false;
}

function checkTaskCategory() {
    if (categoryForm.value.trim()) {
        feedbackCategory.classList.add("hidden");
        borderCategory.classList.remove("fail-red-border");
        return true;
    }
    feedbackCategory.classList.remove("hidden");
    borderCategory.classList.add("fail-red-border");
    return false;
}

// functions for form content //

function setPriority(selectedButton) {
    if (selectedButton.classList.contains("active")) {
        
        selectedButton.classList.remove("active");
    } else {
        let buttons = document.querySelectorAll(".priority");
        buttons.forEach(button => { button.classList.remove("active"); });
        
        selectedButton.classList.add("active");
    }
}

function toggleCategoryDropdown() {
    document.getElementById("categoryMenu").classList.toggle("show");
    document.getElementById("dropdownArrowCategory").classList.toggle("rotate");
}

function selectCategory(category, event) {
    event.stopPropagation();

    document.getElementById("selectedCategory").value = category;
    document.getElementById("categoryMenu").classList.remove("show");
    document.getElementById("dropdownArrowCategory").classList.remove("rotate");
    checkTaskCategory();
}

function toggleDropdown(container) {
    const input = container.querySelector(".dropdown");
    const arrow = container.querySelector(".arrow-dropdown");
    const menu = container.querySelector(".dropdown-menu");

    menu.classList.toggle("show");
    arrow.classList.toggle("rotate");

    if (menu.classList.contains("show")) {
        input.placeholder = "";
        input.focus();
    } else {
        input.placeholder = "Select contacts to assign";
    }
    getContactBadges(container);
}

function showFilteredContactList(input) {
    const menu = input.closest('.dropdown-container').querySelector('.dropdown-menu');
    menu.classList.add('show');
}

// functions for posting tasks //

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

async function createTask(column) {
    const taskData = {
        title: titleForm.value,
        description: descriptionForm.value,
        dueDate: dateForm.value,
        priority: getPriority(),
        assignedTo: getAssignedUsers(),
        category: categoryForm.value,
        subtasks: getSubtasks(subtasksForm),
        taskStatus: column || 'To do',
        dragOrder: Date.now() 
    };

    try {
        await postTaskData(taskData);

        showConfirmation();

        await new Promise(resolve => setTimeout(resolve, 2000));

        clearForm();
        getToBoard();
    } catch (error) {
        console.error(error);
    }
}

function getPriority() {
    let activePriority = document.querySelector(".priority.active");

    if (!activePriority) {
        return "";
    }
    return activePriority.querySelector("span").innerText;
}

function getAssignedUsers() {
    const assignedContacts = [];

    const selectedContacts = document.querySelectorAll(
        '#dropdownMenu .dropdown-item.selected'
    );

    selectedContacts.forEach(contact => {
        const circle = contact.querySelector('.contact-circle');
        const nameElement = contact.querySelector('.contact-name');

        assignedContacts.push({
            id: contact.dataset.id,
            name: nameElement.textContent,
            color: circle.style.cssText
        });
    });
    return assignedContacts;
}

function getSubtasks(taskContainer) {
    const subtasks = [];
    const taskItems = taskContainer.querySelectorAll('.li-subtask');

    taskItems.forEach(task => {
        subtasks.push({
            title: task.textContent.trim(),
            status: 'open'
        });
    });
    return subtasks;
}

// functions for dropdown-section "Assigned to" //

async function loadContacts() {
    const response = await fetch(BASE_URL + "contacts.json");
    contacts = await response.json() || {};
}

function renderContacts(contacts, menu, assignedTo = [], filterWord = "") {
    menu.innerHTML = "";

    checkCurrentLogin(menu, assignedTo, filterWord);

    const assignedIds = assignedTo.map(c => c.id);

    const sortedContacts = Object.entries(contacts).sort((a, b) => {
        const firstNameA = a[1].capitalizedName.split(" ")[0];
        const firstNameB = b[1].capitalizedName.split(" ")[0];
        return firstNameA.localeCompare(firstNameB);
    });

    const currentContactId = loggedInUserEmail
    ? Object.entries(contacts).find(
          ([id, contact]) => contact.email === loggedInUserEmail)?.[0]: null;

   for (const [id, contact] of sortedContacts) {

    if (id === currentContactId) continue;

    const isSelected = assignedIds.includes(id);

    menu.innerHTML += generateContactListHTML(
        contact,
        id,
        isSelected
    );
    }
}

function checkCurrentLogin(dropdownMenu, assignedTo = [], filterWord = "") {
    if (loggedInUser === "guest") return;

    const currentContactEntry = Object.entries(contacts).find(
        ([id, contact]) => contact.email === loggedInUserEmail
    );

    if (!currentContactEntry) return;

    const [contactId, contact] = currentContactEntry;

    if (
        !contact.capitalizedName
            .toLowerCase()
            .includes(filterWord.toLowerCase())
    ) {
        return;
    }

    const isSelected = assignedTo.some(
        c => c.id === contactId
    );

    dropdownMenu.innerHTML += generateContactYourProfileHTML(
        contact,
        contactId,
        isSelected
    );
}

function toggleCheckbox(element) {
    const item = element.classList.contains('dropdown-item')
        ? element
        : element.closest('.dropdown-item');

    const checkbox = item.querySelector('input[type="checkbox"]');

    if (element === item) {
        checkbox.checked = !checkbox.checked;
    }
    item.classList.toggle('selected', checkbox.checked);
}

function filterAndShowCurrentContacts(filterWord, inputElement) {
    const menu = inputElement
        .closest('.dropdown-container')
        ?.querySelector('.dropdown-menu');

    if (!menu) return;

    const selectedIds = Array.from(
        menu.querySelectorAll('.dropdown-item.selected')
    ).map(item => item.dataset.id);

    const currentContacts = Object.fromEntries(
        Object.entries(contacts).filter(([id, contact]) =>
            contact.capitalizedName
                .toLowerCase()
                .includes(filterWord.toLowerCase())
        )
    );

    const assignedTo = selectedIds.map(id => ({ id }));

    renderContacts(
        currentContacts,
        menu,
        assignedTo,
        filterWord
    );
}

function getContactBadges(container) {
    const menu = container.querySelector('.dropdown-menu');
    const badgeContainer = container.parentElement.querySelector('.assign-contact');

    badgeContainer.innerHTML = "";

    Array.from(menu.children)
        .filter(child => child.classList.contains('selected'))
        .forEach(child => {
            renderDropdownContacts(child, badgeContainer);
        });
}

function renderDropdownContacts(child, badgeContainer) {
    const circle = child.querySelector('.contact-circle');
    const initials = circle.textContent.trim();
    const color = circle.style.background;

    badgeContainer.innerHTML += generateContactBadgeHTML(
        initials,
        `background:${color};`
    );
}

/* functions "subtask" */

function closeEditSubtask(id) {
    const input = document.getElementById(`input-subtask-${id}`);

    if (input) {
        input.value = "";
    }
}

function saveEditSubtask(id) {
    const input = document.getElementById(`input-subtask-${id}`);
    const newSubtask = input.value.trim();

    if (!newSubtask) return;

    document.getElementById(`ul-subtask-${id}`).innerHTML +=
        generateItemSubtaskHTML(newSubtask);

    input.value = '';
}

function deleteSubtask(button) {
    button.closest('.container-subtask-li').remove();
}

function editSubtask(element) {
    const container = element.classList.contains('container-subtask-li')
        ? element
        : element.closest('.container-subtask-li');

    const li = container.querySelector('.li-subtask');
    const actions = container.querySelector('.container-edit-btn');

    actions.classList.add('always-visible');
    const text = li.textContent;
    container.classList.add('subtask-edit-mode');

    li.outerHTML = generateOuterHTMLEditSubtask(text);
    actions.innerHTML = generateInnerHTMLEditSubtask();
}

function saveEditedSubtask(button) {
    const container = button.closest('.container-subtask-li');
    const input = container.querySelector('.subtask-edit-input');
    const text = input.value.trim();

    if (!text) return;

    input.outerHTML = generateOuterHTMLSaveSubtask(text);
    container.classList.remove('subtask-edit-mode');

    const actions = container.querySelector('.container-edit-btn');
    actions.classList.remove('always-visible');
    actions.innerHTML = generateInnerHTMLSaveSubtask();
}

// clear form //

function clearForm() {

    titleForm.value = "";
    descriptionForm.value = "";
    dateForm.value = "";
    categoryForm.value = "";
    subtasksForm.innerHTML = "";
    resetPrioBtn();
    document.querySelectorAll(".dropdown-item").forEach(contact => {contact.classList.remove("selected");
    
    const checkbox = contact.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.checked = false;
        }
    });
    resetRequiredFields(); 
    getContactBadges(container);
}

function resetPrioBtn() {
    document.querySelectorAll(".priority").forEach(button => { button.classList.remove("active"); });
    document.querySelectorAll(".medium").forEach(button => { button.classList.add("active"); });
}

function resetRequiredFields() {
    feedbackTitle.classList.add("hidden");
    titleForm.classList.remove("fail-red-border");
    
    feedbackDuedate.classList.add("hidden");
    dateForm.classList.remove("fail-red-border");
        
    feedbackCategory.classList.add("hidden");
    borderCategory.classList.remove("fail-red-border");
}

// Event Listeners //

document.addEventListener('input', (event) => {
    if (event.target.classList.contains('dropdown-assignment')) {
        filterAndShowCurrentContacts(event.target.value, event.target);
    }
});

document.addEventListener("click", (event) => {
    document.querySelectorAll(".dropdown-container").forEach(container => {
        const input = container.querySelector(".dropdown-assignment");
        if (!input) return;

        const menu = container.querySelector(".dropdown-menu");
        if (!menu || !menu.classList.contains("show")) return;

        if (!container.contains(event.target)) {
            menu.classList.remove("show");
            container.querySelector(".arrow-dropdown")?.classList.remove("rotate");
            input.placeholder = "Select contacts to assign";
            getContactBadges(container);
        }
    });
});

document.addEventListener("click", (event) => {
    const dropDownMenuCategories = document.getElementById('categoryMenu');
    if (!dropDownMenuCategories) return;

    if (
        dropDownMenuCategories.classList.contains("show") &&
        !dropDownMenuCategories.contains(event.target) &&
        !event.target.closest(".container-categories")
    ) {
        dropDownMenuCategories.classList.remove("show");
        document.getElementById("dropdownArrowCategory")?.classList.remove("rotate");
        document.getElementById("selectedCategory").placeholder = "Select task category";
    }
});

document.getElementById("taskTitle")?.addEventListener("input", checkTitleName);

document.getElementById("taskDate")?.addEventListener("change", checkDueDate);

document.getElementById("selectedCategory")?.addEventListener("input", checkTaskCategory);
