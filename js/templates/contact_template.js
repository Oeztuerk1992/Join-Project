function createContactTemplate(capitalizedName, initials, email, randomColor , phone) {
    return `
    <div class="alphabet-divider"></div>
            <div class="contact-item" onclick="showContact('${capitalizedName}', '${initials}', '${email}', '${phone}', '${randomColor}')">
                <div class="contact-badge" style="background-color: ${randomColor}">${initials}</div>
                <div class="contact-name-email">
                    <span class="name">${capitalizedName}</span>
                    <span class="email">${email}</span>
                </div>
            </div>
    `;
}

function createLetterTemplate(letter) {
    return `
    <div class="alphabet-letter">${letter}</div>
    `;
}

function showContact(capitalizedName, initials, email, phone, randomColor){
    document.querySelector('.contact-detail-panel').innerHTML = `
        <div class="contact-detail-header">
            <div class="contact-detail-badge" style="background-color: ${randomColor}">${initials}</div>
            <div class="contact-detail-name">
                <span class="nameUser">${capitalizedName}</span>
                <div class="contact-detail-actions">
                    <span>Edit</span>
                    <span>Delete</span>
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