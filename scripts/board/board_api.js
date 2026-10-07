/**
 * Loads all tasks from the backend into the global "tasks" array.
 * @returns {Promise<void>}
 */
async function loadTasks() {
    try {
        const response = await fetch(BASE_URL + "tasks.json");
        if (!response.ok) {
            throw new Error("Loading failed");
        }
        const data = await response.json();
        tasks = data ? Object.entries(data).map(normalizeTask) : [];
    } catch (error) {
        console.error("Error loading tasks:", error);
        tasks = [];
    }
}


/**
 * Converts a backend entry into a task object with defaults.
 * @param {Array} entry - Tuple of backend ID and raw task data.
 * @returns {Object} The normalized task.
 */
function normalizeTask([id, task]) {
    return {
        id: id.substring(1),
        ...taskDefaults(task),
    };
}


/**
 * Returns the task fields, filled with defaults for missing values.
 * @param {Object} task - The raw task data from the backend.
 * @returns {Object} The task fields with defaults applied.
 */
function taskDefaults(task) {
    return {
        title: task.title || "",
        description: task.description || "",
        dueDate: task.dueDate || "",
        priority: task.priority || "",
        assignedTo: task.assignedTo || [],
        category: task.category || "",
        subtasks: task.subtasks || [],
        taskStatus: task.taskStatus || "To do",
        dragOrder: task.dragOrder || 0,
    };
}


/**
 * Saves a task's status to the backend, then reloads "tasks".
 * @param {string|number} id - ID of the task (without the leading "-").
 * @param {*} data - The new taskStatus value to store.
 * @returns {Promise<Object>} The parsed JSON response from the backend.
 */
