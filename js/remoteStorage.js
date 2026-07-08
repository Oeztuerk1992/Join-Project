// Registration //

// Variables //

const BASE_URL = "https://remotestoragejoin-8faac-default-rtdb.europe-west1.firebasedatabase.app/";

// functions //

async function prepareUserDataForPost(users) {

    for (let index = 0; index < users.length; index++) {

        const userData = {
            firstName: users[index].name.firstName,
            lastName: users[index].name.lastName,
            mail: users[index].mail,
            password: users[index].password,
            phoneNo: users[index].phoneNo
        };
        
        registeredUser.push(userData);
        await postUserData("user", userData);
    }
}

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