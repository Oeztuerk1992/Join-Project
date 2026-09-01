// Variables //
 
/**
 * The data for a new task, built ONCE from the current form values at
 * the moment this script runs (script load / page load), not
 * re-evaluated per task creation.
 *
 * IMPORTANT — likely bug: this object is a module-level constant, so
 * its values (title, description, dueDate, priority, assignedTo,
 * category, subtasks, dragOrder) are captured a single time and never
 * refreshed. Every call to createTask() reuses this same stale
 * snapshot instead of reading the form's current values. In addition,
 * `taskStatus: column || 'To do'` references a variable named
 * "column" that is not declared anywhere in this file — it relies on
 * some other global "column" being in scope at load time, and it is
 * NOT the same "column" parameter that createTask(column) receives;
 * that parameter is never actually used to set taskStatus.
 *
 * @type {{title: string, description: string, dueDate: string,
*         priority: string, assignedTo: Array<Object>,
*         category: string, subtasks: Array<Object>,
*         taskStatus: string, dragOrder: number}}
*/
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


/**
* Persists a new task to the backend.
*
* @param {Object} task - The task data to create (see taskData).
* @returns {Promise<Object>} The parsed JSON response from the backend
*                             (includes the generated key as "name").
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
* Creates a new task: posts the module-level "taskData" object to the
* backend (see the caveat on "taskData" above — this does not
* currently use the "column" parameter), shows a confirmation, waits
* briefly, then clears the add-task form and navigates back to the
* board. Errors during saving are caught and logged, not surfaced to
* the UI.
*
* @param {string} column - Intended to specify which Kanban column the
*                           task belongs to. Currently unused inside
*                           the function body (see "taskData").
* @returns {Promise<void>}
*/
async function createTask(column) {
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
