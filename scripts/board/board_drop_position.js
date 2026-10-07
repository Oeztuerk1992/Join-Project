/**
 * Creates all backend update requests.
 * @param {string[]} cardIds - Ordered task IDs.
 * @param {string} oldStatus - Previous status.
 * @param {string} newStatus - New status.
 * @returns {Promise[]} Update requests.
 */
function buildTaskUpdates(cardIds, oldStatus, newStatus) {
    const updates = [];
    cardIds.forEach((id, index) => {
        const task = tasks.find(task => task.id === id);
        if (!task) return;
        task.dragOrder = index * 1000;
        updates.push(saveTaskOrder(id, task.dragOrder));
    });
    if (oldStatus !== newStatus) {
        updates.push(saveTaskCategory(currentDraggedElement, newStatus));
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
 * @param {HTMLElement|null} insertBeforeCard - Card before which the placeholder should be inserted.
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
 * Definition of the Kanban columns available in the mobile "move task"
 * menu, mapping each task status to its target column DOM ID and display label.
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
 * Opens the mobile "move task" menu with one button per other column.
 * @param {string|number} id - ID of the task the menu belongs to.
 * @returns {void}
 */
function openMobileMoveMenu(id) {
    const menu = document.getElementById(`move-menu-${id}`);
    const task = tasks.find(task => task.id === id);
    menu.querySelector('.scroll-move-menu').innerHTML = moveMenuColumns
        .filter(col => col.status !== task.taskStatus)
        .map(col => getMoveButtonHtml(id, col))
        .join('');
    closeMobileMoveMenus();
    menu.classList.add("show");
}


/**
 * Returns the HTML of a move button for a target column.
 * @param {string|number} id - ID of the task to move.
 * @param {{targetId: string, label: string}} col - The target column.
 * @returns {string} The button HTML.
 */
function getMoveButtonHtml(id, col) {
    return `
        <button onclick="moveTaskMobile('${id}', '${col.targetId}')">
            ${col.label}
        </button>
    `;
}


/**
 * Moves a task to another column from the mobile "move task" menu.
 * @param {string|number} id - ID of the task to move.
 * @param {string} taskCat - DOM ID of the target column.
 * @returns {Promise<void>}
 */
async function moveTaskMobile(id, taskCat) {
    currentDraggedElement = id;
    closeMobileMoveMenus();
    await moveTo(taskCat);
}


/**
 * Closes any open mobile move menu when a click occurs anywhere in the document.
 */
document.addEventListener("click", closeMobileMoveMenus);