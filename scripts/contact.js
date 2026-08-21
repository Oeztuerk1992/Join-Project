// Variables Add Contact //
const nameInput = document.getElementById('name');
const inputWrapperName = document.getElementById("container-input-name-contact");
const emailInput = document.getElementById('email');
const inputWrapperMail = document.getElementById("container-input-mail-contact");
const phoneInput = document.getElementById('phone');
const inputWrapperPhone = document.getElementById("container-input-phone-contact");

const infoContactAdd = document.getElementById("validation-feedback-contact-add");

// Variables Edit Contact //
const nameInputEdit = document.getElementById('name-edit');
const inputWrapperNameEdit = document.getElementById("container-input-name-contact-edit");
const emailInputEdit = document.getElementById('email-edit');
const inputWrapperMailEdit = document.getElementById("container-input-mail-contact-edit");
const phoneInputEdit = document.getElementById('phone-edit');
const inputWrapperPhoneEdit = document.getElementById("container-input-phone-contact-edit");

const overlay = document.getElementById('overlay');
const overlayEdit = document.getElementById('overlayEdit');
const infoContactEdit = document.getElementById("validation-feedback-contact-edit");


const newContactMessage = document.getElementById('new-contact-innerwrapper');
let contacts = [];
let activeContact = null;
let activeContactEl = null;

// Variables for mobile //

const btnMenu = document.getElementById('btn-for-mobile-menu');


async function initContacts() {
    getUserProfile();

    await onloadUsers();
    await loadContactsFromFirebase();

    const loggedInUserEmail =
        sessionStorage.getItem('loggedInUserEmail');

    const ownContact = contacts.find(
        contact => contact.email === loggedInUserEmail
    );

    if (ownContact) {
        sessionStorage.setItem(
            'loggedInContactId',
            ownContact.id
        );
    } else {
        sessionStorage.removeItem('loggedInContactId');
    }

    renderContacts();
    initScrollbar();
}


function openOverlay() {
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.classList.add('open');
    }, 10);
}


function closeOverlay(filterWord) {
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
    const words = capitalizedName.trim().split(/\s+/);

    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
}


function buildContact(name) {
    const capitalizedName = capitalizeName(name);
    const initials = getInitials(capitalizedName);
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    return { capitalizedName, initials, email, phone, randomColor: getRandomColor() };
}


function showContact(el, animate = true) {
    if (!el) return;

    if (activeContactEl === el && animate) return;

    if (window.innerWidth <= 664) {
        const actionsMenu = document.getElementById('contact-actions');

        if (actionsMenu) {
            actionsMenu.style.display = 'none';
        }

        if (btnMenu) {
            btnMenu.style.display = 'block';
        }
    }

    if (activeContactEl && activeContactEl !== el) {
        activeContactEl.classList.remove('active');
    }

    activeContactEl = el;
    el.classList.add('active');
    activeContact = el.dataset;

     if (window.innerWidth <= 664) {
        document.querySelector('.new-contact-wrapper').style.display = 'none';
        document.querySelector('.contact-info').style.display = 'flex';
    }

    const panel = document.querySelector('.contact-detail-panel');

    if (animate && window.innerWidth > 664) {
        panel.classList.remove('visible');

        setTimeout(() => {
            updateContactPanel();
            
            requestAnimationFrame(() => {
                panel.classList.add('visible');
            });
        }, 300);
        return;
    }
    updateContactPanel();
}

function updateContactPanel() {
    const panel = document.querySelector('.contact-detail-panel');

    panel.innerHTML = createContactDetailTemplate(
        activeContact.name,
        activeContact.initials,
        activeContact.email,
        activeContact.phone,
        activeContact.color
    );
    restoreActiveContact();
}


function restoreActiveContact() {
    if (!activeContact?.id) return;

    const element = document.querySelector(`[data-id="${activeContact.id}"]`);
    if (!element) return;

    activeContactEl = element;
    activeContactEl.classList.add('active');
}


