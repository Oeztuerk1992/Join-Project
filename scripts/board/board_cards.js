/* ========================================
Variables / Init
======================================== */
 
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
 

/**
 * Re-renders the board: sorts the tasks into their columns and fills empty columns.
 * @param {Array<Object>} [tasksToShow=tasks] - The tasks to render (defaults to all tasks).
 * @returns {void}
 */
function updateTasksforBoard(tasksToShow = tasks) {
    Object.values(columns).forEach(column => column.innerHTML = '');
    tasksToShow
        .sort((a, b) => a.dragOrder - b.dragOrder)
        .forEach(task => {
            const column = columns[task.taskStatus];
            if (column) column.innerHTML += generateTaskMiniCardHTML(task);
        });
    Object.entries(columns).forEach(([status, column]) => {
        if (column.innerHTML.trim() === '') {
            column.innerHTML = generateEmptyCardHTML(status);
        }
    });
}
 

/* ========================================
Functions for generating minicard-HTML 
======================================== */
 
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
 * Returns the priority icon markup for a mini card.
 * @param {string} priority - The task's priority ("Low", "Medium" or "Urgent").
 * @returns {string} The icon HTML, or "" for an unknown priority.
 */
function getImgPrio(priority) {
    const icons = {
        Low: generateImgPrioLowHTML,
        Medium: generateImgPrioMediumHTML,
        Urgent: generateImgPrioHighHTML
    };
    return icons[priority] ? icons[priority]() : '';
}
 
 
/**
 * Builds the assigned-contact badges for a mini card, with an optional "+N" badge.
 * @param {Array<{name: string, color: string}>} [assignments=[]] - The assigned contacts.
 * @param {number|null} [limit=null] - Maximum number of badges; null shows all.
 * @returns {string} The badges HTML.
 */
function getAssignedContactBadges(assignments = [], limit = null) {
    const visible = limit ? assignments.slice(0, limit) : assignments;
    const badgesHTML = visible.map(getContactBadge).join('');
    const remaining = limit ? assignments.length - limit : 0;
    return remaining > 0
        ? badgesHTML + `<div class="user-abbr user-abbr-more">+${remaining}</div>`
        : badgesHTML;
}


/**
 * Builds the badge HTML of a single contact, or "" if it has no name.
 * @param {{name: string, color: string}} contact - The assigned contact.
 * @returns {string} The badge HTML.
 */
function getContactBadge(contact) {
    if (!contact?.name) {
        console.warn('Invalid assigned contact:', contact);
        return '';
    }
    return generateBadgesHTML(contact.color, getInitials(contact.name));
}


/**
 * Returns the first letter of the first and last name in upper case.
 * @param {string} name - The full name of a contact.
 * @returns {string} The initials (one or two letters).
 */
function getInitials(name) {
    const parts = name.trim().split(' ');
    const first = (parts[0]?.[0] || '').toUpperCase();
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] || '').toUpperCase() : '';
    return first + last;
}
 

/**
 * Builds full-row markup (badge + full name) for each assigned contact.
 * @param {Array<{name: string, color: string}>} [assignments=[]] - The assigned contacts.
 * @returns {string} The contact rows HTML.
 */
function getAssignedContactRows(assignments = []) {
    return assignments.map(getContactRow).join('');
}


/**
 * Builds the row HTML of a single contact, or "" if it has no name.
 * @param {{name: string, color: string}} contact - The assigned contact.
 * @returns {string} The row HTML.
 */
function getContactRow(contact) {
    if (!contact?.name) {
        console.warn('Invalid assigned contact:', contact);
        return '';
    }
    return `
        <div class="container-user">
            ${generateBadgesHTML(contact.color, getInitials(contact.name))}
            ${generateUserNamesHTML(contact.name)}
        </div>
    `;
}
 
 
/**
 * Builds the "x/y Subtasks" progress text for a task's mini card.
 * @param {Array<{status: string}>} subtasks - The task's subtasks.
 * @returns {string} The progress text (e.g. "2/5 Subtasks"), or "" if there are none.
 */
function getStatusSubtasks(subtasks) {
    if (subtasks.length === 0) return '';
    const done = subtasks.filter(subtask => subtask.status === 'done').length;
    return `${done}/${subtasks.length} Subtasks`;
}
 
 
/**
 * Calculates the percentage of done subtasks for the mini card progress bar.
 * @param {Array<{status: string}>} subtasks - The task's subtasks.
 * @returns {number|null} The done percentage (0-100), or null if there are no subtasks.
 */
function getSubtaskProgress(subtasks) {
    if (!subtasks.length) return null;
    const done = subtasks.filter(subtask => subtask.status === 'done').length;
    return (done / subtasks.length) * 100;
}
 

/* ========================================
Functions for generating task overlay 
======================================== */
 
/**
 * Opens the task detail overlay as a modal, optionally with entrance animation.
 * @param {string|number} id - ID of the task to display.
 * @param {string} [placeholder] - Pass "animation" to play the entrance animation.
 * @returns {void}
 */
function openTaskOverlay(id, placeholder) {
    const task = tasks.find(task => task.id === id);
    document.getElementById(`task-overlay-${id}`)?.remove();
    document.body.insertAdjacentHTML("beforeend", generateTaskOverlayHTML(task));
    const dialog = document.getElementById(`task-overlay-${id}`);
    dialog.showModal();
    dialog.classList.remove('modal-exit');
    if (placeholder === 'animation') {
        requestAnimationFrame(() => dialog.classList.add('modal-enter'));
    }
    updateScrollbarButtons();
}
 
 
/**
 * Closes the task detail overlay with an exit animation, then removes
 * the dialog element from the DOM once the animation finishes.
 *
 * @param {string|number} id - ID of the task whose overlay should be closed.
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
 * @param {string|number} id - ID of the task whose overlay should be closed.
 * @returns {void}
 */
function closeTaskOverlayNoAnimation(id) {
    const taskOverlay = document.getElementById(`task-overlay-${id}`);
    if (!taskOverlay) return;
    taskOverlay.close();
    taskOverlay.remove();
}