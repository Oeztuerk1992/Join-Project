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
        sessionStorage.setItem('loggedInUser',edited.capitalizedName);
        sessionStorage.setItem('loggedInUserEmail',edited.email);
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
    const userKey = findLinkedUser(users,oldContact.email);
    if (!userKey) return;
    const updatedUser = buildUpdatedUser(users[userKey],newContact);
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
    const loggedInContactId = sessionStorage.getItem("loggedInContactId");
    return id === loggedInContactId;
}


/**
 * Removes a contact from the backend and local data.
 *
 * @param {string} id - Contact ID.
 * @returns {Promise<void>}
 */
async function removeContact(id) {
    const index = contacts.findIndex(contact => contact.id === id);
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
    document.querySelector(".contact-detail-panel").innerHTML = "";
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
    document.querySelector(".new-contact-wrapper").style.display = "flex";
    document.querySelector(".contact-info").style.display = "none";
}