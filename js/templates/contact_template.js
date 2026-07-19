function createContactTemplate(capitalizedName, initials, email, randomColor, phone, id) {
    return `
    <div class="alphabet-divider"></div>
    <div class="contact-item"
        data-id="${id}"
        data-name="${capitalizedName}"
        data-initials="${initials}"
        data-email="${email}"
        data-phone="${phone}"
        data-color="${randomColor}"
        onclick="showContact(this)">
        <div class="contact-badge" style="background-color: ${randomColor}">${initials}</div>
        <div class="contact-name-email">
            <span class="name">${capitalizedName}</span>
            <span class="email">${email}</span>
        </div>
    </div>
    `;
}

function createLetterTemplate(letter) {
    return `<div class="alphabet-letter">${letter}</div>`;
}

function createContactDetailTemplate(name, initials, email, phone, color) {
    return `
        <div class="contact-detail-header">
            <div class="contact-detail-badge" style="background-color: ${color}">${initials}</div>
            <div class="contact-detail-name">
                <span class="nameUser">${name}</span>
                <div class="contact-detail-actions">
                    <span class="edit" onclick="openEditOverlay()">
                        <img src="../assets/icons/contact/edit.png" alt="edit">
                    </span>
                    <span class="delete" onclick="deleteContact()">
                        <img src="../assets/icons/contact/delete.png" alt="delete">
                    </span>
                </div>
            </div>
        </div>
        <div class="contact-detail-info">
            <p class="contact-label">Contact Information</p>
            <p class="label">Email</p>
            <p class="email">${email}</p>
            <p class="label">Phone</p>
            <p class="phone">${phone}</p>
        </div>
    `;
}