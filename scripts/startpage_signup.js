// Sign-up form //
 
const info = document.getElementById("validation-feedback");
const inputMail = document.getElementById("input-signup-mail");
 
 
/**
 * Submit handler for the signup form: prevents the native submission,
 * validates name, email, and password, then password confirmation,
 * then acceptance of the privacy policy — in that order, showing the
 * corresponding error message and stopping at the first failing
 * check. If everything passes, registers the new user.
 *
 * @param {SubmitEvent} event - The form submit event.
 * @returns {boolean} False if any validation step failed; true if
 *                     registration was triggered.
 */
function checkFormDataSignup(event) {
    event.preventDefault();
 
    const isNameValid = checkUserName();
    const isMailValid = checkUserMail();
    const isPwValid = checkUserPw();
    const isPwConfirmValid = checkUserPwConfirm();
 
    if (!isNameValid || !isMailValid || !isPwValid) {
        info.classList.remove("hidden-feedback");
        info.textContent = "Please check all inputs and correct any errors.";
        return false;
    }
 
    if (!isPwConfirmValid) {
        info.classList.remove("hidden-feedback");
        info.textContent = "Your passwords don't match. Please try again.";
        return false;
    }
 
    const isPrivacyValid = checkPrivacyPolicy();
 
    if (!isPrivacyValid) {
        info.classList.remove("hidden-feedback");
        info.textContent = "Please accept the Privacy Policy before proceeding.";
        return false;
    }
 
    registerNewUser();
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
    info.textContent = "Please enter both your first and last name.";
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
 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
    if (!emailRegex.test(email)) {
        info.classList.remove("hidden-feedback");
        inputMail.classList.add("fail-red-border");
        info.textContent = "Please enter your email address in a valid format.";
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
    info.textContent = "Please enter a valid password: at least 7 characters.";
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
        inputPwConf.classList.remove('fail-red-border');
 
        return true;
    }
 
    info.classList.remove('hidden-feedback');
    inputPwConf.classList.add('fail-red-border');
    info.textContent = "Your passwords don't match. Please try again.";
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
    info.textContent = "Please accept the Privacy Policy before proceeding.";
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
 * it and switches to the login modal after a fixed delay.
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
        getLoginModal();
    }, 2000);
}
 
// Event Listeners //
 
/**
 * Live validation listeners for the signup form: re-validate the name
 * field on every keystroke and on blur.
 *
 * @listens HTMLElement#input
 * @listens HTMLElement#blur
 */
document.getElementById("signup-name")?.addEventListener("input", checkUserName);
document.getElementById("signup-name")?.addEventListener("blur", checkUserName);
 
/**
 * Live validation listeners for the signup form: re-validate the email
 * field on every keystroke and on blur.
 *
 * @listens HTMLElement#input
 * @listens HTMLElement#blur
 */
document.getElementById("input-signup-mail")?.addEventListener("input", checkUserMail);
document.getElementById("input-signup-mail")?.addEventListener("blur", checkUserMail);
 
/**
 * Live validation listeners for the signup form: re-validate the
 * password field on every keystroke and on blur.
 *
 * @listens HTMLElement#input
 * @listens HTMLElement#blur
 */
document.getElementById("input-signup-pw")?.addEventListener("input", checkUserPw);
document.getElementById("input-signup-pw")?.addEventListener("blur", checkUserPw);
 
/**
 * Live validation listener for the signup form: re-validate privacy
 * policy acceptance whenever its checkbox state changes.
 *
 * @listens HTMLElement#change
 */
document.getElementById("privacy-policy")?.addEventListener("change", checkPrivacyPolicy);
