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