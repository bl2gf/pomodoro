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

const completedCount =
    document.getElementById("completedCount");

const sessionHistory =
    document.getElementById("sessionHistory");

const totalFocusTime =
    document.getElementById("totalFocusTime");

const fallingTomatoArea =
    document.getElementById("fallingTomatoArea");

const basketTomatoes =
    document.getElementById("basketTomatoes");

const basket =
    document.getElementById("basket");

const bigPomoImage =
    document.getElementById("bigPomoImage");


// =========================================
// MODAL ELEMENTS
// =========================================

const accomplishmentModal =
    document.getElementById("accomplishmentModal");

const accomplishmentInput =
    document.getElementById("accomplishmentInput");

const saveAccomplishmentButton =
    document.getElementById("saveAccomplishmentButton");

const closeAccomplishmentButton =
    document.getElementById("closeAccomplishmentButton");


// =========================================
// IMAGE PATHS
// =========================================

const stillTomatoImage =
    "assets/bigPomo.png";

const blinkingTomatoImage =
    "assets/bigPomoAPNG.png";


// =========================================
// TEST MODE
// =========================================

// Change this to true while testing.
// Focus sessions will last 5 seconds.

const TEST_MODE = true;

const TEST_FOCUS_SECONDS = 5;


// =========================================
// TIMER SETTINGS
// =========================================

let focusMinutes =
    Number(
        localStorage.getItem("focusMinutes")
    ) || 25;

const breakMinutes = 5;


// =========================================
// TIMER STATE
// =========================================

let timeLeft =
    TEST_MODE
        ? TEST_FOCUS_SECONDS
        : focusMinutes * 60;

let timerInterval = null;

let isRunning = false;

let isFocusMode = true;

let waitingForAccomplishment = false;


// =========================================
// SAVED SESSIONS
// =========================================

let sessions =
    JSON.parse(
        localStorage.getItem("pomodoroSessions")
    ) || [];


// =========================================
// IDLE MOVEMENT
// =========================================

let idleMovementTimeout = null;


// =========================================
// BIG TOMATO IMAGE
// =========================================

function showStillTomato() {

    bigPomoImage.src =
        stillTomatoImage;
}


function showBlinkingTomato() {

    /*
        Timestamp forces the GIF
        to restart from the beginning.
    */

    bigPomoImage.src =
        blinkingTomatoImage +
        "?restart=" +
        Date.now();
}


// =========================================
// GET FOCUS TIME
// =========================================

function getFocusSeconds() {

    if (TEST_MODE) {
        return TEST_FOCUS_SECONDS;
    }

    return focusMinutes * 60;
}


// =========================================
// GET TODAY'S SESSIONS
// =========================================

function getTodaysSessions() {

    const today = new Date();

    return sessions.filter(
        function (session) {

            const sessionDate =
                new Date(session.completedAt);

            return (
                sessionDate.getFullYear() ===
                    today.getFullYear()

                &&

                sessionDate.getMonth() ===
                    today.getMonth()

                &&

                sessionDate.getDate() ===
                    today.getDate()
            );
        }
    );
}


// =========================================
// TIMER DISPLAY
// =========================================

function updateDisplay() {

    const minutes =
        Math.floor(timeLeft / 60);

    const seconds =
        timeLeft % 60;

    const formattedSeconds =
        String(seconds).padStart(
            2,
            "0"
        );

    timerDisplay.textContent =
        `${minutes}:${formattedSeconds}`;
}


// =========================================
// INCREASE FOCUS TIME
// =========================================

