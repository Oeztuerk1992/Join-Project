const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const newContactMessage = document.getElementById('new-contact-message');
let contacts = [];


function initContacts() {
    getUserProfile();
}

function getUserProfile() {

    if (loggedInUser === 'guest') {
        userProfile.textContent = "G";
    } else {

    const name = loggedInUser.split(" ");
    const initials = name[0][0].toUpperCase() + name[1][0].toUpperCase();
    userProfile.textContent = initials;

    }

}


function openOverlay(){
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.classList.add('open');
    }, 10);
}

function closeOverlay(){
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('open');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

function getRandomColor() {
    const colors = [];
    for (let colorIndex = 1; colorIndex <= 15; colorIndex++) colors.push(`var(--badge-color-${colorIndex})`);
    return colors[Math.floor(Math.random() * colors.length)];
}

function buildContact(name) {
    const capitalizedName = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const initials = capitalizedName.split(' ').map(w => w.charAt(0)).join('');
    return { capitalizedName, initials, email: emailInput.value.trim(), phone: phoneInput.value.trim(), randomColor: getRandomColor() };
}

function clearInputs(){
    nameInput.value = '';
    emailInput.value = '';
    phoneInput.value = '';
}

function createContact() {
    const name = nameInput.value.trim();
    if (!name || !emailInput.value.trim() || !phoneInput.value.trim()) {
        alert('Please fill in all fields.');
        return;
    }
    const exists = contacts.find(c => c.email === emailInput.value.trim());
    if (exists) {
        alert('Contact with this email already exists.');
        return;
    }
    contacts.push(buildContact(name));
    contacts.sort((a, b) => a.capitalizedName.localeCompare(b.capitalizedName));
    renderContacts();
    closeOverlay();
    clearInputs();
}

function renderContacts(){
    newContactMessage.innerHTML = '';
    let currentLetter = '';
    for(let contactIndex = 0; contactIndex < contacts.length; contactIndex++){
        const letter = contacts[contactIndex].capitalizedName.charAt(0);
        if(letter !== currentLetter){
            currentLetter = letter;
            newContactMessage.innerHTML += createLetterTemplate(letter); 
        }
        newContactMessage.innerHTML += createContactTemplate(contacts[contactIndex].capitalizedName, contacts[contactIndex].initials, contacts[contactIndex].email, contacts[contactIndex].randomColor, contacts[contactIndex].phone);
    }
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

function saveContact() {
    const index = contacts.findIndex(c => c.capitalizedName === activeContact.name);
    contacts[index].capitalizedName = document.getElementById('edit-name').value.trim();
    contacts[index].email = document.getElementById('edit-email').value.trim();
    contacts[index].phone = document.getElementById('edit-phone').value.trim();
    contacts.sort((a, b) => a.capitalizedName.localeCompare(b.capitalizedName));
    renderContacts();
    closeEditOverlay();
    const updatedName = contacts[index].capitalizedName;
    const updatedEl = document.querySelector(`[data-name="${updatedName}"]`);
    showContact(updatedEl);
}

function deleteContact() {
    const index = contacts.findIndex(c => c.capitalizedName === activeContact.name);
    contacts.splice(index, 1);
    document.querySelector('.contact-detail-panel').innerHTML = '';
    activeContact = null;
    renderContacts();
}