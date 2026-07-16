const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const newContactMessage = document.getElementById('new-contact-message');
let contacts = [];


function initContacts() {
    getUserProfile();
}

function openOverlay(){
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.classList.add('open');
    }, 10);
}

function closeOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('open');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
}

function getRandomColor() {
    const colors = [];
    for (let colorNumber = 1; colorNumber <= 15; colorNumber++) colors.push(`var(--badge-color-${colorNumber})`);
    return colors[Math.floor(Math.random() * colors.length)];
}

function capitalizeName(name) {
    const words = name.split(' ');
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords.join(' ');
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

function clearInputs(){
    nameInput.value = '';
    emailInput.value = '';
    phoneInput.value = '';
}

function inputsAreValid() {
    if (!nameInput.value.trim() || !emailInput.value.trim() || !phoneInput.value.trim()) {
        alert('Please fill in all fields.');
        return false;
    }
    return true;
}

function emailAlreadyExists() {
    const exists = contacts.find(contact => contact.email === emailInput.value.trim());
    if (exists) {
        alert('Contact with this email already exists.');
        return true;
    }
    return false;
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
    if (!inputsAreValid()) return;
    if (emailAlreadyExists()) return;
    const newContact = buildContact(nameInput.value.trim());
    const result = await postContactToFirebase(newContact);
    newContact.id = result.name;
    contacts.push(newContact);
    sortContacts();
    renderContacts();
    closeOverlay();
    clearInputs();
}

async function loadContactsFromFirebase() {
    let response = await fetch(BASE_URL + "contacts.json");
    let data = await response.json();
    contacts = [];
    if (data) fillContactsList(data);
    sortContacts();
    renderContacts();
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

function renderContacts(){
    newContactMessage.innerHTML = '';
    let currentLetter = '';
    for (let contactIndex = 0; contactIndex < contacts.length; contactIndex++) {
        const contact = contacts[contactIndex];
        currentLetter = renderLetterIfNew(contact, currentLetter);
        newContactMessage.innerHTML += buildContactHtml(contact);
    }
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
    document.getElementById('edit-name').value = activeContact.name;
    document.getElementById('edit-email').value = activeContact.email;
    document.getElementById('edit-phone').value = activeContact.phone;
    const overlay = document.getElementById('overlayEdit');
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('open'), 10);
}

function closeEditOverlay() {
    const overlay = document.getElementById('overlayEdit');
    overlay.classList.remove('open');
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
    const newName = document.getElementById('edit-name').value.trim();
    const initials = getInitials(newName);
    const email = document.getElementById('edit-email').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    return { capitalizedName: newName, initials, email, phone };
}

async function saveContact() {
    const id = activeContact.id;
    const index = contacts.findIndex(contact => contact.id === id);
    const edited = readEditInputs();
    edited.randomColor = contacts[index].randomColor;
    contacts[index] = { ...edited, id };
    await putContactToFirebase(id, edited);
    sortContacts();
    renderContacts();
    closeEditOverlay();
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
    document.querySelector('.contact-detail-panel').innerHTML = '';
    closeEditOverlay();
    activeContact = null;
    activeContactEl = null;
    renderContacts();
}

loadContactsFromFirebase();