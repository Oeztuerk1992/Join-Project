// Variables Add Contact //
const nameInput = document.getElementById('name');
const inputWrapperName = document.getElementById("container-input-name-contact");
const emailInput = document.getElementById('email');
const inputWrapperMail = document.getElementById("container-input-mail-contact");
const phoneInput = document.getElementById('phone');
const inputWrapperPhone = document.getElementById("container-input-phone-contact");
const infoContactAdd = document.getElementById("validation-feedback-contact-add");
 
// Variables Edit Contact //
const nameInputEdit = document.getElementById('name-edit');
const inputWrapperNameEdit = document.getElementById("container-input-name-contact-edit");
const emailInputEdit = document.getElementById('email-edit');
const inputWrapperMailEdit = document.getElementById("container-input-mail-contact-edit");
const phoneInputEdit = document.getElementById('phone-edit');
const inputWrapperPhoneEdit = document.getElementById("container-input-phone-contact-edit");
const overlay = document.getElementById('overlay');
const overlayEdit = document.getElementById('overlayEdit');
const infoContactEdit = document.getElementById("validation-feedback-contact-edit");
 
const newContactMessage = document.getElementById('new-contact-innerwrapper');
let contacts = [];
let activeContact = null;
let activeContactEl = null;
 
// Variables for mobile //
 
const btnMenu = document.getElementById('btn-for-mobile-menu');
 
 
/**
 * Initializes the contacts page: loads the user profile, all
 * registered users, and all contacts from Firebase. Determines whether
 * the logged-in user has a matching contact entry and stores its ID in
 * sessionStorage ("loggedInContactId") for later use (e.g. to exclude
 * self from assignment lists, protect against self-deletion). Finally
 * renders the contact list and initializes its custom scrollbar.
 *
 * @returns {Promise<void>}
 */
async function initContacts() {
    getUserProfile();
    await onloadUsers();
    await loadContactsFromFirebase();
 
    const loggedInUserEmail =
        sessionStorage.getItem('loggedInUserEmail');
 
    const ownContact = contacts.find(
        contact => contact.email === loggedInUserEmail
    );
 
    if (ownContact) {
        sessionStorage.setItem(
            'loggedInContactId',
            ownContact.id
        );
    } else {
        sessionStorage.removeItem('loggedInContactId');
    }
 
    renderContacts();
    initScrollbar();
}
 
 
/**
 * Opens the "add contact" overlay: makes it visible, then adds the
 * "open" class on the next tick to trigger its entrance transition.
 *
 * @returns {void}
 */
function openOverlay() {
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.classList.add('open');
    }, 10);
}
 
 
/**
 * Closes the "add contact" overlay: removes the "open" class to
 * trigger its exit transition, hides it once the transition finishes,
 * and resets its inputs and validation state.
 *
 * @param {string} filterWord - Passed through to clearValidationRemarks()
 *                               (e.g. "add").
 * @returns {void}
 */
function closeOverlay(filterWord) {
    overlay.classList.remove('open');
 
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
 
    clearInputs();
    clearValidationRemarks(filterWord);
}
 
 
/**
 * Picks a random badge color from a fixed palette of 15 predefined CSS
 * custom properties.
 *
 * @returns {string} A CSS `var(--badge-color-N)` reference.
 */
function getRandomColor() {
    const colors = [];
    for (let colorNumber = 1; colorNumber <= 15; colorNumber++) colors.push(`var(--badge-color-${colorNumber})`);
    return colors[Math.floor(Math.random() * colors.length)];
}
 
 
/**
 * Normalizes a name string into title case: trims whitespace,
 * collapses internal whitespace, and capitalizes the first letter of
 * each word while lowercasing the rest.
 *
 * @param {string} name - The raw name input.
 * @returns {string} The capitalized name (e.g. "john doe" -> "John Doe").
 */
function capitalizeName(name) {
    return name
        .trim()
        .split(/\s+/)
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1).toLowerCase()
        )
        .join(' ');
}
 
 
/**
 * Derives initials from a capitalized name: the first letter if only
 * one word is given, otherwise the first letter of the first word plus
 * the first letter of the last word.
 *
 * @param {string} capitalizedName - The name to derive initials from.
 * @returns {string} One or two uppercase initials.
 */
