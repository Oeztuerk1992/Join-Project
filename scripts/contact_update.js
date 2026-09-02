/**
 * Mobile-only "back" navigation: returns from the contact detail view
 * to the contact list view, clears the active-contact state and detail
 * panel, and hides the contact actions menu.
 *
 * @returns {void}
 */
function goBackContacts() {
    document.querySelector('.new-contact-wrapper').style.display = 'flex';
    document.querySelector('.contact-info').style.display = 'none';
 
    // remove active state
    if (activeContactEl) {
        activeContactEl.classList.remove('active');
    }
 
    activeContactEl = null;
    activeContact = null;
 
    document.querySelector('.contact-detail-panel').innerHTML = '';
 
    const actionsMenu = document.getElementById('contact-actions');
 
    if (actionsMenu) {
        actionsMenu.style.display = 'none';
    }
 
    if (btnMenu) {
        btnMenu.style.display = 'block';
    }
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
 * Clears validation error styling and messages from a contact form
 * (add or edit).
 *
 * @param {string} filterWord - "add" or "edit", selects which form to
 *                               clear (see getFormRefs()).
 * @returns {void}
 */
function clearValidationRemarks(filterWord) {
    const {
        inputWrapperName,
        inputWrapperMail,
        inputWrapperPhone,
        infoContact
    } = getFormRefs(filterWord);
 
    inputWrapperName.classList.remove("fail-red-border");
    inputWrapperMail.classList.remove("fail-red-border");
    inputWrapperPhone.classList.remove("fail-red-border");
    infoContact.classList.add("hidden-feedback");
}
 
 
/**
 * Sorts the global "contacts" array alphabetically by capitalized
 * name, in place.
 *
 * @returns {void}
 */
function sortContacts() {
    contacts.sort((a, b) => a.capitalizedName.localeCompare(b.capitalizedName));
}
 
 
/**
 * Renders the full contact list: shows an empty-state message if there
 * are no contacts, otherwise renders each contact preceded by an
 * alphabetical section letter whenever the first letter changes.
 * Re-initializes the custom scrollbar afterwards.
 *
 * @returns {void}
 */
function renderContacts() {
    const newContactMessage = document.getElementById('new-contact-innerwrapper');
    if (!newContactMessage) return;
    newContactMessage.innerHTML = '';
 
    if (contacts.length === 0) {
        newContactMessage.innerHTML = generateNoContactsHTML();
        return;
    }
 
    let currentLetter = '';
 
    for (let contactIndex = 0; contactIndex < contacts.length; contactIndex++) {
        const contact = contacts[contactIndex];
        currentLetter = renderLetterIfNew(contact, currentLetter);
        newContactMessage.innerHTML += buildContactHtml(contact);
    }
 
    initScrollbar();
}
 
 
/**
 * Smoothly scrolls the contact list container to the top.
 *
 * @returns {void}
 */
function scrollToTop() {
    const container = document.querySelector('.new-contact');
 
    container.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
 

/**
 * Smoothly scrolls the contact list container to the bottom.
 *
 * @returns {void}
 */
function scrollToBottom() {
    const container = document.querySelector('.new-contact');
 
    container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
    });
}
 
 
/**
 * Appends an alphabetical section-letter marker to the contact list
 * whenever a contact's first letter differs from the previous one.
 *
 * @param {{capitalizedName: string}} contact - The contact currently
 *                                               being rendered.
 * @param {string} currentLetter - The section letter rendered so far.
 * @returns {string} The (possibly updated) current section letter, to
 *                    be passed into the next call.
 */
