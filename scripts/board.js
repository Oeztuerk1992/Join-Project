// Variables //
 
let placeholder = null;
let autoScrollInterval = null;
let currentDraggedElement;
let autoScrollContainer = null;
let autoScrollDirection = 0;

let tasks = [];
 

/**
 * Maps each task status to its corresponding Kanban column element in
 * the DOM.
 *
 * @type {Object.<string, HTMLElement>}
 */
const columns = {
        'To do': document.getElementById('kanban-to-do'),
        'In progress': document.getElementById('kanban-in-progress'),
        'Await feedback': document.getElementById('kanban-feedback'),
        'Done': document.getElementById('kanban-done')
};
 
 
// Init and Loading //
 
/**
 * Initializes the Kanban board: sets up the "Add Task" form/contacts,
 * loads all tasks from the backend, and renders them onto the board.
 *
 * @returns {Promise<void>}
 */
async function initBoard() {
    await initAddTask();
    await loadTasks();
 
    updateTasksforBoard();
}
 
 
// Board //
 
/**
 * Re-renders the entire board: clears all columns, sorts the given
 * tasks by drag order and appends each one's mini card HTML into its
 * matching status column, then fills any column that ends up empty
 * with an empty-state placeholder.
 *
 * @param {Array<Object>} [tasksToShow=tasks] - The tasks to render
 *                                               (defaults to the full
 *                                               global "tasks" array;
 *                                               a filtered subset can
 *                                               be passed, e.g. from
 *                                               search).
 * @returns {void}
 */
function updateTasksforBoard(tasksToShow = tasks) {
    Object.values(columns).forEach(column => column.innerHTML = '');
 
    tasksToShow
        .sort((a, b) => a.dragOrder - b.dragOrder)
        .forEach(task => {
            const column = columns[task.taskStatus];
 
            if (column) {
                column.innerHTML += generateTaskMiniCardHTML(task);
            }
        });
 
    Object.entries(columns).forEach(([status, column]) => {
        if (column.innerHTML.trim() === '') {
            column.innerHTML = generateEmptyCardHTML(status);
        }
    });
}
 
 
// Functions for generating minicard-HTML //
 
/**
 * Returns the category label markup for a mini card, based on whether
 * the task is a "User Story" or a technical task.
 *
 * @param {string} category - The task's category value.
 * @returns {string} HTML markup for the category label.
 */
function getTaskCategory(category) {
    if (category === 'User Story') { 
 
        return generateTaskCategoryUserStoryHTML();
    }
    return generateTaskCategoryTechnicalTaskHTML();
}
 
 
/**
 * Returns the priority icon markup for a mini card, based on the
 * task's priority level.
 *
 * @param {string} priority - The task's priority ("Low", "Medium",
 *                             or "Urgent").
 * @returns {string} HTML markup for the priority icon, or an empty
 *                    string if the priority does not match a known
 *                    value.
 */
function getImgPrio(priority) {
    if (priority === 'Low') {
        return generateImgPrioLowHTML();
    }
 
    if (priority === 'Medium') {
        return generateImgPrioMediumHTML();
    }
 
    if (priority === 'Urgent') {
        return generateImgPrioHighHTML();
    }
 
    return '';
}
 
 
/**
 * Builds the assigned-contact badge markup for a mini card. Computes
 * two-letter initials from each contact's name, optionally limits how
 * many badges are shown, and appends a "+N" badge for any remaining
 * contacts beyond the limit. Contacts without a name are skipped (with
 * a console warning).
 *
 * @param {Array<{name: string, color: string}>} [assignments=[]] - The
 *                                assigned contacts.
 * @param {number|null} [limit=null] - Maximum number of badges to
 *                                render; null shows all.
 * @returns {string} HTML markup for the badges (plus a "+N" badge if
 *                    applicable).
 */
