/* ========================================
Variables / Init
======================================== */

const nameInput = document.getElementById('name');
const inputWrapperName = document.getElementById("container-input-name-contact");
const emailInput = document.getElementById('email');
const inputWrapperMail = document.getElementById("container-input-mail-contact");
const phoneInput = document.getElementById('phone');
const inputWrapperPhone = document.getElementById("container-input-phone-contact");
const infoContactAdd = document.getElementById("validation-feedback-contact-add");
 
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
 
const btnMenu = document.getElementById('btn-for-mobile-menu');
 
 
/**
 * Initializes the contacts page: loads data, stores the own contact ID and renders the list.
 * @returns {Promise<void>}
 */
async function initContacts() {
    getUserProfile();
    await onloadUsers();
    await loadContactsFromFirebase();
    storeOwnContactId();
    renderContacts();
    initScrollbar();
    getRestrictionsForInput();
}


/**
 * Stores the ID of the logged-in user's contact in sessionStorage, or removes it.
 * @returns {void}
 */
function storeOwnContactId() {
    const email = sessionStorage.getItem('loggedInUserEmail');
    const ownContact = contacts.find(contact => contact.email === email);
    if (ownContact) {
        sessionStorage.setItem('loggedInContactId', ownContact.id);
    } else {
        sessionStorage.removeItem('loggedInContactId');
    }
}


/* ========================================
General functions
======================================== */
 
/**
 * Attaches input restrictions to the phone and name fields of the contact forms.
 * @returns {void}
 */
function getRestrictionsForInput() {
    restrictPhoneInput(document.getElementById('phone'));
    restrictPhoneInput(document.getElementById('phone-edit'));
    restrictNameInput(document.getElementById('name'));
    restrictNameInput(document.getElementById('name-edit'));
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
 * Closes the "add contact" overlay and resets its inputs and validation state.
 * @param {string} filterWord - Passed through to clearValidationRemarks().
 * @returns {void}
 */
function closeOverlay(filterWord) {
    overlay.classList.remove('open');
    setTimeout(() => overlay.style.display = 'none', 300);
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
 * Normalizes a name into title case (e.g. "john doe" -> "John Doe").
 * @param {string} name - The raw name input.
 * @returns {string} The capitalized name.
 */
function capitalizeName(name) {
    return name
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
 
 
/**
 * Derives one or two uppercase initials (first and last word) from a name.
 * @param {string} capitalizedName - The name to derive initials from.
 * @returns {string} The initials.
 */
function getInitials(capitalizedName) {
    const words = capitalizedName.trim().split(/\s+/);
    const first = words[0].charAt(0);
    const last = words.length > 1 ? words[words.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
}
 
 
/**
 * Builds a new contact object from the add-contact form inputs and a name.
 * @param {string} name - The raw name entered by the user.
 * @returns {{capitalizedName: string, initials: string, email: string,
*            phone: string, randomColor: string}} The new contact (without id).
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
 * @returns {void}
 */
function updateMobileMenu() {
    if (window.innerWidth > 992) return;
    const actionsMenu = document.getElementById("contact-actions");
    if (actionsMenu) actionsMenu.style.display = "none";
    if (btnMenu) btnMenu.style.display = "block";
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
    document.querySelector(".new-contact-wrapper").style.display = "none";
    document.querySelector(".contact-info").style.display = "flex";
}


/**
 * Updates the contact detail panel.
 *
 * @param {boolean} animate - Animation flag.
 * @returns {void}
 */
function updateContactDetails(animate) {
    const panel = document.querySelector(".contact-detail-panel");
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
 * Re-renders the contact detail panel for the active contact and re-marks its list item.
 * @returns {void}
 */
function updateContactPanel() {
    const panel = document.querySelector('.contact-detail-panel');
    const { name, initials, email, phone, color } = activeContact;
    panel.innerHTML = createContactDetailTemplate(name, initials, email, phone, color);
    restoreActiveContact();
}
 
 
/**
 * Re-applies the "active" highlight to the list item of the active contact.
 * @returns {void}
 */
function restoreActiveContact() {
    if (!activeContact?.id) return;
    const element = document.querySelector(`[data-id="${activeContact.id}"]`);
    if (!element) return;
    activeContactEl = element;
    activeContactEl.classList.add('active');
}


/**
 * Restricts a phone input to digits, spaces, hyphens and a leading "+".
 *
 * @param {HTMLInputElement} input - The phone input element.
 * @returns {void}
 */
function restrictPhoneInput(input) {
    input.addEventListener('input', () => {
        input.value = input.value
            .replace(/[^\d\s+-]/g, '')
            .replace(/(?!^)\+/g, '');
    });
}


/**
 * Restricts a name input to letters (any language), spaces,
 * apostrophes and hyphens.
 *
 * @param {HTMLInputElement} input - The name input element.
 * @returns {void}
 */
function restrictNameInput(input) {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/[^\p{L}\s'-]/gu, '');
    });
}