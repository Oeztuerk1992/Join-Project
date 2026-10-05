// Variables //
 
const titleForm = document.getElementById("task-title");
const descriptionForm = document.getElementById("task-description");
const dateForm = document.getElementById("task-date");
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
 

/**
 * Initializes the "Add Task" form: reads the target column from the URL,
 * loads the user profile and all contacts, and renders the contact list
 * in the assignment dropdown.
 *
 * @returns {Promise<void>}
 */
async function initAddTask() {
    const params = new URLSearchParams(window.location.search);
    currentColumn = params.get('column') || 'To do';
    getUserProfile();
    await loadContacts();
    const menu = document.querySelector("#toggle-default .dropdown-menu");
    renderContacts(contacts, menu);
}
 
 
// functions for form content //
 
/**
 * Toggles the "active" state of a priority button (Urgent/Medium/Low).
 * Only one button within the parent container can be active at a time.
 *
 * @param {HTMLElement} selectedButton - The clicked priority button.
 * @returns {void}
 */
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
 
 
/**
 * Opens/closes the category dropdown and rotates the associated
 * arrow indicator.
 *
 * @returns {void}
 */
function toggleCategoryDropdown() {
    document.getElementById("categoryMenu").classList.toggle("show");
    document.getElementById("dropdownArrowCategory").classList.toggle("rotate");
}
 
 
/**
 * Selects a category for the task, writes it to the hidden form field,
 * closes the dropdown, and triggers category validation.
 *
 * @param {string} category - The value of the selected category.
 * @param {Event} event - The click event; stopPropagation() is used to
 *                         prevent the global "click outside closes
 *                         dropdown" handler from firing.
 * @returns {void}
 */
function selectCategory(category, event) {
    event.stopPropagation();
    document.getElementById("selectedCategory").value = category;
    document.getElementById("categoryMenu").classList.remove("show");
    document.getElementById("dropdownArrowCategory").classList.remove("rotate");
    checkTaskCategory();
}
 
 
/**
 * Opens/closes the contact assignment dropdown. On open, focuses the
 * input and clears its placeholder; on close, resets the input and
 * re-renders the contact list based on the currently selected contacts.
 * Afterwards updates the contact badges.
 *
 * @param {HTMLElement} container - The wrapper container holding the
 *                                  input, arrow, and dropdown menu
 *                                  (e.g. "#toggle-default").
 * @returns {void}
 */
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
        input.placeholder = "Select contacts";
        const assignedTo = selectedContactIds.map(id => ({ id }));
        renderContacts(contacts, menu, assignedTo);
    }
    getContactBadges(container);
}
 
 
/**
 * Shows the contact dropdown menu as soon as text is entered in the
 * filter input.
 *
 * @param {HTMLElement} input - The contact filter input element.
 * @returns {void}
 */
function showFilteredContactList(input) {
    const menu = input.closest('.dropdown-container').querySelector('.dropdown-menu');
    menu.classList.add('show');
}
 
 
/**
 * Renders all contacts into the dropdown menu.
 *
 * @param {Object} contacts - All available contacts.
 * @param {HTMLElement} menu - Dropdown menu container.
 * @param {Array<Object>} [assignedTo=[]] - Selected contacts.
 * @param {string} [filterWord=""] - Current filter value.
 * @returns {void}
 */
function renderContacts(contacts, menu, assignedTo = [], filterWord = "") {
    menu.innerHTML = "";

    if (hasNoContacts(contacts, menu)) return;

    checkCurrentLogin(menu, assignedTo, filterWord);

    const assignedIds = assignedTo.map(contact => contact.id);
    const currentContactId = getCurrentContactId(contacts);

    renderContactList(
        contacts,
        menu,
        assignedIds,
        currentContactId
    );
}


/**
 * Displays an empty-state message if no contacts exist.
 *
 * @param {Object} contacts - All available contacts.
 * @param {HTMLElement} menu - Dropdown menu container.
 * @returns {boolean} True if no contacts exist.
 */
function hasNoContacts(contacts, menu) {
    if (Object.keys(contacts).length === 0) {
        menu.innerHTML = generateEmptyContactListHTML();
        return true;
    }

    return false;
}


/**
 * Returns the contact ID of the currently logged-in user.
 *
 * @param {Object} contacts - All available contacts.
 * @returns {string|null} The logged-in contact ID or null.
 */
function getCurrentContactId(contacts) {
    const email = sessionStorage.getItem("loggedInUserEmail");

    if (!email) return null;

    return Object.entries(contacts).find(
        ([, contact]) => contact.email === email
    )?.[0] || null;
}


/**
 * Sorts contacts alphabetically by first name.
 *
 * @param {Object} contacts - All available contacts.
 * @returns {Array} Sorted contact entries.
 */
function getSortedContacts(contacts) {
    return Object.entries(contacts).sort((a, b) => {
        const firstNameA = a[1].capitalizedName.split(" ")[0];
        const firstNameB = b[1].capitalizedName.split(" ")[0];

        return firstNameA.localeCompare(firstNameB);
    });
}


/**
 * Renders the sorted contact list into the dropdown menu.
 *
 * @param {Object} contacts - All available contacts.
 * @param {HTMLElement} menu - Dropdown menu container.
 * @param {string[]} assignedIds - IDs of selected contacts.
 * @param {string|null} currentContactId - Logged-in contact ID.
 * @returns {void}
 */
function renderContactList(
    contacts,
    menu,
    assignedIds,
    currentContactId
) {
    const sortedContacts = getSortedContacts(contacts);

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
 
 
/**
 * Adds the logged-in user to the dropdown menu.
 *
 * @param {HTMLElement} dropdownMenu - Dropdown menu container.
 * @param {Array<Object>} [assignedTo=[]] - Selected contacts.
 * @param {string} [filterWord=""] - Current filter value.
 * @returns {void}
 */
function checkCurrentLogin(
    dropdownMenu,
    assignedTo = [],
    filterWord = ""
) {
    if (loggedInUser === "guest") return;

    const currentContact = getCurrentContactEntry();
    if (!currentContact) return;

    appendCurrentContact(
        currentContact,
        dropdownMenu,
        assignedTo,
        filterWord
    );
}


/**
 * Returns the contact entry of the logged-in user.
 *
 * @returns {[string, Object]|undefined} Contact ID and contact data.
 */
function getCurrentContactEntry() {
    const loggedInContactId =
        sessionStorage.getItem("loggedInContactId");

    return Object.entries(contacts).find(
        ([id]) => id === loggedInContactId
    );
}


/**
 * Appends the logged-in user to the dropdown if visible.
 *
 * @param {[string, Object]} currentContact - Contact entry.
 * @param {HTMLElement} dropdownMenu - Dropdown menu container.
 * @param {Array<Object>} assignedTo - Selected contacts.
 * @param {string} filterWord - Current filter value.
 * @returns {void}
 */
function appendCurrentContact(
    currentContact,
    dropdownMenu,
    assignedTo,
    filterWord
) {
    const [contactId, contact] = currentContact;

    if (!matchesFilter(contact, filterWord)) return;

    const isSelected = assignedTo.some(
        assigned => assigned.id === contactId
    );

    dropdownMenu.innerHTML += generateContactYourProfileHTML(
        contact,
        contactId,
        isSelected
    );
}
