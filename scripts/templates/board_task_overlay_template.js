/**
 * Generates the HTML template for the task details overlay.
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
