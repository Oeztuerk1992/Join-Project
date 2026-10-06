/* ========================================
form validation for contact inputs
======================================== */

/**
 * Validates the "add task" form on submit and creates the task in the given column if valid.
 *
 * @param {SubmitEvent} event - The form submit event.
 * @param {string} column - The Kanban column the new task is created in.
 * @returns {boolean} Always false, to prevent native form submission.
 */
function checkFormDataAddTask(event, column) {
    event.preventDefault();
    hasTriedSubmit = true;
    const isNameValid = checkTitleName();
    const isDateValid = checkDueDate();
    const isCategoryValid = checkTaskCategory();
    const isSubtaskValid = validateSubtasks('add-task');
    const isValid = isNameValid && isDateValid && isCategoryValid && isSubtaskValid;
    if (isValid) createTask(column);
    return false;
}
 
 
/**
 * Validates that the task title is not empty and toggles the error message and red border.
 *
 * @returns {boolean} True if the title is valid, false otherwise.
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
    if (dateForm.value && (!dateForm.min || dateForm.value >= dateForm.min)) {
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
 * trimming whitespace). Toggles the field's error message and red border accordingly.
 *
 * @returns {boolean} True if a category is set (non-empty), false otherwise.
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
 * Resets the error state of all required "add task" fields,
 * hides feedback messages and removes red borders.
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
 
 
/* ========================================
API
======================================== */

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
 * Creates a task from the form values, saves it, shows a confirmation and redirects to the board.
 *
 * @param {string} column - The Kanban column the new task belongs to.
 * @returns {Promise<void>}
 */
async function createTask(column) {
    const taskData = buildTaskData(column);
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
 * Collects the current form values into a task object.
 *
 * @param {string} column - The Kanban column the task is created in.
 * @returns {Object} The task data.
 */
function buildTaskData(column) {
    return {
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
}


/**
* Reads which priority button is currently active in the add-task
* form.
*
* @returns {string} The text of the active priority button's label, or an empty string if none is active.
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
* @returns {Array<{id: string, name: string, color: string}>} The selected contacts.
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
* @param {HTMLElement} taskContainer - Container holding ".li-subtask")
* @returns {Array<{title: string, status: string}>} The subtasks, each with status "open".
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
* variable or an empty object if the backend has no data.
*
* @returns {Promise<void>}
*/
async function loadContacts() {
   const response = await fetch(BASE_URL + "contacts.json");
   contacts = await response.json() || {};
}


/**
 * Formats a Date object as a local ISO date string (YYYY-MM-DD).
 * Intentionally avoids toISOString(), which returns UTC and can yield the wrong date.
 *
 * @param {Date} date - The date to format.
 * @returns {string} Date in YYYY-MM-DD format.
 */
function formatLocalDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  

  /**
   * Sets the min attribute of a date input so that only future dates can be selected.
   *
   * @param {string} inputId - ID of the date input element.
   * @param {boolean} [excludeToday=false] - If true, the earliest selectable date is tomorrow; if false, today.
   * @returns {void}
   */
  function restrictToFutureDates(inputId, excludeToday = false) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const date = new Date();
    if (excludeToday) date.setDate(date.getDate() + 1);
    input.min = formatLocalDate(date);
  }
  
  restrictToFutureDates('task-date');