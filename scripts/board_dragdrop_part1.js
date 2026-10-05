/**
 * Starts dragging a task card: stores its ID in the global
 * "currentDraggedElement" and adds the "dragging" class to the
 * corresponding mini card.
 *
 * @param {string|number} id - ID of the task being dragged.
 * @returns {void}
 */
function startDragging(id) {
    currentDraggedElement = id;
 
    const card = document.getElementById(`card-mini-${id}`);
 
    if (card) {
        card.classList.add('dragging');
    }
}
 
 
/**
 * Ends dragging a task card: removes the "dragging" class from the
 * corresponding mini card, removes the drop placeholder, stops any
 * active auto-scroll, and clears "currentDraggedElement".
 *
 * @param {string|number} id - ID of the task that was being dragged.
 * @returns {void}
 */
function endDragging(id) {
    const card = document.getElementById(`card-mini-${id}`);
 
    if (card) {
        card.classList.remove('dragging');
    }
 
    removeHighlight();
    stopAutoScroll();
 
    currentDraggedElement = null;
}
 
 
/**
 * Drag-over handler for a droppable column: prevents the default
 * behavior (which would block dropping) and triggers auto-scroll
 * handling for that column based on the current pointer position.
 *
 * @param {DragEvent} event - The dragover event; event.currentTarget is
 *                             the scrollable column container.
 * @returns {void}
 */
function allowDrop(event) {
    event.preventDefault();
 
    const scrollContainer = event.currentTarget;
 
    handleAutoScroll(event, scrollContainer);
}
 
 
/**
 * Automatically scrolls a container while dragging near its edges.
 *
 * @param {MouseEvent} event - Current mouse event.
 * @param {HTMLElement} container - Scrollable container.
 * @returns {void}
 */
function handleAutoScroll(event, container) {
    const scrollData = getScrollData(event, container);
    const direction = getScrollDirection(scrollData);

    if (direction === 0) {
        stopAutoScroll();
        return;
    }

    if (isAutoScrollRunning(container, direction)) {
        return;
    }

    startAutoScroll(container, direction);
}


/**
 * Returns scroll-relevant mouse and container data.
 *
 * @param {MouseEvent} event - Current mouse event.
 * @param {HTMLElement} container - Scrollable container.
 * @returns {Object} Scroll position data.
 */
function getScrollData(event, container) {
    const rect = container.getBoundingClientRect();

    return {
        distanceFromTop: event.clientY - rect.top,
        distanceFromBottom: rect.bottom - event.clientY
    };
}


/**
 * Determines the scroll direction.
 *
 * @param {Object} scrollData - Scroll position data.
 * @returns {number} -1, 0 or 1.
 */
function getScrollDirection(scrollData) {
    const scrollZone = 80;

    if (scrollData.distanceFromTop < scrollZone) {
        return -1;
    }

    if (scrollData.distanceFromBottom < scrollZone) {
        return 1;
    }

    return 0;
}


/**
 * Checks whether the desired auto-scroll is already active.
 *
 * @param {HTMLElement} container - Scrollable container.
 * @param {number} direction - Scroll direction.
 * @returns {boolean} True if already running.
 */
function isAutoScrollRunning(container, direction) {
    return autoScrollInterval
        && autoScrollContainer === container
        && autoScrollDirection === direction;
}


/**
 * Starts auto-scrolling for a container.
 *
 * @param {HTMLElement} container - Scrollable container.
 * @param {number} direction - Scroll direction.
 * @returns {void}
 */
function startAutoScroll(container, direction) {
    const scrollSpeed = 8;

    stopAutoScroll();

    autoScrollContainer = container;
    autoScrollDirection = direction;

    autoScrollInterval = setInterval(() => {
        container.scrollTop += direction * scrollSpeed;
    }, 16);
}
 
 
/**
 * Stops any currently running auto-scroll interval and resets the
 * related auto-scroll state (container and direction).
 *
 * @returns {void}
 */
function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
    autoScrollContainer = null;
    autoScrollDirection = 0;
}
 

/**
 * Lazily creates (or returns the existing) drop placeholder element
 * used to visually indicate where a dragged card would land.
 *
 * @returns {HTMLElement} The placeholder element (global "placeholder").
 */
function createPlaceholder() {
    if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.classList.add('drag-area-highlight');
    }
 
    return placeholder;
}
 
 
/**
 * Moves the dragged task to a new column and updates its order.
 *
 * @param {string} taskCat - Target column ID.
 * @returns {Promise<void>}
 */
async function moveTo(taskCat) {
    stopAutoScroll();

    const task = getDraggedTask();
    if (!task) return;

    const oldStatus = task.taskStatus;   // ← vorher merken
    const newStatus = getTaskStatus(taskCat);
    const cardIds = getTargetCardIds(taskCat);

    applyTaskStatus(task, newStatus);

    await saveTaskChanges(
        cardIds,
        oldStatus,   // ← echten alten Wert übergeben
        newStatus
    );

    updateTasksforBoard();
}


/**
 * Returns the currently dragged task.
 *
 * @returns {Object|undefined} Dragged task.
 */
function getDraggedTask() {
    return tasks.find(
        task => task.id === currentDraggedElement
    );
}


/**
 * Returns the status for a column ID.
 *
 * @param {string} taskCat - Target column ID.
 * @returns {string} Task status.
 */
function getTaskStatus(taskCat) {
    const categoryStatus = {
        "kanban-to-do": "To do",
        "kanban-in-progress": "In progress",
        "kanban-feedback": "Await feedback",
        "kanban-done": "Done"
    };

    return categoryStatus[taskCat];
}


/**
 * Returns all task IDs in their new order.
 *
 * @param {string} taskCat - Target column ID.
 * @returns {string[]} Ordered task IDs.
 */
function getTargetCardIds(taskCat) {
    const container = document.getElementById(taskCat);

    const cardIds = [...container.children]
        .filter(el => el.id !== `card-mini-${currentDraggedElement}`)
        .map(el =>
            el === placeholder
                ? currentDraggedElement
                : el.id?.replace("card-mini-", "")
        )
        .filter(Boolean);

    if (!cardIds.includes(currentDraggedElement)) {
        cardIds.push(currentDraggedElement);
    }

    return cardIds;
}


/**
 * Updates the task status locally.
 *
 * @param {Object} task - Task to update.
 * @param {string} status - New task status.
 * @returns {void}
 */
function applyTaskStatus(task, status) {
    task.taskStatus = status;
}


/**
 * Saves the new task order and status.
 *
 * @param {string[]} cardIds - Ordered task IDs.
 * @param {string} oldStatus - Previous status.
 * @param {string} newStatus - New status.
 * @returns {Promise<void>}
 */
async function saveTaskChanges(
    cardIds,
    oldStatus,
    newStatus
) {
    const updates = buildTaskUpdates(
        cardIds,
        oldStatus,
        newStatus
    );

    try {
        await Promise.all(updates);
    } catch (error) {
        console.error(
            "Speichern fehlgeschlagen:",
            error
        );
    }
}