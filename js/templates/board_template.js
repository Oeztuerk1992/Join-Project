function generateTaskMiniCardHTML(element) {
  return `<section id="card-mini-${element.id}" class="mini-card" onclick="openTaskOverlay(${element.id})" draggable="true" ondragstart="startDragging(${element.id})" ondragend="endDragging(${element.id})">
          <div class="frame-mini-card">
            <header class="header-mini-card">
              <h3 id="label-card-${element.id}" class="card-label">
                ${getTaskCategory(element.category)}
              </h3>
              <h4 id="task-title-${element.id}" class="title-task">
              ${element.title}
              </h4>
              <p id="task-description-${element.id}" class="description-task">
                ${element.description}
              </p>
            </header>
            <article id="subtask-${element.id}" class="container-subtask">
              <div id="status-subtask-${element.id}" class="subtask-bar-wrapper">
                <div class="subtask-bar" style="width: ${getSubtaskProgress(element.subtasks)}%;"></div>
              </div>
              <div id="status-count-${element.id}" class="count-status">
                ${getStatusSubtasks(element.subtasks, element.id)}
              </div>
            </article>
            <div class="flex-grow"></div>
            <article class="responsibility-mini-card">
              <div id="badge-member-${element.id}" class="member-badge">
                ${getAssignedContactBadges(element.assignedTo)}
              </div>
              <div id="task-prio-${element.id}" class="priority-task">
                ${getImgPrio(element.priority)}
              </div>
            </article>
          </div>
        </section>`;
}

function generateTaskOverlayHTML(element) {
  return `
        <dialog id="task-overlay-${element.id}" class="view-task-overlay modal-class">
          <div class="frame-view-task">
            <header class="header-view-task">
              <div class="headline-view-task">
                <h3 id="label-card-view-${element.id}" class="card-label-view">
                  ${getTaskCategory(element.category)}
                </h3>
                <button class="btn-close" onclick="closeTaskOverlay(${element.id})"></button>
              </div>
              <h4 id="task-title-view-${element.id}" class="title-task-view">
                ${element.title}
              </h4>
              <p id="task-description-view-${element.id}" class="description-task-view">
                ${element.description}
              </p>
            </header>
            <article class="set-responsibilities">
              <div class="set-date">
                <span class="due-date-text">Due date:</span>
                <div class="due-date">${element.dueDate}</div>
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
                  <div class="container-user">
                    <div class="assigned-user-overlay">
                    ${getAssignedContactBadges(element.assignedTo)}
                    </div>
                    <div class="assigned-user-overlay name-to-badge">
                    ${getAssignedContactNames(element.assignedTo)}
                    </div>
                  </div>
                </div>
              </div>
            </article>
            <article class="subtask-status">
              <span class="title-subtask">Subtasks</span>
              <div id="subtasks-view-${element.id}" class="container-subtasks">
              ${getSubtasksOverlay(element.subtasks, element.id)}
              </div>
            </article>
            <div class="flex-grow"></div>
            <article class="edit-btn">
              <div class="frame-edit-btn">
                <button class="delete-task-view" onclick="deleteTask()">
                  <figure class="container-img-delete">
                    <div class="img-delete"></div>
                    <figcaption class="text-delete">Delete</figcaption>
                  </figure>
                </button>
                <div class="seperator-view-task"></div>
                <button class="edit-task-view" onclick="getEditOverlay(${element.id})">
                  <figure class="container-img-edit">
                    <div class="img-edit"></div>
                    <figcaption class="text-edit">Edit</figcaption>
                  </figure>
                </button>
              </div>
            </article>
          </div>
        </dialog>`;
}

function generateEditOverlayHTML(element) {
  return`
        <dialog id="edit-overlay-${element.id}" class="edit-task-overlay modal-class">
          <div class="frame-view-edit-task">
            <header class="header-form">
              <div class="headline-edit-task">
                <div></div>
                <button class="btn-close" onclick="closeEditOverlay(${element.id})"></button>
              </div>
            </header>
            <form class="form-for-edit-task">
              <div class="container-form">
                <label class="label-form" for="title-input">Title</label>
                <input
                  type="text"
                  class="input input-title"
                  id="title-input-${element.id}"
                  name="title-input"
                  required
                  placeholder="Enter a title"
                /><br />
              </div>
              <div class="container-form">
                <label class="label-form" for="description-input"
                >Description</label
                >
                <textarea
                  class="input input-description"
                  id="description-input-${element.id}"
                  name="description-input"
                  required
                  placeholder="Enter a Description"
                ></textarea
                ><br />
              </div>
              <div class="container-form">
                <label class="label-form" for="date-input">Due Date</label>
                <input
                  type="date"
                  class="input input-date"
                  id="date-input-${element.id}"
                  name="date-input"
                  required
                  placeholder="dd/mm/yyyy"
                /><br />
              </div>
              <div class="set-up-prio-in-edit-mode">
                <span class="title-prio-in-edit-mode">Priority</span>
                <div class="btn-prio-in-edit-mode">
                  <button class="btn-prio-edit">
                    <span>Urgent</span>
                    <div class="img-prio-urgent checked-urgent"></div>
                  </button>
                  <button class="btn-prio-edit">
                    <span>Medium</span>
                    <div class="img-prio-medium checked-medium"></div>
                  </button>
                  <button class="btn-prio-edit">
                    <span>Low</span>
                    <div class="img-prio-low checked-low"></div>
                  </button>
                </div>
              </div>
              <div class="container-dropdown-user">
                <span class="title-dropdown-menu"
                >Assigned to (kommt von Rico)</span
                >
                <div class="container-btn-dropdown">
                  <input
                    type="text"
                    class="search-in-dropdown"
                    placeholder="Select contacts to assign"
                  />
                  <button class="btn-set-resp"></button>
                </div>
                <div id="myDropdown-${element.id}" class="dropdown-content" hidden>
                  <div class="container-dropdown">
                    <div class="list-user-name">
                      <div class="user-abbr">EF</div>
                      <div class="full-name-user">Eva Fischer</div>
                    </div>
                    <input type="checkbox" class="add-remove-user-task" />
                  </div>
                </div>
                <div class="user-chosen-for-task">
                  <div class="user-for-tasks">EF</div>
                  <div class="user-for-tasks">MB</div>
                </div>
              </div>
              <div class="container-edit-subtask">
                <span class="title-dropdown-menu"
                >Subtask (kommt von Rico)</span
                >
              </div>
            </form>
          </div>
          <button type="submit" class="confirm-edit-btn">
                <span>Ok</span>
                <img class="check-mark" src="../assets/icons/board/check.svg" alt="img-check-mark">
          </button>
        </dialog>
        `
}