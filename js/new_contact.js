// Variables Add Contact //
const nameInput = document.getElementById('name');
const infoName = document.getElementById("feedback-name-contact");
const inputWrapperName = document.getElementById("container-input-name-contact");

const emailInput = document.getElementById('email');
const infoMail = document.getElementById("feedback-mail-contact");
const inputWrapperMail = document.getElementById("container-input-mail-contact");

const phoneInput = document.getElementById('phone');
const infoPhone = document.getElementById("feedback-phone-contact");
const inputWrapperPhone = document.getElementById("container-input-phone-contact");

// Variables Edit Contact //
const nameInputEdit = document.getElementById('name-edit');
const infoNameEdit = document.getElementById("feedback-name-contact-edit");
const inputWrapperNameEdit = document.getElementById("container-input-name-contact-edit");

const emailInputEdit = document.getElementById('email-edit');
const infoMailEdit = document.getElementById("feedback-mail-contact-edit");
const inputWrapperMailEdit = document.getElementById("container-input-mail-contact-edit");

const phoneInputEdit = document.getElementById('phone-edit');
const infoPhoneEdit = document.getElementById("feedback-phone-contact-edit");
const inputWrapperPhoneEdit = document.getElementById("container-input-phone-contact-edit");


const newContactMessage = document.getElementById('new-contact-message');
let contacts = [];
let activeContact = null;
let activeContactEl = null;


async function initContacts() {
    getUserProfile();

    await onloadUsers();
    await loadContactsFromFirebase();
    renderContacts();

    initScrollbar();
}

function openOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.classList.add('open');
    }, 10);
}

function closeOverlay(filterWord) {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('open');

    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);

    clearInputs();
    clearValidationRemarks(filterWord);
}

function getRandomColor() {
    const colors = [];
    for (let colorNumber = 1; colorNumber <= 15; colorNumber++) colors.push(`var(--badge-color-${colorNumber})`);
    return colors[Math.floor(Math.random() * colors.length)];
}

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

function getInitials(capitalizedName) {
    const words = capitalizedName.split(' ');
    const firstLetters = words.map(word => word.charAt(0));
    return firstLetters.join('');
}

function buildContact(name) {
    const capitalizedName = capitalizeName(name);
    const initials = getInitials(capitalizedName);
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    return { capitalizedName, initials, email, phone, randomColor: getRandomColor() };
}

function showContact(el) {
    if (!el) return;

    if (activeContact) {
        activeContactEl.classList.remove('active');
    }

    activeContactEl = el;
    el.classList.add('active');
    activeContact = el.dataset;

    const panel = document.querySelector('.contact-detail-panel');
    panel.classList.remove('visible');

    setTimeout(function () {
        panel.innerHTML = createContactDetailTemplate(
            activeContact.name,
            activeContact.initials,
            activeContact.email,
            activeContact.phone,
            activeContact.color
        );
        setTimeout(function () {
            panel.classList.add('visible');
        }, 10);
    }, 200);
}

function clearInputs() {

    document.getElementById('form-for-contact').reset();
}

function clearValidationRemarks(filterWord) {
    const {
        infoName,
        inputWrapperName,
        infoMail,
        inputWrapperMail,
        infoPhone,
        inputWrapperPhone
    } = getFormRefs(filterWord);

    infoName.classList.add("hidden");
    inputWrapperName.classList.remove("fail-red-border");

    infoMail.classList.add("hidden");
    inputWrapperMail.classList.remove("fail-red-border");

    infoPhone.classList.add("hidden");
    inputWrapperPhone.classList.remove("fail-red-border");
}

async function postContactToFirebase(contact) {
    let response = await fetch(BASE_URL + "contacts.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(contact)
    });
    return await response.json();
}

async function createContact() {

    const newContact = buildContact(nameInput.value.trim());
    const result = await postContactToFirebase(newContact);
    newContact.id = result.name;
    contacts.push(newContact);
    sortContacts();
    renderContacts();
    showConfirmation();

    const overlay = document.getElementById('overlay');
    setTimeout(() => {
        overlay.style.display = 'none';
        clearInputs();
        clearValidationRemarks('add');
    }, 2000);
}

async function loadContactsFromFirebase() {
    let response = await fetch(BASE_URL + "contacts.json");
    let data = await response.json();

    contacts = [];

    if (data) fillContactsList(data);

    sortContacts();
}

function fillContactsList(data) {
    const keys = Object.keys(data);
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        const contact = data[keys[keyIndex]];
        contact.id = keys[keyIndex];
        contacts.push(contact);
    }
}

function sortContacts() {
    contacts.sort((a, b) => a.capitalizedName.localeCompare(b.capitalizedName));
}

