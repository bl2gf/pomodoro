// -----------------------------------
// Get HTML elements
// -----------------------------------

const timerDisplay = document.getElementById("timer");
const modeDisplay = document.getElementById("modeDisplay");

const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");

const taskInput = document.getElementById("taskInput");

const tomatoTracker = document.getElementById("tomatoTracker");
const completedCount = document.getElementById("completedCount");


// -----------------------------------
// Timer settings
// -----------------------------------

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;


// -----------------------------------
// Timer state
// -----------------------------------

let timeLeft = FOCUS_TIME;

let timerInterval = null;

let isRunning = false;

let isFocusMode = true;

let pomodorosCompleted = 0;


// -----------------------------------
// Update timer display
// -----------------------------------

function updateDisplay() {

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // padStart makes 9 become "09"
    const formattedSeconds = String(seconds).padStart(2, "0");

    timerDisplay.textContent =
        `${minutes}:${formattedSeconds}`;
}


// -----------------------------------
// Start / Pause button
// -----------------------------------

startButton.addEventListener("click", function () {

    if (isRunning) {

        pauseTimer();

    } else {

        startTimer();

    }

});


// -----------------------------------
// Start timer
// -----------------------------------

function startTimer() {

    isRunning = true;

    startButton.textContent = "Pause";

    timerInterval = setInterval(function () {

        timeLeft--;

        updateDisplay();

        if (timeLeft <= 0) {

            finishTimer();

        }

    }, 1000);

}


// -----------------------------------
// Pause timer
// -----------------------------------

function pauseTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

    isRunning = false;

    startButton.textContent = "Start";

}


// -----------------------------------
// Reset timer
// -----------------------------------

resetButton.addEventListener("click", function () {

    pauseTimer();

    if (isFocusMode) {

        timeLeft = FOCUS_TIME;

    } else {

        timeLeft = BREAK_TIME;

    }

    updateDisplay();

});


// -----------------------------------
// Timer finished
// -----------------------------------

function finishTimer() {

    pauseTimer();

    // If we just finished a focus session
    if (isFocusMode) {

        completePomodoro();

        isFocusMode = false;

        timeLeft = BREAK_TIME;

        modeDisplay.textContent = "Break Time";

        alert("Pomodoro complete! 🍅 Time for a break!");

    }

    // If we just finished a break
    else {

        isFocusMode = true;

        timeLeft = FOCUS_TIME;

        modeDisplay.textContent = "Focus Time";

        alert("Break finished! Ready to focus?");

    }

    updateDisplay();

}


// -----------------------------------
// Complete a Pomodoro
// -----------------------------------

function completePomodoro() {

    pomodorosCompleted++;

    completedCount.textContent = pomodorosCompleted;

    updateTomatoTracker();

}


// -----------------------------------
// Update tomato tracker
// -----------------------------------

function updateTomatoTracker() {

    tomatoTracker.textContent =
        "🍅".repeat(pomodorosCompleted);

}


// -----------------------------------
// Initialize page
// -----------------------------------

updateDisplay();