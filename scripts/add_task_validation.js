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


function resetRequiredFields() {
    feedbackTitle.classList.add("hidden");
    titleForm.classList.remove("fail-red-border");
    
    feedbackDuedate.classList.add("hidden");
    dateForm.classList.remove("fail-red-border");
        
    feedbackCategory.classList.add("hidden");
    borderCategory.classList.remove("fail-red-border");

    document.getElementById("subtask-edit-feedback-add-task").classList.add("hidden");
}


document.getElementById("taskTitle")?.addEventListener("input", checkTitleName);
document.getElementById("taskDate")?.addEventListener("change", checkDueDate);
document.getElementById("selectedCategory")?.addEventListener("input", checkTaskCategory);