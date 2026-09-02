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
 