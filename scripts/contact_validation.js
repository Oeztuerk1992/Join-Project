/**
 * Returns the set of DOM element references and validation state
 * belonging to either the "add contact" form or the "edit contact"
 * form, so the validation functions below can work generically on
 * either form.
 *
 * @param {string} filterWord - "add" for the add-contact form, any
 *                               other value (e.g. "edit") for the
 *                               edit-contact form.
 * @returns {{nameInput: HTMLElement, inputWrapperName: HTMLElement,
*            emailInput: HTMLElement, inputWrapperMail: HTMLElement,
*            phoneInput: HTMLElement, inputWrapperPhone: HTMLElement,
*            infoContact: HTMLElement}} References for the requested
*            form.
*/
function getFormRefs(filterWord) {
   return filterWord === "add"
       ? {
           nameInput,
           inputWrapperName,
           emailInput,
           inputWrapperMail,
           phoneInput,
           inputWrapperPhone,
           infoContact: infoContactAdd
       }
       : {
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
* Submit handler for the add/edit contact form: prevents the native
* form submission, validates name, email, and phone, and shows a
* generic error message if any check fails. If everything is valid,
* creates or saves the contact depending on which form was submitted.
*
* @param {SubmitEvent} event - The form submit event.
* @param {string} filterWord - "add" to create a new contact, any
*                               other value (e.g. "edit") to save
*                               changes to the active contact.
* @returns {boolean} Always returns false (used as an inline
*                     `onsubmit="return checkFormDataContactOverlay(event, filterWord)"`
*                     handler).
*/
function checkFormDataContactOverlay(event, filterWord) {
   event.preventDefault();
   const { infoContact } = getFormRefs(filterWord);
   const isNameValid = checkUserNameContact(filterWord);
   const isMailValid = checkUserMailContact(filterWord);
   const isPhoneValid = checkUserPhone(filterWord);

   if (!isNameValid || !isMailValid || !isPhoneValid) {
       infoContact.classList.remove("hidden-feedback");
       infoContact.textContent = "Please check all inputs and correct any errors.";
       return false;
   }

   infoContact.classList.add("hidden-feedback");

   if (filterWord === 'add') {
           createContact();
   } else {
       saveContact();
   }
   return false;
}


/**
* Validates the name field of a contact form: the name must consist of
* at least two words (first and last name). Toggles the field's error
* styling accordingly and sets an error message on failure.
*
* @param {string} filterWord - "add" or "edit", selects which form to
*                               validate (see getFormRefs()).
* @returns {boolean} True if the name has at least two words, false
*                     otherwise.
*/
function checkUserNameContact(filterWord) {
   const {nameInput, inputWrapperName, infoContact} = getFormRefs(filterWord);

   const value = nameInput.value.trim();
   const wordCount = value ? value.split(/\s+/).length : 0;

   if (wordCount >= 2) {
       infoContact.classList.add("hidden-feedback");
       inputWrapperName.classList.remove("fail-red-border");
       return true;
   }

   infoContact.classList.remove("hidden-feedback");
   inputWrapperName.classList.add("fail-red-border");
   infoContact.textContent = "Please enter both your first and last name.";
   return false;
}


/**
* Validates the email field of a contact form: normalizes the value
* (trimmed, lowercased) back into the input, checks it against a basic
* email format, and additionally checks it isn't already taken by
* another contact or registered user (via emailAlreadyExistsContact()).
* Toggles the field's error styling accordingly.
*
* @param {string} filterWord - "add" or "edit", selects which form to
*                               validate (see getFormRefs()).
* @returns {boolean} True if the email is well-formed and not already
*                     taken, false otherwise.
*/
function checkUserMailContact(filterWord) {
   const {emailInput, inputWrapperMail, infoContact} = getFormRefs(filterWord);

   emailInput.value = emailInput.value.trim().toLowerCase();
   const email = emailInput.value;
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

   if (!emailRegex.test(email)) {
       infoContact.classList.remove("hidden-feedback");
       inputWrapperMail.classList.add("fail-red-border");
       infoContact.textContent = "Please enter your email address in a valid format."
       return false;
   }
   if (!emailAlreadyExistsContact(filterWord)) {
       return false;
   }

   infoContact.classList.add("hidden-feedback");
   inputWrapperMail.classList.remove("fail-red-border");
   return true;
}


/**
 * Checks whether the entered email address is already in use.
 *
 * @param {string} filterWord - Form type ("add" or "edit").
 * @returns {boolean} True if the email is available.
 */
function emailAlreadyExistsContact(filterWord) {
    const formRefs = getFormRefs(filterWord);
    const email = getEnteredEmail(formRefs);

    const mailExistsContact = contactEmailExists(
        email,
        filterWord
    );

    const mailExistsUser = userEmailExists(email);

    return updateEmailValidationState(
        formRefs,
        mailExistsContact || mailExistsUser
    );
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
 *
 * @param {string} email - Email to check.
 * @param {string} filterWord - Form type.
 * @returns {boolean} True if the email exists.
 */
function contactEmailExists(email, filterWord) {
    if (filterWord !== "edit") {
        return contacts.some(
            contact => contact.email === email
        );
    }

    if (!activeContact) return false;

    return contacts.some(
        contact =>
            contact.email === email
            && contact.id !== activeContact.id
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
 *
 * @param {Object} formRefs - Form references.
 * @param {boolean} hasDuplicate - Duplicate state.
 * @returns {boolean} True if the email is valid.
 */
function updateEmailValidationState(
    formRefs,
    hasDuplicate
) {
    const {
        inputWrapperMail,
        infoContact
    } = formRefs;

    if (hasDuplicate) {
        showEmailError(
            inputWrapperMail,
            infoContact
        );
        return false;
    }

    hideEmailError(
        inputWrapperMail,
        infoContact
    );

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
    infoContact.classList.remove(
        "hidden-feedback"
    );

    infoContact.textContent =
        "This email address is already taken.";

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
    infoContact.classList.add(
        "hidden-feedback"
    );

    wrapper.classList.remove(
        "fail-red-border"
    );
}


/**
* Validates the phone field of a contact form: requires a minimum
* length and a format matching an international number
* (e.g. "+49 123 456 789"). Toggles the field's error styling
* accordingly and sets an error message on failure.
*
* @param {string} filterWord - "add" or "edit", selects which form to
*                               validate (see getFormRefs()).
* @returns {boolean} True if the phone number is valid, false
*                     otherwise.
*/
function checkUserPhone(filterWord) {
   const {phoneInput, inputWrapperPhone, infoContact} = getFormRefs(filterWord);
   const phone = phoneInput.value.trim();

   if (phone.length < 11) {
       infoContact.classList.remove("hidden-feedback");
       infoContact.textContent = "Phone number must contain at least 11 characters.";
       inputWrapperPhone.classList.add("fail-red-border");
       return false;
   }

   const phoneRegex = /^\+\d{1,4}\s*[\d\s-]{4,}$/;

   if (phoneRegex.test(phone)) {
       infoContact.classList.add("hidden-feedback");
       inputWrapperPhone.classList.remove("fail-red-border");
       return true;
   }

   infoContact.classList.remove("hidden-feedback");
   infoContact.textContent = "Please enter a valid phone number (+XX XX...).";
   inputWrapperPhone.classList.add("fail-red-border");
   return false;
}


/**
* Normalizes a raw phone number string into "+CC XXX XXX XXX" display
* format: strips all non-digit characters, treats the first two digits
* as the country code, and groups the remaining digits into blocks of
* three.
*
* @param {string} phone - The raw phone number input.
* @returns {string} The formatted phone number (e.g. "+49 123 456
*                    789"). If fewer than 4 digits are present, returns
*                    "+" followed by whatever digits exist.
*/
function formatPhoneNumber(phone) {
   const digits = phone.replace(/[^\d]/g, '');

   if (digits.length < 4) {
       return `+${digits}`;
   }

   const countryCode = digits.slice(0, 2);
   const rest = digits.slice(2);

   const groups = rest.match(/.{1,3}/g) || [];

   return `+${countryCode} ${groups.join(' ')}`;
}

// delete own account: confirmation info shows up //

/**
* Shows a confirmation dialog informing the user they cannot delete
* their own contact/account, then automatically dismisses it (and
* closes the edit-contact overlay, if open) after a fixed delay.
*
* @returns {void}
*/
function showDialogDelete() {
   const confirmation = document.getElementById("delete-own-account-dialog");
   confirmation.showModal();
   confirmation.classList.add("show");
 
   setTimeout(() => {
       if (overlayEdit.classList.contains('open')) {
           closeContactEditOverlay('edit');
       }
       confirmation.classList.remove("show");
       confirmation.close();
   }, 4000);    
}


// Event Listener //

/**
* Live validation listeners for the "add contact" form: re-validate
* the name field on every keystroke and on blur.
*
* @listens HTMLElement#input
* @listens HTMLElement#blur
*/
document.getElementById("name")?.addEventListener("input", () => checkUserNameContact("add"));
document.getElementById("name")?.addEventListener("blur", () => checkUserNameContact("add"));

/**
* Live validation listeners for the "add contact" form: re-validate
* the email field on every keystroke and on blur.
*
* @listens HTMLElement#input
* @listens HTMLElement#blur
*/
document.getElementById("email")?.addEventListener("input", () => checkUserMailContact("add"));
document.getElementById("email")?.addEventListener("blur", () => checkUserMailContact("add"));

/**
* Live validation listeners for the "add contact" form: re-validate
* the phone field on every keystroke and on blur.
*
* @listens HTMLElement#input
* @listens HTMLElement#blur
*/
document.getElementById("phone")?.addEventListener("input", () => checkUserPhone("add"));
document.getElementById("phone")?.addEventListener("blur", () => checkUserPhone("add"));

/**
* Live validation listeners for the "edit contact" form: re-validate
* the name field on every keystroke and on blur.
*
* @listens HTMLElement#input
* @listens HTMLElement#blur
*/
document.getElementById("name-edit")?.addEventListener("input", () => checkUserNameContact("edit"));
document.getElementById("name-edit")?.addEventListener("blur", () => checkUserNameContact("edit"));

/**
* Live validation listeners for the "edit contact" form: re-validate
* the email field on every keystroke and on blur.
*
* @listens HTMLElement#input
* @listens HTMLElement#blur
*/
document.getElementById("email-edit")?.addEventListener("input", () => checkUserMailContact("edit"));
document.getElementById("email-edit")?.addEventListener("blur", () => checkUserMailContact("edit"));

/**
* Live validation listeners for the "edit contact" form: re-validate
* the phone field on every keystroke and on blur.
*
* @listens HTMLElement#input
* @listens HTMLElement#blur
*/
document.getElementById("phone-edit")?.addEventListener("input", () => checkUserPhone("edit"));
document.getElementById("phone-edit")?.addEventListener("blur", () => checkUserPhone("edit"));