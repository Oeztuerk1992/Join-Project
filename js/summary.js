// variables //
const guestInfo = document.getElementById('greeting-guest');
const userInfo = document.getElementById('greeting-user');

const greetTimeGuest = document.getElementById('greet-time-guest');
const greetTime = document.getElementById('greet-time');

const loggedUserInfo = document.getElementById('greet-user-name');

// functions //

async function initSummary() {
    getUserGreeting();
    getUserProfile();
    await loadTasks();
    getInfoBoard();
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

function getInfoBoard() {
    getSumToDo();
    getSumDone();
    getDateUrgentTasks();
    getSumTasksBoard();
    getSumInProgress();
    getSumAwaitFeedback();
}

function getSumToDo() {
    const sum = tasks.filter(task => task.taskStatus === 'To do').length;
    document.getElementById('count-do').textContent = sum;

    return sum;
}

function getSumDone() {
    const sum = tasks.filter(task => task.taskStatus === 'Done').length;
    document.getElementById('count-done').textContent = sum;

    return sum;
}

function getDateUrgentTasks() {
    const dates = [];

    for (let index = 0; index < tasks.length; index++) {
        dates.push(Temporal.PlainDate.from(tasks[index].dueDate));
    }
    dates.sort(Temporal.PlainDate.compare);

    getTasksForDeadline(dates[0]);
    document.getElementById('urgent-date').textContent = getFormatDateSummary(dates[0]);
}

function getTasksForDeadline(date) {
    const sum = tasks.filter(task =>
        task.taskStatus !== 'Done' &&
        Temporal.PlainDate.compare(
            Temporal.PlainDate.from(task.dueDate),
            date
        ) === 0
    ).length;

    document.getElementById('count-urgent').textContent = sum;

    return sum;
}

function getFormatDateSummary(date) {
    const monthName = date.toLocaleString("en-US", {month: "long"});

    return `${monthName} ${date.day}, ${date.year}`;
}

function getSumTasksBoard() {
    const sum = tasks.filter(task => task.taskStatus !== 'Done').length;
    document.getElementById('count-tasks').textContent = sum;

    return sum;
}

function getSumInProgress() {
    const sum = tasks.filter(task => task.taskStatus === 'In progress').length;
    document.getElementById('count-in-progress').textContent = sum;

    return sum;
}

function getSumAwaitFeedback() {
    const sum = tasks.filter(task => task.taskStatus === 'Await feedback').length;
    document.getElementById('count-await-feedback').textContent = sum;

    return sum;
}
