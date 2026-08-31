// Variables //

let placeholder = null;
let autoScrollInterval = null;
let currentDraggedElement;
let autoScrollContainer = null;
let autoScrollDirection = 0;

let tasks = [];

const columns = {
        'To do': document.getElementById('kanban-to-do'),
        'In progress': document.getElementById('kanban-in-progress'),
        'Await feedback': document.getElementById('kanban-feedback'),
        'Done': document.getElementById('kanban-done')
};


// Init and Loading //

async function initBoard() {
    await initAddTask();
    await loadTasks();

    updateTasksforBoard();
}


// Board //

function updateTasksforBoard(tasksToShow = tasks) {
    Object.values(columns).forEach(column => column.innerHTML = '');

    tasksToShow
        .sort((a, b) => a.dragOrder - b.dragOrder)
        .forEach(task => {
            const column = columns[task.taskStatus];

            if (column) {
                column.innerHTML += generateTaskMiniCardHTML(task);
            }
        });

    Object.entries(columns).forEach(([status, column]) => {
        if (column.innerHTML.trim() === '') {
            column.innerHTML = generateEmptyCardHTML(status);
        }
    });
}


// Functions for generating minicard-HTML //

function getTaskCategory(category) {
    if (category === 'User Story') { 

        return generateTaskCategoryUserStoryHTML();
    }
    return generateTaskCategoryTechnicalTaskHTML();
}


function getImgPrio(priority) {
    if (priority === 'Low') {
        return generateImgPrioLowHTML();
    }

    if (priority === 'Medium') {
        return generateImgPrioMediumHTML();
    }

    if (priority === 'Urgent') {
        return generateImgPrioHighHTML();
    }

    return '';
}


function getAssignedContactBadges(assignments = [], limit = null) {
    const visible = limit ? assignments.slice(0, limit) : assignments;

    const badgesHTML = visible.map(contact => {

        if (!contact?.name) {
            console.warn('Invalid assigned contact:', contact);
            return '';
        }

        const parts = contact.name.trim().split(' ');

        const initials =
            (parts[0]?.[0] || '').toUpperCase() +
            (parts.length > 1
                ? (parts[parts.length - 1]?.[0] || '').toUpperCase()
                : '');

        return generateBadgesHTML(contact.color, initials);

    }).join('');

    const remaining = limit ? assignments.length - limit : 0;

    return remaining > 0
        ? badgesHTML + `<div class="user-abbr user-abbr-more">+${remaining}</div>`
        : badgesHTML;
}

function getAssignedContactRows(assignments = []) {
    return assignments.map(contact => {

        if (!contact?.name) {
            console.warn('Invalid assigned contact:', contact);
            return '';
        }

        const parts = contact.name.trim().split(' ');

        const initials =
            (parts[0]?.[0] || '').toUpperCase() +
            (parts.length > 1
                ? (parts[parts.length - 1]?.[0] || '').toUpperCase()
                : '');

        return `
            <div class="container-user">
                ${generateBadgesHTML(contact.color, initials)}
                ${generateUserNamesHTML(contact.name)}
            </div>
        `;
    }).join('');
}


function getStatusSubtasks(subtasks) {
    let numberOfDoneSubtasks = 0;

    for (let index = 0; index < subtasks.length; index++) {
        if (subtasks[index].status === 'done') {
            numberOfDoneSubtasks++;
        }
    }
    if (subtasks.length != 0) {
    return `${numberOfDoneSubtasks}/${subtasks.length} Subtasks`;
    } else {
        return ``;
    }
}


function getSubtaskProgress(subtasks) {
    if (!subtasks.length) return null;

    let done = 0;

    for (let index = 0; index < subtasks.length; index++) {
        if (subtasks[index].status === 'done') {
            done++;
        }
    }
    return (done / subtasks.length) * 100;
}


// Functions for generating task overlay //

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
}


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


function closeTaskOverlayNoAnimation(id) {
    const taskOverlay = document.getElementById(`task-overlay-${id}`);

    if (!taskOverlay) return;

    taskOverlay.close();
    taskOverlay.remove();
}


// Functions for generating task-overlay-HTML //

function getDateFormat(date) {
    let oldDate = date;
    
    let newDate =
        oldDate.substring(8, 10) + "." +
        oldDate.substring(5, 7) + "." +
        oldDate.substring(0, 4);

    return newDate;
}


/* function getAssignedContactNames(contacts) {
    return contacts.map(contact => {
        const usernames = contact.name;

        return generateUserNamesHTML(usernames);
    }).join('');
} */


function getSubtasksOverlay(subtasks, id) {
    let listSubtasks = '';

    for (let index = 0; index < subtasks.length; index++) {
        listSubtasks += generateSubtaskHTML(subtasks, id, index);
    }
    return listSubtasks;
}


// Functions for generating edit overlay //

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


function getSubtasksEditOverlay(subtasks, id) {
    let listSubtasks = '';

    for (let index = 0; index < subtasks.length; index++) {
        listSubtasks += generateSubtaskEditHTML(subtasks, id, index);
    }
    return listSubtasks;
}


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


function closeEditOverlayNoAnimation(id) {
    const editOverlay = document.getElementById(`edit-overlay-${id}`);

    if (!editOverlay) return;

    editOverlay.close();
    editOverlay.remove();
}


// function for search-bar, filtering tasks //

function filterAndShowCurrentTask(filterWord) {
    const search = filterWord.toLowerCase();
    const filterInfo = document.getElementById('filter-info');

    const currentTasks = tasks.filter(task =>
        (task.title || '').toLowerCase().includes(search) ||
        (task.description || '').toLowerCase().includes(search)
    );

    updateTasksforBoard(currentTasks);

    if (currentTasks.length === 0) {
        filterInfo.classList.remove('hidden');
    } else {
        filterInfo.classList.add('hidden');
    }
}


// function for opening/closing modal "add-task" //

function openAddTaskOverlay(column) {
    
    if (window.innerWidth <= 992) {
        window.location.href = `add_task.html?column=${encodeURIComponent(column)}`;
        return;
    }
    
    const dialog = document.getElementById("add-task-overlay");

    dialog.classList.remove('modal-enter');
    dialog.classList.remove('modal-exit');

    dialog.showModal();

    requestAnimationFrame(() => {
        dialog.classList.add('modal-enter');
    });
    if (column) {
        currentColumn = column;
    }
}


function closeAddTaskOverlay() {
    const dialog = document.getElementById("add-task-overlay");

    dialog.classList.remove('modal-enter');
    dialog.classList.add('modal-exit');

    dialog.addEventListener(
        'animationend',
        () => {
            dialog.close();
            clearForm();
            dialog.classList.remove('modal-exit');
        },
        { once: true }
    );
}


// Event Listener for Filter //

if (document.getElementById('input-text')) {
    document.getElementById('input-text').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        filterAndShowCurrentTask(event.target.value);
    }
    });
}

