// variables //
const guestInfo = document.getElementById('greeting-guest');
const userInfo = document.getElementById('greeting-user');
const loggedUserInfo = document.getElementById('greet-user-name');

// functions //


// es wird der login checkup benötigt //
function init() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');

    if (loggedInUser === 'guest') {
        guestInfo.classList.remove('hidden');
        userInfo.classList.add('hidden');
    } else {
        guestInfo.classList.add('hidden');
        userInfo.classList.remove('hidden');

        loggedUserInfo.textContent = loggedInUser;
    }
}

function getToBoard() {
    window.location.href = 'board.html';
}