function getAssignedContactBadges(assignments = [], limit = null) {
    const visible = limit ? assignments.slice(0, limit) : assignments;
    const badgesHTML = visible.map(contact => {
 
        if (!contact?.name) {
            console.warn('Invalid assigned contact:', contact);
            return '';
        }
 
        const parts = contact.name.trim().split(' ');
        const initials =
            (parts[0]?.[0] || '').toUpperCase() +
            (parts.length > 1
                ? (parts[parts.length - 1]?.[0] || '').toUpperCase()
                : '');
 
        return generateBadgesHTML(contact.color, initials);
    }).join('');
    const remaining = limit ? assignments.length - limit : 0;
    return remaining > 0
        ? badgesHTML + `<div class="user-abbr user-abbr-more">+${remaining}</div>`
        : badgesHTML;
}
 

/**
 * Builds full-row markup (badge + full name) for each assigned
 * contact, e.g. for use in the task detail overlay. Contacts without a
 * name are skipped (with a console warning).
 *
 * @param {Array<{name: string, color: string}>} [assignments=[]] - The
 *                                assigned contacts.
 * @returns {string} HTML markup for the contact rows.
 */
function getAssignedContactRows(assignments = []) {
    return assignments.map(contact => {
 
        if (!contact?.name) {
            console.warn('Invalid assigned contact:', contact);
            return '';
        }
 
        const parts = contact.name.trim().split(' ');
        const initials =
            (parts[0]?.[0] || '').toUpperCase() +
            (parts.length > 1
                ? (parts[parts.length - 1]?.[0] || '').toUpperCase()
                : '');
 
        return `
            <div class="container-user">
                ${generateBadgesHTML(contact.color, initials)}
                ${generateUserNamesHTML(contact.name)}
            </div>
        `;
    }).join('');
}
 
 
/**
 * Builds the "x/y Subtasks" progress text for a task's mini card.
 *
 * @param {Array<{status: string}>} subtasks - The task's subtasks.
 * @returns {string} The progress text (e.g. "2/5 Subtasks"), or an
 *                    empty string if there are no subtasks.
 */
function getStatusSubtasks(subtasks) {
    let numberOfDoneSubtasks = 0;
 
    for (let index = 0; index < subtasks.length; index++) {
        if (subtasks[index].status === 'done') {
            numberOfDoneSubtasks++;
        }
    }
    if (subtasks.length != 0) {
    return `${numberOfDoneSubtasks}/${subtasks.length} Subtasks`;
    } else {
        return ``;
    }
}
 
 
/**
 * Calculates the percentage of a task's subtasks that are done, used
 * to size the progress bar on the mini card.
 *
 * @param {Array<{status: string}>} subtasks - The task's subtasks.
 * @returns {number|null} The done percentage (0-100), or null if there
 *                         are no subtasks.
 */
function getSubtaskProgress(subtasks) {
    if (!subtasks.length) return null;
 
    let done = 0;
 
    for (let index = 0; index < subtasks.length; index++) {
        if (subtasks[index].status === 'done') {
            done++;
        }
    }
    return (done / subtasks.length) * 100;
}
 
 
// Functions for generating task overlay //
 
/**
 * Opens the read-only task detail overlay for a given task: removes
 * any stale overlay for that task, inserts freshly generated overlay
 * HTML into the document, and shows it as a modal dialog. Optionally
 * plays an entrance animation.
 *
 * @param {string|number} id - ID of the task to display.
 * @param {string} [placeholder] - Pass the string "animation" to
 *                                 trigger the entrance animation on the
 *                                 next animation frame; any other value
 *                                 (or omission) skips it. Note: this
 *                                 parameter shadows the module-level
 *                                 "placeholder" variable within this
 *                                 function.
 * @returns {void}
 */
function openTaskOverlay(id, placeholder) {
    const task = tasks.find(task => task.id === id);
 
    let dialog = document.getElementById(`task-overlay-${id}`);
 
    if (dialog) {
        dialog.remove();
    }
    document.body.insertAdjacentHTML(
        "beforeend",
        generateTaskOverlayHTML(task)
    );
 
    dialog = document.getElementById(`task-overlay-${id}`);
    dialog.showModal();
    dialog.classList.remove('modal-exit');
    
    if (placeholder === 'animation') {
    requestAnimationFrame(() => {
        dialog.classList.add('modal-enter');
    });}
}
 
 
/**
 * Closes the task detail overlay with an exit animation, then removes
 * the dialog element from the DOM once the animation finishes.
 *
 * @param {string|number} id - ID of the task whose overlay should be
 *                              closed.
 * @returns {void}
 */