function renderLetterIfNew(contact, currentLetter) {
    const letter = contact.capitalizedName.charAt(0);
    if (letter !== currentLetter) {
        newContactMessage.innerHTML += createLetterTemplate(letter);
        return letter;
    }
    return currentLetter;
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
 * Opens the "edit contact" overlay for the currently active contact:
 * resets the submit-attempt flag, pre-fills the edit form fields and
 * avatar from the active contact's data, and shows the overlay with
 * its entrance transition.
 *
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
 * clears its validation state, and hides it once the transition
 * finishes.
 *
 * @param {string} filterWord - Passed through to clearValidationRemarks()
 *                               (e.g. "edit").
 * @returns {void}
 */
function closeContactEditOverlay(filterWord) {
    overlayEdit.classList.remove('open');
    clearValidationRemarks(filterWord);
 
    setTimeout(() => overlayEdit.style.display = 'none', 300);
}
 
 
/**
 * Reads and normalizes the current values from the "edit contact" form
 * (name capitalized, initials derived, email/phone trimmed).
 *
 * @returns {{capitalizedName: string, initials: string, email: string,
 *            phone: string}} The edited contact data (without id or
 *            randomColor, which are preserved separately by the
 *            caller).
 */
function readEditInputs() {
    const capitalizedName = capitalizeName(
        nameInputEdit.value.trim()
    );
 
    const initials = getInitials(capitalizedName);
    const email = emailInputEdit.value.trim();
    const phone = phoneInputEdit.value.trim();
 
    return {
        capitalizedName,
        initials,
        email,
        phone
    };
}
 
 
/**
 * Initializes the custom scrollbar thumb for the contact list: sets
 * its fixed height and (re-)attaches the scroll listener that keeps
 * the thumb position in sync.
 *
 * @returns {void}
 */
function initScrollbar() {
    const liste = document.querySelector('.new-contact');
    const thumb = document.querySelector('.custom-thumb');
    const leiste = document.querySelector('.custom-scrollbar');
 
    thumb.style.height = '56px';
    liste.removeEventListener('scroll', updateScrollbar);
    liste.addEventListener('scroll', updateScrollbar);
}
 
 
/**
 * Updates the custom scrollbar thumb's vertical position to match the
 * contact list's current scroll position.
 *
 * @returns {void}
 */
function updateScrollbar() {
    const liste = document.querySelector('.new-contact');
    const thumb = document.querySelector('.custom-thumb');
    const leiste = document.querySelector('.custom-scrollbar');
 
    const scrollProzent = liste.scrollTop / (liste.scrollHeight - liste.clientHeight);
    const thumbPosition = scrollProzent * (leiste.clientHeight - 56);
    thumb.style.top = thumbPosition + 'px';
}
 
 
// after deleting contacts, update of tasks //
 
/**
 * After a contact has been deleted, removes it from the "assignedTo"
 * list of every task that referenced it, persisting each affected
 * task's updated assignment list to the backend.
 *
 * @param {string} contactId - ID of the deleted contact.
 * @returns {Promise<void>}
 */
async function removeDeletedContactFromTasks(contactId) {
    for (const task of tasks) {
 
        if (!Array.isArray(task.assignedTo)) continue;
 
        const filtered = task.assignedTo.filter(
            contact => contact.id !== contactId
        );
 
        if (filtered.length !== task.assignedTo.length) {
            await fetch(`${BASE_URL}/tasks/-${task.id}/assignedTo.json`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(filtered)
            });
        }
    }
}
 
 
/**
 * After a contact has been edited, updates its cached display name
 * inside the "assignedTo" list of every task it's assigned to,
 * persisting each affected task's updated assignment list to the
 * backend.
 *
 * @param {string} contactId - ID of the edited contact.
 * @param {{capitalizedName: string}} editedContact - The contact's new
 *                                    data (only capitalizedName is
 *                                    used here).
 * @returns {Promise<void>}
 */
async function updateContactInTasks(contactId, editedContact) {
    for (const task of tasks) {
        if (!Array.isArray(task.assignedTo)) continue;
        let changed = false;
        const updatedAssignments = task.assignedTo.map(contact => {
            if (contact.id === contactId) {
                changed = true;
                return {
                    ...contact,
                    name: editedContact.capitalizedName
                };
            }
            return contact;
        });
        if (changed) {
            await fetch(
                `${BASE_URL}/tasks/-${task.id}/assignedTo.json`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedAssignments)
                }
            );
        }
    }
}
 
 
/**
 * Opens the mobile contact-actions menu (edit/delete) and hides the
 * menu-trigger button. Stops the click from bubbling further (e.g. to
 * the global "click outside closes menu" listener).
 *
 * @param {MouseEvent} event - The click event that triggered opening
 *                              the menu.
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
 
 
// Event Listeners //
 
/**
 * Closes the "add contact" overlay when the user clicks its
 * backdrop (i.e. directly on the overlay element, not its content).
 *
 * @listens overlay#click
 */
overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) {
        closeOverlay('add');
    }
});
 
/**
 * Closes the "edit contact" overlay when the user clicks its
 * backdrop (i.e. directly on the overlay element, not its content).
 *
 * @listens overlayEdit#click
 */
overlayEdit?.addEventListener('click', (e) => {
    if (e.target === overlayEdit) {
        closeContactEditOverlay('edit');
    }
});
 
 
/**
 * Global click listener: closes the mobile contact-actions menu when a
 * click occurs outside both the menu itself and its trigger button.
 *
 * @listens document#click
 * @param {MouseEvent} event - The click event.
 * @returns {void}
 */
document.addEventListener("click", (event) => {
    const actionsMenu = document.getElementById('contact-actions');
 
    if (!actionsMenu) return;
 
    if (
        !actionsMenu.contains(event.target) &&
        !btnMenu.contains(event.target)
    ) {
        closeMobileMenuContacts();
    }
});