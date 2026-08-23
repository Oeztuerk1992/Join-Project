// Variables //

const titleForm = document.getElementById("taskTitle");
const descriptionForm = document.getElementById("taskDescription");
const dateForm = document.getElementById("taskDate");
const categoryForm = document.getElementById("selectedCategory");
const subtasksForm = document.getElementById("ul-subtask-add-task");
const dropDownMenuCategories = document.getElementById('categoryMenu');
const container = document.getElementById('toggle-default');
const dropDownMenuAssignments = document.querySelector("#toggle-default .dropdown-menu");
const filterInputContact = document.getElementById("dropdown-assignment");
const inputSubtask = document.getElementById("input-subtask-add-task");

const feedbackTitle = document.getElementById("feedback-title");
const feedbackDuedate = document.getElementById("feedback-duedate");
const feedbackCategory = document.getElementById("feedback-category");
const borderCategory = document.getElementById("category-border");

let contacts = {};
let currentColumn = 'To do';
let selectedContactIds = [];
let hasTriedSubmit = false;

// Functions //

// Init and Loading //

async function initAddTask() {
    const params = new URLSearchParams(window.location.search);
    currentColumn = params.get('column') || 'To do';
    
    getUserProfile();
    await loadContacts();

    const menu = document.querySelector("#toggle-default .dropdown-menu");
    renderContacts(contacts, menu);
}


// functions for form content //

function setPriority(selectedButton) {
    const container = selectedButton.parentElement;

    const buttons = container.querySelectorAll('.priority');

    if (selectedButton.classList.contains('active')) {
        selectedButton.classList.remove('active');
    } else {
        buttons.forEach(button =>
            button.classList.remove('active')
        );

        selectedButton.classList.add('active');
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
        input.value = "";
        input.placeholder = "Select contacts to assign";

        const assignedTo = selectedContactIds.map(id => ({ id }));
        renderContacts(contacts, menu, assignedTo);
    }

    getContactBadges(container);
}


function showFilteredContactList(input) {
    const menu = input.closest('.dropdown-container').querySelector('.dropdown-menu');
    menu.classList.add('show');
}


function renderContacts(contacts, menu, assignedTo = [], filterWord = "") {
    menu.innerHTML = "";

    if (Object.keys(contacts).length === 0) {
        menu.innerHTML = generateEmptyContactListHTML();
        return;
    }

    const loggedInUserEmail =
        sessionStorage.getItem('loggedInUserEmail');

    checkCurrentLogin(menu, assignedTo, filterWord);

    const assignedIds = assignedTo.map(c => c.id);

    const sortedContacts = Object.entries(contacts).sort((a, b) => {
        const firstNameA = a[1].capitalizedName.split(" ")[0];
        const firstNameB = b[1].capitalizedName.split(" ")[0];
        return firstNameA.localeCompare(firstNameB);
    });

    const currentContactId = loggedInUserEmail
        ? Object.entries(contacts).find(
              ([id, contact]) =>
                  contact.email === loggedInUserEmail
          )?.[0]
        : null;

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

    const loggedInContactId =
        sessionStorage.getItem('loggedInContactId');

    const currentContactEntry = Object.entries(contacts).find(
        ([id]) => id === loggedInContactId
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
    const id = item.dataset.id;

    if (element === item) {
        checkbox.checked = !checkbox.checked;
    }

    item.classList.toggle('selected', checkbox.checked);

    if (checkbox.checked) {
        if (!selectedContactIds.includes(id)) {
            selectedContactIds.push(id);
        }
    } else {
        selectedContactIds = selectedContactIds.filter(
            contactId => contactId !== id
        );
    }
}


function filterAndShowCurrentContacts(filterWord, inputElement) {
    const menu = inputElement
        .closest('.dropdown-container')
        ?.querySelector('.dropdown-menu');

    if (!menu) return;

    const currentContacts = Object.fromEntries(
        Object.entries(contacts).filter(([id, contact]) =>
            contact.capitalizedName
                .toLowerCase()
                .includes(filterWord.toLowerCase())
        )
    );

    const assignedTo = selectedContactIds.map(id => ({ id }));

    renderContacts(
        currentContacts,
        menu,
        assignedTo,
        filterWord
    );
}


function getContactBadges(container) {
    const badgeContainer =
        container.parentElement.querySelector('.assign-contact');

    badgeContainer.innerHTML = "";

    selectedContactIds.forEach(id => {
        const contact = contacts[id];

        if (!contact) return;

        badgeContainer.innerHTML += generateContactBadgeHTML(
            contact.initials,
            `background:${contact.randomColor};`
        );
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
    const container = button.closest('.container-subtask-li');

    const ul = container.closest('[id^="ul-subtask-"]');
    const id = ul.id.replace('ul-subtask-', '');

    container.remove();

    validateSubtasks(id);
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

    const input = container.querySelector('.subtask-edit-input');
    if (input) {
    input.focus();

    const length = input.value.length;
    input.setSelectionRange(length, length);
    }
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

    const ul = container.closest('[id^="ul-subtask-"]');
    const id = ul.id.replace('ul-subtask-', '');
    validateSubtasks(id);
}


// clear form //

function clearForm() {

    titleForm.value = "";
    descriptionForm.value = "";
    dateForm.value = "";
    categoryForm.value = "";
    subtasksForm.innerHTML = "";
    filterInputContact.value = "";
    inputSubtask.value = "";
    resetPrioBtn();
    document.querySelectorAll(".dropdown-item").forEach(contact => {contact.classList.remove("selected");
    
    const checkbox = contact.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.checked = false;
        }
    });
    selectedContactIds = [];
    resetRequiredFields(); 
    getContactBadges(container);

    if (getComputedStyle(document.getElementById('close-mobile')).display === 'block') {
        getToBoard();
    }
}

function resetPrioBtn() {
    const addTaskPrioContainer =
        document.getElementById('button-prio-form');

    addTaskPrioContainer
        .querySelectorAll('.priority')
        .forEach(button => button.classList.remove('active'));

    addTaskPrioContainer
        .querySelector('.medium')
        ?.classList.add('active');
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

            input.value = "";
            input.placeholder = "Select contacts to assign";

            const assignedTo = selectedContactIds.map(id => ({ id }));
            renderContacts(contacts, menu, assignedTo);

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
