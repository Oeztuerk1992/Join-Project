/**
 * Returns the DOM references of the add or edit contact form.
 * @param {string} filterWord - "add" for the add form, otherwise the edit form.
 * @returns {Object} The input, wrapper and info element references.
 */
function getFormRefs(filterWord) {
    return filterWord === "add" ? getAddFormRefs() : getEditFormRefs();
}


/**
 * Returns the DOM references of the add contact form.
 * @returns {Object} The input, wrapper and info element references.
 */
function getAddFormRefs() {
    return {
        nameInput,
        inputWrapperName,
        emailInput,
        inputWrapperMail,
        phoneInput,
        inputWrapperPhone,
        infoContact: infoContactAdd
    };
}


/**
 * Returns the DOM references of the edit contact form.
 * @returns {Object} The input, wrapper and info element references.
 */
function getEditFormRefs() {
    return {
        nameInput: nameInputEdit,
        inputWrapperName: inputWrapperNameEdit,
        emailInput: emailInputEdit,
        inputWrapperMail: inputWrapperMailEdit,
        phoneInput: phoneInputEdit,
        inputWrapperPhone: inputWrapperPhoneEdit,
        infoContact: infoContactEdit
    };
}


/**
 * Validates the add/edit contact form (name, email, phone) and creates or saves the contact.
 * @param {SubmitEvent} event - The form submit event.
 * @param {string} filterWord - "add" to create a new contact, otherwise save the active one.
 * @returns {boolean} Always false, to prevent native form submission.
 */
function checkFormDataContactOverlay(event, filterWord) {
    event.preventDefault();
    const { infoContact } = getFormRefs(filterWord);
    const isValid = checkUserNameContact(filterWord)
        && checkUserMailContact(filterWord)
        && checkUserPhone(filterWord);
    infoContact.classList.toggle("hidden-feedback", isValid);
    if (isValid && filterWord === 'add') runWithDisabledButton("#create-contact", createContact);
    if (isValid && filterWord === 'edit') runWithDisabledButton("#save-contact", saveContact);
    return false;
}


/**
 * Validates that the contact name has at least two words (first and last name).
 * @param {string} filterWord - "add" or "edit", selects the form to validate.
 * @returns {boolean} True if the name has at least two words, false otherwise.
 */
function checkUserNameContact(filterWord) {
    const { nameInput, inputWrapperName, infoContact } = getFormRefs(filterWord);
    const value = nameInput.value.trim();
    const isValid = value.split(/\s+/).filter(Boolean).length >= 2;
    infoContact.classList.toggle("hidden-feedback", isValid);
    inputWrapperName.classList.toggle("fail-red-border", !isValid);
    if (!isValid) infoContact.textContent = "Please enter first and last name.";
    return isValid;
}


/**
 * Validates the contact email (format and uniqueness) and normalizes it in the input.
 * @param {string} filterWord - "add" or "edit", selects the form to validate.
 * @returns {boolean} True if the email is well-formed and not already taken, false otherwise.
 */
function checkUserMailContact(filterWord) {
    const { emailInput, inputWrapperMail, infoContact } = getFormRefs(filterWord);
    emailInput.value = emailInput.value.trim().toLowerCase();
    const emailRegex = /^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(emailInput.value)) {
        showMailError(inputWrapperMail, infoContact);
        return false;
    }
    if (!emailAlreadyExistsContact(filterWord)) return false;
    infoContact.classList.add("hidden-feedback");
    inputWrapperMail.classList.remove("fail-red-border");
    return true;
}


/**
 * Shows the "invalid email" error on the email field.
 * @param {HTMLElement} wrapper - The email input wrapper.
 * @param {HTMLElement} info - The feedback element.
 * @returns {void}
 */
function showMailError(wrapper, info) {
    info.classList.remove("hidden-feedback");
    wrapper.classList.add("fail-red-border");
    info.textContent = "Please enter a valid email address.";
}


/**
 * Checks whether the entered email address is already in use.
 * @param {string} filterWord - Form type ("add" or "edit").
 * @returns {boolean} True if the email is available.
 */
