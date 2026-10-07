const BASE_URL = "https://remotestoragejoin-8faac-default-rtdb.europe-west1.firebasedatabase.app/";


/**
 * Loads all registered users from the backend into "registeredUser";
 * does nothing if no data is returned.
 *
 * @returns {Promise<void>}
 */
async function onloadUsers() {
        let userResponse = await getAllUsers("user");
        if (!userResponse) return;  
        registeredUser.length = 0;
        let userKeysArray = Object.keys(userResponse);
    
        for (let index = 0; index < userKeysArray.length; index++) {
            registeredUser.push(
                userResponse[userKeysArray[index]]
            );
        }
}
 
 
/**
 * Fetches raw data from a given path in the Firebase database.
 *
 * @param {string} path - The Firebase path segment to fetch (without ".json"), e.g. "user".
 * @returns {Promise<Object|null>} The parsed JSON response, or null if the path has no data.
 */
async function getAllUsers(path) {
    let response = await fetch(BASE_URL + path + ".json");
    return responseToJson = await response.json();
}
 
 
/**
 * Validates the login on submit; on success links the matching contact, clears the inputs and opens the summary.
 *
 * @param {SubmitEvent} event - The form submit event.
 * @returns {Promise<boolean>} Always false, to prevent native form submission.
 */
async function checkFormDataLogin(event) {
    event.preventDefault();
    const user = checkDataLogin();
    if (user) {
        await loadContactsFromFirebase();
        const ownContact = contacts.find(contact => contact.email === user.mail);
        if (ownContact) sessionStorage.setItem('loggedInContactId', ownContact.id);
        loginMail.value = "";
        loginPw.value = "";
        getToSummary(`${user.firstName} ${user.lastName}`, user.mail);
    }
    return false;
}
 
 
/**
 * Checks whether the entered login credentials match a registered user.
 *
 * @returns {Object|null} The matching user object or null if the login
 *                        data is invalid.
 */
function checkDataLogin() {
    for (let index = 0; index < registeredUser.length; index++) {
        const user = registeredUser[index];
        if (loginMail.value === user.mail && loginPw.value === user.password) {
            document.getElementById("feedback-login").classList.add("hidden-feedback");
            return user;
        }
    }
    showLoginError();
    return null;
}


/**
 * Displays login validation feedback and applies error styling.
 *
 * @returns {void}
 */
function showLoginError() {
    const info = document.getElementById("feedback-login");
    const mailGroup = document.getElementById("login-mail-group");
    const passwordGroup = document.getElementById("login-password-group");
    info.classList.remove("hidden-feedback");
    mailGroup.classList.add("fail-red-border");
    passwordGroup.classList.add("fail-red-border");
    info.textContent = isMobileView()
        ? "Wrong email or password, try again."
        : "Check your email and password. Please try again.";
}


/**
 * Flattens the new users, adds each to "registeredUser" and saves it to the backend.
 *
 * @param {Array<{name: {firstName: string, lastName: string}, mail: string, password: string}>} users - Newly signed-up users.
 * @returns {Promise<void>}
 */
async function prepareUserDataForPost(users) {
    for (const user of users) {
        const userData = {
            firstName: user.name.firstName,
            lastName: user.name.lastName,
            mail: user.mail,
            password: user.password
        };
        registeredUser.push(userData);
        await postUserData("user", userData);
    }
}
 
 
/**
 * Creates a new record in the Firebase database and returns its parsed JSON response.
 *
 * @param {string} [path="user"] - The Firebase path segment (without ".json").
 * @param {Object} [data={}] - The data to store.
 * @returns {Promise<Object>} The Firebase response (generated key as "name").
 */
async function postUserData(path = "user", data = {}) {
    const response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return await response.json();
}