function renderContacts() {
    const newContactMessage = document.getElementById('new-contact-message');

    if (!newContactMessage) return;

    newContactMessage.innerHTML = '';

    let currentLetter = '';

    for (let contactIndex = 0; contactIndex < contacts.length; contactIndex++) {
        const contact = contacts[contactIndex];
        currentLetter = renderLetterIfNew(contact, currentLetter);
        newContactMessage.innerHTML += buildContactHtml(contact);
    }

    initScrollbar();
}

function scrollToTop() {
    document.querySelector('.new-contact').scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToBottom() {
    document.querySelector('.new-contact').scrollTo({ top: 99999, behavior: 'smooth' });
}

function renderLetterIfNew(contact, currentLetter) {
    const letter = contact.capitalizedName.charAt(0);
    if (letter !== currentLetter) {
        newContactMessage.innerHTML += createLetterTemplate(letter);
        return letter;
    }
    return currentLetter;
}

function buildContactHtml(contact) {
    return createContactTemplate(contact.capitalizedName, contact.initials, contact.email, contact.randomColor, contact.phone, contact.id);
}

function openEditOverlay() {
    document.getElementById('name-edit').value = activeContact.name;
    document.getElementById('email-edit').value = activeContact.email;
    document.getElementById('phone-edit').value = activeContact.phone;
    const avatar = document.getElementById('edit-avatar');
    avatar.innerHTML = activeContact.initials;
    avatar.style.backgroundColor = activeContact.color;
    const overlay = document.getElementById('overlayEdit');
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('open'), 10);
}

function closeContactEditOverlay(filterWord) {
    const overlay = document.getElementById('overlayEdit');
    overlay.classList.remove('open');
    clearValidationRemarks(filterWord);

    setTimeout(() => overlay.style.display = 'none', 300);
}

async function putContactToFirebase(id, contact) {
    let response = await fetch(BASE_URL + "contacts/" + id + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(contact)
    });
    return await response.json();
}

function readEditInputs() {
    const newName = document.getElementById('name-edit').value.trim();
    const initials = getInitials(newName);
    const email = document.getElementById('email-edit').value.trim();
    const phone = document.getElementById('phone-edit').value.trim();
    return { capitalizedName: newName, initials, email, phone };
}

async function saveContact() {
    const id = activeContact.id;
    const index = contacts.findIndex(contact => contact.id === id);
    const edited = readEditInputs();
    edited.randomColor = contacts[index].randomColor;
    contacts[index] = { ...edited, id };
    await putContactToFirebase(id, edited);

    await loadTasks();
    await updateContactInTasks(id, edited);
    await loadTasks();

    sortContacts();
    renderContacts();
    closeContactEditOverlay('edit');
    showContact(document.querySelector(`[data-id="${id}"]`));
}

async function deleteContactFromFirebase(id) {
    await fetch(BASE_URL + "contacts/" + id + ".json", {
        method: "DELETE"
    });
}

async function deleteContact() {
    const id = activeContact.id;
    const index = contacts.findIndex(contact => contact.id === id);

    await deleteContactFromFirebase(id);
    contacts.splice(index, 1);

    await loadContactsFromFirebase();
    await loadTasks();
    await removeDeletedContactFromTasks(id);

    document.querySelector('.contact-detail-panel').innerHTML = '';
    closeContactEditOverlay('edit');
    activeContact = null;
    activeContactEl = null;
    renderContacts();
}

function initScrollbar() {
    const liste = document.querySelector('.new-contact');
    const thumb = document.querySelector('.custom-thumb');
    const leiste = document.querySelector('.custom-scrollbar');

    thumb.style.height = '56px';
    liste.removeEventListener('scroll', updateScrollbar);
    liste.addEventListener('scroll', updateScrollbar);
}

function updateScrollbar() {
    const liste = document.querySelector('.new-contact');
    const thumb = document.querySelector('.custom-thumb');
    const leiste = document.querySelector('.custom-scrollbar');

    const scrollProzent = liste.scrollTop / (liste.scrollHeight - liste.clientHeight);
    const thumbPosition = scrollProzent * (leiste.clientHeight - 56);
    thumb.style.top = thumbPosition + 'px';
}

// Form validation

function getFormRefs(filterWord) {
    return filterWord === "add"
        ? {
            nameInput,
            infoName,
            inputWrapperName,
            emailInput,
            infoMail,
            inputWrapperMail,
            phoneInput,
            infoPhone,
            inputWrapperPhone
        }
        : {
            nameInput: nameInputEdit,
            infoName: infoNameEdit,
            inputWrapperName: inputWrapperNameEdit,
            emailInput: emailInputEdit,
            infoMail: infoMailEdit,
            inputWrapperMail: inputWrapperMailEdit,
            phoneInput: phoneInputEdit,
            infoPhone: infoPhoneEdit,
            inputWrapperPhone: inputWrapperPhoneEdit
        };
}

