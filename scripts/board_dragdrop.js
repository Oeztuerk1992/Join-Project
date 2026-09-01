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
 * Starts, keeps, or stops auto-scrolling of a column container while
 * dragging, based on how close the pointer is to the top/bottom edge.
 * If the pointer is within the scroll zone of the top or bottom edge,
 * an interval is (re)started that scrolls the container in that
 * direction; otherwise any active auto-scroll is stopped. Avoids
 * restarting an already-running interval for the same container and
 * direction.
 *
 * @param {DragEvent} event - The current drag event; event.clientY is
 *                             used as the pointer's vertical position.
 * @param {HTMLElement} container - The scrollable column container to
 *                                   scroll.
 * @returns {void}
 */
function handleAutoScroll(event, container) {
    const rect = container.getBoundingClientRect();
    const mouseY = event.clientY;
 
    const scrollZone = 80;
    const scrollSpeed = 8;
 
    const distanceFromTop = mouseY - rect.top;
    const distanceFromBottom = rect.bottom - mouseY;
 
    let direction = 0;
 
    if (distanceFromTop < scrollZone) {
        direction = -1;
    } else if (distanceFromBottom < scrollZone) {
        direction = 1;
    }
 
    if (direction === 0) {
        stopAutoScroll();
        return;
    }
 
    if (autoScrollInterval && autoScrollContainer === container && autoScrollDirection === direction) {
        return; // already running identically, do nothing
    }
 
    stopAutoScroll(); // cleanly stop the old interval (possibly different container/direction)
 
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
 * Moves the currently dragged task into the given Kanban column:
 * updates its status, recalculates the drag order of all cards in the
 * target column (based on their current DOM order, with the dragged
 * card's placeholder position substituted in), persists the updated
 * order and, if changed, the new status to the backend, and finally
 * re-renders the board. Does nothing if no task matches
 * "currentDraggedElement".
 *
 * @param {string} taskCat - DOM ID of the target column
 *                            (e.g. "kanban-to-do"), mapped internally
 *                            to a task status via categoryStatus.
 * @returns {Promise<void>}
 */
async function moveTo(taskCat) {
    stopAutoScroll();
    const categoryStatus = {
        'kanban-to-do': 'To do',
        'kanban-in-progress': 'In progress',
        'kanban-feedback': 'Await feedback',
        'kanban-done': 'Done'
    };
    const newStatus = categoryStatus[taskCat];
    const task = tasks.find(task => task.id === currentDraggedElement);
 
    if (!task) return;
 
    const targetContainer = document.getElementById(taskCat);
    const oldStatus = task.taskStatus;
 
    const cardIds = [...targetContainer.children]
    .filter(el => el.id !== `card-mini-${currentDraggedElement}`)
    .map(el => el === placeholder ? currentDraggedElement : el.id?.replace('card-mini-', ''))
    .filter(Boolean);
 
    if (!cardIds.includes(currentDraggedElement)) {
        cardIds.push(currentDraggedElement);
    }
 
    task.taskStatus = newStatus;
 
    // reassign dragOrder for all affected tasks in the target column
    const updates = [];
    cardIds.forEach((id, index) => {
        const t = tasks.find(t => t.id === id);
        if (t) {
            t.dragOrder = index * 1000;
            updates.push(saveTaskOrder(id, t.dragOrder));
        }
    });
 
    if (oldStatus !== newStatus) {
        updates.push(saveTaskCategory(currentDraggedElement, newStatus));
    }
 
    try {
        await Promise.all(updates);
    } catch (err) {
        console.error('Speichern fehlgeschlagen:', err);
    }
 
    updateTasksforBoard();
}
 
 
/**
 * Shows a drop placeholder inside the given container at the position
 * the dragged card would be inserted, based on the pointer's vertical
 * position relative to the other (non-dragging) cards in that
 * container. Removes the placeholder instead if the computed drop
 * position is the same as the dragged card's current position, or does
 * nothing if the target container or the dragged card cannot be found.
 *
 * @param {string} id - DOM ID of the container currently being dragged
 *                       over.
 * @param {DragEvent} event - The current drag event; event.clientY is
 *                             used to determine the insertion point.
 * @returns {void}
 */
function highlight(id, event) {
    const target = document.getElementById(id);
 
    if (!target) {
        return;
    }
 
    const draggedCard = document.getElementById(
        `card-mini-${currentDraggedElement}`
    );
 
    if (!draggedCard) {
        return;
    }
 
    const cards = [
        ...target.querySelectorAll('.mini-card:not(.dragging)')
    ];
 
    let insertBeforeCard = null;
 
    for (const card of cards) {
        const rect = card.getBoundingClientRect();
        const cardMiddle = rect.top + rect.height / 2;
 
        if (event.clientY < cardMiddle) {
            insertBeforeCard = card;
            break;
        }
    }
 
    // Target position same as the card's current position? Then don't show a placeholder.
    const isSameSpot =
        target === draggedCard.parentElement &&
        draggedCard.nextElementSibling === insertBeforeCard;
 
    if (isSameSpot) {
        removeHighlight();
        return;
    }
 
    const currentPlaceholder = createPlaceholder();
 
    if (insertBeforeCard) {
        target.insertBefore(currentPlaceholder, insertBeforeCard);
    } else {
        target.appendChild(currentPlaceholder);
    }
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