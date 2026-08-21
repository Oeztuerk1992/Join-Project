// Sign-up form //

const info = document.getElementById("validation-feedback");
const inputMail = document.getElementById("input-signup-mail");


function checkFormDataSignup(event) {
    event.preventDefault();

    const isNameValid = checkUserName();
    const isMailValid = checkUserMail();
    const isPwValid = checkUserPw();
    const isPwConfirmValid = checkUserPwConfirm();

    if (!isNameValid || !isMailValid || !isPwValid) {
        info.classList.remove("hidden-feedback");
        info.textContent = "Please check all inputs and correct any errors.";
        return false;
    }

    if (!isPwConfirmValid) {
        info.classList.remove("hidden-feedback");
        info.textContent = "Your passwords don't match. Please try again.";
        return false;
    }

    const isPrivacyValid = checkPrivacyPolicy();

    if (!isPrivacyValid) {
        info.classList.remove("hidden-feedback");
        info.textContent = "Please accept the Privacy Policy before proceeding.";
        return false;
    }

    registerNewUser();
    return true;
}

function checkUserName() {
    const inputName = document.getElementById("input-signup-name");

    const value = nameUser.value.trim();
    const wordCount = value ? value.split(/\s+/).length : 0;

    if (wordCount >= 2) {
        info.classList.add("hidden-feedback");
        inputName.classList.remove('fail-red-border');

        return true;
    }
    info.classList.remove('hidden-feedback');
    inputName.classList.add('fail-red-border');
    info.textContent = "Please enter both your first and last name.";
    return false;
}

function checkUserMail() {
    mailUser.value = mailUser.value.trim().toLowerCase();
    const email = mailUser.value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        info.classList.remove("hidden-feedback");
        inputMail.classList.add("fail-red-border");
        info.textContent = "Please enter your email address in a valid format.";
        return false;
    }
    if (!emailAlreadyExists()) {
        return false;
    }

    info.classList.add("hidden-feedback");
    inputMail.classList.remove("fail-red-border");
    return true;
}

function emailAlreadyExists() {
    const mailExistsContact = contacts.some(contact => contact.email === mailUser.value.trim());
    const mailExistsUser = registeredUser.some(user => user.mail === mailUser.value.trim());

    if (mailExistsContact || mailExistsUser) {
        info.classList.remove('hidden-feedback');
        info.textContent = 'This email address is already taken.';
        inputMail.classList.add('fail-red-border');
        return false;
    }
    info.classList.add('hidden-feedback');
    inputMail.classList.remove('fail-red-border');
    return true;
}


function checkUserPw() {
    const inputPw = document.getElementById("input-signup-pw");

    if (pwUser.value.trim().length >= 7) {
        info.classList.add("hidden-feedback");
        inputPw.classList.remove('fail-red-border');

        return true;
    }

    info.classList.remove('hidden-feedback');
    inputPw.classList.add('fail-red-border');
    info.textContent = "Please enter a valid password: at least 7 characters.";
    return false;
}


function checkUserPwConfirm() {
    const inputPwConf = document.getElementById("input-signup-confirm-pw");

    if (checkPw.value.trim() !== "" && checkPw.value === pwUser.value) {
        info.classList.add("hidden-feedback");
        inputPwConf.classList.remove('fail-red-border');

        return true;
    }

    info.classList.remove('hidden-feedback');
    inputPwConf.classList.add('fail-red-border');
    info.textContent = "Your passwords don't match. Please try again.";
    return false;
}


function checkPrivacyPolicy() {

    if (privacyPolicy.checked) {
        info.classList.add("hidden-feedback");
        return true;
    }

    info.classList.remove("hidden-feedback");
    info.textContent = "Please accept the Privacy Policy before proceeding.";
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
    
    showConfirmationSignup();
}


// create contact-object for registered user //

async function createContactFromUser(fullName, email, userId) {

    const capitalizedName = capitalizeName(fullName);
    const initials = getInitials(capitalizedName);

    const contact = {
        userId,
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

function showConfirmationSignup() {

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
document.getElementById("signup-name")?.addEventListener("blur", checkUserName);

document.getElementById("input-signup-mail")?.addEventListener("input", checkUserMail);
document.getElementById("input-signup-mail")?.addEventListener("blur", checkUserMail);

document.getElementById("input-signup-pw")?.addEventListener("input", checkUserPw);
document.getElementById("input-signup-pw")?.addEventListener("blur", checkUserPw);

document.getElementById("privacy-policy")?.addEventListener("change", checkPrivacyPolicy);