function checkFormDataContactOverlay(event, filterWord) {
    event.preventDefault();

    const isNameValid = checkUserNameContact(filterWord);
    const isMailValid = checkUserMailContact(filterWord);
    const isPhoneValid = checkUserPhone(filterWord);

    const isValid = isNameValid && isMailValid && isPhoneValid;

    if (isValid) {
        if (filterWord === 'add') {
            createContact();
        } else {
            saveContact();
        }
    }

    return false;
}

function checkUserNameContact(filterWord) {
    const { nameInput, infoName, inputWrapperName } = getFormRefs(filterWord);

    const value = nameInput.value.trim();
    const wordCount = value ? value.split(/\s+/).length : 0;

    if (wordCount >= 2) {
        infoName.classList.add("hidden");
        inputWrapperName.classList.remove("fail-red-border");
        return true;
    }

    infoName.classList.remove("hidden");
    inputWrapperName.classList.add("fail-red-border");
    return false;
}

function checkUserMailContact(filterWord) {
    const { emailInput, infoMail, inputWrapperMail } = getFormRefs(filterWord);

    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        infoMail.classList.remove("hidden");
        inputWrapperMail.classList.add("fail-red-border");
        infoMail.textContent = "Please enter your email address in a valid format."
        return false;
    }
    if (!emailAlreadyExistsContact(filterWord)) {
        return false;
    }

    infoMail.classList.add("hidden");
    inputWrapperMail.classList.remove("fail-red-border");
    return true;
}

function emailAlreadyExistsContact(filterWord) {
    const { emailInput, infoMail, inputWrapperMail } = getFormRefs(filterWord);

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
        infoMail.classList.remove("hidden");
        infoMail.textContent = "This email address is already taken.";
        inputWrapperMail.classList.add("fail-red-border");
        return false;
    }

    infoMail.classList.add("hidden");
    inputWrapperMail.classList.remove("fail-red-border");
    return true;
}

function checkUserPhone(filterWord) {
    const { phoneInput, infoPhone, inputWrapperPhone } = getFormRefs(filterWord);
    const phone = phoneInput.value.trim();

    if (phone.length < 11) {
        infoPhone.classList.remove("hidden");
        infoPhone.textContent = "Phone number must contain at least 11 characters.";
        inputWrapperPhone.classList.add("fail-red-border");
        return false;
    }

    const phoneRegex = /^\+\d{1,4}[\s\d-]{4,}$/;

    if (phoneRegex.test(phone)) {
        infoPhone.classList.add("hidden");
        inputWrapperPhone.classList.remove("fail-red-border");
        return true;
    }

    infoPhone.classList.remove("hidden");
    infoPhone.textContent = "Please enter a valid phone number (+XX XX...).";
    inputWrapperPhone.classList.add("fail-red-border");
    return false;
}

// after deleting contacts, update of tasks //

async function removeDeletedContactFromTasks(contactId) {
    for (const task of tasks) {

        if (!Array.isArray(task.assignedTo)) continue;

        const filtered = task.assignedTo.filter(
            contact => contact.id !== contactId
        );

        if (filtered.length !== task.assignedTo.length) {
            await fetch(`${BASE_URL}/tasks/-${task.id}/assignedTo.json`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(filtered)
            });
        }
    }
}

async function updateContactInTasks(contactId, editedContact) {

    for (const task of tasks) {

        if (!Array.isArray(task.assignedTo)) continue;

        let changed = false;

        const updatedAssignments = task.assignedTo.map(contact => {
                        
            if (contact.id === contactId) {

                changed = true;

                return {
                    ...contact,
                    name: editedContact.capitalizedName
                };
            }

            return contact;
        });

        if (changed) {

            await fetch(
                `${BASE_URL}/tasks/-${task.id}/assignedTo.json`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedAssignments)
                }
            );
        }
    }
}



// Event Listeners //

const overlay = document.getElementById('overlay');
overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
        closeOverlay('add');
    }
});

const overlayEdit = document.getElementById('overlayEdit');
overlayEdit.addEventListener('click', function (e) {
    if (e.target === overlayEdit) {
        closeContactEditOverlay('edit');
    }
});

document.getElementById("name")?.addEventListener("input", () => checkUserNameContact("add"));

document.getElementById("email")?.addEventListener("input", () => checkUserMailContact("add"));

document.getElementById("phone")?.addEventListener("input", () => checkUserPhone("add"));

document.getElementById("name-edit")?.addEventListener("input", () => checkUserNameContact("edit"));

document.getElementById("email-edit")?.addEventListener("input", () => checkUserMailContact("edit"));

document.getElementById("phone-edit")?.addEventListener("input", () => checkUserPhone("edit"));
