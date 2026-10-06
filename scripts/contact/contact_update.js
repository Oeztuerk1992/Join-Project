/* ========================================
Functions for updates, overlays, functions for mobile
======================================== */

/**
 * Mobile-only "back" navigation: returns from the contact detail view to the list.
 * @returns {void}
 */
function goBackContacts() {
    document.querySelector('.new-contact-wrapper').style.display = 'flex';
    document.querySelector('.contact-info').style.display = 'none';
    if (activeContactEl) {activeContactEl.classList.remove('active');}
    activeContactEl = null;
    activeContact = null;
    document.querySelector('.contact-detail-panel').innerHTML = '';
    const actionsMenu = document.getElementById('contact-actions');
    if (actionsMenu) {actionsMenu.style.display = 'none';}
    if (btnMenu) {btnMenu.style.display = 'block';}
}
 
 
/**
 * Resets the contact form fields via the native form reset.
 *
 * @returns {void}
 */
function clearInputs() {
    document.getElementById('form-for-contact').reset();
}
 
 
/**
 * Clears validation error styling and messages from a contact form.
 * @param {string} filterWord - "add" or "edit", selects the form to clear.
 * @returns {void}
 */
function clearValidationRemarks(filterWord) {
    const { inputWrapperName, inputWrapperMail, inputWrapperPhone, infoContact } = getFormRefs(filterWord);
    [inputWrapperName, inputWrapperMail, inputWrapperPhone]
        .forEach(wrapper => wrapper.classList.remove("fail-red-border"));
    infoContact.classList.add("hidden-feedback");
}
 
 
/**
 * Sorts the global "contacts" array alphabetically by capitalized name, in place.
 *
 * @returns {void}
 */
function sortContacts() {
    contacts.sort((a, b) => a.capitalizedName.localeCompare(b.capitalizedName));
}
 
 
/**
 * Renders the contact list with alphabetical section letters, or an empty-state message.
 * @returns {void}
 */
function renderContacts() {
    const wrapper = document.getElementById('new-contact-innerwrapper');
    if (!wrapper) return;
    wrapper.innerHTML = '';
    if (contacts.length === 0) {
        wrapper.innerHTML = generateNoContactsHTML();
        return;
    }
    let currentLetter = '';
    contacts.forEach(contact => {
        currentLetter = renderLetterIfNew(contact, currentLetter);
        wrapper.innerHTML += buildContactHtml(contact);
    });
    initScrollbar();
}
 
 
/**
 * Appends a section letter to the contact list when the first letter changes.
 * @param {{capitalizedName: string}} contact - The contact currently rendered.
 * @param {string} currentLetter - The section letter rendered so far.
 * @returns {string} The current section letter for the next call.
 */
function renderLetterIfNew(contact, currentLetter) {
    const letter = contact.capitalizedName.charAt(0);
    if (letter === currentLetter) return currentLetter;
    newContactMessage.innerHTML += createLetterTemplate(letter);
    return letter;
}
 
 
/**
 * Builds the list-item HTML markup for a single contact.
 *
 * @param {Object} contact - The contact to render.
 * @returns {string} HTML markup for the contact's list entry.
 */
function buildContactHtml(contact) {
    return createContactTemplate(contact.capitalizedName, contact.initials, contact.email, contact.randomColor, contact.phone, contact.id);
}
 
 
/**
 * Opens the "edit contact" overlay and pre-fills it with the active contact.
 * @returns {void}
 */
function openEditOverlay() {
    hasTriedSubmit = false;
    document.getElementById('name-edit').value = activeContact.name;
    document.getElementById('email-edit').value = activeContact.email;
    document.getElementById('phone-edit').value = activeContact.phone;
    const avatar = document.getElementById('edit-avatar');
    avatar.innerHTML = activeContact.initials;
    avatar.style.backgroundColor = activeContact.color;
    overlayEdit.style.display = 'flex';
    setTimeout(() => overlayEdit.classList.add('open'), 10);
}
 
 
/**
 * Closes the "edit contact" overlay: triggers its exit transition,
 * clears its validation state, and hides it once the transition finishes.
 *
 * @param {string} filterWord - Passed through to clearValidationRemarks() (e.g. "edit").
 * @returns {void}
 */
