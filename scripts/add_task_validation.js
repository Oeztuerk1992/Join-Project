/**
 * Submit handler for the "add task" form: prevents the native
 * submission, marks that a submit attempt has occurred (global
 * "hasTriedSubmit"), and validates title, due date, category, and
 * subtasks. If everything is valid, creates the task in the given
 * column.
 *
 * @param {SubmitEvent} event - The form submit event.
 * @param {string} column - The Kanban column the new task should be
 *                           created in.
 * @returns {boolean} Always returns false (used as an inline
 *                     `onsubmit="return checkFormDataAddTask(event, column)"`
 *                     handler to prevent a native form submission;
 *                     does not reflect whether createTask() was
 *                     called).
 */
function checkFormDataAddTask(event, column) {
    event.preventDefault();
    hasTriedSubmit = true;
 
    const isNameValid = checkTitleName();
    const isDateValid = checkDueDate();
    const isCategoryValid = checkTaskCategory();
    const isSubtaskValid = validateSubtasks('add-task');
    const isValid = isNameValid && isDateValid && isCategoryValid && isSubtaskValid;
 
    if (isValid) {
        createTask(column);
    }
    return false;
}
 
 
/**
 * Validates the task title field: must not be empty (after trimming
 * whitespace). Toggles the field's error message and red border
 * accordingly.
 *
 * @returns {boolean} True if the title is valid (non-empty), false
 *                     otherwise.
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
    if (dateForm.value) {
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
 * trimming whitespace). Toggles the field's error message and red
 * border accordingly.
 *
 * @returns {boolean} True if a category is set (non-empty), false
 *                     otherwise.
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
 * Resets the error state of all required "add task" fields (title,
 * due date, category, subtasks) — hides feedback messages and removes
 * red borders — without changing the fields' actual values.
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
 
 
// Event Listeners //
 
/**
 * Live validation listener: re-validates the title field as the user
 * types.
 *
 * @listens HTMLElement#input
 */
document.getElementById("task-title")?.addEventListener("input", checkTitleName);
 
/**
 * Live validation listener: re-validates the due-date field when its
 * value changes (e.g. picked from the date picker).
 *
 * @listens HTMLElement#change
 */
document.getElementById("task-date")?.addEventListener("change", checkDueDate);
 
/**
 * Live validation listener: re-validates the category field whenever
 * its (hidden) value input changes.
 *
 * @listens HTMLElement#input
 */
document.getElementById("selectedCategory")?.addEventListener("input", checkTaskCategory);