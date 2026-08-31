function startDragging(id) {
    currentDraggedElement = id;

    const card = document.getElementById(`card-mini-${id}`);

    if (card) {
        card.classList.add('dragging');
    }
}


function endDragging(id) {
    const card = document.getElementById(`card-mini-${id}`);

    if (card) {
        card.classList.remove('dragging');
    }

    removeHighlight();
    stopAutoScroll();

    currentDraggedElement = null;
}


function allowDrop(event) {
    event.preventDefault();

    const scrollContainer = event.currentTarget;

    handleAutoScroll(event, scrollContainer);
}


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
        return; // läuft bereits identisch, nichts tun
    }

    stopAutoScroll(); // alten Interval (ggf. anderer Container/Richtung) sauber beenden

    autoScrollContainer = container;
    autoScrollDirection = direction;

    autoScrollInterval = setInterval(() => {
        container.scrollTop += direction * scrollSpeed;
    }, 16);
}


function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
    autoScrollContainer = null;
    autoScrollDirection = 0;
}

function createPlaceholder() {
    if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.classList.add('drag-area-highlight');
    }

    return placeholder;
}


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

    // dragOrder für alle betroffenen Tasks der Zielspalte neu vergeben
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

    // Zielposition == aktuelle Position der Karte? Dann keinen Platzhalter zeigen.
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


function removeHighlight() {
    if (placeholder) {
        placeholder.remove();
    }
}

// functions for mobile move menu //

function openMobileMoveMenu(id) {
    const menu = document.getElementById(`move-menu-${id}`);

    document.querySelectorAll('.move-menu').forEach(menu => {
        menu.classList.remove('show');
    });

    menu.classList.add('show');
}


async function moveTaskMobile(id, taskCat) {
    currentDraggedElement = id;

    const menu = document.getElementById(`move-menu-${id}`);
    menu.classList.remove('show');

    await moveTo(taskCat);
}