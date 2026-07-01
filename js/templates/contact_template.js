function createContactTemplate(capitalizedName, initials, email) {
    return `
            <div class="contact-list" id="new-contact-message">
                <span class="alphabet-letter">${capitalizedName.charAt(0)}</span>
                <div class="alphabet-divider"></div>
                <div class="contact-item">
                    <div class="contact-badge">${initials}</div>
                    <div class="contact-name-email">
                        <span class="name">${capitalizedName}</span>
                        <span class="email">${email}</span>
                    </div>
                </div>
            </div>
    `;
}
