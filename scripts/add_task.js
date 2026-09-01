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
 * Renders the contact list into the given dropdown menu: sorted
 * alphabetically by first name, the logged-in user is excluded from the
 * regular list (they are shown separately via checkCurrentLogin() as
 * "own profile"), already assigned contacts are marked as selected.
 * If "contacts" is empty, an empty-state view is rendered instead.
 *
 * @param {Object.<string, Object>} contacts - Contact objects, keyed by
 *                                              contact ID.
 * @param {HTMLElement} menu - The dropdown menu element to render into.
 * @param {Array<{id: string}>} [assignedTo=[]] - Contacts already
 *                                                 assigned (only the id
 *                                                 is used).
 * @param {string} [filterWord=""] - Not used directly in this function;
 *                                   passed through to checkCurrentLogin().
 * @returns {void}
 */
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
 
 
/**
 * Renders the logged-in user as a separate "own profile" entry at the
 * top of the contact list; renders nothing if the user is logged in as
 * a guest. Takes the current filter text and selection state into
 * account.
 *
 * @param {HTMLElement} dropdownMenu - The dropdown menu element the
 *                                     entry is appended to.
 * @param {Array<{id: string}>} [assignedTo=[]] - Contacts already assigned.
 * @param {string} [filterWord=""] - Search text checked against the
 *                                   logged-in user's name.
 * @returns {void}
 */
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
 
 
/**
 * Toggles the checkbox of a contact list item and keeps
 * "selectedContactIds" in sync. Can be called with the list item itself
 * or with a descendant of it.
 *
 * @param {HTMLElement} element - The ".dropdown-item" element or a
 *                                 descendant of it.
 * @returns {void}
 */
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
 
 
/**
 * Filters contacts by the entered text (case-insensitive substring
 * match on the name) and re-renders the filtered list in the
 * associated dropdown menu.
 *
 * @param {string} filterWord - The search text from the filter input.
 * @param {HTMLElement} inputElement - The filter input element, used to
 *                                     locate the associated
 *                                     container/menu.
 * @returns {void}
 */
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
 
 
/**
 * Renders the badges (initials circles) of the currently selected
 * contacts (selectedContactIds) into the associated badge container.
 *
 * @param {HTMLElement} container - An ancestor of the badge container
 *                                  (".assign-contact" is a child of
 *                                  container.parentElement).
 * @returns {void}
 */
function getContactBadges(container) {
    const badgeContainer = container.parentElement.querySelector('.assign-contact');
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
 
 
/**
 * Reads the initials and background color from a given contact circle
 * element and appends a new badge built from them to the given badge
 * container.
 *
 * @param {HTMLElement} child - Element containing a ".contact-circle"
 *                              child (initials + background color).
 * @param {HTMLElement} badgeContainer - Container the badge HTML is
 *                                       appended to.
 * @returns {void}
 */
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
 
/**
 * Cancels editing of a subtask by clearing its input field (restoring
 * the display view itself happens elsewhere, e.g. in the related
 * HTML/template).
 *
 * @param {string|number} id - ID of the subtask whose input field
 *                              should be cleared.
 * @returns {void}
 */
function closeEditSubtask(id) {
    const input = document.getElementById(`input-subtask-${id}`);
 
    if (input) {
        input.value = "";
    }
}
 
 
/**
 * Takes the text from the subtask input field as a new subtask, appends
 * it as a list item to the associated subtask list, and clears the
 * input field afterwards. Does nothing if the text is empty/whitespace.
 *
 * @param {string|number} id - ID of the task whose subtask list
 *                              ("ul-subtask-{id}") this belongs to.
 * @returns {void}
 */
function saveEditSubtask(id) {
    const input = document.getElementById(`input-subtask-${id}`);
    const newSubtask = input.value.trim();
 
    if (!newSubtask) return;
 
    document.getElementById(`ul-subtask-${id}`).innerHTML +=
        generateItemSubtaskHTML(newSubtask);
 
    input.value = '';
}
 
 
/**
 * Removes a subtask list item from the DOM and triggers validation of
 * the remaining subtasks in the associated list.
 *
 * @param {HTMLElement} button - The delete button inside the
 *                                ".container-subtask-li" item.
 * @returns {void}
 */
function deleteSubtask(button) {
    const container = button.closest('.container-subtask-li');
 
    const ul = container.closest('[id^="ul-subtask-"]');
    const id = ul.id.replace('ul-subtask-', '');
 
    container.remove();
 
    validateSubtasks(id);
}
 
 
/**
 * Puts a subtask list item into edit mode: replaces the text display
 * with an editable input field, swaps the action buttons accordingly,
 * and focuses the new input (cursor placed at the end of the existing
 * text).
 *
 * @param {HTMLElement} element - Either the ".container-subtask-li"
 *                                element itself or a descendant of it.
 * @returns {void}
 */
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
 
 
/**
 * Saves the subtask text changed in edit mode, exits edit mode
 * (swaps display markup and action buttons back), and triggers
 * validation of the associated subtask list. Does nothing if the text
 * is empty/whitespace.
 *
 * @param {HTMLElement} button - The save button inside the
 *                                ".container-subtask-li" item.
 * @returns {void}
 */
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
 
/**
 * Resets the entire "Add Task" form: clears all text fields, the
 * subtask list, and the contact filter field, resets the priority to
 * its default, clears all contact selections (including checkbox
 * state), empties selectedContactIds, resets required-field error
 * states, and refreshes the contact badges.
 *
 * @returns {void}
 */
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
 
/*     const closeMobile = document.getElementById('close-mobile');
    if (closeMobile && getComputedStyle(closeMobile).display === 'block') {
    getToBoard();
}*/
 
}
 
/**
 * Resets the priority selection to the default: removes "active" from
 * all priority buttons and marks the "medium" button as active.
 *
 * @returns {void}
 */
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
 
/**
 * Global input listener. Whenever text is typed into a
 * ".dropdown-assignment" input (the contact filter field), filters and
 * re-renders the matching contacts.
 *
 * @listens document#input
 * @param {InputEvent} event - The input event; event.target is checked
 *                              for the ".dropdown-assignment" class.
 * @returns {void}
 */
document.addEventListener('input', (event) => {
    if (event.target.classList.contains('dropdown-assignment')) {
        filterAndShowCurrentContacts(event.target.value, event.target);
    }
});
 
 
/**
 * Global click listener ("click outside closes dropdown" for contact
 * assignment). Iterates over every ".dropdown-container" on the page;
 * for any container whose dropdown menu is currently open, a click
 * outside that container closes the menu, resets the filter input and
 * arrow rotation, re-renders the contact list based on the current
 * selection, and refreshes the contact badges.
 *
 * @listens document#click
 * @param {MouseEvent} event - The click event, used to test whether the
 *                              click happened outside a given
 *                              ".dropdown-container".
 * @returns {void}
 */
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
            input.placeholder = "Select contacts";
 
            const assignedTo = selectedContactIds.map(id => ({ id }));
            renderContacts(contacts, menu, assignedTo);
 
            getContactBadges(container);
        }
    });
});
 
 
/**
 * Global click listener ("click outside closes dropdown" for the
 * category dropdown). If the category menu is open and the click
 * happened neither inside the menu nor inside a ".container-categories"
 * element, the menu is closed, the arrow rotation is reset, and the
 * category input placeholder is restored.
 *
 * @listens document#click
 * @param {MouseEvent} event - The click event, used to test whether the
 *                              click happened outside the category
 *                              dropdown.
 * @returns {void}
 */
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
 