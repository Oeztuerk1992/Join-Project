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


/**
 * Creates all backend update requests.
 *
 * @param {string[]} cardIds - Ordered task IDs.
 * @param {string} oldStatus - Previous status.
 * @param {string} newStatus - New status.
 * @returns {Promise[]} Update requests.
 */
function buildTaskUpdates(
    cardIds,
    oldStatus,
    newStatus
) {
    const updates = [];

    cardIds.forEach((id, index) => {
        const task = tasks.find(task => task.id === id);

        if (!task) return;

        task.dragOrder = index * 1000;

        updates.push(
            saveTaskOrder(id, task.dragOrder)
        );
    });

    if (oldStatus !== newStatus) {
        updates.push(
            saveTaskCategory(
                currentDraggedElement,
                newStatus
            )
        );
    }

    return updates;
}
 
 
/**
 * Displays a drop placeholder at the current drag position.
 *
 * @param {string} id - Target container ID.
 * @param {DragEvent} event - Current drag event.
 * @returns {void}
 */
function highlight(id, event) {
    const target = getTargetContainer(id);
    const draggedCard = getDraggedCard();

    if (!target || !draggedCard) return;

    const insertBeforeCard = getInsertBeforeCard(target, event);

    if (isSameDropPosition(target, draggedCard, insertBeforeCard)) {
        removeHighlight();
        return;
    }

    insertPlaceholder(target, insertBeforeCard);
}


/**
 * Returns the target container element.
 *
 * @param {string} id - DOM ID of the target container.
 * @returns {HTMLElement|null} The target container element.
 */
function getTargetContainer(id) {
    return document.getElementById(id);
}


/**
 * Returns the card currently being dragged.
 *
 * @returns {HTMLElement|null} The dragged card element.
 */
function getDraggedCard() {
    return document.getElementById(
        `card-mini-${currentDraggedElement}`
    );
}


/**
 * Determines before which card the placeholder should be inserted.
 *
 * @param {HTMLElement} target - Target container element.
 * @param {DragEvent} event - Current drag event.
 * @returns {HTMLElement|null} The reference card or null.
 */
function getInsertBeforeCard(target, event) {
    const cards = [
        ...target.querySelectorAll(".mini-card:not(.dragging)")
    ];

    for (const card of cards) {
        if (event.clientY < getCardMiddle(card)) {
            return card;
        }
    }

    return null;
}


/**
 * Returns the vertical center position of a card.
 *
 * @param {HTMLElement} card - Card element.
 * @returns {number} The card's vertical midpoint.
 */
function getCardMiddle(card) {
    const rect = card.getBoundingClientRect();
    return rect.top + rect.height / 2;
}


/**
 * Checks whether the calculated drop position matches the card's
 * current position.
 *
 * @param {HTMLElement} target - Target container element.
 * @param {HTMLElement} draggedCard - Currently dragged card.
 * @param {HTMLElement|null} insertBeforeCard - Reference card.
 * @returns {boolean} True if the drop position is unchanged.
 */
function isSameDropPosition(
    target,
    draggedCard,
    insertBeforeCard
) {
    return target === draggedCard.parentElement
        && draggedCard.nextElementSibling === insertBeforeCard;
}


/**
 * Inserts the placeholder into the target container.
 *
 * @param {HTMLElement} target - Target container element.
 * @param {HTMLElement|null} insertBeforeCard - Card before which the
 *                                              placeholder should be inserted.
 * @returns {void}
 */
function insertPlaceholder(
    target,
    insertBeforeCard
) {
    const placeholder = createPlaceholder();

    if (insertBeforeCard) {
        target.insertBefore(
            placeholder,
            insertBeforeCard
        );
        return;
    }

    target.appendChild(placeholder);
}

 
/**
 * Removes the drop placeholder element from the DOM, if present.
 *
 * @returns {void}
 */
function removeHighlight() {
    if (placeholder) {
        placeholder.remove();
    }
}
 
// functions for mobile move menu //
 
/**
 * Closes every open mobile "move task" menu on the page by removing
 * the "show" class from all ".move-menu" elements.
 *
 * @returns {void}
 */
function closeMobileMoveMenus() {
    document.querySelectorAll(".move-menu").forEach(menu => {
        menu.classList.remove("show");
    });
}
 

/**
 * Global click listener: closes any open mobile move menu whenever a
 * click occurs anywhere in the document.
 *
 * @listens document#click
 */
document.addEventListener("click", closeMobileMoveMenus);
 

/**
 * Definition of the Kanban columns available in the mobile "move task"
 * menu, mapping each task status to its target column DOM ID and
 * display label.
 *
 * @type {Array<{status: string, targetId: string, label: string}>}
 */
const moveMenuColumns = [
    { status: 'To do', targetId: 'kanban-to-do', label: 'To-do' },
    { status: 'In progress', targetId: 'kanban-in-progress', label: 'Progress' },
    { status: 'Await feedback', targetId: 'kanban-feedback', label: 'Review' },
    { status: 'Done', targetId: 'kanban-done', label: 'Done' }
];
 

/**
 * Opens the mobile "move task" menu for a given task: renders one
 * button per Kanban column, excluding the task's current column, then
 * closes any other open move menus and shows this one.
 *
 * @param {string|number} id - ID of the task the menu belongs to; used
 *                              to find its `move-menu-{id}` element and
 *                              its current status.
 * @returns {void}
 */
function openMobileMoveMenu(id) {
    const menu = document.getElementById(`move-menu-${id}`);
    const task = tasks.find(task => task.id === id);
 
    const scrollContainer = menu.querySelector('.scroll-move-menu');
    scrollContainer.innerHTML = moveMenuColumns
        .filter(col => col.status !== task.taskStatus)
        .map(col => `
            <button onclick="moveTaskMobile('${id}', '${col.targetId}')">
                ${col.label}
            </button>
        `).join('');
 
    closeMobileMoveMenus();
    menu.classList.add("show");
}


/**
 * Moves a task to a new column from the mobile "move task" menu:
 * treats the given task as the currently dragged element, closes the
 * move menus, and delegates the actual move to moveTo().
 *
 * @param {string|number} id - ID of the task to move.
 * @param {string} taskCat - DOM ID of the target column (see
 *                            moveMenuColumns / moveTo()).
 * @returns {Promise<void>}
 */
async function moveTaskMobile(id, taskCat) {
    currentDraggedElement = id;
 
    closeMobileMoveMenus();
    await moveTo(taskCat);
}