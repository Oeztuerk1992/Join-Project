/**
 * Generates the HTML template for the task edit overlay.
 * The overlay contains the form fields for editing the task details,
 * assigned contacts, priority, and subtasks.
 *
 * @param {Object} element - The task object containing all relevant task data.
 * @returns {string} The HTML template for the task edit overlay.
 */
function generateEditOverlayHTML(element) {
  return `
    <dialog id="edit-overlay-${element.id}" class="edit-task-overlay modal-class" >
      <header class="header-form">
              <div class="headline-edit-task">
                <div></div>
                <button class="btn-close" onclick="closeEditOverlay('${element.id}')"></button>
              </div>
      </header>
      <div class="scroll-container">
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
                  class="input-description hover-input"
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
                  <button type="button" class="btn-prio-edit priority urgent ${element.priority === 'Urgent' ? 'active' : ''}" value="Urgent" onclick="setPriority(this)">
                    <span>Urgent</span>
                    <img
                      src="../assets/img/priority/Property 1=Urgent.svg"
                      alt=""
                    />
                  </button>
                  <button type="button" class="btn-prio-edit priority medium ${element.priority === 'Medium' ? 'active' : ''}" value="Medium" onclick="setPriority(this)">
                    <span>Medium</span>
                    <img
                      src="../assets/img/priority/Property 1=Medium.svg"
                      alt=""
                    />
                  </button>
                  <button type="button" class="btn-prio-edit priority low ${element.priority === 'Low' ? 'active' : ''}" value="Low" onclick="setPriority(this)">
                    <span>Low</span>
                    <img
                      src="../assets/img/priority/Property 1=Low.svg"
                      alt=""
                    />
                  </button>
                </div>
              </div>
              <div id="container-dropdown-menu-${element.id}" class="input-group container-dropdown-user">
                <label>Assigned to</label>
                <div id="toggle-${element.id}" class="dropdown-container" onclick="toggleDropdown(this)">
                  <input id="dropdown-assignment-${element.id}" class="dropdown dropdown-assignment" placeholder="Select contacts" onkeydown="showFilteredContactList(this)">
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
                      <img src="../assets/img/edit_delete/Property 1=close.svg" />
                    </button>
                    <div class="subtask-divider"></div>
                    <button type="button" onclick="saveEditSubtask('${element.id}')">
                      <img src="../assets/img/edit_delete/Property 1=check.svg" />
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
        <button class="btn-scrollbar scroll-top" onmousedown="startScrolling('.scroll-wrapper', -1)" onmouseup="stopScrolling()" onmouseleave="stopScrolling()"><img src="../assets/img/contact/high.png" alt="up"></button>
        <button class="btn-scrollbar scroll-down" onmousedown="startScrolling('.scroll-wrapper', 1)" onmouseup="stopScrolling()" onmouseleave="stopScrolling()"><img src="../assets/img/contact/down.png" alt="down"></button>
      </div>
      <footer class="footer-edit-overlay">
        <p id="subtask-edit-feedback-${element.id}" class="subtask-edit-feedback hidden"><span class="red-required">*</span>Close the subtasks.</p>
        <button type="submit" form="edit-form-${element.id}" class="confirm-edit-btn">
          <span>Ok</span>
          <img class="check-mark" src="../assets/img/board/check.svg" alt="img-check-mark">
        </button>
      </footer>
    </dialog >
  `;
}


/**
 * Generates the HTML template for a subtask in edit mode.
 * The template contains the subtask title and buttons for editing and deleting it.
 *
 * @param {Array<Object>} subtasks - The subtasks belonging to the task.
 * @param {string|number} id - The unique ID of the parent task.
 * @param {number} index - The index of the subtask in the array.
 * @returns {string} The HTML template for the editable subtask.
 */
function generateSubtaskEditHTML(subtasks, id, index) {
  return `
           <div id="edit-subtask-${id}-${index}" class="container-subtask-li" data-status="${subtasks[index].status}" ondblclick="editSubtask(this)">
                <li class="li-subtask subtask-text">${subtasks[index].title}</li>
                <div class="container-edit-btn">
                    <button type="button" class="edit-button" onclick="editSubtask(this)"></button>
                    <div class="subtask-divider"></div>
                    <button type="button" class="delete-button" onclick="deleteSubtask(this)"></button>
                </div>
           </div>
  `;
}
