/* ========================================
API - Part 1
======================================== */

/**
 * Creates a new contact in Firebase.
 *
 * @param {Object} contact - The contact data to create.
 * @returns {Promise<Object>} The parsed JSON response from Firebase (includes the generated key as "name").
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
 * and sorts them.
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
 * "contacts" array, attaching each contact's Firebase key as its "id" field.
 *
 * @param {Object.<string, Object>} data - Raw contacts data as returned by Firebase.
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
 * Creates a new contact from the current form data, saves it to the
 * backend, updates the contact list, shows a confirmation message, and focuses the newly created contact.
 *
 * @returns {Promise<void>}
 */
async function createContact() {
    const newContact = await saveNewContact();
    updateContactList(newContact);
    showConfirmation();
    hideContactOverlay(newContact.id);
}


/**
 * Builds a contact object from the form data and saves it to the
 * backend.
 *
 * @returns {Promise<Object>} The newly created contact.
 */
async function saveNewContact() {
    const newContact = buildContact(nameInput.value.trim());
    newContact.phone = formatPhoneNumber(newContact.phone);
    const result = await postContactToFirebase(newContact);
    newContact.id = result.name;
    return newContact;
}


/**
 * Adds a contact to the local contacts array and refreshes the
 * contact list.
 *
 * @param {Object} contact - Contact to add.
 * @returns {void}
 */
function updateContactList(contact) {
    contacts.push(contact);
    sortContacts();
    renderContacts();
}


/**
 * Hides the add-contact overlay after a short delay, clears the form,
 * and focuses the newly created contact.
 *
 * @param {string} contactId - ID of the newly created contact.
 * @returns {void}
 */
function hideContactOverlay(contactId) {
    const overlay = document.getElementById("overlay");
    setTimeout(() => {
        overlay.style.display = "none";
        clearInputs();
        clearValidationRemarks("add");
        focusNewContact(contactId);
    }, 2000);
}


/**
 * Opens the newly created contact and scrolls it into view.
 *
 * @param {string} contactId - ID of the contact to focus.
 * @returns {void}
 */
function focusNewContact(contactId) {
    const contactElement = document.querySelector(`[data-id="${contactId}"]`);
    if (!contactElement) return;
    showContact(contactElement);
    setTimeout(() => {
        contactElement.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, 50);
}


/**
 * Saves the changes made to the active contact, updates the UI, and
 * synchronizes the changes with the backend.
 *
 * @returns {Promise<void>}
 */
async function saveContact() {
    const contactData = prepareContactUpdate();
    updateLocalContact(contactData);
    refreshContactView(contactData.id);
    closeContactEditOverlay("edit");
    updateContactPanel(false);
    await syncContactChanges(contactData);
}


/**
 * Creates the updated contact data from the edit form.
 *
 * @returns {Object} Contact update information.
 */
function prepareContactUpdate() {
    const id = activeContact.id;
    const index = contacts.findIndex(contact => contact.id === id);
    const oldContact = { ...contacts[index] };
    const edited = readEditInputs();
    edited.phone = formatPhoneNumber(edited.phone);
    edited.randomColor = contacts[index].randomColor;
    return { id, index, oldContact, edited };
}


/**
 * Updates the contact in the local contacts array.
 *
 * @param {Object} contactData - Contact update information.
 * @returns {void}
 */
function updateLocalContact(contactData) {
    contacts[contactData.index] = {
        ...contactData.edited,
        id: contactData.id
    };
    sortContacts();
    renderContacts();
}


/**
 * Restores the active contact after re-rendering the contact list.
 *
 * @param {string} id - Contact ID.
 * @returns {void}
 */
function refreshContactView(id) {
    const contactEl = document.querySelector(`[data-id="${id}"]`);
    if (!contactEl) return;
    activeContact = contactEl.dataset;
    activeContactEl = contactEl;
    contactEl.classList.add("active");
}


/**
 * Synchronizes the updated contact with the backend and related data.
 *
 * @param {Object} contactData - Contact update information.
 * @returns {Promise<void>}
 */
async function syncContactChanges(contactData) {
    const { id, oldContact, edited } = contactData;
    try {
        await putContactToFirebase(id, edited);
        await syncUserDataFromContact(
            oldContact,
            edited
        );
        await onloadUsers();
        checkAfterUpdateContact(id, edited);
        await loadTasks();
        await updateContactInTasks(id, edited);
    } catch (error) {
        console.error("Sync after contact update failed:",error);
    }
}