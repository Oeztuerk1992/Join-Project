/* ========================================
functions "subtask"
======================================== */
 
/**
 * Cancels editing of a subtask by clearing its input field.
 *
 * @param {string|number} id - ID of the subtask whose input should be cleared.
 * @returns {void}
 */
function closeEditSubtask(id) {
    const input = document.getElementById(`input-subtask-${id}`);
    if (input) input.value = "";
}
 
 
/**
 * Appends the input text as a new subtask list item and clears the input; ignores empty text.
 *
 * @param {string|number} id - ID of the task whose subtask list ("ul-subtask-{id}") is extended.
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
 * @param {HTMLElement} button - The delete button inside the ".container-subtask-li" item.
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
 * Puts a subtask list item into edit mode with an input field and swapped action buttons.
 *
 * @param {HTMLElement} element - The ".container-subtask-li" element or a descendant of it.
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
    focusSubtaskInput(container);
}


/**
 * Focuses the subtask edit input and places the cursor at the end of its text.
 *
 * @param {HTMLElement} container - The ".container-subtask-li" element holding the input.
 * @returns {void}
 */
function focusSubtaskInput(container) {
    const input = container.querySelector('.subtask-edit-input');
    if (!input) return;
    input.focus();
    const length = input.value.length;
    input.setSelectionRange(length, length);
}
 
 
/**
 * Saves the edited subtask text, leaves edit mode and validates the subtask list; ignores empty text.
 *
 * @param {HTMLElement} button - The save button inside the ".container-subtask-li" item.
 * @returns {void}
 */
function saveEditedSubtask(button) {
    const container = button.closest('.container-subtask-li');
    const input = container.querySelector('.subtask-edit-input');
    const text = input.value.trim();
    if (!text) return;
    input.outerHTML = generateOuterHTMLSaveSubtask(text);
    exitSubtaskEditMode(container);
    const id = container.closest('[id^="ul-subtask-"]').id.replace('ul-subtask-', '');
    validateSubtasks(id);
}


/**
 * Removes the edit mode state and restores the default action buttons.
 *
 * @param {HTMLElement} container - The ".container-subtask-li" element.
 * @returns {void}
 */
function exitSubtaskEditMode(container) {
    container.classList.remove('subtask-edit-mode');
    const actions = container.querySelector('.container-edit-btn');
    actions.classList.remove('always-visible');
    actions.innerHTML = generateInnerHTMLSaveSubtask();
}
 

/* ========================================
clear form
======================================== */

/**
 * Resets the "Add Task" form fields, contact selection and required-field errors.
 *
 * @returns {void}
 */
function clearForm() {
    clearFormFields();
    resetPrioBtn();
    clearContactSelection();
    selectedContactIds = [];
    resetRequiredFields();
    getContactBadges(container);
}


/**
 * Clears all text inputs, the subtask list and the contact filter field.
 *
 * @returns {void}
 */
function clearFormFields() {
    titleForm.value = "";
    descriptionForm.value = "";
    dateForm.value = "";
    categoryForm.value = "";
    subtasksForm.innerHTML = "";
    filterInputContact.value = "";
    inputSubtask.value = "";
}


/**
 * Deselects all dropdown contacts and unchecks their checkboxes.
 *
 * @returns {void}
 */
function clearContactSelection() {
    document.querySelectorAll(".dropdown-item").forEach(contact => {
        contact.classList.remove("selected");
        const checkbox = contact.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = false;
    });
}
 

/**
 * Resets the priority selection to the default: removes "active" from
 * all priority buttons and marks the "medium" button as active.
 *
 * @returns {void}
 */
function resetPrioBtn() {
    const addTaskPrioContainer = document.getElementById('button-prio-form');
 
    addTaskPrioContainer
        .querySelectorAll('.priority')
        .forEach(button => button.classList.remove('active'));
 
    addTaskPrioContainer
        .querySelector('.medium')
        ?.classList.add('active');
}
 

/* ========================================
Event Listeners, support functions
======================================== */

// Filters and re-renders contacts when text is typed into a ".dropdown-assignment" input.

document.addEventListener('input', (event) => {
    if (event.target.classList.contains('dropdown-assignment')) {
        filterAndShowCurrentContacts(event.target.value, event.target);
    }
});
 
 
// Closes open contact dropdowns when clicking outside their container.

document.addEventListener("click", (event) => {
    document.querySelectorAll(".dropdown-container").forEach(container => {
        if (!container.contains(event.target)) closeOpenDropdown(container);
    });
});


/**
 * Closes an open dropdown, resets input and arrow, re-renders contacts and updates badges.
 *
 * @param {HTMLElement} container - The ".dropdown-container" element.
 * @returns {void}
 */
function closeOpenDropdown(container) {
    const input = container.querySelector(".dropdown-assignment");
    const menu = container.querySelector(".dropdown-menu");
    if (!input || !menu || !menu.classList.contains("show")) return;
    menu.classList.remove("show");
    container.querySelector(".arrow-dropdown")?.classList.remove("rotate");
    input.value = "";
    input.placeholder = "Select contacts";
    const assignedTo = selectedContactIds.map(id => ({ id }));
    renderContacts(contacts, menu, assignedTo);
    getContactBadges(container);
}
 
 
// Closes the category dropdown when clicking outside of it.

document.addEventListener("click", (event) => {
    const menu = document.getElementById('categoryMenu');
    if (!menu) return;
    if (
        menu.classList.contains("show") &&
        !menu.contains(event.target) &&
        !event.target.closest(".container-categories")
    ) {
        menu.classList.remove("show");
        document.getElementById("dropdownArrowCategory")?.classList.remove("rotate");
        document.getElementById("selectedCategory").placeholder = "Select task category";
    }
});
 