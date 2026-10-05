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
