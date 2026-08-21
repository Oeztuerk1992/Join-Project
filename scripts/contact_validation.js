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


function emailAlreadyExistsContact(filterWord) {
    const {emailInput, inputWrapperMail, infoContact} = getFormRefs(filterWord);

    const email = emailInput.value.trim();

    let mailExistsContact;

    if (filterWord === "edit") {

        if (!activeContact) {
            return false;
        }

        mailExistsContact = contacts.some(
            contact =>
                contact.email === email &&
                contact.id !== activeContact.id
        );
    } else {
        mailExistsContact = contacts.some(
            contact => contact.email === email
        );
    }

    const mailExistsUser = registeredUser.some(
    user =>
        user.mail === email &&
        user.mail !== activeContact?.email
    );

    if (mailExistsContact || mailExistsUser) {
        infoContact.classList.remove("hidden-feedback");
        infoContact.textContent = "This email address is already taken.";
        inputWrapperMail.classList.add("fail-red-border");
        return false;
    }

    infoContact.classList.add("hidden-feedback");
    inputWrapperMail.classList.remove("fail-red-border");
    return true;
}


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

document.getElementById("name")?.addEventListener("input", () => checkUserNameContact("add"));
document.getElementById("name")?.addEventListener("blur", () => checkUserNameContact("add"));

document.getElementById("email")?.addEventListener("input", () => checkUserMailContact("add"));
document.getElementById("email")?.addEventListener("blur", () => checkUserMailContact("add"));

document.getElementById("phone")?.addEventListener("input", () => checkUserPhone("add"));
document.getElementById("phone")?.addEventListener("blur", () => checkUserPhone("add"));

document.getElementById("name-edit")?.addEventListener("input", () => checkUserNameContact("edit"));
document.getElementById("name-edit")?.addEventListener("blur", () => checkUserNameContact("edit"));

document.getElementById("email-edit")?.addEventListener("input", () => checkUserMailContact("edit"));
document.getElementById("email-edit")?.addEventListener("blur", () => checkUserMailContact("edit"));

document.getElementById("phone-edit")?.addEventListener("input", () => checkUserPhone("edit"));
document.getElementById("phone-edit")?.addEventListener("blur", () => checkUserPhone("edit"));