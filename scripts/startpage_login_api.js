// Variables //
 
const BASE_URL = "https://remotestoragejoin-8faac-default-rtdb.europe-west1.firebasedatabase.app/";
 
 
// Login form //
 
/**
 * Loads all registered users from the backend into the global
 * "registeredUser" array, replacing its previous contents. Does
 * nothing if the backend returns no data.
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
 * @param {string} path - The Firebase path segment to fetch (without
 *                         ".json"), e.g. "user".
 * @returns {Promise<Object|null>} The parsed JSON response, or null if
 *                                  the path has no data.
 */
async function getAllUsers(path) {
    let response = await fetch(BASE_URL + path + ".json");
    return responseToJson = await response.json();
}
 
 
/**
 * Submit handler for the login form: prevents the native submission,
 * validates the entered credentials against registered users. On
 * success, loads contacts, links the session to the matching contact
 * (if one exists for that email), clears the login inputs, and
 * navigates to the summary page with the user's name and email. On
 * failure, error state is shown by checkDataLogin() itself.
 *
 * @param {SubmitEvent} event - The form submit event.
 * @returns {Promise<boolean>} Always resolves to false (used as an
 *                              inline
 *                              `onsubmit="return checkFormDataLogin(event)"`
 *                              handler to prevent a native form
 *                              submission).
 */
async function checkFormDataLogin(event) {
    event.preventDefault();
    const user = checkDataLogin();
 
    if (user) {
        await loadContactsFromFirebase();
        const ownContact = contacts.find(contact => contact.email === user.mail);
        if (ownContact) {
            sessionStorage.setItem('loggedInContactId',ownContact.id);
        }
        loginMail.value = "";
        loginPw.value = "";
        getToSummary(`${user.firstName} ${user.lastName}`,user.mail);
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
        if (
            loginMail.value === registeredUser[index].mail &&
            loginPw.value === registeredUser[index].password
        ) {
            document.getElementById("feedback-login")
                .classList.add("hidden-feedback");

            return registeredUser[index];
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
 
 
// Registration / Login API //
 
/**
 * Reshapes a list of newly signed-up users into the flat user-record
 * format used by the backend, appends each one to the local
 * "registeredUser" array, and persists each one via postUserData().
 *
 * @param {Array<{name: {firstName: string, lastName: string},
 *                 mail: string, password: string}>} users - Newly
 *                 signed-up users, as pushed by registerNewUser().
 * @returns {Promise<void>}
 */
async function prepareUserDataForPost(users) {
    for (let index = 0; index < users.length; index++) {
 
        const userData = {
            firstName: users[index].name.firstName,
            lastName: users[index].name.lastName,
            mail: users[index].mail,
            password: users[index].password
        };
        registeredUser.push(userData);
        await postUserData("user", userData);
    }
}
 
 
/**
 * Creates a new user record in the Firebase database.
 *
 * @param {string} [path="user"] - The Firebase path segment to post
 *                                 to (without ".json").
 * @param {Object} [data={}] - The user data to store.
 * @returns {Promise<Object>} The parsed JSON response from Firebase
 *                             (includes the generated key as "name").
 */
async function postUserData(path = "user", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}