function generateContactListHTML(contact, id, isSelected = false) {
    return `
            <div class="dropdown-item ${isSelected ? 'selected' : ''}" data-id="${id}" onclick="event.stopPropagation(); toggleCheckbox(this)">
                <div class="contact-info">
                    <div id="${id}"
                        class="contact-circle"
                        style="background:${contact.randomColor};">
                        ${contact.initials}
                    </div>
                    <span>${contact.capitalizedName}</span>
                </div>
                <input type="checkbox" value="${id}" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleCheckbox(this)">
            </div>
            `;
}

function generateContactYourProfileHTML(loggedInUser, isSelected = false) {
    return`
            <div id="dropdown-your-profile" class="dropdown-item ${isSelected ? 'selected' : ''}" data-id="your-profile" onclick="event.stopPropagation(); toggleCheckbox(this)">
                <div class="contact-info">
                    <div id="your-profile-badge"
                        class="contact-circle"
                        style="background:var(--badge-color-14)">
                        ${userProfile.textContent}
                    </div>
                    <span>${loggedInUser}</span><span>(You)</span>
                </div>
                <input type="checkbox" value="your-profile" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleCheckbox(this)">
            </div>
            `;
}

function generateContactBadgeHTML(initials, color) {
    return`
            <div class="contact-circle contact-for-tasks" style="${color};">
                ${initials}
            </div>
            `;        
}

function generateYourProfileBadgeHTML() {
    return`
            <div class="contact-circle contact-for-tasks" style="background:var(--badge-color-14)">
                ${userProfile.textContent}
            </div>
            `;        
}

function generateItemSubtaskHTML(newSubtask) {
    return`
            <div class="container-subtask-li" data-status="open" ondblclick="editSubtask(this)">
                <li class="li-subtask">${newSubtask}</li>
                <div class="container-edit-btn">
                    <button type="button" class="edit-button" onclick="editSubtask(this)"></button>
                    <div class="subtask-divider"></div>
                    <button type="button" class="delete-button" onclick="deleteSubtask(this)"></button>
                </div>
            </div>
            `;
}

function generateOuterHTMLEditSubtask(text) {
    return`
            <input type="text" class="subtask-edit-input" value="${text}">
            `;
}

function generateInnerHTMLEditSubtask() {
    return`
            <div class="btn-inner-html">
                <button type="button" class="delete-button-edit" onclick="deleteSubtask(this)"></button>
                <div class="subtask-divider"></div>
                <button class="save-edited-task" type="button" onclick="saveEditedSubtask(this)">
                    <img src="../assets/icons/edit_delete/Property 1=check.svg">
                </button>
            </div>
            `;
}

function generateOuterHTMLSaveSubtask(text) {
    return`
            <li class="li-subtask">${text}</li>
            `;
}

function generateInnerHTMLSaveSubtask() {
    return`
            <button type="button" class="edit-button" onclick="editSubtask(this)"></button>
            <div class="subtask-divider"></div>
            <button type="button" class="delete-button-edit" onclick="deleteSubtask(this)"></button>
            `;
}