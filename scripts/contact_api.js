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
 * Creates a new contact from the current form data, saves it to the
 * backend, updates the contact list, shows a confirmation message,
 * and focuses the newly created contact.
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
    const newContact = buildContact(
        nameInput.value.trim()
    );

    newContact.phone = formatPhoneNumber(
        newContact.phone
    );

    const result = await postContactToFirebase(
        newContact
    );

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
    const contactElement = document.querySelector(
        `[data-id="${contactId}"]`
    );

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
    const index = contacts.findIndex(
        contact => contact.id === id
    );

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
    const contactEl = document.querySelector(
        `[data-id="${id}"]`
    );

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
        console.error(
            "Sync nach Contact-Update fehlgeschlagen:",
            error
        );
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
 * Synchronizes a contact update with a linked user account.
 *
 * @param {Object} oldContact - Contact data before the update.
 * @param {Object} newContact - Contact data after the update.
 * @returns {Promise<void>}
 */
async function syncUserDataFromContact(
    oldContact,
    newContact
) {
    const users = await loadUsers();

    if (!users) return;

    const userKey = findLinkedUser(
        users,
        oldContact.email
    );

    if (!userKey) return;

    const updatedUser = buildUpdatedUser(
        users[userKey],
        newContact
    );

    await saveUpdatedUser(userKey, updatedUser);
}


/**
 * Loads all registered users.
 *
 * @returns {Promise<Object|null>} Loaded users.
 */
async function loadUsers() {
    const response = await fetch(
        BASE_URL + "user.json"
    );

    return await response.json();
}


/**
 * Finds the user linked to a contact email.
 *
 * @param {Object} users - All registered users.
 * @param {string} email - Contact email.
 * @returns {string|undefined} User key.
 */
function findLinkedUser(users, email) {
    return Object.keys(users).find(
        key => users[key].mail === email
    );
}


/**
 * Creates an updated user object from contact data.
 *
 * @param {Object} user - Existing user data.
 * @param {Object} contact - Updated contact data.
 * @returns {Object} Updated user.
 */
function buildUpdatedUser(user, contact) {
    const nameParts = contact.capitalizedName
        .trim()
        .split(/\s+/);

    return {
        ...user,
        firstName: getFirstName(nameParts),
        lastName: getLastName(nameParts),
        mail: contact.email
    };
}


/**
 * Returns the first name part(s) of a full name.
 *
 * @param {string[]} nameParts - Split name parts.
 * @returns {string} First name.
 */
function getFirstName(nameParts) {
    return nameParts.slice(0, -1).join(" ");
}


/**
 * Returns the last name part of a full name.
 *
 * @param {string[]} nameParts - Split name parts.
 * @returns {string} Last name.
 */
function getLastName(nameParts) {
    return nameParts[nameParts.length - 1];
}


/**
 * Saves an updated user to the backend.
 *
 * @param {string} userKey - User ID.
 * @param {Object} updatedUser - User data to save.
 * @returns {Promise<void>}
 */
async function saveUpdatedUser(
    userKey,
    updatedUser
) {
    await fetch(`${BASE_URL}user/${userKey}.json`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedUser)
    });
}
 
 
/**
 * Deletes the currently active contact and updates all related data.
 *
 * @returns {Promise<void>}
 */
async function deleteContact() {
    const id = activeContact.id;

    if (isCurrentUserContact(id)) {
        showDialogDelete();
        return;
    }

    await removeContact(id);

    resetContactView();
    renderContacts();

    updateMobileContactView();
}


/**
 * Checks whether the contact belongs to the logged-in user.
 *
 * @param {string} id - Contact ID.
 * @returns {boolean} True if the contact is the logged-in user.
 */
function isCurrentUserContact(id) {
    const loggedInContactId =
        sessionStorage.getItem("loggedInContactId");

    return id === loggedInContactId;
}


/**
 * Removes a contact from the backend and local data.
 *
 * @param {string} id - Contact ID.
 * @returns {Promise<void>}
 */
async function removeContact(id) {
    const index = contacts.findIndex(
        contact => contact.id === id
    );

    await deleteContactFromFirebase(id);

    contacts.splice(index, 1);

    await loadContactsFromFirebase();
    await loadTasks();

    await removeDeletedContactFromTasks(id);
}


/**
 * Clears the contact detail view and resets contact state.
 *
 * @returns {void}
 */
function resetContactView() {
    document.querySelector(
        ".contact-detail-panel"
    ).innerHTML = "";

    closeContactEditOverlay("edit");

    activeContact = null;
    activeContactEl = null;
}


/**
 * Switches back to the contact list on mobile devices.
 *
 * @returns {void}
 */
function updateMobileContactView() {
    if (window.innerWidth > 992) return;

    document.querySelector(
        ".new-contact-wrapper"
    ).style.display = "flex";

    document.querySelector(
        ".contact-info"
    ).style.display = "none";
}