increaseTimeButton.addEventListener(
    "click",
    function () {

        if (
            isRunning ||
            !isFocusMode ||
            waitingForAccomplishment
        ) {
            return;
        }

        focusMinutes++;

        timeLeft =
            getFocusSeconds();

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
            waitingForAccomplishment ||
            focusMinutes <= 1
        ) {
            return;
        }

        focusMinutes--;

        timeLeft =
            getFocusSeconds();

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
// START / PAUSE BUTTON
// =========================================

startButton.addEventListener(
    "click",
    function () {

        if (waitingForAccomplishment) {
            return;
        }

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

    /*
        Tomato blinks only during
        an active focus session.
    */

    if (isFocusMode) {

        showBlinkingTomato();

    } else {

        showStillTomato();
    }

    increaseTimeButton.disabled =
        true;

    decreaseTimeButton.disabled =
        true;

    timerInterval =
        setInterval(
            function () {

                timeLeft--;

                if (timeLeft <= 0) {

                    timeLeft = 0;

                    updateDisplay();

                    finishTimer();

                    return;
                }

                updateDisplay();

            },
            1000
        );
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

    showStillTomato();

    if (
        isFocusMode &&
        !waitingForAccomplishment
    ) {

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

        if (waitingForAccomplishment) {
            return;
        }

        pauseTimer();

        if (isFocusMode) {

            timeLeft =
                getFocusSeconds();

        } else {

            timeLeft =
                breakMinutes * 60;
        }

        showStillTomato();

        updateDisplay();
    }
);


// =========================================
// TIMER FINISHED
// =========================================

function finishTimer() {

    pauseTimer();

    /*
        FOCUS FINISHED
    */

    if (isFocusMode) {

        waitingForAccomplishment =
            true;

        increaseTimeButton.disabled =
            true;

        decreaseTimeButton.disabled =
            true;

        startButton.disabled =
            true;

        resetButton.disabled =
            true;

        showStillTomato();

        openAccomplishmentModal();

        return;
    }

    /*
        BREAK FINISHED
    */

    isFocusMode = true;

    timeLeft =
        getFocusSeconds();

    modeDisplay.textContent =
        "Focus Time";

    increaseTimeButton.disabled =
        false;

    decreaseTimeButton.disabled =
        false;

    showStillTomato();

    updateDisplay();
}


// =========================================
// OPEN ACCOMPLISHMENT MODAL
// =========================================

function openAccomplishmentModal() {

    accomplishmentInput.value =
        "";

    accomplishmentModal
        .classList
        .remove("hidden");

    document.body
        .classList
        .add("modal-open");

    accomplishmentInput.focus();
}


// =========================================
// CLOSE MODAL
// =========================================

function closeAccomplishmentModal() {

    accomplishmentModal
        .classList
        .add("hidden");

    document.body
        .classList
        .remove("modal-open");
}


// =========================================
// SAVE ACCOMPLISHMENT
// =========================================

saveAccomplishmentButton
    .addEventListener(
        "click",
        saveAccomplishment
    );


accomplishmentInput
    .addEventListener(
        "keydown",
        function (event) {

            /*
                Ctrl + Enter also saves.
            */

            if (
                event.key === "Enter" &&
                event.ctrlKey
            ) {

                saveAccomplishment();
            }
        }
    );


function saveAccomplishment() {

    const accomplishment =
        accomplishmentInput
            .value
            .trim();

    if (!accomplishment) {

        accomplishmentInput.focus();

        return;
    }

    const session = {

        accomplishment:
            accomplishment,

        completedAt:
            new Date().toISOString(),

        /*
            Store the user's selected
            Pomodoro duration rather than
            the 5-second test duration.
        */

        duration:
            focusMinutes
    };

    sessions.push(session);

    saveSessions();

    closeAccomplishmentModal();

    /*
        Tomato falls before appearing
        permanently in the basket.
    */

    animateTomatoFall();

    displaySessionHistory(false);

    moveToBreak();
}


// =========================================
// SKIP ACCOMPLISHMENT
// =========================================

closeAccomplishmentButton
    .addEventListener(
        "click",
        skipAccomplishment
    );


function skipAccomplishment() {

    /*
        Close the popup without saving
        a session or adding a tomato.
    */

    closeAccomplishmentModal();

    moveToBreak();
}


// =========================================
// MOVE TO BREAK
// =========================================

function moveToBreak() {

    waitingForAccomplishment =
        false;

    startButton.disabled =
        false;

    resetButton.disabled =
        false;

    isFocusMode =
        false;

    timeLeft =
        breakMinutes * 60;

    modeDisplay.textContent =
        "Break Time";

    increaseTimeButton.disabled =
        true;

    decreaseTimeButton.disabled =
        true;

    showStillTomato();

    updateDisplay();
}


// =========================================
// FALLING TOMATO
// =========================================

function animateTomatoFall() {

    const fallingTomato =
        document.createElement("div");

    fallingTomato.classList.add(
        "falling-tomato"
    );

    fallingTomatoArea.appendChild(
        fallingTomato
    );

    fallingTomato.addEventListener(
        "animationend",
        function () {

            fallingTomato.remove();

            /*
                Add the permanent tomato
                after the falling animation.
            */

            renderBasket(true);

            basketImpact();

        },
        {
            once: true
        }
    );
}


// =========================================
// BASKET IMPACT
// =========================================

function basketImpact() {

    basket.classList.remove(
        "basket-impact"
    );

    /*
        Forces browser to restart
        the animation.
    */

    void basket.offsetWidth;

    basket.classList.add(
        "basket-impact"
    );

    const tomatoes =
        basketTomatoes.querySelectorAll(
            ".basket-tomato:not(.new-tomato)"
        );

    tomatoes.forEach(
        function (
            tomato,
            index
        ) {

            const delay =
                index * 35;

            setTimeout(
                function () {

                    tomato.classList.remove(
                        "idle-wiggle"
                    );

                    tomato.classList.add(
                        "tomato-jiggle"
                    );

                    setTimeout(
                        function () {

                            tomato.classList.remove(
                                "tomato-jiggle"
                            );

                        },
                        600
                    );

                },
                delay
            );
        }
    );

    setTimeout(
        function () {

            basket.classList.remove(
                "basket-impact"
            );

        },
        600
    );
}


// =========================================
// RENDER BASKET
// =========================================

function renderBasket(
    animateNewest = false
) {

    basketTomatoes.innerHTML =
        "";

    const todaysSessions =
        getTodaysSessions();

    completedCount.textContent =
        todaysSessions.length;

    const rotations = [

        "-8deg",
        "5deg",
        "-3deg",
        "9deg",
        "-6deg",
        "3deg",
        "-4deg",
        "7deg"

    ];

    todaysSessions.forEach(
        function (
            session,
            index
        ) {

            const tomato =
                document.createElement(
                    "div"
                );

            tomato.classList.add(
                "basket-tomato"
            );

            const rotation =
                rotations[
                    index %
                    rotations.length
                ];

            tomato.style.setProperty(
                "--rotation",
                rotation
            );

            const isNewest =
                index ===
                todaysSessions.length - 1;

            if (
                animateNewest &&
                isNewest
            ) {

                tomato.classList.add(
                    "new-tomato"
                );

                tomato.addEventListener(
                    "animationend",
                    function () {

                        tomato.classList.remove(
                            "new-tomato"
                        );

                    },
                    {
                        once: true
                    }
                );
            }

            basketTomatoes.appendChild(
                tomato
            );
        }
    );

    scheduleIdleMovement();
}


// =========================================
// RANDOM IDLE MOVEMENT
// =========================================

function scheduleIdleMovement() {

    clearTimeout(
        idleMovementTimeout
    );

    const tomatoes =
        basketTomatoes.querySelectorAll(
            ".basket-tomato"
        );

    if (
        tomatoes.length === 0
    ) {
        return;
    }

    /*
        One random tomato wiggles
        every 3–7 seconds.
    */

    const delay =
        3000 +
        Math.random() * 4000;

    idleMovementTimeout =
        setTimeout(
            function () {

                wiggleRandomTomato();

                scheduleIdleMovement();

            },
            delay
        );
}


function wiggleRandomTomato() {

    const tomatoes =
        basketTomatoes.querySelectorAll(
            ".basket-tomato"
        );

    if (
        tomatoes.length === 0
    ) {
        return;
    }

    const randomIndex =
        Math.floor(
            Math.random() *
            tomatoes.length
        );

    const tomato =
        tomatoes[randomIndex];

    if (
        tomato.classList.contains(
            "new-tomato"
        ) ||
        tomato.classList.contains(
            "tomato-jiggle"
        )
    ) {
        return;
    }

    tomato.classList.add(
        "idle-wiggle"
    );

    tomato.addEventListener(
        "animationend",
        function () {

            tomato.classList.remove(
                "idle-wiggle"
            );

        },
        {
            once: true
        }
    );
}


// =========================================
// SAVE SESSIONS
// =========================================

function saveSessions() {

    localStorage.setItem(
        "pomodoroSessions",
        JSON.stringify(sessions)
    );
}


// =========================================
// SESSION HISTORY
// =========================================

function displaySessionHistory(
    updateBasket = true
) {

    sessionHistory.innerHTML =
        "";

    const todaysSessions =
        getTodaysSessions();

    if (
        todaysSessions.length === 0
    ) {

        sessionHistory.textContent =
            "No sessions yet ♡";

        totalFocusTime.textContent =
            "Total focus time: 0 minutes";

        if (updateBasket) {

            renderBasket();
        }

        return;
    }

    const reversedSessions =
        [...todaysSessions]
            .reverse();

    reversedSessions.forEach(
        function (session) {

            const sessionElement =
                document.createElement(
                    "div"
                );

            sessionElement.classList.add(
                "session"
            );

            const accomplishmentElement =
                document.createElement(
                    "div"
                );

            accomplishmentElement
                .classList
                .add(
                    "session-task"
                );

            /*
                Supports both the current
                accomplishment format and
                your older task format.
            */

            const description =
                session.accomplishment ||
                session.task ||
                "Completed focus session";

            accomplishmentElement.textContent =
                "🍅 " +
                description;

            const completedDate =
                new Date(
                    session.completedAt
                );

            const detailsElement =
                document.createElement(
                    "div"
                );

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
                )} • ${session.duration} min`;

            sessionElement.appendChild(
                accomplishmentElement
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

    if (updateBasket) {

        renderBasket();
    }
}


// =========================================
// TOTAL FOCUS TIME
// =========================================

function updateTotalFocusTime() {

    const todaysSessions =
        getTodaysSessions();

    let totalMinutes = 0;

    todaysSessions.forEach(
        function (session) {

            totalMinutes +=
                session.duration;
        }
    );

    if (
        totalMinutes < 60
    ) {

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

showStillTomato();

updateDisplay();

displaySessionHistory();