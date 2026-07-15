// variables //
const guestInfo = document.getElementById('greeting-guest');
const userInfo = document.getElementById('greeting-user');

const greetTimeGuest= document.getElementById('greet-time-guest');
const greetTime = document.getElementById('greet-time');

const loggedUserInfo = document.getElementById('greet-user-name');

// functions //


// es wird der login checkup benötigt //

function initSummary() {
    getUserGreeting();
    getUserProfile();
}

function getUserGreeting() {
    
    getGreetingTime();

    if (loggedInUser === 'guest') {
        guestInfo.classList.remove('hidden');
        userInfo.classList.add('hidden');
    } else {
        guestInfo.classList.add('hidden');
        userInfo.classList.remove('hidden');

        loggedUserInfo.textContent = loggedInUser;
    }
}

function getGreetingTime() {
    const hour = new Date().getHours();
    let greeting;

    if (hour < 12) {
        greeting = "Good morning";
    } else if (hour < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }

    greetTimeGuest.textContent = `${greeting}!`;
    greetTime.textContent = `${greeting},`;
}

function getToBoard() {
    window.location.href = 'board.html';
}