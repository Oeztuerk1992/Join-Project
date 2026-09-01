/**
 * Validates the entire edit-task overlay form for a given task (title,
 * due date, subtasks) and, if everything is valid, saves the edited
 * task. Marks that a submit attempt has occurred (global
 * "hasTriedSubmit"), which live input validation can use to decide
 * whether to show errors immediately.
 *
 * @param {string|number} id - ID of the task whose edit overlay is
 *                              being validated.
 * @returns {boolean} Always returns false (used as an inline
 *                     `onsubmit="return checkFormDataEditOverlay(id)"`
 *                     handler to prevent a native form submission).
 */
function checkFormDataEditOverlay(id) {
    hasTriedSubmit = true;
 
    const isTitleValid = checkEditTitleName(id);
    const isDueDateValid = checkEditDueDate(id);
    const areSubtasksValid = validateSubtasks(id);
 
    const isValid =
        isTitleValid &&
        isDueDateValid &&
        areSubtasksValid;
 
    if (isValid) {
        saveEditTask(id);
    }
 
    return false;
}
 
 
/**
 * Validates the title field of a task's edit overlay: the title must
 * not be empty (after trimming whitespace). Toggles the field's error
 * message and red border accordingly.
 *
 * @param {string|number} id - ID of the task; used to locate
 *                              `feedback-title-{id}` and
 *                              `title-input-{id}`.
 * @returns {boolean} True if the title is valid (non-empty), false
 *                     otherwise.
 */
function checkEditTitleName(id) {
    const info = document.getElementById(`feedback-title-${id}`);
    const inputName = document.getElementById(`title-input-${id}`);
 
    if (inputName.value.trim()) {
            info.classList.add("hidden");
            inputName.classList.remove("fail-red-border");
            return true;
        }
 
        info.classList.remove("hidden");
        inputName.classList.add("fail-red-border");
        return false;
}
 
 
/**
 * Validates the due-date field of a task's edit overlay: a value must
 * be set. Toggles the field's error message and red border
 * accordingly.
 *
 * @param {string|number} id - ID of the task; used to locate
 *                              `feedback-duedate-{id}` and
 *                              `date-input-{id}`.
 * @returns {boolean} True if a due date is set, false otherwise.
 */
function checkEditDueDate(id) {
    const info = document.getElementById(`feedback-duedate-${id}`);
    const inputDate = document.getElementById(`date-input-${id}`);
 
    if (inputDate.value) {
        info.classList.add("hidden");
        inputDate.classList.remove("fail-red-border");
        return true;
    }
 
    info.classList.remove("hidden");
    inputDate.classList.add("fail-red-border");
    return false;
}
 
// Event Listeners //
 
/**
 * Global input listener for live validation inside edit-task overlays.
 * As the user types into a title field (".input-title"), re-validates
 * that task's title; as the user types into a due-date field
 * (".input-date"), re-validates that task's due date. The task ID is
 * derived from the input element's ID.
 *
 * @listens document#input
 * @param {InputEvent} event - The input event; event.target is checked
 *                              against the ".input-title" and
 *                              ".input-date" classes.
 * @returns {void}
 */
document.addEventListener("input", (event) => {
    if (event.target.classList.contains("input-title")) {
        const id = event.target.id.replace("title-input-", "");
        checkEditTitleName(id);
    }
 
    if (event.target.classList.contains("input-date")) {
        const id = event.target.id.replace("date-input-", "");
        checkEditDueDate(id);
    }
});