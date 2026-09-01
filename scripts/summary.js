// variables //
const guestInfo = document.getElementById('greeting-guest');
const userInfo = document.getElementById('greeting-user');

const greetTimeGuest = document.getElementById('greet-time-guest');
const greetTime = document.getElementById('greet-time');

const loggedUserInfo = document.getElementById('greet-user-name');

// functions //

async function initSummary() {
    initMobileGreetingSplash();
    getUserGreeting();
    getUserProfile("desktop");
    await loadTasks();
    getInfoBoard();
}

function getGreetingText() {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

function applyGreeting(guestEl, userEl, timeGuestEl, timeUserEl, userNameEl) {
    const greeting = getGreetingText();

    if (loggedInUser === 'guest') {
        timeGuestEl.textContent = `${greeting}!`;
        guestEl.classList.remove('hidden');
        userEl.classList.add('hidden');
    } else {
        timeUserEl.textContent = `${greeting},`;
        userNameEl.textContent = loggedInUser;
        userEl.classList.remove('hidden');
        guestEl.classList.add('hidden');
    }
}

function getUserGreeting() {
    applyGreeting(guestInfo, userInfo, greetTimeGuest, greetTime, loggedUserInfo);
}

function initMobileGreetingSplash() {
    const isMobile = window.innerWidth <= 992;
    const splash = document.getElementById('mobile-greeting-splash');

    if (!isMobile || !splash) return;

    // Bereits in dieser Session angezeigt?
    if (sessionStorage.getItem('greetingShown')) {
        splash.remove();
        return;
    }

    applyGreeting(
        document.getElementById('splash-greeting-guest'),
        document.getElementById('splash-greeting-user'),
        document.getElementById('splash-greet-time-guest'),
        document.getElementById('splash-greet-time'),
        document.getElementById('splash-greet-user-name')
    );

    // Als angezeigt speichern
    sessionStorage.setItem('greetingShown', 'true');

    setTimeout(() => {
        splash.classList.add('hide');

        setTimeout(() => splash.remove(), 600);
    }, 1500);
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

/* function getDateUrgentTasks() {
    const dates = tasks
        .filter(task =>
            task.dueDate &&
            task.taskStatus !== 'Done'
        )
        .map(task =>
            Temporal.PlainDate.from(task.dueDate)
        );

    if (dates.length === 0) {
        document.getElementById('count-urgent').textContent = '0';
        document.getElementById('urgent-date').textContent = '-';
        return;
    }

    dates.sort(Temporal.PlainDate.compare);

    const earliestDate = dates[0];

    getTasksForDeadline(earliestDate);

    document.getElementById('urgent-date').textContent =
        getFormatDateSummary(earliestDate);
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
} */

    function getDateUrgentTasks() {
        const dates = tasks
            .filter(task =>
                task.dueDate &&
                task.taskStatus !== 'Done'
            )
            .map(task => new Date(`${task.dueDate}T00:00:00`));
    
        if (dates.length === 0) {
            document.getElementById('count-urgent').textContent = '0';
            document.getElementById('urgent-date').textContent = '-';
            return;
        }
    
        dates.sort((a, b) => a - b);
    
        const earliestDate = dates[0];
    
        getTasksForDeadline(earliestDate);
    
        document.getElementById('urgent-date').textContent =
            getFormatDateSummary(earliestDate);
    }
    
    
    function getTasksForDeadline(date) {
        const sum = tasks.filter(task =>
            task.taskStatus !== 'Done' &&
            task.dueDate &&
            new Date(`${task.dueDate}T00:00:00`).getTime() === date.getTime()
        ).length;
    
        document.getElementById('count-urgent').textContent = sum;
    
        return sum;
    }
    
    
    function getFormatDateSummary(date) {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
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
