// =========================================
// HTML ELEMENTS
// =========================================

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


// =========================================
// TIMER SETTINGS
// =========================================

// Load saved focus duration.
// Default = 25 minutes.

let focusMinutes =
    Number(localStorage.getItem("focusMinutes")) || 25;


// We'll make this editable later.

const breakMinutes = 5;


// =========================================
// TIMER STATE
// =========================================

let timeLeft =
    focusMinutes * 60;

let timerInterval = null;

let isRunning = false;

let isFocusMode = true;


// =========================================
// SESSION HISTORY
// =========================================

let sessions =
    JSON.parse(
        localStorage.getItem("pomodoroSessions")
    ) || [];


let pomodorosCompleted =
    sessions.length;


// =========================================
// TIMER DISPLAY
// =========================================

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


// =========================================
// INCREASE FOCUS TIME
// =========================================

increaseTimeButton.addEventListener(
    "click",
    function () {

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


// =========================================
// DECREASE FOCUS TIME
// =========================================

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


// =========================================
// SAVE FOCUS TIME
// =========================================

function saveFocusTime() {

    localStorage.setItem(
        "focusMinutes",
        focusMinutes
    );
}


// =========================================
// START / PAUSE
// =========================================

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


// =========================================
// START TIMER
// =========================================

function startTimer() {

    isRunning = true;


    startButton.textContent =
        "Pause";


    increaseTimeButton.disabled =
        true;

    decreaseTimeButton.disabled =
        true;


    timerInterval =
        setInterval(function () {

            timeLeft--;


            if (timeLeft <= 0) {

                timeLeft = 0;

                updateDisplay();

                finishTimer();

                return;
            }


            updateDisplay();

        }, 1000);
}


// =========================================
// PAUSE TIMER
// =========================================

function pauseTimer() {

    clearInterval(timerInterval);


    timerInterval = null;

    isRunning = false;


    startButton.textContent =
        "Start";


    if (isFocusMode) {

        increaseTimeButton.disabled =
            false;

        decreaseTimeButton.disabled =
            false;
    }
}


// =========================================
// RESET TIMER
// =========================================

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


// =========================================
// TIMER FINISHED
// =========================================

function finishTimer() {

    pauseTimer();


    // -------------------------------------
    // Focus finished
    // -------------------------------------

    if (isFocusMode) {

        completePomodoro();


        isFocusMode = false;


        timeLeft =
            breakMinutes * 60;


        modeDisplay.textContent =
            "Break Time";


        increaseTimeButton.disabled =
            true;

        decreaseTimeButton.disabled =
            true;


        alert(
            "Pomodoro complete! 🍅 Time for a break!"
        );
    }


    // -------------------------------------
    // Break finished
    // -------------------------------------

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


// =========================================
// COMPLETE POMODORO
// =========================================

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


// =========================================
// SAVE SESSION HISTORY
// =========================================

function saveSessions() {

    localStorage.setItem(
        "pomodoroSessions",
        JSON.stringify(sessions)
    );
}


// =========================================
// TOMATO TRACKER
// =========================================

function updateTomatoTracker() {

    if (pomodorosCompleted === 0) {

        tomatoTracker.textContent =
            "No pomodoros yet ♡";

        return;
    }


    tomatoTracker.textContent =
        "🍅".repeat(pomodorosCompleted);
}


// =========================================
// DISPLAY SESSION HISTORY
// =========================================

function displaySessionHistory() {

    sessionHistory.innerHTML = "";


    if (sessions.length === 0) {

        sessionHistory.textContent =
            "No sessions yet ♡";


        totalFocusTime.textContent =
            "Total focus time: 0 minutes";


        return;
    }


    const reversedSessions =
        [...sessions].reverse();


    reversedSessions.forEach(
        function (session) {

            // Session container

            const sessionElement =
                document.createElement("div");


            sessionElement.classList.add(
                "session"
            );


            // Task name

            const taskElement =
                document.createElement("div");


            taskElement.classList.add(
                "session-task"
            );


            taskElement.textContent =
                "🍅 " + session.task;


            // Date

            const completedDate =
                new Date(
                    session.completedAt
                );


            // Time + duration

            const detailsElement =
                document.createElement("div");


            detailsElement.classList.add(
                "session-time"
            );


            detailsElement.textContent =
                `${completedDate.toLocaleTimeString(
                    [],
                    {
                        hour: "numeric",
                        minute: "2-digit"
                    }
                )} • ${session.duration} minutes`;


            sessionElement.appendChild(
                taskElement
            );


            sessionElement.appendChild(
                detailsElement
            );


            sessionHistory.appendChild(
                sessionElement
            );
        }
    );


    updateTotalFocusTime();
}


// =========================================
// TOTAL FOCUS TIME
// =========================================

function updateTotalFocusTime() {

    let totalMinutes = 0;


    sessions.forEach(
        function (session) {

            totalMinutes +=
                session.duration;
        }
    );


    if (totalMinutes < 60) {

        totalFocusTime.textContent =
            `Total focus time: ${totalMinutes} minutes`;

        return;
    }


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    totalFocusTime.textContent =
        `Total focus time: ${hours}h ${minutes}m`;
}


// =========================================
// INITIALIZE
// =========================================

updateDisplay();


completedCount.textContent =
    pomodorosCompleted;


updateTomatoTracker();


displaySessionHistory();