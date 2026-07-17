function generateTaskMiniCardHTML(element) {
    return `<section class="mini-card" id="card-mini-${element.id}" onclick="openTaskOverlay(${element.id})" draggable="true" ondragstart="startDragging(${element.id})" ondragend="endDragging(${element.id})">
            <div class="frame-mini-card">
              <header class="header-mini-card">
                <h3 class="card-label" id="label-card-${element.id}">
                  ${getTaskCategory(element.category)}
                </h3>
  
                <h4 class="title-task" id="task-title-${element.id}">${element.title}</h4>
                
                <p class="description-task" id="task-description-${element.id}">
                  ${element.description}
                </p>
              </header>
              <article class="container-subtask" id="subtask-${element.id}">
                <div class="subtask-bar-wrapper" id="status-subtask-${element.id}">
                  <div class="subtask-bar" style="width: ${getSubtaskProgress(element.subtasks)}%;"></div>
                </div>
                <div class="count-status" id="status-count-${element.id}">
                  ${getStatusSubtasks(element.subtasks, element.id)}
                </div>
              </article>
              <article class="responsibility-mini-card">
                <div class="member-badge" id="badge-member-${element.id}">
                  ${getAssignedContacts(element.assignedTo)}
                </div>
                <div class="priority-task" id="task-prio-${element.id}">
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
                  <h3 class="card-label-view" id="label-card-view-${element.id}">
                    ${getTaskCategory(element.category)}
                  </h3>
                  <button class="btn-close" onclick="closeTaskOverlay(${element.id})"></button>
                </div>
                <h4 class="title-task-view" id="task-title-view-${element.id}">
                  ${element.title}
                </h4>
                <p class="description-task-view" id="task-description-view-${element.id}">
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
                  <div class="member-badge-view" id="badge-member-view-${element.id}">
                    <div class="container-user">
                      <div class="user-abbr"></div>
                      <div class="name-to-badge"></div>
                    </div>
                  </div>
                </div>
              </article>
              <article class="subtask-status">
                <span class="title-subtask">Subtasks</span>
                <div class="container-subtasks" id="subtasks-view-${element.id}">
                  <label class="container-checkbox">
                    <div class="background-checkbox">
                      <input type="checkbox" class="checkbox-subtask" />
                    </div>
                    <p class="description-subtask">
                      Implement Recipe Recommendation
                    </p>
                  </label>
                </div>
              </article>
              <article class="edit-btn">
                <div class="frame-edit-btn">
                  <button class="delete-task-view">
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