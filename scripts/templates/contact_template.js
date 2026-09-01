/**
 * Builds the HTML markup for a single contact list item, including its
 * data attributes (id, name, initials, email, phone, color) used
 * elsewhere via `element.dataset` (e.g. showContact(), activeContact).
 *
 * @param {string} capitalizedName - The contact's name in title case.
 * @param {string} initials - One or two uppercase initials.
 * @param {string} email - The contact's email address.
 * @param {string} randomColor - CSS color value/variable used as the
 *                                avatar background.
 * @param {string} phone - The contact's phone number.
 * @param {string} id - The contact's ID.
 * @returns {string} HTML markup for the contact list item.
 */
function createContactTemplate(capitalizedName, initials, email, randomColor, phone, id) {
    return `
        <div class="contact-item"
            data-id="${id}"
            data-name="${capitalizedName}"
            data-initials="${initials}"
            data-email="${email}"
            data-phone="${phone}"
            data-color="${randomColor}"
            onclick="showContact(this)">
            <div class="contact-badge" style="background-color: ${randomColor}">${initials}</div>
            <div class="contact-name-email">
                <span class="name">${capitalizedName}</span>
                <span class="email">${email}</span>
            </div>
        </div>
    `;
}
 
 
/**
 * Builds the HTML markup for an alphabetical section divider shown
 * above the first contact whose name starts with a given letter.
 *
 * @param {string} letter - The section letter to display.
 * @returns {string} HTML markup for the letter heading and divider.
 */
function createLetterTemplate(letter) {
    return `
        <div class="alphabet-letter">${letter}</div>
        <div class="alphabet-divider"></div>
    `;
}
 
 
/**
 * Builds the HTML markup for the contact detail panel, including edit
 * and delete action buttons.
 *
 * @param {string} name - The contact's display name.
 * @param {string} initials - One or two uppercase initials.
 * @param {string} email - The contact's email address.
 * @param {string} phone - The contact's phone number.
 * @param {string} color - CSS color value/variable used as the avatar
 *                          background.
 * @returns {string} HTML markup for the contact detail view.
 */
function createContactDetailTemplate(name, initials, email, phone, color) {
    return `
        <div class="contact-detail-header">
            <div class="contact-detail-badge" style="background-color: ${color}">${initials}</div>
            <div class="contact-detail-name">
                <span class="name-user">${name}</span>
                <div id="contact-actions" class="contact-detail-actions">
                    <span class="edit" onclick="openEditOverlay()">
                        <img src="../assets/img/contact/edit.png" alt="edit">
                    </span>
                    <span class="delete" onclick="deleteContact()">
                        <img src="../assets/img/contact/delete.png" alt="delete">
                    </span>
                </div>
            </div>
        </div>
        <div class="contact-detail-info">
            <p class="contact-label">Contact Information</p>
            <p class="label">Email</p>
            <p class="email">${email}</p>
            <p class="label">Phone</p>
            <p class="phone">${phone}</p>
        </div>
    `;
}
 
 
/**
 * Builds the HTML markup for the contact list's empty state.
 *
 * @returns {string} HTML markup for the "no contacts" message.
 */
function generateNoContactsHTML() {
    return `
        <div class="no-contacts-info">
            No contacts available.
        </div>
    `;
}
