// variables //

const editOverlay = document.getElementById('edit-overlay');

const placeholder = document.getElementById('empty-spot-drag');

let currentDraggedElement;

let tasks = [
    {
        id: 0,
        'taskStatus': 'Await feedback',
        'category': 'User Story',
        'title': 'Contact Form & Imprint',
        'description': 'Define CSS naming conventions and structure.',
        'dueDate': '30.07.2026',
        'priority': 'Urgent',
        'assignedTo': [
            {
                name: 'Sofia Müller',
                color: '--badge-color-1'
            },
            {
                name: 'Max Mustermann',
                color: '--badge-color-2'
            }
        ],
        subtasks: [
            {
                title: 'Create layout',
                status: 'Done'
            },
            {
                title: 'Implement form',
                status: 'Open'
            }
        ]
    },
     {
        id: 1,
        'taskStatus': 'To do',
        'category': 'User Story',
        'title': 'Contact Form & Imprint',
        'description': 'Define CSS naming conventions and structure.',
        'dueDate': '30.07.2026',
        'priority': 'Urgent',
        'assignedTo': [
            {
                name: 'Sofia Müller',
                color: '--badge-color-1'
            },
            {
                name: 'Max Mustermann',
                color: '--badge-color-2'
            }
        ],
        subtasks: [
            {
                title: 'Create layout',
                status: 'Done'
            },
            {
                title: 'Implement form',
                status: 'Open'
            }
        ]
    },
     {
        id: 2,
        'taskStatus': 'Done',
        'category': 'User Story',
        'title': 'Contact Form & Imprint',
        'description': 'Define CSS naming conventions and structure.',
        'dueDate': '30.07.2026',
        'priority': 'Urgent',
        'assignedTo': [
            {
                name: 'Sofia Müller',
                color: '--badge-color-1'
            },
            {
                name: 'Max Mustermann',
                color: '--badge-color-2'
            }
        ],
        subtasks: [
            {
                title: 'Create layout',
                status: 'Done'
            },
            {
                title: 'Implement form',
                status: 'Open'
            }
        ]
    },
    {
        id: 3,
        'taskStatus': 'Done',
        'category': 'Technical Task',
        'title': 'Testmodul',
        'description': 'Preparations for testmodul',
        'dueDate': '10.07.2026',
        'priority': 'Medium',
        'assignedTo': [
            {
                name: 'Sofia Müller',
                color: '--badge-color-1'
            },
            {
                name: 'Max Mustermann',
                color: '--badge-color-2'
            },
            {
                name: 'Wolfgang Ball',
                color: '--badge-color-3'
            }
        ],
        subtasks: [
            {
                title: 'Create layout',
                status: 'Open'
            },
            {
                title: 'Implement form',
                status: 'Open'
            }
        ]
    }];

// functions //

function initBoard() {
    getUserProfile();
    updateTasksforBoard();
}

function getToAddTask() {
    window.location.href = 'add_task.html';
}

function updateTasksforBoard() {
    const columns = {
        'To do': document.getElementById('kanban-to-do'),
        'In progress': document.getElementById('kanban-in-progress'),
        'Await feedback': document.getElementById('kanban-feedback'),
        'Done': document.getElementById('kanban-done')
    };

    Object.values(columns).forEach(column => {
        column.innerHTML = '';
    });

    tasks.forEach(element => {
        const column = columns[element.taskStatus];

        if (column) {
            column.innerHTML += generateTaskMiniCardHTML(element);
        }
    });

    Object.values(columns).forEach(column => {
        if (column.innerHTML.trim() === '') {
            column.innerHTML = generateEmptyCardHTML();
        }
    });
}

function getTaskCategory(category) {
    if (category === 'User Story') {
        return `
            <div class="category-user-story">User Story</div>
            `
    }
    return `
            <div class="category-technical-task">Technical Task</div>
            `
}

function getImgPrio(priority) {
    if (priority === 'Low') {
        return `
            <img src="../assets/icons/board/cards/prio_low.svg" alt="img-prio-low">`
    }
    if (priority === 'Medium') {
        return `
            <img src="../assets/icons/board/cards/prio_medium.svg" alt="img-prio-medium">`
    }
    return `
            <img src="../assets/icons/board/cards/prio_high.svg" alt="img-prio-high">`
}

function getAssignedContacts(contacts) {
    return contacts.map(contact => {
        const parts = contact.name.split(' ');

        const initials =
            parts[0][0].toUpperCase() +
            (parts.length > 1
                ? parts[parts.length - 1][0].toUpperCase()
                : '');

        return `<div class="user-abbr" 
                style="background-color: var(${contact.color})">
                ${initials}</div>
                `;
    }).join('');
}

function getStatusSubtasks(subtasks) {
    let numberOfDoneSubtasks = 0;

    for (let index = 0; index < subtasks.length; index++) {
        if (subtasks[index].status === 'Done') {
            numberOfDoneSubtasks++;
        }
    }

    return `${numberOfDoneSubtasks}/${subtasks.length} Subtasks`;
}

function getSubtaskProgress(subtasks) {
    let done = 0;

    for (let index = 0; index < subtasks.length; index++) {
        if (subtasks[index].status === 'Done') {
            done++;
        }
    }

    return (done / subtasks.length) * 100;
}

function generateEmptyCardHTML() {
    return `
            <div class="no-task-feedback">No tasks To do</div>
            `        
}

function startDragging(id) {
    currentDraggedElement = id;

    const card = document.getElementById(`card-mini-${id}`);
    card.classList.add('dragging');
}

function endDragging(id) {

    const card = document.getElementById(`card-mini-${id}`);
    card.classList.remove('dragging');
    
    placeholder.classList.remove('drag-area-highlight');
}

function allowDrop(event) {
    event.preventDefault();
}

function moveTo(taskCat) {
    
const categoryStatus = {
        'kanban-to-do' : 'To do',
        'kanban-in-progress' : 'In progress',
        'kanban-feedback' : 'Await feedback',
        'kanban-done' : 'Done'
    };

    tasks[currentDraggedElement]['taskStatus'] = categoryStatus[taskCat];
    updateTasksforBoard();
}

function highlight(id) {
    
    const currentColumn = document.getElementById(`card-mini-${currentDraggedElement}`).parentElement;
    const target = document.getElementById(id);

    if (target === currentColumn) {
        return;
    }

    if (placeholder.parentElement !== target) {
        target.appendChild(placeholder);
    }

    placeholder.classList.add('drag-area-highlight');
}

function removeHighlight() {
    placeholder.classList.remove('drag-area-highlight');
}


// Task Overlay //

function openTaskOverlay(id) {
    const task = tasks.find(task => task.id === id);

    let dialog = document.getElementById(`task-overlay-${id}`);

    if (!dialog) {
        document.body.insertAdjacentHTML(
            "beforeend",
            generateTaskOverlayHTML(task)
        );

        dialog = document.getElementById(`task-overlay-${id}`);
    }

    dialog.showModal();
}

function closeTaskOverlay(id) {

    const taskOverlay = document.getElementById(`task-overlay-${id}`);

    taskOverlay.close();
}

// Edit Overlay //

function getEditOverlay() {
    taskOverlay.close();
    editOverlay.showModal();
}

function closeEditOverlay() {
    editOverlay.close();
}