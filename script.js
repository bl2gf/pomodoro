// -----------------------------------
// Get HTML elements
// -----------------------------------

const timerDisplay =
    document.getElementById("timer");

const modeDisplay =
    document.getElementById("modeDisplay");

const startButton =
    document.getElementById("startButton");

const resetButton =
    document.getElementById("resetButton");

const increaseTimeButton =
    document.getElementById("increaseTimeButton");

const decreaseTimeButton =
    document.getElementById("decreaseTimeButton");

const taskInput =
    document.getElementById("taskInput");

const tomatoTracker =
    document.getElementById("tomatoTracker");

const completedCount =
    document.getElementById("completedCount");

const sessionHistory =
    document.getElementById("sessionHistory");

const totalFocusTime =
    document.getElementById("totalFocusTime");


// -----------------------------------
// Timer Settings
// -----------------------------------

// Load saved focus time.
// If there isn't one, default to 25 minutes.
let focusMinutes =
    Number(localStorage.getItem("focusMinutes")) || 25;


// We'll make break time editable later.
const breakMinutes = 5;


// -----------------------------------
// Timer State
// -----------------------------------

let timeLeft =
    focusMinutes * 60;

let timerInterval = null;

let isRunning = false;

let isFocusMode = true;


// -----------------------------------
// Load Session History
// -----------------------------------

let sessions =
    JSON.parse(
        localStorage.getItem("pomodoroSessions")
    ) || [];


let pomodorosCompleted =
    sessions.length;


// -----------------------------------
// Update Timer Display
// -----------------------------------

function updateDisplay() {

    const minutes =
        Math.floor(timeLeft / 60);

    const seconds =
        timeLeft % 60;


    const formattedSeconds =
        String(seconds).padStart(2, "0");


    timerDisplay.textContent =
        `${minutes}:${formattedSeconds}`;
}


// -----------------------------------
// Increase Focus Time
// -----------------------------------

increaseTimeButton.addEventListener(
    "click",
    function () {

        // Don't allow editing while
        // running or during a break.
        if (isRunning || !isFocusMode) {
            return;
        }


        focusMinutes++;


        timeLeft =
            focusMinutes * 60;


        saveFocusTime();

        updateDisplay();
    }
);


// -----------------------------------
// Decrease Focus Time
// -----------------------------------

decreaseTimeButton.addEventListener(
    "click",
    function () {

        if (
            isRunning ||
            !isFocusMode ||
            focusMinutes <= 1
        ) {
            return;
        }


        focusMinutes--;


        timeLeft =
            focusMinutes * 60;


        saveFocusTime();

        updateDisplay();
    }
);


// -----------------------------------
// Save Focus Preference
// -----------------------------------

function saveFocusTime() {

    localStorage.setItem(
        "focusMinutes",
        focusMinutes
    );
}


// -----------------------------------
// Start / Pause Button
// -----------------------------------

startButton.addEventListener(
    "click",
    function () {

        if (isRunning) {

            pauseTimer();

        } else {

            startTimer();
        }
    }
);


// -----------------------------------
// Start Timer
// -----------------------------------

function startTimer() {

    isRunning = true;


    startButton.textContent =
        "Pause";


    // Hide editing controls while
    // the timer is running.
    increaseTimeButton.disabled = true;

    decreaseTimeButton.disabled = true;


    timerInterval =
        setInterval(function () {

            timeLeft--;

            updateDisplay();


            if (timeLeft <= 0) {

                finishTimer();
            }

        }, 1000);
}


// -----------------------------------
// Pause Timer
// -----------------------------------

function pauseTimer() {

    clearInterval(timerInterval);


    timerInterval = null;

    isRunning = false;


    startButton.textContent =
        "Start";


    // Focus time can be edited
    // when we're in focus mode.
    if (isFocusMode) {

        increaseTimeButton.disabled =
            false;

        decreaseTimeButton.disabled =
            false;
    }
}


// -----------------------------------
// Reset Timer
// -----------------------------------

resetButton.addEventListener(
    "click",
    function () {

        pauseTimer();


        if (isFocusMode) {

            timeLeft =
                focusMinutes * 60;

        } else {

            timeLeft =
                breakMinutes * 60;
        }


        updateDisplay();
    }
);


// -----------------------------------
// Timer Finished
// -----------------------------------

