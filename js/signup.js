// Sign-up form //

const info = document.getElementById("feedback-mail");
const inputMail = document.getElementById("input-signup-mail");


function checkFormDataSignup(event) {
    event.preventDefault();

    const isNameValid = checkUserName();
    const isMailValid = checkUserMail();
    const isPwValid = checkUserPw();
    const isPwConfirmValid = checkUserPwConfirm();
    const isPrivacyValid = checkPrivacyPolicy();
        
    const isValid = isNameValid && isMailValid && isPwValid && isPwConfirmValid && isPrivacyValid;

    if (isValid) {
        registerNewUser();
    }

    return false;
}

function checkUserName() {
    const info = document.getElementById("feedback-name");
    const inputName = document.getElementById("input-signup-name");

    const value = nameUser.value.trim();
    const wordCount = value ? value.split(/\s+/).length : 0;

    if (wordCount >= 2) {
        info.classList.add("hidden");
        inputName.classList.remove('fail-red-border');

        return true;
    }
    info.classList.remove('hidden');
    inputName.classList.add('fail-red-border');
    return false;
}

function checkUserMail() {
    const email = mailUser.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        info.classList.remove("hidden");
        inputMail.classList.add("fail-red-border");
        info.textContent = "Please enter your email address in a valid format."
        return false;
    }
    if (!emailAlreadyExists()) {
        return false;
    }

    info.classList.add("hidden");
    inputMail.classList.remove("fail-red-border");
    return true;
}

function emailAlreadyExists() {
    const mailExistsContact = contacts.some(contact => contact.email === mailUser.value.trim());
    const mailExistsUser = registeredUser.some(user => user.mail === mailUser.value.trim());

    if (mailExistsContact || mailExistsUser) {
        info.classList.remove('hidden');
        info.textContent = 'This email address is already taken.';
        inputMail.classList.add('fail-red-border');
        return false;
    }
    info.classList.add('hidden');
    inputMail.classList.remove('fail-red-border');
    return true;
}

function checkUserPw() {
    const info = document.getElementById("feedback-pw");
    const inputPw = document.getElementById("input-signup-pw");

    if (pwUser.value.trim().length >= 7) {
        info.classList.add("hidden");
        inputPw.classList.remove('fail-red-border');

        return true;
    }

    info.classList.remove('hidden');
    inputPw.classList.add('fail-red-border');
    return false;
}

function checkUserPwConfirm() {
    const info = document.getElementById("pw-info");
    const inputPwConf = document.getElementById("input-signup-confirm-pw");

    if (checkPw.value === pwUser.value) {
        info.classList.add("hidden");
        inputPwConf.classList.remove('fail-red-border');

        return true;
    }

    info.classList.remove('hidden');
    inputPwConf.classList.add('fail-red-border');
    return false;
}

function checkPrivacyPolicy() {
    const info = document.getElementById("privacy-policy-info");

    if (privacyPolicy.checked) {
        info.classList.add("hidden");
        return true;
    }

    info.classList.remove("hidden");
    return false;
}

async function registerNewUser() {
    const capitalize = (str) => {
        const lower = str.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    };

    const fullName = document.getElementById('signup-name').value.trim();
    const nameParts = fullName.split(/\s+/);

    const lastName = capitalize(nameParts.pop());
    const firstName = nameParts.map(capitalize).join(' ');

    signUpNewUser.push({
        name: {
            firstName,
            lastName,
        },
        mail: document.getElementById('signup-mail').value,
        password: document.getElementById('signup-pw').value
    });

    const email = document.getElementById('signup-mail').value;
    await prepareUserDataForPost(signUpNewUser);
    await createContactFromUser(fullName, email);
    
    showConfirmation();
}

// create contact-object for registered user //

async function createContactFromUser(fullName, email) {

    const capitalizedName = capitalizeName(fullName);
    const initials = getInitials(capitalizedName);

    const contact = {
        capitalizedName,
        initials,
        email,
        phone: "",
        randomColor: getRandomColor()
    };

    await fetch(BASE_URL + "contacts.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(contact)
    });
}




// confirmation info shows up //

function showConfirmation() {

    const confirmation = document.getElementById("confirmation-dialog");

    confirmation.showModal();

    confirmation.classList.add("show");

    setTimeout(() => {
        confirmation.classList.remove("show");
        confirmation.close();
        getLoginModal();
    }, 2000);
}

// Event Listeners //

document.getElementById("signup-name")?.addEventListener("input", checkUserName);

document.getElementById("input-signup-mail")?.addEventListener("input", checkUserMail);

document.getElementById("privacy-policy")?.addEventListener("change", checkPrivacyPolicy);