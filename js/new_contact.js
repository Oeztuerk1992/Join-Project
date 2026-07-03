const createContactButton = document.getElementById('create-contact');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const newContactMessage = document.getElementById('new-contact-message');
const contactDetailEmail = document.querySelector('.contact-detail-email');
let contacts = [];

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
    const colors = [];
    for (let i = 1; i <= 15; i++){
        colors.push(`var(--badge-color-${i})`);
    }
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    contacts.push({capitalizedName, initials, email, randomColor, phone});
    contacts.sort((a, b) => a.capitalizedName.localeCompare(b.capitalizedName));
    renderContacts();
    closeOverlay();
    nameInput.value = '';
    emailInput.value = '';
    phoneInput.value = '';
}

function renderContacts(){
    newContactMessage.innerHTML = '';
    let currentLetter = '';

    for(let i=0; i < contacts.length; i++){
        const letter = contacts[i].capitalizedName.charAt(0);
        if(letter !== currentLetter){
            currentLetter = letter;
            newContactMessage.innerHTML += createLetterTemplate(letter); 
        }
        newContactMessage.innerHTML += createContactTemplate(contacts[i].capitalizedName, contacts[i].initials, contacts[i].email, contacts[i].randomColor, contacts[i].phone);
    }
}