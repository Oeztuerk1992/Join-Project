/**
 * Updates the selected contact IDs.
 *
 * @param {HTMLElement} item - Dropdown item.
 * @param {HTMLInputElement} checkbox - Contact checkbox.
 * @returns {void}
 */
function updateSelectedContact(item, checkbox) {
    const id = item.dataset.id;

    if (checkbox.checked) {
        addSelectedContact(id);
        return;
    }

    removeSelectedContact(id);
}


/**
 * Adds a contact ID to the selection.
 *
 * @param {string} id - Contact ID.
 * @returns {void}
 */
function addSelectedContact(id) {
    if (!selectedContactIds.includes(id)) {
        selectedContactIds.push(id);
    }
}


/**
 * Removes a contact ID from the selection.
 *
 * @param {string} id - Contact ID.
 * @returns {void}
 */
function removeSelectedContact(id) {
    selectedContactIds = selectedContactIds.filter(
        contactId => contactId !== id
    );
}
 
 
/**
 * Filters contacts by the entered text (case-insensitive substring
 * match on the name) and re-renders the filtered list in the
 * associated dropdown menu.
 *
 * @param {string} filterWord - The search text from the filter input.
 * @param {HTMLElement} inputElement - The filter input element, used to
 *                                     locate the associated
 *                                     container/menu.
 * @returns {void}
 */
function filterAndShowCurrentContacts(filterWord, inputElement) {
    const menu = inputElement
        .closest('.dropdown-container')
        ?.querySelector('.dropdown-menu');
 
    if (!menu) return;
 
    const currentContacts = Object.fromEntries(
        Object.entries(contacts).filter(([id, contact]) =>
            contact.capitalizedName
                .toLowerCase()
                .includes(filterWord.toLowerCase())
        )
    );
    const assignedTo = selectedContactIds.map(id => ({ id }));
    renderContacts(
        currentContacts,
        menu,
        assignedTo,
        filterWord
    );
}
 
 
/**
 * Renders the badges (initials circles) of the currently selected
 * contacts (selectedContactIds) into the associated badge container.
 *
 * @param {HTMLElement} container - An ancestor of the badge container
 *                                  (".assign-contact" is a child of
 *                                  container.parentElement).
 * @returns {void}
 */
function getContactBadges(container) {
    const badgeContainer = container.parentElement.querySelector('.assign-contact');
    badgeContainer.innerHTML = "";
 
    selectedContactIds.forEach(id => {
        const contact = contacts[id];
 
        if (!contact) return;
 
        badgeContainer.innerHTML += generateContactBadgeHTML(
            contact.initials,
            `background:${contact.randomColor};`
        );
    });
}
 
 
/**
 * Reads the initials and background color from a given contact circle
 * element and appends a new badge built from them to the given badge
 * container.
 *
 * @param {HTMLElement} child - Element containing a ".contact-circle"
 *                              child (initials + background color).
 * @param {HTMLElement} badgeContainer - Container the badge HTML is
 *                                       appended to.
 * @returns {void}
 */
function renderDropdownContacts(child, badgeContainer) {
    const circle = child.querySelector('.contact-circle');
    const initials = circle.textContent.trim();
    const color = circle.style.background;
 
    badgeContainer.innerHTML += generateContactBadgeHTML(
        initials,
        `background:${color};`
    );
}