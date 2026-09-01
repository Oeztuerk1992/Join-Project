/**
 * Creates a new contact in Firebase.
 *
 * @param {Object} contact - The contact data to create.
 * @returns {Promise<Object>} The parsed JSON response from Firebase
 *                             (includes the generated key as "name").
 */
async function postContactToFirebase(contact) {
    let response = await fetch(BASE_URL + "contacts.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(contact)
    });
    return await response.json();
}
 
 
/**
 * Overwrites an existing contact in Firebase with new data.
 *
 * @param {string} id - ID of the contact to update.
 * @param {Object} contact - The full contact data to store.
 * @returns {Promise<Object>} The parsed JSON response from Firebase.
 */
async function putContactToFirebase(id, contact) {
    let response = await fetch(BASE_URL + "contacts/" + id + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(contact)
    });
    return await response.json();
}
 
 
/**
 * Deletes a contact from Firebase.
 *
 * @param {string} id - ID of the contact to delete.
 * @returns {Promise<void>}
 */
async function deleteContactFromFirebase(id) {
    await fetch(BASE_URL + "contacts/" + id + ".json", {
        method: "DELETE"
    });
}
 
 
/**
 * Loads all contacts from Firebase into the global "contacts" array
 * and sorts them. Resets "contacts" to an empty array first, so any
 * previous state is discarded.
 *
 * @returns {Promise<void>}
 */
async function loadContactsFromFirebase() {
    let response = await fetch(BASE_URL + "contacts.json");
    let data = await response.json();
 
    contacts = [];
 
    if (data) fillContactsList(data);
 
    sortContacts();
}
 
 
/**
 * Converts a Firebase contacts object (keyed by ID) into the global
 * "contacts" array, attaching each contact's Firebase key as its "id"
 * field.
 *
 * @param {Object.<string, Object>} data - Raw contacts data as
 *                                          returned by Firebase.
 * @returns {void}
 */
function fillContactsList(data) {
    const keys = Object.keys(data);
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        const contact = data[keys[keyIndex]];
        contact.id = keys[keyIndex];
        contacts.push(contact);
    }
}
 
 
/**
 * Creates a new contact from the current "add contact" form input:
 * builds the contact, formats its phone number, persists it to
 * Firebase, adds it to the local "contacts" array, re-sorts and
 * re-renders the list, and shows a confirmation. After a short delay,
 * hides the add-contact overlay, clears its inputs/validation state,
 * and scrolls the newly created contact into view.
 *
 * @returns {Promise<void>}
 */
