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