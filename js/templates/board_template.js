function generateTaskMiniCardHTML(element) {
  return ` 
          <section id="card-mini-${element.id}" class="mini-card" onclick="openTaskOverlay('${element.id}','animation')"
            draggable="true" ondragstart="startDragging('${element.id}')" ondragend="endDragging('${element.id}')">
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
                  ${getStatusSubtasks(element.subtasks)}
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

function generateTaskCategoryUserStoryHTML() {
  return `
          <div class="category-user-story">User Story</div>
          `;
}

function generateTaskCategoryTechnicalTaskHTML() {
  return `
          <div class="category-technical-task">Technical Task</div>
          `;
}

function generateImgPrioLowHTML() {
  return `
          <img src="../assets/icons/board/cards/prio_low.svg" alt="img-prio-low">
          `;
}

function generateImgPrioMediumHTML() {
  return `
          <img src="../assets/icons/board/cards/prio_medium.svg" alt="img-prio-medium">
          `;
}

function generateImgPrioHighHTML() {
  return `
          <img src="../assets/icons/board/cards/prio_high.svg" alt="img-prio-high">
          `;
}

function generateBadgesHTML(color, initials) {
  return `
          <div class="user-abbr" style="${color}">${initials}</div>
          `;
}

function generateEmptyCardHTML() {
  return `
          <div class="no-task-feedback">No tasks To do</div>
          `;
}

function generateTaskOverlayHTML(element) {
  return`
    <dialog id="task-overlay-${element.id}" class="view-task-overlay modal-class" >
      <header class="header-view-task">
          <div class="headline-view-task">
            <h3 id="label-card-view-${element.id}" class="card-label-view">
              ${getTaskCategory(element.category)}
            </h3>
            <button class="btn-close" onclick="closeTaskOverlay('${element.id}')"></button>
          </div>
          <h4 id="task-title-view-${element.id}" class="title-task-view">
            ${element.title}
          </h4>
          <p id="task-description-view-${element.id}" class="description-task-view">
            ${element.description}
          </p>
      </header>
      <div class="scroll-wrapper-task">
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
        </div>
      </div>
      <div class="flex-grow"></div>
      <article class="edit-btn">
          <div class="frame-edit-btn">
            <button class="delete-task-view" onclick="deleteTask('${element.id}')">
              <figure class="container-img-delete">
                <div class="img-delete"></div>
                <figcaption class="text-delete">Delete</figcaption>
              </figure>
            </button>
            <div class="seperator-view-task"></div>
            <button class="edit-task-view" onclick="getEditOverlay('${element.id}'); setActivePriority('${element.priority}')">
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

function generateUserNamesHTML(usernames) {
  return `
    <div class="contact-names-overlay">${usernames}</div>
    `;
}

function generateSubtaskHTML(subtasks, id, index) {
  return `
    <label id = "subtask-${id}-${index}" class="container-checkbox" >
      <div class="background-checkbox">
        <input type="checkbox" class="checkbox-subtask" onclick="toggleStatusSubtask('subtask-${id}-${index}', '${id}', ${index})" value="${subtasks[index].status}" ${subtasks[index].status === "done" ? "checked" : ""}/>
      </div>
      <p class="description-subtask">
        ${subtasks[index].title}
      </p>
    </label >
    `;
}

function generateEditOverlayHTML(element) {
  return`
    <dialog id="edit-overlay-${element.id}" class="edit-task-overlay modal-class" >
      <header class="header-form">
              <div class="headline-edit-task">
                <div></div>
                <button class="btn-close" onclick="closeEditOverlay('${element.id}')"></button>
              </div>
      </header>
      <div class="scroll-wrapper">
        <div class="frame-view-edit-task">
          <form id="edit-form-${element.id}" class="form-for-edit-task" onsubmit= "return checkFormDataEditOverlay('${element.id}')" novalidate>
            <div class="container-form">
              <label class="label-form" for="title-input">Title<span id="feedback-title-${element.id}" class="info-failed hidden">This field is required.</span></label>
              <input
                type="text"
                class="input input-title hover-input"
                id="title-input-${element.id}"
                name="title-input"
                required
                placeholder="Enter a title"
                value="${element.title}"
              /><br />
            </div>
            <div class="container-form">
              <label class="label-form" for="description-input"
              >Description</label
              >
              <textarea
                class="input input-description hover-input"
                id="description-input-${element.id}"
                name="description-input"
                required
                placeholder="Enter a Description"
              >${element.description}</textarea
              ><br />
            </div>
            <div class="container-form">
              <label class="label-form" for="date-input">Due Date<span id="feedback-duedate-${element.id}" class="info-failed hidden">This field is required.</span></label>
              <input
                type="date"
                class="input input-date hover-input"
                id="date-input-${element.id}"
                name="date-input"
                required
                value="${element.dueDate}"
              /><br />
            </div>
            <div id="${element.priority}" class="set-up-prio-in-edit-mode">
              <span class="title-prio-in-edit-mode">Priority</span>
              <div id="prio-btn-${element.id}" class="btn-prio-in-edit-mode">
                <button type="button" class="btn-prio-edit priority urgent" value="Urgent" onclick="setPriority(this)">
                  <span>Urgent</span>
                  <img
                    src="../assets/icons/priority/Property 1=Urgent.svg"
                    alt=""
                  />
                </button>
                <button type="button" class="btn-prio-edit priority medium active" value="Medium" onclick="setPriority(this)">
                  <span>Medium</span>
                  <img
                    src="../assets/icons/priority/Property 1=Medium.svg"
                    alt=""
                  />
                </button>
                <button type="button" class="btn-prio-edit priority low" value="Low" onclick="setPriority(this)">
                  <span>Low</span>
                  <img
                    src="../assets/icons/priority/Property 1=Low.svg"
                    alt=""
                  />
                </button>
              </div>
            </div>
            <div id="container-dropdown-menu-${element.id}" class="input-group container-dropdown-user">
              <label>Assigned to</label>
              <div id="toggle-${element.id}" class="dropdown-container" onclick="toggleDropdown(this)">
                <input id="dropdown-assignment-${element.id}" class="dropdown dropdown-assignment" placeholder="Select contacts to assign" onkeydown="showFilteredContactList(this)">
                  <button type="button" id="dropdownArrow-${element.id}" class="arrow-dropdown"></button>
                  <div id="dropdownMenu-${element.id}" class="dropdown-menu"></div>
              </div>
              <div id="contact-chosen-for-task-${element.id}" class="assign-contact margin-badge">${getAssignedContactBadges(element.assignedTo)}</div>
            </div>
            <div class="input-group group-subtasks">
              <label>Subtasks</label>
              <div class="subtask-input">
                <input id="input-subtask-${element.id}" class="subtask-enter" type="text" placeholder="Add new subtask" />
                <div class="subtask-actions">
                  <button type="button" onclick="closeEditSubtask('${element.id}')">
                    <img src="../assets/icons/edit_delete/Property 1=close.svg" />
                  </button>
                  <div class="subtask-divider"></div>
                  <button type="button" onclick="saveEditSubtask('${element.id}')">
                    <img src="../assets/icons/edit_delete/Property 1=check.svg" />
                  </button>
                </div>
              </div>
              <div id="list-subtasks-${element.id}" class="list-subtasks remove-scrollbar">
                <ul id="ul-subtask-${element.id}" class="container-ul-subtask">${getSubtasksEditOverlay(element.subtasks, element.id)}</ul>
              </div>
            </div>
          </form>
        </div>
      </div>
      <button type="submit" form="edit-form-${element.id}" class="confirm-edit-btn">
        <span>Ok</span>
        <img class="check-mark" src="../assets/icons/board/check.svg" alt="img-check-mark">
      </button>
    </dialog >
    `;
}

function generateSubtaskEditHTML(subtasks, id, index) {
  return `
           <div id="edit-subtask-${id}-${index}" class="container-subtask-li" data-status="${subtasks[index].status}" ondblclick="editSubtask(this)">
                <li class="li-subtask">${subtasks[index].title}</li>
                <div class="container-edit-btn">
                    <button type="button" class="edit-button" onclick="editSubtask(this)"></button>
                    <div class="subtask-divider"></div>
                    <button type="button" class="delete-button" onclick="deleteSubtask(this)"></button>
                </div>
            </div>
            `;
}



