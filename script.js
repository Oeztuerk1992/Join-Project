function validateSubtasks(id) {
    const feedbackSubtask = document.getElementById(`subtask-edit-feedback-${id}`);
    const feedbackSubtaskMobile = document.getElementById(`subtask-edit-feedback-${id}-mobile`);
    const editingSubtasks = document.querySelectorAll(`#ul-subtask-${id} .container-subtask-li.subtask-edit-mode`);

    if (editingSubtasks.length > 0) {

        if (!hasTriedSubmit) {
            return false;
        }

        feedbackSubtask?.classList.remove('hidden');
        feedbackSubtaskMobile?.classList.remove('hidden');

        editingSubtasks.forEach(subtask => {
            const input = subtask.querySelector('.subtask-edit-input');
            input?.classList.add('color-red');
        });

        scrollToOpenSubtask(id);

        return false;
    }

    feedbackSubtask?.classList.add('hidden');
    feedbackSubtaskMobile?.classList.add('hidden');

    document
        .querySelectorAll(`#ul-subtask-${id} .subtask-edit-input`)
        .forEach(input => {
            input.classList.remove('color-red');
        });

    hasTriedSubmit = false;

    return true;
}


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

// Event Listener for Subtask //

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


document.addEventListener('keydown', (event) => {
    if (
        event.key === 'Enter' &&
        event.target.classList.contains('subtask-edit-input')
    ) {
        event.preventDefault();

        const container =
            event.target.closest('.container-subtask-li');

        const saveButton =
            container.querySelector('.save-edited-task');

        saveButton.click();
    }
});


document.addEventListener('keydown', (event) => {
    if (
        event.key === 'Enter' &&
        event.target.classList.contains('dropdown-assignment')
    ) {
        event.preventDefault();
    }
});


// confirmation info shows up //

function showConfirmation() {

    const confirmation = document.getElementById("confirmation-dialog");
    confirmation.showModal();
    confirmation.classList.add("show");

    setTimeout(() => {
        confirmation.classList.remove("show");
        confirmation.close();
    }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    const warning = document.createElement('div');
    warning.className = 'landscape-warning';
    warning.innerHTML = '<p>Please rotate your device to portrait mode.</p>';
    document.body.prepend(warning);
  });

  document.querySelectorAll('input, textarea').forEach(element => {
    element.setAttribute('spellcheck', 'false');
});

document.addEventListener('mousedown', e => {
    if (e.target.closest('.subtask-actions button')) {
        e.preventDefault();
    }
});