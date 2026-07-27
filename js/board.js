// Variables //

const placeholder = document.getElementById('empty-spot-drag');
let currentDraggedElement;
let tasks = [];

const columns = {
        'To do': document.getElementById('kanban-to-do'),
        'In progress': document.getElementById('kanban-in-progress'),
        'Await feedback': document.getElementById('kanban-feedback'),
        'Done': document.getElementById('kanban-done')
    };

// Functions //

// Init and Loading //

async function initBoard() {
    await initAddTask();
    await loadTasks();

    updateTasksforBoard();
}

async function loadTasks() {
    try {
        const response = await fetch(BASE_URL + "tasks.json");

        if (!response.ok) {
            throw new Error("Loading failed");
        }

        const data = await response.json();

        tasks = data
            ? Object.entries(data).map(([id, task]) => ({
                  id: id.substring(1),
                  title: task.title || "",
                  description: task.description || "",
                  dueDate: task.dueDate || "",
                  priority: task.priority || "",
                  assignedTo: task.assignedTo || [],
                  category: task.category || "",
                  subtasks: task.subtasks || [],
                  taskStatus: task.taskStatus || "To do"
              }))
            : [];
    } catch (error) {
        console.error("Error loading tasks:", error);
        tasks = [];
    }
}

// Board //

