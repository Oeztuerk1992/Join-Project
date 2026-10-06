/* ========================================
Shared utility functions (used across all HTML pages)
======================================== */

/**
 * Validates whether subtasks are still in edit mode.
 *
 * @param {string|number} id - The task ID used to identify the subtasks.
 * @returns {boolean} True if no subtasks are being edited, otherwise false.
 */
function validateSubtasks(id) {
    const editingSubtasks = getEditingSubtasks(id);
    if (editingSubtasks.length > 0) {
        return handleEditingSubtasks(id, editingSubtasks);
    }
    resetSubtaskFeedback(id);
    hasTriedSubmit = false;
    return true;
}


/**
 * Returns all subtasks that are currently in edit mode.
 *
 * @param {string|number} id - The task ID used to find the subtasks.
 * @returns {NodeListOf<Element>} The subtasks currently being edited.
 */
function getEditingSubtasks(id) {
    return document.querySelectorAll(
        `#ul-subtask-${id} .container-subtask-li.subtask-edit-mode`
    );
}


/**
 * Handles validation when subtasks are still being edited.
 *
 * @param {string|number} id - The task ID used to identify the subtasks.
 * @param {NodeListOf<Element>} editingSubtasks - The subtasks in edit mode.
 * @returns {boolean} False because editing subtasks prevent submission.
 */
function handleEditingSubtasks(id, editingSubtasks) {
    if (!hasTriedSubmit) {
        return false;
    }
    showSubtaskFeedback(id);
    markEditingSubtasksRed(editingSubtasks);
    scrollToOpenSubtask(id);
    return false;
}


/**
 * Displays the edit feedback messages for the given task.
 *
 * @param {string|number} id - The task ID used to identify the feedback elements.
 * @returns {void}
 */
function showSubtaskFeedback(id) {
    const feedbackSubtask = document.getElementById(`subtask-edit-feedback-${id}`);
    const feedbackSubtaskMobile = document.getElementById(`subtask-edit-feedback-${id}-mobile`);
    feedbackSubtask?.classList.remove('hidden');
    feedbackSubtaskMobile?.classList.remove('hidden');
}


/**
 * Marks all inputs of editing subtasks with a red color.
 *
 * @param {NodeListOf<Element>} editingSubtasks - The subtasks in edit mode.
 * @returns {void}
 */
function markEditingSubtasksRed(editingSubtasks) {
    editingSubtasks.forEach(subtask => {
        const input = subtask.querySelector('.subtask-edit-input');
        input?.classList.add('color-red');
    });
}


/**
 * Resets the feedback and input styling for a task.
 *
 * @param {string|number} id - The task ID used to identify the subtasks.
 * @returns {void}
 */
function resetSubtaskFeedback(id) {
    hideSubtaskFeedback(id);
    removeRedColor(id);
}


/**
 * Hides the edit feedback messages for the given task.
 *
 * @param {string|number} id - The task ID used to identify the feedback elements.
 * @returns {void}
 */
function hideSubtaskFeedback(id) {
    const feedbackSubtask = document.getElementById(`subtask-edit-feedback-${id}`);
    const feedbackSubtaskMobile = document.getElementById(`subtask-edit-feedback-${id}-mobile`);
    feedbackSubtask?.classList.add('hidden');
    feedbackSubtaskMobile?.classList.add('hidden');
}


/**
 * Removes the red color from all subtask inputs of a task.
 *
 * @param {string|number} id - The task ID used to identify the subtask inputs.
 * @returns {void}
 */
function removeRedColor(id) {
    document
        .querySelectorAll(`#ul-subtask-${id} .subtask-edit-input`)
        .forEach(input => {
            input.classList.remove('color-red');
        });
}


/**
 * Scrolls the currently edited subtask into view.
 *
 * @param {string|number} id - The unique ID of the task containing the subtask.
 * @returns {void}
 */
function scrollToOpenSubtask(id) {
    const openSubtask = document.querySelector(
        `#ul-subtask-${id} .container-subtask-li.subtask-edit-mode`
    );

    if (openSubtask) {
        openSubtask.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}


/* ========================================
Confirmation message
======================================== */

/**
 * Displays the confirmation dialog for two seconds
 * and then closes it automatically.
 *
 * @returns {void}
 */
function showConfirmation() {
    const confirmation = document.getElementById("confirmation-dialog");
    confirmation.showModal();
    confirmation.classList.add("show");

    setTimeout(() => {
        confirmation.classList.remove("show");
        confirmation.close();
    }, 2000);
}


/* ========================================
Scrollbar
======================================== */

/**
 * Shows the scroll up/down buttons if the container content overflows, otherwise hides them.
 *
 * @returns {void}
 */
function updateScrollbarButtons() {
    const container = document.querySelector(".scroll-wrapper-task");
    const hasScrollbar = container.scrollHeight > container.clientHeight;
    document.querySelector(".scroll-top").style.display = hasScrollbar ? "flex" : "none";
    document.querySelector(".scroll-down").style.display = hasScrollbar ? "flex" : "none";
}


/**
 * Starts continuously scrolling a container while a button is pressed.
 *
 * @param {string} selector - CSS selector of the scroll container.
 * @param {number} direction - Scroll direction (-1 for up, 1 for down).
 * @returns {void}
 */
function startScrolling(selector, direction) {
    const container = document.querySelector(selector);
    if (!container) return;
    scrollInterval = setInterval(() => {
        container.scrollTop += direction * 10;
    }, 16);
}


/**
 * Stops continuous scrolling.
 *
 * @returns {void}
 */
function stopScrolling() {
    clearInterval(scrollInterval);
}


/* ========================================
Event Listeners, support functions
======================================== */

/**
 * Saves the new subtask when Enter is pressed in the subtask input, without submitting the form.
 */
document.addEventListener('keydown', (event) => {
    if (
        event.target.classList.contains('subtask-enter') &&
        event.key === 'Enter'
    ) {
        event.preventDefault();
        const id = event.target.id.replace('input-subtask-', '');
        saveEditSubtask(id);
    }
});


/**
 * Triggers the save button when Enter is pressed while editing an existing subtask.
 */
document.addEventListener('keydown', (event) => {
    if (
        event.key === 'Enter' &&
        event.target.classList.contains('subtask-edit-input')
    ) {
        event.preventDefault();
        const container = event.target.closest('.container-subtask-li');
        const saveButton = container.querySelector('.save-edited-task');
        saveButton.click();
    }
});


/**
 * Prevents Enter from submitting the form while the contact dropdown input is focused.
 */
document.addEventListener('keydown', (event) => {
    if (
        event.key === 'Enter' &&
        event.target.classList.contains('dropdown-assignment')
    ) {
        event.preventDefault();
    }
});


/**
 * Adds a hidden "rotate your device" overlay, shown via CSS on small landscape viewports.
 */
document.addEventListener('DOMContentLoaded', () => {
    const warning = document.createElement('div');
    warning.className = 'landscape-warning';
    warning.setAttribute('role', 'alert');
    warning.innerHTML = '<p>Please rotate your device to portrait mode.</p>';
    document.body.prepend(warning);
});


/**
 * Disables spell checking for all input and textarea elements.
 */
document.querySelectorAll('input, textarea').forEach(element => {
    element.setAttribute('spellcheck', 'false');
});


/**
 * Prevents mousedown default on subtask action buttons (keeps focus in the input).
 */
document.addEventListener('mousedown', e => {
    if (e.target.closest('.subtask-actions button')) {
        e.preventDefault();
    }
});

