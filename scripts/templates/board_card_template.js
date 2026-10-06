/**
 * Generates the HTML template for a task mini-card.
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
