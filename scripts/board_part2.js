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

