const createContactButton = document.getElementById('create-contact');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const newContactMessage = document.getElementById('new-contact-message');

function openOverlay(){
    document.getElementById('overlay').style.display = 'flex';
}

function closeOverlay(){
    document.getElementById('overlay').style.display = 'none';
}

function createContact(){
    const name = nameInput.value.trim();
    const capitalizedName = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const initials = capitalizedName.split(' ').map(word => word.charAt(0)).join('');
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    if(name === '' || email === '' || phone === ''){
        alert('Please fill in all fields.');
        return;
    }

    newContactMessage.innerHTML += createContactTemplate(capitalizedName, initials, email);
    closeOverlay();
    nameInput.value = '';
    emailInput.value = '';
    phoneInput.value = '';
}