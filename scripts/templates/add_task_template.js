/**
 * Generates the HTML template for a contact in the contact assignment dropdown menu.
 * This template is used in the add-contact form and the task edit overlay.
 *
 * @param {Object} contact - The contact object containing the contact's name,
 * initials, and badge color.
 * @param {string|number} id - The unique ID of the contact.
 * @param {boolean} isSelected - Indicates whether the contact is currently selected.
 * @returns {string} The HTML template for the contact list item.
 */
function generateContactListHTML(contact, id, isSelected = false) {
    return `
        <div class="dropdown-item ${isSelected ? 'selected' : ''}"
             data-id="${id}"
             onclick="event.stopPropagation(); toggleCheckbox(this)">
            <div class="contact-info">
                <div id="${id}"
                     class="contact-circle"
                     style="background:${contact.randomColor};">
                    ${contact.initials}
                </div>
                <span class="contact-name">
                    ${contact.capitalizedName}
                </span>
            </div>
            <input type="checkbox"
                   value="${id}"
                   ${isSelected ? 'checked' : ''}
                   onclick="event.stopPropagation(); toggleCheckbox(this)">
        </div>
    `;
}


/**
 * Generates the HTML template displayed when no contacts are available.
 *
 * @returns {string} The HTML template displaying the "No contacts available" message.
 */
function generateEmptyContactListHTML() {
    return`
            <div class="dropdown-item contact-info empty-contact">
                No contacts available.
            </div>
    `;
}


/**
 * Generates the HTML template for the logged-in user's contact entry
 * in the contact assignment dropdown menu.
 * The logged-in user is displayed at the top of the contact list with a "(You)" label.
 *
 * @param {Object} contact - The contact object containing the user's name,
 * initials, and badge color.
 * @param {string|number} id - The unique ID of the logged-in user.
 * @param {boolean} isSelected - Indicates whether the user is currently selected.
 * @returns {string} The HTML template for the logged-in user's contact entry.
 */
function generateContactYourProfileHTML(contact, id, isSelected = false) {
    return `
        <div
            id="dropdown-your-profile"
            class="dropdown-item ${isSelected ? 'selected' : ''}"
            data-id="${id}"
            onclick="event.stopPropagation(); toggleCheckbox(this)">
            <div class="contact-info">
                <div
                    id="your-profile-badge-${id}"
                    class="contact-circle"
                    style="background:${contact.randomColor};">
                    ${contact.initials}
                </div>
                <span class="contact-name">
                    ${contact.capitalizedName}
                </span>
                <span class="you-label">(You)</span>
            </div>
            <input
                type="checkbox"
                value="${id}"
                ${isSelected ? 'checked' : ''}
                onclick="event.stopPropagation(); toggleCheckbox(this)">
        </div>
    `;
}


/**
 * Generates the HTML template for a contact badge displayed on task mini-cards
 * and in task edit overlays.
 *
 * @param {string} initials - The initials displayed inside the badge.
 * @param {string} color - The CSS styling used to set the badge color.
 * @returns {string} The HTML template for the contact badge.
 */
function generateContactBadgeHTML(initials, color) {
    return`
            <div class="contact-circle contact-for-tasks" style="${color};">
                ${initials}
            </div>
    `;        
}


/**
 * Generates the HTML template for the logged-in user's own contact badge.
 * This badge is used when no contact record is available.
 *
 * @returns {string} The HTML template for the user's contact badge.
 */
function generateYourProfileBadgeHTML() {
    return`
            <div class="contact-circle contact-for-tasks" style="background:var(--badge-color-14)">
                ${userProfile.textContent}
            </div>
    `;        
}


/**
 * Generates the HTML template for a newly created subtask.
 * The subtask is created from the subtask input field and displayed
 * with edit and delete buttons.
 *
 * @param {string} newSubtask - The text entered by the user for the new subtask.
 * @returns {string} The HTML template for the new subtask list item.
 */
function generateItemSubtaskHTML(newSubtask) {
    return`
            <div class="container-subtask-li" data-status="open" ondblclick="editSubtask(this)">
                <li class="li-subtask subtask-text">${newSubtask}</li>
                <div class="container-edit-btn">
                    <button type="button" class="edit-button" onclick="editSubtask(this)"></button>
                    <div class="subtask-divider"></div>
                    <button type="button" class="delete-button" onclick="deleteSubtask(this)"></button>
                </div>
            </div>
    `;
}


/**
 * Generates the HTML input field used to edit an existing subtask.
 *
 * @param {string} text - The current text of the subtask.
 * @returns {string} The HTML template for the subtask edit input field.
 */
function generateOuterHTMLEditSubtask(text) {
    return`
            <input type="text" class="subtask-edit-input" value="${text}">
    `;
}


/**
 * Generates the HTML template containing the action buttons displayed
 * while a subtask is being edited.
 *
 * @returns {string} The HTML template containing the delete and save buttons.
 */
function generateInnerHTMLEditSubtask() {
    return`
            <div class="btn-inner-html">
                <button type="button" class="delete-button-edit" onclick="deleteSubtask(this)"></button>
                <div class="subtask-divider"></div>
                <button class="save-edited-task" type="button" onclick="saveEditedSubtask(this)">
                    <img src="../assets/img/edit_delete/Property 1=check.svg">
                </button>
            </div>
    `;
}


/**
 * Generates the HTML template for a subtask after its text has been edited
 * and saved.
 *
 * @param {string} text - The updated text of the subtask.
 * @returns {string} The HTML template containing the updated subtask text.
 */
function generateOuterHTMLSaveSubtask(text) {
    return`
            <li class="li-subtask subtask-text">${text}</li>
    `;
}


/**
 * Generates the HTML template containing the edit and delete buttons
 * for a saved subtask.
 *
 * @returns {string} The HTML template containing the edit and delete buttons.
 */
function generateInnerHTMLSaveSubtask() {
    return`
            <button type="button" class="edit-button" onclick="editSubtask(this)"></button>
            <div class="subtask-divider"></div>
            <button type="button" class="delete-button" onclick="deleteSubtask(this)"></button>
    `;
}
