const guestInfo = document.getElementById("greeting-guest");
const userInfo = document.getElementById("greeting-user");
const greetTimeGuest = document.getElementById("greet-time-guest");
const greetTime = document.getElementById("greet-time");
const loggedUserInfo = document.getElementById("greet-user-name");


/**
 * Initializes the summary page: greeting, user profile, tasks and dashboard counters.
 *
 * @returns {Promise<void>}
 */
async function initSummary() {
    initMobileGreetingSplash();
    getUserGreeting();
    getUserProfile("desktop");
    await loadTasks();
    getInfoBoard();
}


/**
 * Returns a time-of-day-appropriate greeting phrase based on the
 * current local hour.
 *
 * @returns {string} "Good morning" (before 12:00), "Good afternoon" (before 18:00), or "Good evening" otherwise.
 */
function getGreetingText() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}
 
 
/**
 * Shows the time-based greeting for guests or the logged-in user and toggles the matching containers.
 *
 * @param {HTMLElement} guestEl - Container shown for guest users.
 * @param {HTMLElement} userEl - Container shown for logged-in users.
 * @param {HTMLElement} timeGuestEl - Element receiving the guest greeting text.
 * @param {HTMLElement} timeUserEl - Element receiving the user greeting text.
 * @param {HTMLElement} userNameEl - Element receiving the logged-in user's name.
 * @returns {void}
 */
function applyGreeting(guestEl, userEl, timeGuestEl, timeUserEl, userNameEl) {
    const greeting = getGreetingText();
    if (loggedInUser === "guest") {
        timeGuestEl.textContent = `${greeting}!`;
        guestEl.classList.remove("hidden");
        userEl.classList.add("hidden");
    } else {
        timeUserEl.textContent = `${greeting},`;
        userNameEl.textContent = loggedInUser;
        userEl.classList.remove("hidden");
        guestEl.classList.add("hidden");
    }
}
 
 
/**
 * Applies the greeting to the page's main (non-splash) guest/user
 * greeting elements.
 *
 * @returns {void}
 */
function getUserGreeting() {
    applyGreeting(guestInfo, userInfo, greetTimeGuest, greetTime, loggedUserInfo);
}
 
 
/**
 * Shows a one-time mobile greeting splash per session, then fades it out and removes it.
 *
 * @returns {void}
 */
function initMobileGreetingSplash() {
    const splash = document.getElementById("mobile-greeting-splash");
    if (!isMobileView() || !splash) return;
    if (sessionStorage.getItem("greetingShown")) {
        splash.remove();
        return;
    }
    applyGreetingToSplash();
    sessionStorage.setItem("greetingShown", "true");
    setTimeout(() => {
        splash.classList.add("hide");
        setTimeout(() => splash.remove(), 600);
    }, 1500);
}


/**
 * Applies the time-based greeting to the splash screen elements.
 *
 * @returns {void}
 */
function applyGreetingToSplash() {
    applyGreeting(
        document.getElementById("splash-greeting-guest"),
        document.getElementById("splash-greeting-user"),
        document.getElementById("splash-greet-time-guest"),
        document.getElementById("splash-greet-time"),
        document.getElementById("splash-greet-user-name")
    );
}
 
 
/**
 * Navigates the browser to the Kanban board page.
 *
 * @returns {void}
 */
function getToBoard() {
    window.location.href = "board.html";
}
 
 
/**
 * Populates every dashboard counter/date field by running each summary
 * calculation and writing its result into the corresponding DOM element.
 *
 * @returns {void}
 */
function getInfoBoard() {
    getSumToDo();
    getSumDone();
    getDateUrgentTasks();
    getSumTasksBoard();
    getSumInProgress();
    getSumAwaitFeedback();
}
 
 
/**
 * Counts tasks with status "To do" and writes the count into the
 * "count-do" element.
 *
 * @returns {number} The number of "To do" tasks.
 */
function getSumToDo() {
    const sum = tasks.filter((task) => task.taskStatus === "To do").length;
    document.getElementById("count-do").textContent = sum;
 
    return sum;
}
 
 
/**
 * Counts tasks with status "Done" and writes the count into the
 * "count-done" element.
 *
 * @returns {number} The number of "Done" tasks.
 */
function getSumDone() {
    const sum = tasks.filter((task) => task.taskStatus === "Done").length;
    document.getElementById("count-done").textContent = sum;
 
    return sum;
}
 
 
/**
 * Writes the count and date of the earliest-due open tasks into the summary, or "0" and "-" if none.
 *
 * @returns {void}
 */
function getDateUrgentTasks() {
    const dates = tasks
        .filter((task) => task.dueDate && task.taskStatus !== "Done")
        .map((task) => new Date(`${task.dueDate}T00:00:00`));
    if (dates.length === 0) {
        document.getElementById("count-urgent").textContent = "0";
        document.getElementById("urgent-date").textContent = "-";
        return;
    }
    dates.sort((a, b) => a - b);
    const earliestDate = dates[0];
    getTasksForDeadline(earliestDate);
    document.getElementById("urgent-date").textContent = getFormatDateSummary(earliestDate);
}
 
 
/**
 * Counts not-yet-done tasks whose due date matches the given date, and
 * writes the count into the "count-urgent" element.
 *
 * @param {Date} date - The date to match tasks against (compared by exact timestamp at midnight).
 * @returns {number} The number of matching tasks.
 */
function getTasksForDeadline(date) {
    const sum = tasks.filter(
        (task) =>
            task.taskStatus !== "Done" &&
            task.dueDate &&
            new Date(`${task.dueDate}T00:00:00`).getTime() === date.getTime()
    ).length;
 
    document.getElementById("count-urgent").textContent = sum;
 
    return sum;
}
 
 
/**
 * Formats a date for display in the dashboard, e.g. "September 1,
 * 2026".
 *
 * @param {Date} date - The date to format.
 * @returns {string} The date formatted in en-US locale ("Month D, YYYY").
 */
function getFormatDateSummary(date) {
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}
 
 
/**
 * Counts all tasks, writes the count into the "count-tasks" element.
 *
 * @returns {number} The number of not-yet-done tasks.
 */
function getSumTasksBoard() {
    const sum = tasks.length;
    document.getElementById("count-tasks").textContent = sum;
    return sum;
}
 
 
/**
 * Counts tasks with status "In progress" and writes the count into the
 * "count-in-progress" element.
 *
 * @returns {number} The number of "In progress" tasks.
 */
function getSumInProgress() {
    const sum = tasks.filter((task) => task.taskStatus === "In progress").length;
    document.getElementById("count-in-progress").textContent = sum;
    return sum;
}
 
 
/**
 * Counts tasks with status "Await feedback" and writes the count into
 * the "count-await-feedback" element.
 *
 * @returns {number} The number of "Await feedback" tasks.
 */
function getSumAwaitFeedback() {
    const sum = tasks.filter(
        (task) => task.taskStatus === "Await feedback"
    ).length;
    document.getElementById("count-await-feedback").textContent = sum;
    return sum;
}
