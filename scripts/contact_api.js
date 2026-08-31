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


async function deleteContactFromFirebase(id) {
    await fetch(BASE_URL + "contacts/" + id + ".json", {
        method: "DELETE"
    });
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


async function createContact() {

    const newContact = buildContact(nameInput.value.trim());
    newContact.phone = formatPhoneNumber(newContact.phone);

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

            const newContactElement = document.querySelector(`[data-id="${newContact.id}"]`);
            showContact(newContactElement);

                setTimeout(() => {
                    newContactElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 50);
    }, 2000);

}



async function saveContact() {
    const id = activeContact.id;
    const index = contacts.findIndex(contact => contact.id === id);

    const oldContact = { ...contacts[index] };

    const edited = readEditInputs();
    edited.phone = formatPhoneNumber(edited.phone);
    edited.randomColor = contacts[index].randomColor;

    contacts[index] = { ...edited, id };

    sortContacts();
    renderContacts();

    const contactEl = document.querySelector(`[data-id="${id}"]`);
    activeContact = contactEl.dataset;
    activeContactEl = contactEl;
    contactEl.classList.add('active');

    closeContactEditOverlay('edit');
    updateContactPanel(false);

    try {
        await putContactToFirebase(id, edited);
        await syncUserDataFromContact(oldContact, edited);
        checkAfterUpdateContact(id, edited);
        await loadTasks();
        await updateContactInTasks(id, edited);
    } catch (err) {
        console.error('Sync nach Contact-Update fehlgeschlagen:', err);
    }
}


function checkAfterUpdateContact(id, edited) {
    const loggedInContactId =
        sessionStorage.getItem('loggedInContactId');

    if (id === loggedInContactId) {
        sessionStorage.setItem(
            'loggedInUser',
            edited.capitalizedName
        );

        sessionStorage.setItem(
            'loggedInUserEmail',
            edited.email
        );

        getUserProfile();
    }
}


async function syncUserDataFromContact(oldContact, newContact) {
    const response = await fetch(BASE_URL + "user.json");
    const users = await response.json();

    if (!users) return;

    const userKey = Object.keys(users).find(
        key => users[key].mail === oldContact.email
    );

    // Contact is not linked to a registered user
    if (!userKey) return;

    const nameParts = newContact.capitalizedName.trim().split(/\s+/);

    const updatedUser = {
        ...users[userKey],
        firstName: nameParts.slice(0, -1).join(" "),
        lastName: nameParts[nameParts.length - 1],
        mail: newContact.email
    };

    await fetch(`${BASE_URL}user/${userKey}.json`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedUser)
    });
}


async function deleteContact() {
    const loggedInContactId =
        sessionStorage.getItem('loggedInContactId');

    const id = activeContact.id;

    if (id === loggedInContactId) {
        showDialogDelete();
        return;
    }

    const index = contacts.findIndex(
        contact => contact.id === id
    );

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

    // Mobile view
    if (window.innerWidth <= 992) {
        document.querySelector('.new-contact-wrapper').style.display = 'flex';
        document.querySelector('.contact-info').style.display = 'none';
    }
}