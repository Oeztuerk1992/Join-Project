// Login form //

// load all user and create an array -> registeredUser //

async function onloadUsers() {
    let userResponse = await getAllUsers("user");
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

function checkFormDataLogin(event) {
    event.preventDefault();

    const user = checkDataLogin();
    
    if (user) {
        loginMail.value = "";
        loginPw.value = "";
        getToSummary(`${user.firstName} ${user.lastName}`);
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
            info.classList.add("hidden");

            mailGroup.classList.remove("fail-red-border");
            passwordGroup.classList.remove("fail-red-border");

            return registeredUser[index];
        }
    }
    info.classList.remove('hidden');

    mailGroup.classList.add("fail-red-border");
    passwordGroup.classList.add("fail-red-border");

    return null;
}