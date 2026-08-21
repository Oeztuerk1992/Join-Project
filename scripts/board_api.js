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
                  taskStatus: task.taskStatus || "To do",
                  dragOrder: task.dragOrder || 0,
              }))
            : [];
    } catch (error) {
        console.error("Error loading tasks:", error);
        tasks = [];
    }
}


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


async function saveTaskOrder(id, data) {
    const response = await fetch(`${BASE_URL}/tasks/-${id}/dragOrder.json`, {
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
              const nameElement = contact.querySelector('.contact-name');

              return {
                  id: contact.dataset.id,
                  name: nameElement?.textContent || '',
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