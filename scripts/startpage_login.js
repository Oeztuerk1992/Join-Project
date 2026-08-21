// Login form //

// load all user and create an array -> registeredUser //

async function onloadUsers() {
    let userResponse = await getAllUsers("user");
    if (!userResponse) return;
    let userKeysArray = Object.keys(userResponse);

    for (let index = 0; index < userKeysArray.length; index++) {
        registeredUser.push(
            userResponse[userKeysArray[index]]
        );
    }
}

async function getAllUsers(path) {
    let response = await fetch(BASE_URL + path + ".json");
    return responseToJson = await response.json();
}

// check login input //

async function checkFormDataLogin(event) {
    event.preventDefault();

    const user = checkDataLogin();

    if (user) {

        const ownContact = contacts.find(
            contact => contact.email === user.mail
        );

        if (ownContact) {
            sessionStorage.setItem(
                'loggedInContactId',
                ownContact.id
            );
        }

        loginMail.value = "";
        loginPw.value = "";

        getToSummary(
            `${user.firstName} ${user.lastName}`,
            user.mail
        );
    }

    return false;
}

function checkDataLogin() {
    const info = document.getElementById("feedback-login");

    const mailGroup = document.getElementById("login-mail-group");
    const passwordGroup = document.getElementById("login-password-group");

    for (let index = 0; index < registeredUser.length; index++) {

        if (
            loginMail.value === registeredUser[index].mail &&
            loginPw.value === registeredUser[index].password
        ) {
            info.classList.add("hidden-feedback");

            mailGroup.classList.remove("fail-red-border");
            passwordGroup.classList.remove("fail-red-border");

            return registeredUser[index];
        }
    }
    info.classList.remove('hidden-feedback');

    mailGroup.classList.add("fail-red-border");
    passwordGroup.classList.add("fail-red-border");

    return null;
}