function closeTaskOverlay(id) {
    const taskOverlay = document.getElementById(`task-overlay-${id}`);
 
    if (!taskOverlay) return;
 
    taskOverlay.classList.remove('modal-enter');
    taskOverlay.classList.add('modal-exit');
 
    taskOverlay.addEventListener(
        'animationend',
        () => {
            taskOverlay.close();
            taskOverlay.remove();
        },
        { once: true }
    );
}
 
 
/**
 * Closes the task detail overlay immediately, without playing an exit
 * animation, and removes it from the DOM.
 *
 * @param {string|number} id - ID of the task whose overlay should be
 *                              closed.
 * @returns {void}
 */
function closeTaskOverlayNoAnimation(id) {
    const taskOverlay = document.getElementById(`task-overlay-${id}`);
 
    if (!taskOverlay) return;
 
    taskOverlay.close();
    taskOverlay.remove();
}
 
 
// Functions for generating task-overlay-HTML //
 
/**
 * Converts a date string from "YYYY-MM-DD..." format into "DD.MM.YYYY"
 * display format.
 *
 * @param {string} date - The date string, expected to start with
 *                         "YYYY-MM-DD".
 * @returns {string} The reformatted date as "DD.MM.YYYY".
 */
function getDateFormat(date) {
    let oldDate = date;
    
    let newDate =
        oldDate.substring(8, 10) + "." +
        oldDate.substring(5, 7) + "." +
        oldDate.substring(0, 4);
 
    return newDate;
}
 
 
/**
 * Builds the subtask list markup for the read-only task detail
 * overlay.
 *
 * @param {Array<Object>} subtasks - The task's subtasks.
 * @param {string|number} id - ID of the task the subtasks belong to.
 * @returns {string} Concatenated HTML markup for all subtasks.
 */
function getSubtasksOverlay(subtasks, id) {
    let listSubtasks = '';
 
    for (let index = 0; index < subtasks.length; index++) {
        listSubtasks += generateSubtaskHTML(subtasks, id, index);
    }
    return listSubtasks;
}
 
 
// Functions for generating edit overlay //
 
/**
 * Opens the edit overlay for a given task: removes any stale edit
 * overlay for that task, inserts freshly generated edit-overlay HTML,
 * pre-selects the task's currently assigned contacts in the assignment
 * dropdown, closes the read-only task overlay (without animation), and
 * shows the edit overlay as a modal dialog.
 *
 * @param {string|number} id - ID of the task to edit.
 * @returns {void}
 */
function getEditOverlay(id) {
    const task = tasks.find(task => task.id === id);
    let dialog = document.getElementById(`edit-overlay-${id}`);
 
    if (dialog) {
        dialog.remove();
    }
 
    document.body.insertAdjacentHTML(
        "beforeend",
        generateEditOverlayHTML(task)
    );
 
    dialog = document.getElementById(`edit-overlay-${id}`);
    const menu = document.getElementById(`dropdownMenu-${id}`);
 
    selectedContactIds = (task.assignedTo || []).map(c => c.id);
    renderContacts(contacts, menu, task.assignedTo);
 
    closeTaskOverlayNoAnimation(id);
    dialog.showModal();
}
 
 
/**
 * Builds the subtask list markup for the edit overlay (editable
 * subtask items).
 *
 * @param {Array<Object>} subtasks - The task's subtasks.
 * @param {string|number} id - ID of the task the subtasks belong to.
 * @returns {string} Concatenated HTML markup for all editable
 *                    subtasks.
 */