function updateTasksforBoard(tasksToShow = tasks) {
    Object.values(columns).forEach(column => column.innerHTML = '');

    tasksToShow.forEach(task => {
        const column = columns[task.taskStatus];

        if (column) {
            column.innerHTML += generateTaskMiniCardHTML(task);
        }
    });

    Object.values(columns).forEach(column => {
        if (column.innerHTML.trim() === '') {
            column.innerHTML = generateEmptyCardHTML();
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
        return generateImgPrioHighHTML();
}

function getAssignedContactBadges(assignments) {
    return assignments.map(contact => {
        const parts = contact.name.split(' ');

        const initials =
            parts[0][0].toUpperCase() +
            (parts.length > 1
                ? parts[parts.length - 1][0].toUpperCase()
                : '');

        return generateBadgesHTML(contact.color, initials);

    }).join('');
}

function getStatusSubtasks(subtasks) {
    let numberOfDoneSubtasks = 0;

    for (let index = 0; index < subtasks.length; index++) {
        if (subtasks[index].status === 'done') {
            numberOfDoneSubtasks++;
        }
    }
    return `${numberOfDoneSubtasks}/${subtasks.length} Subtasks`;
}

function getSubtaskProgress(subtasks) {
    if (!subtasks.length) return 0;

    let done = 0;

    for (let index = 0; index < subtasks.length; index++) {
        if (subtasks[index].status === 'done') {
            done++;
        }
    }
    return (done / subtasks.length) * 100;
}

// Functions for drag and drop //

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

async function moveTo(taskCat) {
    const categoryStatus = {
        'kanban-to-do': 'To do',
        'kanban-in-progress': 'In progress',
        'kanban-feedback': 'Await feedback',
        'kanban-done': 'Done'
    };
    const task = tasks.find(task => task.id === currentDraggedElement);

    if (task) {
        task.taskStatus = categoryStatus[taskCat];

        await saveTaskCategory(currentDraggedElement, task.taskStatus);
        updateTasksforBoard();
    }
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

    taskOverlay.classList.remove('modal-enter');
    taskOverlay.classList.add('modal-exit');

    taskOverlay.addEventListener(
        'animationend',
        () => {
            taskOverlay.close();
            taskOverlay.classList.remove('modal-exit');
        },
        { once: true }
    );
}

function closeTaskOverlayNoAnimation(id) {
    const taskOverlay = document.getElementById(`task-overlay-${id}`);
    taskOverlay.close();
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

function setActivePriority(priority) {
    document.querySelectorAll(".priority").forEach(button => {
        button.classList.toggle("active", button.value === priority);
    });
}

function getAssignedContactNames(contacts) {
    return contacts.map(contact => {
        const usernames = contact.name;

        return generateUserNamesHTML(usernames);
    }).join('');
}

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
    renderContacts(contacts, menu, task.assignedTo);

    closeTaskOverlayNoAnimation(id);
    dialog.showModal();
    setActivePriority(task.priority);
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

    editOverlay.classList.remove('modal-enter');
    editOverlay.classList.add('modal-exit');

    editOverlay.addEventListener(
        'animationend',
        () => {
            editOverlay.close();
            editOverlay.classList.remove('modal-exit');
        },
        { once: true }
    );
}

function closeEditOverlayNoAnimation(id) {
    const editOverlay = document.getElementById(`edit-overlay-${id}`);
    editOverlay.close();
}

// function for search-bar, filtering tasks //

function filterAndShowCurrentTask(filterWord) {
    const currentTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(filterWord.toLowerCase()) ||
        task.description.toLowerCase().includes(filterWord.toLowerCase())
    );
    updateTasksforBoard(currentTasks);
}

// function for opening/closing modal "add-task" //

function openAddTaskOverlay() {
    document.getElementById("add-task-overlay").classList.add("show");
}

function closeAddTaskOverlay() {
    document.getElementById("add-task-overlay").classList.remove("show");
}

// delete function //

async function deleteTask(id) {
    const response = await fetch(`${BASE_URL}/tasks/-${id}.json`, {
        method: "DELETE",
    });

    let responseToJson = await response.json();
    closeTaskOverlay(id);

    await loadTasks();
    updateTasksforBoard();

    return responseToJson;
}

// save/put functions //

async function saveTaskCategory(id, data) {
    const response = await fetch(`${BASE_URL}/tasks/-${id}/taskStatus.json`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    await loadTasks();

    return response.json();
}

async function saveEditTask(id) {
    const updatedTask = {
        title: document.getElementById(`title-input-${id}`).value,
        description: document.getElementById(`description-input-${id}`).value,
        dueDate: document.getElementById(`date-input-${id}`).value,
        priority: getSelectedPriority(id),
        assignedTo: getAssignedContacts(id),
        subtasks: getUpdatedSubtasks(id)
    };

    const response = await fetch(`${BASE_URL}/tasks/-${id}.json`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
    });

    if (!response.ok) {
        throw new Error("Failed to update task");
    }
    procedureAfterSave(id);
    return response.json();
}

async function procedureAfterSave(id) {
    await loadTasks();
    updateTasksforBoard();

    closeEditOverlayNoAnimation(id);

    const oldOverlay = document.getElementById(`task-overlay-${id}`);
    if (oldOverlay) {
        oldOverlay.remove();
    }

    openTaskOverlay(id, 'no animation');
}

function getSelectedPriority(id) {
    const activeBtn = document
        .getElementById(`prio-btn-${id}`)
        ?.querySelector(".active");

    return activeBtn ? activeBtn.value: "";
}

function getAssignedContacts(id) {
    const selectedContacts = document
        .getElementById(`dropdownMenu-${id}`)
        ?.querySelectorAll(".selected");

    return selectedContacts
        ? Array.from(selectedContacts).map(contact => {
              const circle = contact.querySelector('.contact-circle');
              const nameElement = contact.querySelector('.contact-info span');
              return {
                  name: nameElement.textContent,
                  color: circle.style.cssText
              };
          })
        : [];
}

function getUpdatedSubtasks(id) {
    const subtaskElements = document.querySelectorAll(`#ul-subtask-${id} .container-subtask-li`);

    return Array.from(subtaskElements).map(container => ({
        title: container.querySelector('.li-subtask').textContent.trim(),
        status: container.dataset.status || "open"
    }));
}

async function toggleStatusSubtask(subtaskId, taskId, index) {
    let label = document.getElementById(subtaskId);
    let checkbox = label.querySelector('.checkbox-subtask');
    const newStatus = checkbox.checked ? 'done' : 'open';

    checkbox.value = newStatus;

    const task = tasks.find(task => task.id === taskId);
    task.subtasks[index].status = newStatus;

    const response = await fetch(`${BASE_URL}/tasks/-${taskId}/subtasks.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task.subtasks),
    });

    if (!response.ok) {
        checkbox.checked = !checkbox.checked;
        checkbox.value = checkbox.checked ? 'done' : 'open';
        task.subtasks[index].status = checkbox.value;
        return;
    }

    updateMiniCardSubtaskProgress(taskId, task.subtasks);
}

function updateMiniCardSubtaskProgress(taskId, subtasks) {
    const bar = document.querySelector(`#status-subtask-${taskId} .subtask-bar`);
    const count = document.getElementById(`status-count-${taskId}`);

    if (bar) bar.style.width = `${getSubtaskProgress(subtasks)}%`;
    if (count) count.textContent = getStatusSubtasks(subtasks);
}

// Event Listeners //

// filter //

document.getElementById('input-text').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        filterAndShowCurrentTask(event.target.value);
    }
});


