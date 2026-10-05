/**
 * Generates the HTML template for a task mini-card.
 * The mini-card displays the task title, category, description, priority,
 * assigned contacts, and subtask progress.
 *
 * @param {Object} element - The task object containing all relevant task data.
 * @returns {string} The HTML template for the task mini-card.
 */
function generateTaskMiniCardHTML(element) {
  return ` 
          <section id="card-mini-${element.id}" class="mini-card" onclick="openTaskOverlay('${element.id}','animation')"
            draggable="true" ondragstart="startDragging('${element.id}')" ondragend="endDragging('${element.id}')">
            <div class="frame-mini-card">
              <header class="header-mini-card">
                <div class="headline-minicard">  
                  <h3 id="label-card-${element.id}" class="card-label">
                    ${getTaskCategory(element.category)}
                  </h3>
                  <button id="mobile-icon-for-move-${element.id}" class="mobile-icon-move" 
                    onclick="event.stopPropagation(); openMobileMoveMenu('${element.id}')">
                  </button>
                  <div id="move-menu-${element.id}" class="move-menu" onclick="event.stopPropagation()">
                    <span>Move to:</span>
                    <div class="scroll-move-menu"></div>
                  </div>
                </div>
                <h4 id="task-title-${element.id}" class="title-task">
                  ${element.title}
                </h4>
                <p id="task-description-${element.id}" class="description-task">
                  ${element.description}
                </p>
              </header>
              ${element.subtasks.length ?
      `
              <article id="subtask-${element.id}" class="container-subtask">
                <div id="status-subtask-${element.id}" class="subtask-bar-wrapper">
                  <div class="subtask-bar" style="width: ${getSubtaskProgress(element.subtasks)}%;"></div>
                </div>
                <div id="status-count-${element.id}" class="count-status">
                  ${getStatusSubtasks(element.subtasks)}
                </div>
              </article>
              `: ''
    }
              <div class="flex-grow"></div>
              <article class="responsibility-mini-card">
                <div id="badge-member-${element.id}" class="member-badge">
                  ${getAssignedContactBadges(element.assignedTo, 4)}
                </div>
                <div id="task-prio-${element.id}" class="priority-task">
                  ${getImgPrio(element.priority)}
                </div>
              </article>
            </div>
          </section>
  `;
}


/**
 * Generates the HTML template for the "User Story" task category.
 *
 * @returns {string} The HTML template displaying the "User Story" category.
 */
function generateTaskCategoryUserStoryHTML() {
  return `
          <div class="category-user-story">User Story</div>
  `;
}


/**
 * Generates the HTML template for the "Technical Task" task category.
 *
 * @returns {string} The HTML template displaying the "Technical Task" category.
 */
function generateTaskCategoryTechnicalTaskHTML() {
  return `
          <div class="category-technical-task">Technical Task</div>
  `;
}


/**
 * Generates the HTML template for a task with low priority.
 *
 * @returns {string} The HTML template containing the low-priority icon.
 */
function generateImgPrioLowHTML() {
  return `
          <img src="../assets/img/board/cards/prio_low.svg" alt="img-prio-low">
  `;
}


/**
 * Generates the HTML template for a task with medium priority.
 *
 * @returns {string} The HTML template containing the medium-priority icon.
 */
function generateImgPrioMediumHTML() {
  return `
          <img src="../assets/img/board/cards/prio_medium.svg" alt="img-prio-medium">
  `;
}


/**
 * Generates the HTML template for a task with high priority.
 *
 * @returns {string} The HTML template containing the high-priority icon.
 */
function generateImgPrioHighHTML() {
  return `
          <img src="../assets/img/board/cards/prio_high.svg" alt="img-prio-high">
  `;
}


/**
 * Generates an HTML badge displaying the initials of an assigned contact.
 *
 * @param {string} color - The CSS styling used to set the badge color.
 * @param {string} initials - The initials displayed inside the badge.
 * @returns {string} The HTML template for the contact badge.
 */
function generateBadgesHTML(color, initials) {
  return `
          <div class="user-abbr" style="${color}">${initials}</div>
  `;
}


/**
 * Generates an HTML element displaying the names of assigned contacts.
 *
 * @param {string} usernames - The names of the assigned contacts.
 * @returns {string} The HTML template containing the contact names.
 */
function generateUserNamesHTML(usernames) {
  return `
    <div class="contact-names-overlay">${usernames}</div>
  `;
}