function getSubtasksEditOverlay(subtasks, id) {
    let listSubtasks = '';
 
    for (let index = 0; index < subtasks.length; index++) {
        listSubtasks += generateSubtaskEditHTML(subtasks, id, index);
    }
    return listSubtasks;
}
 
 
/**
 * Closes the edit overlay with an exit animation, then removes the
 * dialog element from the DOM once the animation finishes.
 *
 * @param {string|number} id - ID of the task whose edit overlay should
 *                              be closed.
 * @returns {void}
 */
function closeEditOverlay(id) {
    const editOverlay = document.getElementById(`edit-overlay-${id}`);
 
    if (!editOverlay) return;
 
    editOverlay.classList.remove('modal-enter');
    editOverlay.classList.add('modal-exit');
 
    editOverlay.addEventListener(
        'animationend',
        () => {
            editOverlay.close();
            editOverlay.remove();
        },
        { once: true }
    );
}
 
 
/**
 * Closes the edit overlay immediately, without playing an exit
 * animation, and removes it from the DOM.
 *
 * @param {string|number} id - ID of the task whose edit overlay should
 *                              be closed.
 * @returns {void}
 */
function closeEditOverlayNoAnimation(id) {
    const editOverlay = document.getElementById(`edit-overlay-${id}`);
 
    if (!editOverlay) return;
 
    editOverlay.close();
    editOverlay.remove();
}
 
 
// function for search-bar, filtering tasks //
 
/**
 * Filters tasks by title or description against the given search text
 * (case-insensitive) and re-renders the board with the matching tasks.
 * Shows or hides the "no results" info element depending on whether
 * any tasks matched.
 *
 * @param {string} filterWord - The search text entered by the user.
 * @returns {void}
 */
function filterAndShowCurrentTask(filterWord) {
    const search = filterWord.toLowerCase();
    const filterInfo = document.getElementById('filter-info');
 
    const currentTasks = tasks.filter(task =>
        (task.title || '').toLowerCase().includes(search) ||
        (task.description || '').toLowerCase().includes(search)
    );
 
    updateTasksforBoard(currentTasks);
 
    if (currentTasks.length === 0) {
        filterInfo.classList.remove('hidden');
    } else {
        filterInfo.classList.add('hidden');
    }
}
 
 
// function for opening/closing modal "add-task" //
 
/**
 * Opens the "Add Task" overlay for a given column. On narrow viewports
 * (<= 992px), navigates to a dedicated add-task page instead of
 * opening a modal. On wider viewports, shows the modal dialog with an
 * entrance animation and, if a column was given, sets it as the
 * current target column.
 *
 * @param {string} [column] - The Kanban column the new task should be
 *                             created in (e.g. "To do").
 * @returns {void}
 */
function openAddTaskOverlay(column) {
    
    if (window.innerWidth <= 992) {
        window.location.href = `add_task.html?column=${encodeURIComponent(column)}`;
        return;
    }
    
    const dialog = document.getElementById("add-task-overlay");
    dialog.classList.remove('modal-enter');
    dialog.classList.remove('modal-exit');
    dialog.showModal();
 
    requestAnimationFrame(() => {
        dialog.classList.add('modal-enter');
    });
    if (column) {
        currentColumn = column;
    }
}
 
 
/**
 * Closes the "Add Task" overlay with an exit animation. Once the
 * animation finishes, closes and clears the form so it's ready for the
 * next use.
 *
 * @returns {void}
 */
function closeAddTaskOverlay() {
    const dialog = document.getElementById("add-task-overlay");
 
    dialog.classList.remove('modal-enter');
    dialog.classList.add('modal-exit');
 
    dialog.addEventListener(
        'animationend',
        () => {
            dialog.close();
            clearForm();
            dialog.classList.remove('modal-exit');
        },
        { once: true }
    );
}
 
 
// Event Listener for Filter //
 
/**
 * If a search input (#input-text) exists on the page, filters and
 * re-renders the board when the user presses Enter in that field.
 *
 * @listens HTMLElement#keydown
 */
if (document.getElementById('input-text')) {
    document.getElementById('input-text').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        filterAndShowCurrentTask(event.target.value);
    }
    });
}

