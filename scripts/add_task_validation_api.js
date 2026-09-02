/**
 * Submit handler for the "add task" form: prevents the native
 * submission, marks that a submit attempt has occurred (global
 * "hasTriedSubmit"), and validates title, due date, category, and
 * subtasks. If everything is valid, creates the task in the given
 * column.
 *
 * @param {SubmitEvent} event - The form submit event.
 * @param {string} column - The Kanban column the new task should be
 *                           created in.
 * @returns {boolean} Always returns false (used as an inline
 *                     `onsubmit="return checkFormDataAddTask(event, column)"`
 *                     handler to prevent a native form submission;
 *                     does not reflect whether createTask() was
 *                     called).
 */
function checkFormDataAddTask(event, column) {
    event.preventDefault();
    hasTriedSubmit = true;
 
    const isNameValid = checkTitleName();
    const isDateValid = checkDueDate();
    const isCategoryValid = checkTaskCategory();
    const isSubtaskValid = validateSubtasks('add-task');
    const isValid = isNameValid && isDateValid && isCategoryValid && isSubtaskValid;
 
    if (isValid) {
        createTask(column);
    }
    return false;
}
 
 
/**
 * Validates the task title field: must not be empty (after trimming
 * whitespace). Toggles the field's error message and red border
 * accordingly.
 *
 * @returns {boolean} True if the title is valid (non-empty), false
 *                     otherwise.
 */
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
 
 
/**
 * Validates the task due-date field: a value must be set. Toggles the
 * field's error message and red border accordingly.
 *
 * @returns {boolean} True if a due date is set, false otherwise.
 */
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
 
 
/**
 * Validates the task category field: must not be empty (after
 * trimming whitespace). Toggles the field's error message and red
 * border accordingly.
 *
 * @returns {boolean} True if a category is set (non-empty), false
 *                     otherwise.
 */
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
 
 
/**
 * Resets the error state of all required "add task" fields (title,
 * due date, category, subtasks) — hides feedback messages and removes
 * red borders — without changing the fields' actual values.
 *
 * @returns {void}
 */
function resetRequiredFields() {
    feedbackTitle.classList.add("hidden");
    titleForm.classList.remove("fail-red-border");
    
    feedbackDuedate.classList.add("hidden");
    dateForm.classList.remove("fail-red-border");
        
    feedbackCategory.classList.add("hidden");
    borderCategory.classList.remove("fail-red-border");
 
    document.getElementById("subtask-edit-feedback-add-task").classList.add("hidden");
}
 
 
// Event Listeners //
 
/**
 * Live validation listener: re-validates the title field as the user
 * types.
 *
 * @listens HTMLElement#input
 */
document.getElementById("task-title")?.addEventListener("input", checkTitleName);
 
/**
 * Live validation listener: re-validates the due-date field when its
 * value changes (e.g. picked from the date picker).
 *
 * @listens HTMLElement#change
 */
document.getElementById("task-date")?.addEventListener("input", checkDueDate);
 
/**
 * Live validation listener: re-validates the category field whenever
 * its (hidden) value changes.
 *
 * @listens HTMLElement#input
 */
document.getElementById("selectedCategory")?.addEventListener("input", checkTaskCategory);


// API //

/**
 * Saves a task to the backend.
 *
 * @async
 * @param {Object} task - The task data to persist.
 * @returns {Promise<{name: string}>} The generated task ID.
 */
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


/**
 * Creates a new task from the current form values and persists it
 * to the backend. After a successful save, a confirmation message
 * is shown, the form is cleared, and the user is redirected to the
 * board.
 *
 * @param {string} column - The Kanban column the new task belongs to.
 * @returns {Promise<void>}
 */
async function createTask(column) {
    const taskData = {
        title: titleForm.value,
        description: descriptionForm.value,
        dueDate: dateForm.value,
        priority: getPriority(),
        assignedTo: getAssignedUsers(),
        category: categoryForm.value,
        subtasks: getSubtasks(subtasksForm),
        taskStatus: column || "To do",
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


/**
* Reads which priority button is currently active in the add-task
* form.
*
* @returns {string} The text of the active priority button's label,
*                    or an empty string if none is active.
*/
function getPriority() {
   const container = document.getElementById('button-prio-form');
   const activePriority = container?.querySelector('.priority.active');

   return activePriority
       ? activePriority.querySelector('span').innerText
       : '';
}


/**
* Reads the currently selected contacts out of the add-task
* assignment dropdown.
*
* @returns {Array<{id: string, name: string, color: string}>} The
*          selected contacts.
*/
function getAssignedUsers() {
   const assignedContacts = [];
   const selectedContacts = document.querySelectorAll('#dropdownMenu .dropdown-item.selected');

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


/**
* Reads the current subtasks out of a given subtask list container
* for a newly created task, setting each one's status to "open".
*
* @param {HTMLElement} taskContainer - Container holding the subtask
*                                       list items (".li-subtask").
* @returns {Array<{title: string, status: string}>} The subtasks,
*          each with status "open".
*/
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


/**
* Loads all contacts from the backend into the global "contacts"
* variable (as an object keyed by contact ID), or an empty object if
* the backend has no data.
*
* @returns {Promise<void>}
*/
async function loadContacts() {
   const response = await fetch(BASE_URL + "contacts.json");
   contacts = await response.json() || {};
}