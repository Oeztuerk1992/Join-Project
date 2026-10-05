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
    updateScrollbarButtons();
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