async function createContact() {
 
    const newContact = buildContact(nameInput.value.trim());
    newContact.phone = formatPhoneNumber(newContact.phone);
 
    const result = await postContactToFirebase(newContact);
    newContact.id = result.name;
    contacts.push(newContact);
    sortContacts();
    renderContacts();
    showConfirmation();
 
    const overlay = document.getElementById('overlay');
    
        setTimeout(() => {
            overlay.style.display = 'none';
            clearInputs();
            clearValidationRemarks('add');
 
            const newContactElement = document.querySelector(`[data-id="${newContact.id}"]`);
            showContact(newContactElement);
 
                setTimeout(() => {
                    newContactElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 50);
    }, 2000);
 
}
 
 
 
/**
 * Saves changes made to the currently active contact in the edit form:
 * updates the local "contacts" entry, re-sorts and re-renders the
 * list, keeps the (re-rendered) contact selected/active, closes the
 * edit overlay, and refreshes the contact detail panel. Then
 * persists the change to Firebase and runs follow-up sync steps
 * (linked user record, contact panel state, tasks referencing this
 * contact). Sync errors are caught and logged, not surfaced to the UI.
 *
 * @returns {Promise<void>}
 */
async function saveContact() {
    const id = activeContact.id;
    const index = contacts.findIndex(contact => contact.id === id);
 
    const oldContact = { ...contacts[index] };
 
    const edited = readEditInputs();
    edited.phone = formatPhoneNumber(edited.phone);
    edited.randomColor = contacts[index].randomColor;
 
    contacts[index] = { ...edited, id };
 
    sortContacts();
    renderContacts();
 
    const contactEl = document.querySelector(`[data-id="${id}"]`);
    activeContact = contactEl.dataset;
    activeContactEl = contactEl;
    contactEl.classList.add('active');
 
    closeContactEditOverlay('edit');
    updateContactPanel(false);
 
    try {
        await putContactToFirebase(id, edited);
        await syncUserDataFromContact(oldContact, edited);
        await onloadUsers();
        checkAfterUpdateContact(id, edited);
        await loadTasks();
        await updateContactInTasks(id, edited);
    } catch (err) {
        console.error('Sync nach Contact-Update fehlgeschlagen:', err);
    }
}
 
 
/**
 * If the edited contact is the currently logged-in user, updates the
 * session's cached display name and email and refreshes the user
 * profile UI to reflect the change.
 *
 * @param {string} id - ID of the contact that was edited.
 * @param {Object} edited - The edited contact data (capitalizedName,
 *                           email, etc.).
 * @returns {void}
 */
function checkAfterUpdateContact(id, edited) {
    const loggedInContactId =
        sessionStorage.getItem('loggedInContactId');
 
    if (id === loggedInContactId) {
        sessionStorage.setItem(
            'loggedInUser',
            edited.capitalizedName
        );
 
        sessionStorage.setItem(
            'loggedInUserEmail',
            edited.email
        );
 
        getUserProfile();
    }
}
 
 
/**
 * If a contact is linked to a registered user account (matched by the
 * old email address), updates that user's stored name and email to
 * match the contact's new data. Does nothing if no user is linked to
 * the contact's previous email.
 *
 * @param {Object} oldContact - The contact's data before editing
 *                               (used to find the linked user via its
 *                               previous email).
 * @param {Object} newContact - The contact's data after editing
 *                               (capitalizedName, email).
 * @returns {Promise<void>}
 */
async function syncUserDataFromContact(oldContact, newContact) {
    const response = await fetch(BASE_URL + "user.json");
    const users = await response.json();
 
    if (!users) return;
 
    const userKey = Object.keys(users).find(
        key => users[key].mail === oldContact.email
    );
 
    // Contact is not linked to a registered user
    if (!userKey) return;
 
    const nameParts = newContact.capitalizedName.trim().split(/\s+/);
 
    const updatedUser = {
        ...users[userKey],
        firstName: nameParts.slice(0, -1).join(" "),
        lastName: nameParts[nameParts.length - 1],
        mail: newContact.email
    };
 
    await fetch(`${BASE_URL}user/${userKey}.json`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedUser)
    });
}
 
 
/**
 * Deletes the currently active contact. If the contact is the
 * logged-in user themself, deletion is blocked and a confirmation
 * dialog is shown instead. Otherwise, removes the contact from
 * Firebase and the local "contacts" array, reloads contacts and tasks,
 * removes the contact from any tasks it was assigned to, clears the
 * detail panel, closes the edit overlay, resets the active-contact
 * state, and re-renders the list. On narrow viewports, also switches
 * the mobile layout back to the contact list view.
 *
 * @returns {Promise<void>}
 */
async function deleteContact() {
    const loggedInContactId =
        sessionStorage.getItem('loggedInContactId');
 
    const id = activeContact.id;
 
    if (id === loggedInContactId) {
        showDialogDelete();
        return;
    }
 
    const index = contacts.findIndex(
        contact => contact.id === id
    );
 
    await deleteContactFromFirebase(id);
    contacts.splice(index, 1);
 
    await loadContactsFromFirebase();
    await loadTasks();
    await removeDeletedContactFromTasks(id);
 
    document.querySelector('.contact-detail-panel').innerHTML = '';
    closeContactEditOverlay('edit');
    activeContact = null;
    activeContactEl = null;
    renderContacts();
 
    // Mobile view //

    /**
     * in mobile view only the contact list is displayed, after clicking on contact the detail window opens
     */
    if (window.innerWidth <= 992) {
        document.querySelector('.new-contact-wrapper').style.display = 'flex';
        document.querySelector('.contact-info').style.display = 'none';
    }
}