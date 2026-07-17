// Sign-up form //

function checkFormDataSignup(event) {
    event.preventDefault();

    const isValid =
        checkUserName() &&
        checkUserMail() &&
        checkUserPw() &&
        checkUserPwConfirm() &&
        checkPrivacyPolicy();

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
    const info = document.getElementById("feedback-mail");
    const inputMail = document.getElementById("input-signup-mail");

    if (
        mailUser.value.includes("@") &&
        !mailUser.value.startsWith("@") &&
        !mailUser.value.endsWith("@")
    ) {
        info.classList.add("hidden");
        inputMail.classList.remove('fail-red-border');

        return true;
    }

    info.classList.remove('hidden');
    inputMail.classList.add('fail-red-border');
    return false;
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

    await prepareUserDataForPost(signUpNewUser);
    showSignupConfirmation();
}


// confirmation info shows up //

function showSignupConfirmation() {

    const confirmation = document.getElementById("signup-confirmation");

    confirmation.showModal();

    confirmation.classList.add("show");

    setTimeout(() => {
        confirmation.classList.remove("show");
        confirmation.close();
        getLoginModal();
    }, 2000);
}