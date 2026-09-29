// Sign-up form //
 
const info = document.getElementById("validation-feedback");
const inputMail = document.getElementById("input-signup-mail");
 

/**
 * Handles signup form submission by validating all inputs and starting
 * the registration process if validation succeeds.
 *
 * @param {SubmitEvent} event - Form submit event.
 * @returns {boolean} True if registration was triggered; otherwise
 *                    false.
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
 * Validates the signup name field: must consist of at least two words
 * (first and last name). Toggles the field's error styling
 * accordingly.
 *
 * @returns {boolean} True if the name has at least two words, false
 *                     otherwise.
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
 * Validates the signup email field: normalizes the value (trimmed,
 * lowercased) back into the input, checks it against a basic email
 * format, and additionally checks it isn't already taken by an
 * existing contact or registered user (via emailAlreadyExists()).
 * Toggles the field's error styling accordingly.
 *
 * @returns {boolean} True if the email is well-formed and not already
 *                     taken, false otherwise.
 */
function checkUserMail() {
    mailUser.value = mailUser.value.trim().toLowerCase();
    const email = mailUser.value;
    const emailRegex =
    /^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
 
    if (!emailRegex.test(email)) {
        info.classList.remove("hidden-feedback");
        inputMail.classList.add("fail-red-border");
        info.textContent = "Please enter a valid email address.";
        return false;
    }
    if (!emailAlreadyExists()) {
        return false;
    }
 
    info.classList.add("hidden-feedback");
    inputMail.classList.remove("fail-red-border");
    return true;
}
 
/**
 * Checks whether the email currently entered in the signup form is
 * already used by an existing contact or a registered user. Toggles
 * the field's error styling accordingly.
 *
 * @returns {boolean} True if the email is not already taken, false if
 *                     it is.
 */
function emailAlreadyExists() {
    const mailExistsContact = contacts.some(contact => contact.email === mailUser.value.trim());
    const mailExistsUser = registeredUser.some(user => user.mail === mailUser.value.trim());
 
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
 * @returns {boolean} True if the password is at least 7 characters
 *                     long, false otherwise.
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
 * Validates the password-confirmation field: must be non-empty and
 * match the password field exactly. Toggles the field's error styling
 * accordingly.
 *
 * @returns {boolean} True if the confirmation matches the password,
 *                     false otherwise.
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
 * @returns {boolean} True if the privacy policy is accepted, false
 *                     otherwise.
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
 * Registers a new user from the signup form: splits and capitalizes
 * the entered full name into first/last name, appends the new user's
 * data to the local "signUpNewUser" array, persists it to the backend,
 * creates a linked contact entry for the new user, and shows the
 * signup confirmation dialog.
 *
 * @returns {Promise<void>}
 */
async function registerNewUser() {
    const capitalize = (str) => {
        const lower = str.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    };
 
    const fullName = document.getElementById('signup-name').value.trim();
    const nameParts = fullName.split(/\s+/);
    const lastName = capitalize(nameParts.pop());
    const firstName = nameParts.map(capitalize).join(' ');
 
    signUpNewUser.push({
        name: {
            firstName,
            lastName,
        },
        mail: document.getElementById('signup-mail').value,
        password: document.getElementById('signup-pw').value
    });
 
    const email = document.getElementById('signup-mail').value;
    await prepareUserDataForPost(signUpNewUser);
    await createContactFromUser(fullName, email);
 
    showConfirmationSignup();
}
 
 
// create contact-object for registered user //
 
/**
 * Creates a contact entry in the backend linked to a newly registered
 * user, so the new user also appears in the contacts list.
 *
 * @param {string} fullName - The user's full name, capitalized into
 *                             the contact's display name.
 * @param {string} email - The user's email address.
 * @param {string} [userId] - ID linking the contact back to the user
 *                             record. Note: registerNewUser() calls
 *                             this function without a third argument,
 *                             so "userId" is currently always
 *                             undefined at the call site.
 * @returns {Promise<void>}
 */
async function createContactFromUser(fullName, email, userId) {
    const capitalizedName = capitalizeName(fullName);
    const initials = getInitials(capitalizedName);
 
    const contact = {
        userId,
        capitalizedName,
        initials,
        email,
        phone: "",
        randomColor: getRandomColor()
    };
 
    await fetch(BASE_URL + "contacts.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(contact)
    });
}
 
 
// confirmation info shows up //
 
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