/**
 * Generates the HTML template displayed when a Kanban column contains no tasks.
 *
 * @param {string} status - The status of the Kanban column.
 * @returns {string} The HTML template displaying the empty-column message.
 */
function generateEmptyCardHTML(status) {
  return `
          <div class="no-task-feedback">No tasks ${status}</div>
  `;
}


/**
 * Generates the HTML template for the task details overlay.
 * The overlay displays the task category, title, description, due date,
 * priority, assigned contacts, and subtasks.
 *
 * @param {Object} element - The task object containing all relevant task data.
 * @returns {string} The HTML template for the task details overlay.
 */
function generateTaskOverlayHTML(element) {
  return `
    <dialog id="task-overlay-${element.id}" class="view-task-overlay modal-class" >
        <header class="header-view-task">
            <div class="headline-view-task">
              <h3 id="label-card-view-${element.id}" class="card-label-view">
                ${getTaskCategory(element.category)}
              </h3>
              <button class="btn-close" onclick="closeTaskOverlay('${element.id}')"></button>
            </div>
        </header>
      <div class="scroll-container"> 
        <div class="scroll-wrapper-task">
          <div class="subheader-view-task">
              <h4 id="task-title-view-${element.id}" class="title-task-view">
                ${element.title}
              </h4>
              <p id="task-description-view-${element.id}" class="description-task-view">
                ${element.description}
              </p>
          </div>  
          <div class="frame-view-task">
            <article class="set-responsibilities">
            <div class="set-date">
              <span class="due-date-text">Due date:</span>
              <div class="due-date">${getDateFormat(element.dueDate)}</div>
            </div>
            <div class="set-priority">
              <span class="priority-long-text">Priority:</span>
              <div class="priority-long">
                <span class="text-long-prio">${element.priority}</span>
                ${getImgPrio(element.priority)}
              </div>
            </div>
            <div class="assignment-to-user">
              <span class="text-assigned">Assigned To:</span>
              <div id="badge-member-view-${element.id}" class="member-badge-view">
                ${getAssignedContactRows(element.assignedTo)}
              </div>
            </div>
            </article>
            <article class="subtask-status">
            <span class="title-subtask">Subtasks</span>
            <div id="subtasks-view-${element.id}" class="container-subtasks">
              ${getSubtasksOverlay(element.subtasks, element.id)}
            </div>
            </article>
          </div>
        </div>
        <button class="btn-scrollbar scroll-top" onmousedown="startScrolling('.scroll-wrapper-task', -1)" onmouseup="stopScrolling()" onmouseleave="stopScrolling()"><img src="../assets/img/contact/high.png" alt="up"></button>
        <button class="btn-scrollbar scroll-down" onmousedown="startScrolling('.scroll-wrapper-task', 1)" onmouseup="stopScrolling()" onmouseleave="stopScrolling()"><img src="../assets/img/contact/down.png" alt="down"></button>
      </div>
      <article class="edit-btn">
          <div class="frame-edit-btn">
            <button class="delete-task-view" onclick="deleteTask('${element.id}')">
              <figure class="container-img-delete">
                <div class="img-delete"></div>
                <figcaption class="text-delete">Delete</figcaption>
              </figure>
            </button>
            <div class="seperator-view-task"></div>
            <button class="edit-task-view" onclick="getEditOverlay('${element.id}')">
              <figure class="container-img-edit">
                <div class="img-edit"></div>
                <figcaption class="text-edit">Edit</figcaption>
              </figure>
            </button>
          </div>
      </article>
    </dialog>
  `;
}


/**
 * Generates the HTML template for a subtask with a checkbox.
 *
 * @param {Array<Object>} subtasks - The subtasks belonging to the task.
 * @param {string|number} id - The unique ID of the parent task.
 * @param {number} index - The index of the subtask in the array.
 * @returns {string} The HTML template for the subtask with a checkbox.
 */
function generateSubtaskHTML(subtasks, id, index) {
  return `
    <label id = "subtask-${id}-${index}" class="container-checkbox subtask-text" >
      <div class="background-checkbox">
        <input type="checkbox" class="checkbox-subtask" onclick="toggleStatusSubtask('subtask-${id}-${index}', '${id}', ${index})" value="${subtasks[index].status}" ${subtasks[index].status === "done" ? "checked" : ""}/>
      </div>
      <p class="description-subtask">
        ${subtasks[index].title}
      </p>
    </label >
  `;
}
