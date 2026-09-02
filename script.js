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
    const feedbackSubtask = document.getElementById(
        `subtask-edit-feedback-${id}`
    );
    const feedbackSubtaskMobile = document.getElementById(
        `subtask-edit-feedback-${id}-mobile`
    );

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
    const feedbackSubtask = document.getElementById(
        `subtask-edit-feedback-${id}`
    );
    const feedbackSubtaskMobile = document.getElementById(
        `subtask-edit-feedback-${id}-mobile`
    );

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


// Event listeners for subtasks //

/**
 * Handles the Enter key in the subtask input field.
 * Prevents the default form submission and saves the new subtask.
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
 * Handles the Enter key while editing an existing subtask.
 * Prevents the default behavior and triggers the save button.
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
 * Prevents the Enter key from submitting the form while
 * the contact assignment dropdown is focused.
 */
document.addEventListener('keydown', (event) => {
    if (
        event.key === 'Enter' &&
        event.target.classList.contains('dropdown-assignment')
    ) {
        event.preventDefault();
    }
});


// Confirmation message //

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


/**
 * Creates and displays a warning message asking users
 * to rotate their device to portrait mode.
 */
document.addEventListener('DOMContentLoaded', () => {
    const warning = document.createElement('div');
    warning.className = 'landscape-warning';
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
 * Prevents the default mouse-down behavior when clicking
 * the action buttons of the subtask input.
 */
document.addEventListener('mousedown', e => {
    if (e.target.closest('.subtask-actions button')) {
        e.preventDefault();
    }
});