function getInitials(capitalizedName) {
    const words = capitalizedName.trim().split(/\s+/);
 
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }
 
    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
}
 
 
/**
 * Builds a new contact object from the "add contact" form's current
 * email/phone inputs and a given name, generating capitalized name,
 * initials, and a random badge color.
 *
 * @param {string} name - The raw name entered by the user.
 * @returns {{capitalizedName: string, initials: string, email: string,
 *            phone: string, randomColor: string}} The new contact
 *            object (without an "id" yet; assigned after saving to
 *            Firebase).
 */
function buildContact(name) {
    const capitalizedName = capitalizeName(name);
    const initials = getInitials(capitalizedName);
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    return { capitalizedName, initials, email, phone, randomColor: getRandomColor() };
}
 
 
/**
 * Selects a contact and displays its details.
 *
 * @param {HTMLElement} el - Selected contact element.
 * @param {boolean} [animate=true] - Whether to animate the panel.
 * @returns {void}
 */
function showContact(el, animate = true) {
    if (!canShowContact(el, animate)) return;

    updateMobileMenu();
    setActiveContact(el);
    updateMobileLayout();

    updateContactDetails(animate);
}


/**
 * Checks whether contact details can be displayed.
 *
 * @param {HTMLElement} el - Selected contact element.
 * @param {boolean} animate - Animation flag.
 * @returns {boolean} True if display should continue.
 */
function canShowContact(el, animate) {
    if (!el) return false;

    if (activeContactEl === el && animate) {
        return false;
    }

    return true;
}


/**
 * Updates the mobile action menu visibility.
 *
 * @returns {void}
 */
function updateMobileMenu() {
    if (window.innerWidth > 992) return;

    const actionsMenu = document.getElementById(
        "contact-actions"
    );

    if (actionsMenu) {
        actionsMenu.style.display = "none";
    }

    if (btnMenu) {
        btnMenu.style.display = "block";
    }
}


/**
 * Marks a contact as active.
 *
 * @param {HTMLElement} el - Selected contact element.
 * @returns {void}
 */
function setActiveContact(el) {
    if (activeContactEl && activeContactEl !== el) {
        activeContactEl.classList.remove("active");
    }

    activeContactEl = el;
    activeContact = el.dataset;

    el.classList.add("active");
}


/**
 * Switches to the contact detail view on mobile.
 *
 * @returns {void}
 */
function updateMobileLayout() {
    if (window.innerWidth > 992) return;

    document.querySelector(
        ".new-contact-wrapper"
    ).style.display = "none";

    document.querySelector(
        ".contact-info"
    ).style.display = "flex";
}


/**
 * Updates the contact detail panel.
 *
 * @param {boolean} animate - Animation flag.
 * @returns {void}
 */
function updateContactDetails(animate) {
    const panel = document.querySelector(
        ".contact-detail-panel"
    );

    if (animate && window.innerWidth > 992) {
        animateContactPanel(panel);
        return;
    }

    updateContactPanel();
}


/**
 * Animates the contact detail panel refresh.
 *
 * @param {HTMLElement} panel - Detail panel element.
 * @returns {void}
 */
function animateContactPanel(panel) {
    panel.classList.remove("visible");

    setTimeout(() => {
        updateContactPanel();

        requestAnimationFrame(() => {
            panel.classList.add("visible");
        });
    }, 300);
}
 
/**
 * Re-renders the contact detail panel from the currently active
 * contact's data, then re-marks the corresponding list item as active
 * (useful after the list itself has been re-rendered).
 *
 * @returns {void}
 */
function updateContactPanel() {
    const panel = document.querySelector('.contact-detail-panel');
 
    panel.innerHTML = createContactDetailTemplate(
        activeContact.name,
        activeContact.initials,
        activeContact.email,
        activeContact.phone,
        activeContact.color
    );
    restoreActiveContact();
}
 
 
/**
 * Re-applies the "active" highlight to the contact list item matching
 * the currently active contact's ID, e.g. after the list has been
 * re-rendered and the previous element reference is stale. Does
 * nothing if there is no active contact or no matching element.
 *
 * @returns {void}
 */
function restoreActiveContact() {
    if (!activeContact?.id) return;
 
    const element = document.querySelector(`[data-id="${activeContact.id}"]`);
    if (!element) return;
 
    activeContactEl = element;
    activeContactEl.classList.add('active');
}