function goBackContacts() {
    document.querySelector('.new-contact-wrapper').style.display = 'flex';
    document.querySelector('.contact-info').style.display = 'none';

    // remove active state
    if (activeContactEl) {
        activeContactEl.classList.remove('active');
    }

    activeContactEl = null;
    activeContact = null;

    document.querySelector('.contact-detail-panel').innerHTML = '';

    const actionsMenu = document.getElementById('contact-actions');

    if (actionsMenu) {
        actionsMenu.style.display = 'none';
    }

    if (btnMenu) {
        btnMenu.style.display = 'block';
    }
}


function clearInputs() {
    document.getElementById('form-for-contact').reset();
}


function clearValidationRemarks(filterWord) {
    const {
        inputWrapperName,
        inputWrapperMail,
        inputWrapperPhone,
        infoContact
    } = getFormRefs(filterWord);

    inputWrapperName.classList.remove("fail-red-border");
    inputWrapperMail.classList.remove("fail-red-border");
    inputWrapperPhone.classList.remove("fail-red-border");
    infoContact.classList.add("hidden-feedback");
}


function sortContacts() {
    contacts.sort((a, b) => a.capitalizedName.localeCompare(b.capitalizedName));
}


function renderContacts() {
    const newContactMessage = document.getElementById('new-contact-innerwrapper');

    if (!newContactMessage) return;

    newContactMessage.innerHTML = '';

    if (contacts.length === 0) {
        newContactMessage.innerHTML = generateNoContactsHTML();
        return;
    }

    let currentLetter = '';

    for (let contactIndex = 0; contactIndex < contacts.length; contactIndex++) {
        const contact = contacts[contactIndex];
        currentLetter = renderLetterIfNew(contact, currentLetter);
        newContactMessage.innerHTML += buildContactHtml(contact);
    }

    initScrollbar();
}


function scrollToTop() {
    const container = document.querySelector('.new-contact');

    container.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function scrollToBottom() {
    const container = document.querySelector('.new-contact');

    container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
    });
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
    hasTriedSubmit = false;
    document.getElementById('name-edit').value = activeContact.name;
    document.getElementById('email-edit').value = activeContact.email;
    document.getElementById('phone-edit').value = activeContact.phone;
    const avatar = document.getElementById('edit-avatar');
    avatar.innerHTML = activeContact.initials;
    avatar.style.backgroundColor = activeContact.color;
    overlayEdit.style.display = 'flex';
    setTimeout(() => overlayEdit.classList.add('open'), 10);
}


function closeContactEditOverlay(filterWord) {
    overlayEdit.classList.remove('open');
    clearValidationRemarks(filterWord);

    setTimeout(() => overlayEdit.style.display = 'none', 300);
}


function readEditInputs() {
    const capitalizedName = capitalizeName(
        nameInputEdit.value.trim()
    );

    const initials = getInitials(capitalizedName);
    const email = emailInputEdit.value.trim();
    const phone = phoneInputEdit.value.trim();

    return {
        capitalizedName,
        initials,
        email,
        phone
    };
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


function openMobileMenuContacts(event) {
    event.stopPropagation();

    const actionsMenu = document.getElementById('contact-actions');

    if (!actionsMenu) return;

    btnMenu.style.display = 'none';
    actionsMenu.classList.add('open');
}


function closeMobileMenuContacts() {
    const actionsMenu = document.getElementById('contact-actions');

    if (!actionsMenu) return;

    actionsMenu.classList.remove('open');
    btnMenu.style.display = 'block';
}


// Event Listeners //

overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) {
        closeOverlay('add');
    }
});

overlayEdit?.addEventListener('click', (e) => {
    if (e.target === overlayEdit) {
        closeContactEditOverlay('edit');
    }
});


document.addEventListener("click", (event) => {
    const actionsMenu = document.getElementById('contact-actions');

    if (!actionsMenu) return;

    if (
        !actionsMenu.contains(event.target) &&
        !btnMenu.contains(event.target)
    ) {
        closeMobileMenuContacts();
    }
});