/* ========================================
Variables
======================================== */

const info = document.getElementById("validation-feedback");
const inputMail = document.getElementById("input-signup-mail");
 

/* ========================================
Sign-up form functions
======================================== */

/**
 * Handles signup form submission by validating all inputs and starting
 * the registration process if validation succeeds.
 *
 * @param {SubmitEvent} event - Form submit event.
 * @returns {boolean} True if registration was triggered; otherwise false.
 */
function checkFormDataSignup(event) {
    event.preventDefault();
    resetValidation();
    if (!validateSignupInputs()) {
        return false;
    }
    registerNewUser();
    return true;
}


/**
 * Validates all signup form inputs from top to bottom and stops at the
 * first validation error.
 *
 * @returns {boolean} True if all inputs are valid, otherwise false.
 */
function validateSignupInputs() {
    if (!checkUserName()) return false;
    if (!checkUserMail()) return false;
    if (!checkUserPw()) return false;
    if (!checkUserPwConfirm()) return false;
    if (!checkPrivacyPolicy()) return false;
    return true;
}


/**
 * Validates that the signup name has at least two words and toggles the error styling.
 *
 * @returns {boolean} True if the name has at least two words, false otherwise.
 */
function checkUserName() {
    const inputName = document.getElementById("input-signup-name");
    const value = nameUser.value.trim();
    const wordCount = value ? value.split(/\s+/).length : 0;
    if (wordCount >= 2) {
        info.classList.add("hidden-feedback");
        inputName.classList.remove('fail-red-border');
        return true;
    }
    info.classList.remove('hidden-feedback');
    inputName.classList.add('fail-red-border');
    info.textContent = "Please enter first and last name.";
    return false;
}

 
/**
 * Validates the signup email (format and not already taken) and toggles the error styling.
 *
 * @returns {boolean} True if the email is well-formed and not already taken, false otherwise.
 */
function checkUserMail() {
    mailUser.value = mailUser.value.trim().toLowerCase();
    const email = mailUser.value;
    const emailRegex = /^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
        info.classList.remove("hidden-feedback");
        inputMail.classList.add("fail-red-border");
        info.textContent = "Please enter a valid email address.";
        return false;
    }
    if (!emailAlreadyExists()) return false;
    info.classList.add("hidden-feedback");
    inputMail.classList.remove("fail-red-border");
    return true;
}
 

/**
 * Checks that the signup email is not used by a contact or registered user and toggles the error styling.
 *
 * @returns {boolean} True if the email is not already taken, false if it is.
 */
function emailAlreadyExists() {
    const mail = mailUser.value.trim();
    const mailExistsContact = contacts.some(contact => contact.email === mail);
    const mailExistsUser = registeredUser.some(user => user.mail === mail);
    if (mailExistsContact || mailExistsUser) {
        info.classList.remove('hidden-feedback');
        info.textContent = 'This email address is already taken.';
        inputMail.classList.add('fail-red-border');
        return false;
    }
    info.classList.add('hidden-feedback');
    inputMail.classList.remove('fail-red-border');
    return true;
}
 
 
/**
 * Validates the signup password field: requires at least 7 characters
 * (after trimming). Toggles the field's error styling accordingly.
 *
 * @returns {boolean} True if the password is at least 7 characters long, false otherwise.
 */
function checkUserPw() {
    const inputPw = document.getElementById("input-signup-pw");
    if (pwUser.value.trim().length >= 7) {
        info.classList.add("hidden-feedback");
        inputPw.classList.remove('fail-red-border');
        return true;
    }
    info.classList.remove('hidden-feedback');
    inputPw.classList.add('fail-red-border');
    info.textContent = "Password: With at least 7 characters.";
    return false;
}
 
 
/**
 * Validates that the confirmation is non-empty and matches the password, and toggles the error styling.
 *
 * @returns {boolean} True if the confirmation matches the password, false otherwise.
 */
function checkUserPwConfirm() {
    const inputPwConf = document.getElementById("input-signup-confirm-pw");
    if (checkPw.value.trim() !== "" && checkPw.value === pwUser.value) {
        info.classList.add("hidden-feedback");
        inputPwConf.classList.remove("fail-red-border");
        return true;
    }
    info.classList.remove("hidden-feedback");
    inputPwConf.classList.add("fail-red-border");
    info.textContent = isMobileView()
        ? "Passwords don't match. Try again."
        : "Your passwords don't match. Please try again.";
    return false;
}
 
 
/**
 * Validates that the privacy policy checkbox is checked. Toggles the
 * shared feedback message accordingly.
 *
 * @returns {boolean} True if the privacy policy is accepted, false otherwise.
 */
function checkPrivacyPolicy() {
    if (privacyPolicy.checked) {
        info.classList.add("hidden-feedback");
        return true;
    }
    info.classList.remove("hidden-feedback");
    info.textContent = "Please accept the Privacy Policy.";
    return false;
}
 
 
/**
 * Registers a new user from the signup form, saves it, creates a linked contact and shows the confirmation.
 *
 * @returns {Promise<void>}
 */
async function registerNewUser() {
    const fullName = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-mail').value;
    signUpNewUser.push(buildNewUser(fullName, email));
    await prepareUserDataForPost(signUpNewUser);
    await createContactFromUser(fullName, email);
    showConfirmationSignup();
}


/**
 * Builds the user object with capitalized first/last name from the signup form.
 *
 * @param {string} fullName - The entered full name.
 * @param {string} email - The entered email address.
 * @returns {{name: {firstName: string, lastName: string}, mail: string, password: string}} The new user.
 */
function buildNewUser(fullName, email) {
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const nameParts = fullName.split(/\s+/);
    const lastName = capitalize(nameParts.pop());
    const firstName = nameParts.map(capitalize).join(' ');
    return {
        name: { firstName, lastName },
        mail: email,
        password: document.getElementById('signup-pw').value
    };
}
 
 
/* ========================================
create contact-object for registered user
======================================== */
 
/**
 * Creates a contact in the backend linked to a newly registered user.
 *
 * @param {string} fullName - The user's full name.
 * @param {string} email - The user's email address.
 * @param {string} [userId] - ID linking the contact to the user record.
 * @returns {Promise<void>}
 */
async function createContactFromUser(fullName, email, userId) {
    const capitalizedName = capitalizeName(fullName);
    const contact = {
        userId,
        capitalizedName,
        initials: getInitials(capitalizedName),
        email,
        phone: "",
        randomColor: getRandomColor()
    };
    await postContact(contact);
}


/**
 * Saves a contact to the Firebase "contacts" path.
 *
 * @param {Object} contact - The contact data to store.
 * @returns {Promise<void>}
 */
async function postContact(contact) {
    await fetch(BASE_URL + "contacts.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact)
    });
}
 
 
/* ========================================
confirmation info shows up
======================================== */

/**
 * Shows the signup confirmation dialog, then automatically dismisses
 * it and switches to the login window after a fixed delay.
 *
 * @returns {void}
 */
function showConfirmationSignup() {
    const confirmation = document.getElementById("confirmation-dialog");
    confirmation.showModal();
    confirmation.classList.add("show");
    setTimeout(() => {
        confirmation.classList.remove("show");
        confirmation.close();
        getToLogin();
    }, 2000);
}
