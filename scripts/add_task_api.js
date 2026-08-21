async function postTaskData(task) {
    let response = await fetch(BASE_URL + "tasks.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task)
    });

    return await response.json();
}


async function createTask(column) {
    const taskData = {
        title: titleForm.value,
        description: descriptionForm.value,
        dueDate: dateForm.value,
        priority: getPriority(),
        assignedTo: getAssignedUsers(),
        category: categoryForm.value,
        subtasks: getSubtasks(subtasksForm),
        taskStatus: column || 'To do',
        dragOrder: Date.now() 
    };

    try {
        await postTaskData(taskData);

        showConfirmation();

        await new Promise(resolve => setTimeout(resolve, 2000));

        clearForm();
        getToBoard();
    } catch (error) {
        console.error(error);
    }
}


function getPriority() {
    const container =
        document.getElementById('button-prio-form');

    const activePriority =
        container?.querySelector('.priority.active');

    return activePriority
        ? activePriority.querySelector('span').innerText
        : '';
}


function getAssignedUsers() {
    const assignedContacts = [];

    const selectedContacts = document.querySelectorAll(
        '#dropdownMenu .dropdown-item.selected'
    );

    selectedContacts.forEach(contact => {
        const circle = contact.querySelector('.contact-circle');
        const nameElement = contact.querySelector('.contact-name');

        assignedContacts.push({
            id: contact.dataset.id,
            name: nameElement.textContent,
            color: circle.style.cssText
        });
    });
    return assignedContacts;
}


function getSubtasks(taskContainer) {
    const subtasks = [];
    const taskItems = taskContainer.querySelectorAll('.li-subtask');

    taskItems.forEach(task => {
        subtasks.push({
            title: task.textContent.trim(),
            status: 'open'
        });
    });
    return subtasks;
}


async function loadContacts() {
    const response = await fetch(BASE_URL + "contacts.json");
    contacts = await response.json() || {};
}