function finishTimer() {

    pauseTimer();


    // -------------------------------
    // Focus session finished
    // -------------------------------

    if (isFocusMode) {

        completePomodoro();


        isFocusMode = false;


        timeLeft =
            breakMinutes * 60;


        modeDisplay.textContent =
            "Break Time";


        // Don't allow focus time
        // editing during the break.
        increaseTimeButton.disabled =
            true;

        decreaseTimeButton.disabled =
            true;


        alert(
            "Pomodoro complete! 🍅 Time for a break!"
        );
    }


    // -------------------------------
    // Break finished
    // -------------------------------

    else {

        isFocusMode = true;


        timeLeft =
            focusMinutes * 60;


        modeDisplay.textContent =
            "Focus Time";


        increaseTimeButton.disabled =
            false;

        decreaseTimeButton.disabled =
            false;


        alert(
            "Break finished! Ready to focus?"
        );
    }


    updateDisplay();
}


// -----------------------------------
// Complete Pomodoro
// -----------------------------------

function completePomodoro() {

    const session = {

        task:
            taskInput.value.trim() ||
            "Untitled session",

        completedAt:
            new Date().toISOString(),

        duration:
            focusMinutes
    };


    sessions.push(session);


    saveSessions();


    pomodorosCompleted =
        sessions.length;


    completedCount.textContent =
        pomodorosCompleted;


    updateTomatoTracker();

    displaySessionHistory();


    taskInput.value = "";
}


// -----------------------------------
// Save Sessions
// -----------------------------------

function saveSessions() {

    localStorage.setItem(
        "pomodoroSessions",
        JSON.stringify(sessions)
    );
}


// -----------------------------------
// Update Tomato Tracker
// -----------------------------------

function updateTomatoTracker() {

    if (pomodorosCompleted === 0) {

        tomatoTracker.textContent =
            "No pomodoros completed yet!";

        return;
    }


    tomatoTracker.textContent =
        "🍅".repeat(pomodorosCompleted);
}


// -----------------------------------
// Display Session History
// -----------------------------------

function displaySessionHistory() {

    sessionHistory.innerHTML = "";


    // No saved sessions
    if (sessions.length === 0) {

        sessionHistory.textContent =
            "No sessions yet!";


        totalFocusTime.textContent =
            "Total focus time: 0 minutes";


        return;
    }


    // Copy the array and reverse it
    // so newest sessions appear first.
    const reversedSessions =
        [...sessions].reverse();


    reversedSessions.forEach(
        function (session) {

            // -----------------------
            // Session container
            // -----------------------

            const sessionElement =
                document.createElement("div");


            sessionElement.classList.add(
                "session"
            );


            // -----------------------
            // Task
            // -----------------------

            const taskElement =
                document.createElement("div");


            taskElement.classList.add(
                "session-task"
            );


            taskElement.textContent =
                "🍅 " + session.task;


            // -----------------------
            // Completion time
            // -----------------------

            const timeElement =
                document.createElement("div");


            timeElement.classList.add(
                "session-time"
            );


            const completedDate =
                new Date(
                    session.completedAt
                );


            timeElement.textContent =
                completedDate.toLocaleString();


            // -----------------------
            // Duration
            // -----------------------

            const durationElement =
                document.createElement("div");


            durationElement.classList.add(
                "session-time"
            );


            durationElement.textContent =
                `${session.duration} minute focus session`;


            // -----------------------
            // Add everything
            // -----------------------

            sessionElement.appendChild(
                taskElement
            );


            sessionElement.appendChild(
                timeElement
            );


            sessionElement.appendChild(
                durationElement
            );


            sessionHistory.appendChild(
                sessionElement
            );
        }
    );


    updateTotalFocusTime();
}


// -----------------------------------
// Calculate Total Focus Time
// -----------------------------------

function updateTotalFocusTime() {

    let totalMinutes = 0;


    sessions.forEach(
        function (session) {

            totalMinutes +=
                session.duration;
        }
    );


    // Less than an hour
    if (totalMinutes < 60) {

        totalFocusTime.textContent =
            `Total focus time: ${totalMinutes} minutes`;

        return;
    }


    // One hour or more
    const hours =
        Math.floor(totalMinutes / 60);


    const minutes =
        totalMinutes % 60;


    totalFocusTime.textContent =
        `Total focus time: ${hours}h ${minutes}m`;
}


// -----------------------------------
// Initialize Page
// -----------------------------------

updateDisplay();


completedCount.textContent =
    pomodorosCompleted;


updateTomatoTracker();


displaySessionHistory();