// Highlight and placeholder for the drop position //

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
