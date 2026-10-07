/**
 * Validates the edit-task form (title, due date, subtasks) and saves if valid.
 * @param {string|number} id - ID of the task whose edit overlay is validated.
 * @returns {boolean} Always false, to prevent native form submission.
 */
function checkFormDataEditOverlay(id) {
    hasTriedSubmit = true;
    const isTitleValid = checkEditTitleName(id);
    const isDueDateValid = checkEditDueDate(id);
    const areSubtasksValid = validateSubtasks(id);
    if (isTitleValid && isDueDateValid && areSubtasksValid) {
        runWithDisabledButton(`[form="edit-form-${id}"]`, () => saveEditTask(id));
    }
    return false;
}
 
 
/**
 * Validates that the title of a task's edit overlay is not empty.
 * @param {string|number} id - ID of the task, used to locate the title elements.
 * @returns {boolean} True if the title is valid, false otherwise.
 */
function checkEditTitleName(id) {
    const info = document.getElementById(`feedback-title-${id}`);
    const inputName = document.getElementById(`title-input-${id}`);
    const isValid = inputName.value.trim() !== "";
    info.classList.toggle("hidden", isValid);
    inputName.classList.toggle("fail-red-border", !isValid);
    return isValid;
}
 
 
/**
 * Validates that a due date is set in a task's edit overlay.
 * @param {string|number} id - ID of the task, used to locate the due-date elements.
 * @returns {boolean} True if a due date is set, false otherwise.
 */
function checkEditDueDate(id) {
    const info = document.getElementById(`feedback-duedate-${id}`);
    const inputDate = document.getElementById(`date-input-${id}`);
    const isValid = inputDate.value !== "";
    info.classList.toggle("hidden", isValid);
    inputDate.classList.toggle("fail-red-border", !isValid);
    return isValid;
}
 
