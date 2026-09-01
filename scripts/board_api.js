/**
 * Loads all tasks from the backend (Firebase-style REST endpoint) and
 * writes them into the global "tasks" array. Missing fields on a task
 * are filled with sensible defaults. On error or empty response,
 * "tasks" is set to an empty array.
 *
 * @returns {Promise<void>}
 */
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
 
 
/**
 * Persists a task's status/column (e.g. "To do", "In progress", "Done")
 * to the backend and reloads the local "tasks" array afterwards.
 *
 * @param {string|number} id - ID of the task (without the leading "-"
 *                              used in the backend path).
 * @param {*} data - The new taskStatus value to store.
 * @returns {Promise<Object>} The parsed JSON response from the backend.
 */
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
 
 
/**
 * Persists a task's drag order (its position within a column) to the
 * backend and reloads the local "tasks" array afterwards.
 *
 * @param {string|number} id - ID of the task (without the leading "-"
 *                              used in the backend path).
 * @param {*} data - The new dragOrder value to store.
 * @returns {Promise<Object>} The parsed JSON response from the backend.
 */
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
 
 
/**
 * Reads the current values out of a task's edit form (title,
 * description, due date, priority, assigned contacts, subtasks) and
 * PATCHes them to the backend. On success, triggers the post-save
 * procedure (reload, re-render board, reopen overlay).
 *
 * @param {string|number} id - ID of the task being edited; used to
 *                              locate the form fields
 *                              (`title-input-{id}` etc.) and the
 *                              backend path.
 * @returns {Promise<Object>} The parsed JSON response from the backend.
 * @throws {Error} If the PATCH request does not return an ok response.
 */
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
 
 
/**
 * Reads which priority button is currently active in a task's edit
 * form.
 *
 * @param {string|number} id - ID of the task; used to locate the
 *                              `prio-btn-{id}` container.
 * @returns {string} The value of the active priority button, or an
 *                    empty string if none is active.
 */
function getSelectedPriority(id) {
    const activeBtn = document
        .getElementById(`prio-btn-${id}`)
        ?.querySelector(".active");
 
    return activeBtn ? activeBtn.value: "";
}
 
 
/**
 * Reads the currently selected contacts out of a task's edit form
 * assignment dropdown.
 *
 * @param {string|number} id - ID of the task; used to locate the
 *                              `dropdownMenu-{id}` container.
 * @returns {Array<{id: string, name: string, color: string}>} The
 *          selected contacts, or an empty array if the dropdown is not
 *          found.
 */
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
 
 
/**
 * Reads the current subtasks out of a task's edit form subtask list.
 *
 * @param {string|number} id - ID of the task; used to locate the
 *                              `ul-subtask-{id}` list.
 * @returns {Array<{title: string, status: string}>} The subtasks with
 *          their title and status ("open" by default if not set via
 *          the container's dataset).
 */
function getUpdatedSubtasks(id) {
    const subtaskElements = document.querySelectorAll(`#ul-subtask-${id} .container-subtask-li`);
 
    return Array.from(subtaskElements).map(container => ({
        title: container.querySelector('.li-subtask').textContent.trim(),
        status: container.dataset.status || "open"
    }));
}
 
 
/**
 * Toggles a subtask's checkbox and persists the resulting subtask
 * status to the backend. Updates the local task's subtasks array
 * optimistically before the request; on failure, reverts the checkbox,
 * its value, and the local status back to the previous state. On
 * success, refreshes the subtask progress shown on the task's mini card.
 *
 * @param {string} subtaskId - ID of the subtask's label element,
 *                              containing the checkbox.
 * @param {string|number} taskId - ID of the parent task, used to find
 *                                  it in the global "tasks" array and
 *                                  to build the backend path.
 * @param {number} index - Index of the subtask within
 *                          task.subtasks.
 * @returns {Promise<void>}
 */
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
 
 
/**
 * Updates a task's mini card on the board to reflect the current
 * subtask progress: the progress bar width and the "x/y done" count
 * text.
 *
 * @param {string|number} taskId - ID of the task whose mini card
 *                                  should be updated.
 * @param {Array<{title: string, status: string}>} subtasks - The
 *                                  task's current subtasks, used to
 *                                  compute progress and status text.
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
    const response = await fetch(`${BASE_URL}/tasks/-${id}.json`, {
        method: "DELETE",
    });
 
    let responseToJson = await response.json();
    closeTaskOverlay(id);
 
    await loadTasks();
    updateTasksforBoard();
 
    return responseToJson;
}
 
 
/**
 * Runs after a task has been successfully saved: reloads tasks,
 * re-renders the board, closes the edit overlay without animation,
 * removes the stale overlay element from the DOM, and reopens the task
 * overlay (without animation) to show the updated data.
 *
 * @param {string|number} id - ID of the task that was saved.
 * @returns {Promise<void>}
 */
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