function emailAlreadyExistsContact(filterWord) {
    const formRefs = getFormRefs(filterWord);
    const email = getEnteredEmail(formRefs);
    const exists = contactEmailExists(email, filterWord) || userEmailExists(email);
    return updateEmailValidationState(formRefs, exists);
}


/**
 * Returns the trimmed email from the selected form.
 *
 * @param {Object} formRefs - Form references.
 * @returns {string} Entered email.
 */
function getEnteredEmail(formRefs) {
    return formRefs.emailInput.value.trim();
}


/**
 * Checks whether the email already exists in contacts.
 * @param {string} email - Email to check.
 * @param {string} filterWord - Form type.
 * @returns {boolean} True if the email exists.
 */
function contactEmailExists(email, filterWord) {
    if (filterWord !== "edit") {
        return contacts.some(contact => contact.email === email);
    }
    if (!activeContact) return false;
    return contacts.some(
        contact => contact.email === email && contact.id !== activeContact.id
    );
}


/**
 * Checks whether the email already exists in users.
 *
 * @param {string} email - Email to check.
 * @returns {boolean} True if the email exists.
 */
function userEmailExists(email) {
    return registeredUser.some(
        user =>
            user.mail === email
            && user.mail !== activeContact?.email
    );
}


/**
 * Updates the email validation UI.
 * @param {Object} formRefs - Form references.
 * @param {boolean} hasDuplicate - Duplicate state.
 * @returns {boolean} True if the email is valid.
 */
function updateEmailValidationState(formRefs, hasDuplicate) {
    const { inputWrapperMail, infoContact } = formRefs;
    if (hasDuplicate) {
        showEmailError(inputWrapperMail, infoContact);
        return false;
    }
    hideEmailError(inputWrapperMail, infoContact);
    return true;
}


/**
 * Displays the duplicate-email error.
 *
 * @param {HTMLElement} wrapper - Input wrapper.
 * @param {HTMLElement} infoContact - Feedback element.
 * @returns {void}
 */
function showEmailError(
    wrapper,
    infoContact
) {
    infoContact.classList.remove("hidden-feedback");
    infoContact.textContent = "This email address is already taken.";
    wrapper.classList.add("fail-red-border");
}


/**
 * Hides the duplicate-email error.
 *
 * @param {HTMLElement} wrapper - Input wrapper.
 * @param {HTMLElement} infoContact - Feedback element.
 * @returns {void}
 */
function hideEmailError(
    wrapper,
    infoContact
) {
    infoContact.classList.add("hidden-feedback");
    wrapper.classList.remove("fail-red-border");
}


/**
 * Validates that the contact phone number has at least 11 characters.
 * @param {string} filterWord - "add" or "edit", selects the form to validate.
 * @returns {boolean} True if the phone number is valid, false otherwise.
 */
function checkUserPhone(filterWord) {
    const { phoneInput, inputWrapperPhone, infoContact } = getFormRefs(filterWord);
    const isValid = phoneInput.value.trim().length >= 11;
    infoContact.classList.toggle("hidden-feedback", isValid);
    inputWrapperPhone.classList.toggle("fail-red-border", !isValid);
    if (!isValid) infoContact.textContent = "Phone number: min. 11 digits!";
    return isValid;
}


/**
 * Formats a raw phone number as "+CC XXX XXX XXX" (e.g. "+49 123 456 789").
 * @param {string} phone - The raw phone number input.
 * @returns {string} The formatted number; "+" plus the digits if fewer than 4 digits.
 */
function formatPhoneNumber(phone) {
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.length < 4) return `+${digits}`;
    const groups = digits.slice(2).match(/.{1,3}/g) || [];
    return `+${digits.slice(0, 2)} ${groups.join(' ')}`;
}


/**
 * Shows a dialog that the own account cannot be deleted and closes it after 4 seconds.
 * @returns {void}
 */
function showDialogDelete() {
    const confirmation = document.getElementById("delete-own-account-dialog");
    confirmation.showModal();
    confirmation.classList.add("show");
    setTimeout(() => {
        if (overlayEdit.classList.contains('open')) closeContactEditOverlay('edit');
        confirmation.classList.remove("show");
        confirmation.close();
    }, 4000);
}