async function saveTaskCategory(id, data) {
    const response = await fetch(`${BASE_URL}/tasks/-${id}/taskStatus.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    await loadTasks();
    return response.json();
}
 
 
/**
 * Saves a task's drag order to the backend, then reloads "tasks".
 * @param {string|number} id - ID of the task (without the leading "-").
 * @param {*} data - The new dragOrder value to store.
 * @returns {Promise<Object>} The parsed JSON response from the backend.
 */
async function saveTaskOrder(id, data) {
    const response = await fetch(`${BASE_URL}/tasks/-${id}/dragOrder.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    await loadTasks();
    return response.json();
}
 
 
/**
 * Reads the edit form of a task and PATCHes the values to the backend.
 * @param {string|number} id - ID of the task being edited.
 * @returns {Promise<Object>} The parsed JSON response from the backend.
 * @throws {Error} If the PATCH request does not return an ok response.
 */
async function saveEditTask(id) {
    const response = await fetch(`${BASE_URL}/tasks/-${id}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(readEditForm(id)),
    });
    if (!response.ok) {
        throw new Error("Failed to update task");
    }
    procedureAfterSave(id);
    return response.json();
}


/**
 * Collects the current values of a task's edit form fields.
 * @param {string|number} id - ID of the task, used to locate the form fields.
 * @returns {Object} The updated task fields.
 */
function readEditForm(id) {
    return {
        title: document.getElementById(`title-input-${id}`).value,
        description: document.getElementById(`description-input-${id}`).value,
        dueDate: document.getElementById(`date-input-${id}`).value,
        priority: getSelectedPriority(id),
        assignedTo: getAssignedContacts(id),
        subtasks: getUpdatedSubtasks(id)
    };
}
 
 
/**
 * Reads which priority button is active in a task's edit form.
 * @param {string|number} id - ID of the task, used to locate `prio-btn-{id}`.
 * @returns {string} The value of the active button, or "" if none is active.
 */
function getSelectedPriority(id) {
    const activeBtn = document
        .getElementById(`prio-btn-${id}`)
        ?.querySelector(".active");
    return activeBtn ? activeBtn.value : "";
}
 
 
/**
 * Reads the selected contacts from a task's edit form assignment dropdown.
 * @param {string|number} id - ID of the task, used to locate `dropdownMenu-{id}`.
 * @returns {Array<{id: string, name: string, color: string}>} The selected contacts, or an empty array if the dropdown is not found.
 */
function getAssignedContacts(id) {
    const selected = document
        .getElementById(`dropdownMenu-${id}`)
        ?.querySelectorAll(".selected");
    return selected ? Array.from(selected).map(readContact) : [];
}


/**
 * Extracts id, name and color from a selected contact element.
 * @param {HTMLElement} contact - The selected contact element.
 * @returns {{id: string, name: string, color: string}} The contact data.
 */
function readContact(contact) {
    const circle = contact.querySelector(".contact-circle");
    const nameElement = contact.querySelector(".contact-name");
    return {
        id: contact.dataset.id,
        name: nameElement?.textContent || "",
        color: circle.style.cssText
    };
}
 
 
/**
 * Reads the subtasks from a task's edit form subtask list.
 * @param {string|number} id - ID of the task, used to locate `ul-subtask-{id}`.
 * @returns {Array<{title: string, status: string}>} The subtasks; status defaults to "open".
 */
function getUpdatedSubtasks(id) {
    const elements = document.querySelectorAll(
        `#ul-subtask-${id} .container-subtask-li`
    );
    return Array.from(elements).map(container => ({
        title: container.querySelector(".li-subtask").textContent.trim(),
        status: container.dataset.status || "open"
    }));
}
 
 
/**
 * Toggles a subtask checkbox and saves the status; reverts on failure.
 * @param {string} subtaskId - ID of the subtask's label element.
 * @param {string|number} taskId - ID of the parent task.
 * @param {number} index - Index of the subtask within task.subtasks.
 * @returns {Promise<void>}
 */
async function toggleStatusSubtask(subtaskId, taskId, index) {
    const checkbox = document.getElementById(subtaskId).querySelector(".checkbox-subtask");
    const task = tasks.find(task => task.id === taskId);
    checkbox.value = checkbox.checked ? "done" : "open";
    task.subtasks[index].status = checkbox.value;
    const response = await putSubtasks(taskId, task.subtasks);
    if (!response.ok) {
        checkbox.checked = !checkbox.checked;
        checkbox.value = checkbox.checked ? "done" : "open";
        task.subtasks[index].status = checkbox.value;
        return;
    }
    updateMiniCardSubtaskProgress(taskId, task.subtasks);
}


/**
 * Sends the subtasks of a task to the backend.
 * @param {string|number} taskId - ID of the parent task.
 * @param {Array<Object>} subtasks - The subtasks to store.
 * @returns {Promise<Response>} The fetch response.
 */
function putSubtasks(taskId, subtasks) {
    return fetch(`${BASE_URL}/tasks/-${taskId}/subtasks.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subtasks),
    });
}
 
 
/**
 * Updates a task's mini card with the current subtask progress bar and count.
 * @param {string|number} taskId - ID of the task whose mini card is updated.
 * @param {Array<{title: string, status: string}>} subtasks - The task's current subtasks.
 * @returns {void}
 */
function updateMiniCardSubtaskProgress(taskId, subtasks) {
    const bar = document.querySelector(`#status-subtask-${taskId} .subtask-bar`);
    const count = document.getElementById(`status-count-${taskId}`);
    if (bar) bar.style.width = `${getSubtaskProgress(subtasks)}%`;
    if (count) count.textContent = getStatusSubtasks(subtasks);
}
 
 
/**
 * Deletes a task from the backend, closes its overlay, reloads the
 * local "tasks" array, and re-renders the board.
 *
 * @param {string|number} id - ID of the task to delete.
 * @returns {Promise<Object>} The parsed JSON response from the backend.
 */
async function deleteTask(id) {
    const response = await fetch(`${BASE_URL}/tasks/-${id}.json`, {method: "DELETE",});
    let responseToJson = await response.json();
    closeTaskOverlay(id);
    await loadTasks();
    updateTasksforBoard();
    return responseToJson;
}
 
 
/**
 * Reloads tasks, re-renders the board and reopens the saved task's overlay.
 * @param {string|number} id - ID of the task that was saved.
 * @returns {Promise<void>}
 */
async function procedureAfterSave(id) {
    await loadTasks();
    updateTasksforBoard();
    closeEditOverlayNoAnimation(id);
    document.getElementById(`task-overlay-${id}`)?.remove();
    openTaskOverlay(id, 'no animation');
}