function closeContactEditOverlay(filterWord) {
    overlayEdit.classList.remove('open');
    clearValidationRemarks(filterWord);
    setTimeout(() => overlayEdit.style.display = 'none', 300);
}
 
 
/**
 * Reads and normalizes the values of the "edit contact" form.
 * @returns {{capitalizedName: string, initials: string, email: string,
*            phone: string}} The edited contact data (without id and color).
*/
function readEditInputs() {
   const capitalizedName = capitalizeName(nameInputEdit.value.trim());
   const initials = getInitials(capitalizedName);
   const email = emailInputEdit.value.trim();
   const phone = phoneInputEdit.value.trim();
   return { capitalizedName, initials, email, phone };
}
 
 
/* ========================================
after deleting contacts, update of tasks
======================================== */

/**
 * Removes a deleted contact from the "assignedTo" list of all tasks and saves the changes.
 * @param {string} contactId - ID of the deleted contact.
 * @returns {Promise<void>}
 */
async function removeDeletedContactFromTasks(contactId) {
    for (const task of tasks) {
        if (!Array.isArray(task.assignedTo)) continue;
        const filtered = task.assignedTo.filter(contact => contact.id !== contactId);
        if (filtered.length !== task.assignedTo.length) {
            await putAssignedTo(task.id, filtered);
        }
    }
}


/**
 * Sends the assigned contacts of a task to the backend.
 * @param {string|number} taskId - ID of the task.
 * @param {Array<Object>} assignedTo - The assigned contacts to store.
 * @returns {Promise<Response>} The fetch response.
 */
function putAssignedTo(taskId, assignedTo) {
    return fetch(`${BASE_URL}/tasks/-${taskId}/assignedTo.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignedTo)
    });
}
 
 
/**
 * Updates the name of an edited contact in the "assignedTo" list of all tasks and saves the changes.
 * @param {string} contactId - ID of the edited contact.
 * @param {{capitalizedName: string}} editedContact - The contact's new data.
 * @returns {Promise<void>}
 */
async function updateContactInTasks(contactId, editedContact) {
    for (const task of tasks) {
        if (!Array.isArray(task.assignedTo)) continue;
        if (!task.assignedTo.some(contact => contact.id === contactId)) continue;
        const updated = task.assignedTo.map(contact => contact.id === contactId
            ? { ...contact, name: editedContact.capitalizedName }
            : contact);
        await putAssignedTo(task.id, updated);
    }
}
 
 
/**
 * Opens the mobile contact-actions menu (edit/delete) and hides the
 * menu-trigger button. Stops the click from bubbling further (e.g. to the global "click outside closes menu" listener).
 *
 * @param {MouseEvent} event - The click event that triggered opening the menu.
 * @returns {void}
 */
function openMobileMenuContacts(event) {
    event.stopPropagation();
    const actionsMenu = document.getElementById('contact-actions');
    if (!actionsMenu) return;
    btnMenu.style.display = 'none';
    actionsMenu.classList.add('open');
}
 
 
/**
 * Closes the mobile contact-actions menu and shows the menu-trigger
 * button again.
 *
 * @returns {void}
 */
function closeMobileMenuContacts() {
    const actionsMenu = document.getElementById('contact-actions');
    if (!actionsMenu) return;
    actionsMenu.classList.remove('open');
    btnMenu.style.display = 'block';
}
 

/* ========================================
Event Listeners
======================================== */

/**
 * Closes the "add contact" overlay when its backdrop is clicked.
 */
overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay('add');
});


/**
 * Closes the "edit contact" overlay when its backdrop is clicked.
 */
overlayEdit?.addEventListener('click', (e) => {
    if (e.target === overlayEdit) closeContactEditOverlay('edit');
});


/**
 * Closes the mobile contact-actions menu when a click occurs outside the menu and its button.
 */
document.addEventListener("click", (event) => {
    const actionsMenu = document.getElementById('contact-actions');
    if (!actionsMenu) return;
    if (!actionsMenu.contains(event.target) && !btnMenu.contains(event.target)) {
        closeMobileMenuContacts();
    }
});