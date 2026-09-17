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
    document.getElementById(
        "increaseTimeButton"
    );

const decreaseTimeButton =
    document.getElementById(
        "decreaseTimeButton"
    );

const completedCount =
    document.getElementById(
        "completedCount"
    );

const sessionHistory =
    document.getElementById(
        "sessionHistory"
    );

const totalFocusTime =
    document.getElementById(
        "totalFocusTime"
    );

const fallingTomatoArea =
    document.getElementById(
        "fallingTomatoArea"
    );

const basketTomatoes =
    document.getElementById(
        "basketTomatoes"
    );

const basket =
    document.getElementById(
        "basket"
    );


// Modal

const accomplishmentModal =
    document.getElementById(
        "accomplishmentModal"
    );

const accomplishmentInput =
    document.getElementById(
        "accomplishmentInput"
    );

const saveAccomplishmentButton =
    document.getElementById(
        "saveAccomplishmentButton"
    );


// =========================================
// TIMER SETTINGS
// =========================================

let focusMinutes =
    Number(
        localStorage.getItem(
            "focusMinutes"
        )
    ) || 25;


const breakMinutes = 5;


// =========================================
// TIMER STATE
// =========================================

let timeLeft =
    focusMinutes * 60;

let timerInterval = null;

let isRunning = false;

let isFocusMode = true;

let waitingForAccomplishment =
    false;


// =========================================
// SAVED SESSIONS
// =========================================

let sessions =
    JSON.parse(
        localStorage.getItem(
            "pomodoroSessions"
        )
    ) || [];


// =========================================
// IDLE MOVEMENT STATE
// =========================================

let idleMovementTimeout = null;


// =========================================
// GET TODAY'S SESSIONS
// =========================================

function getTodaysSessions() {

    const today =
        new Date();


    return sessions.filter(
        function (session) {

            const sessionDate =
                new Date(
                    session.completedAt
                );


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
        Math.floor(
            timeLeft / 60
        );


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
// INCREASE TIME
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
            focusMinutes * 60;


        saveFocusTime();

        updateDisplay();
    }
);


// =========================================
// DECREASE TIME
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

        if (
            waitingForAccomplishment
        ) {
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

    clearInterval(
        timerInterval
    );


    timerInterval = null;

    isRunning = false;


    startButton.textContent =
        "Start";


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

        if (
            waitingForAccomplishment
        ) {
            return;
        }


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


    // Focus finished

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


        openAccomplishmentModal();

        return;
    }


    // Break finished

    isFocusMode =
        true;


    timeLeft =
        focusMinutes * 60;


    modeDisplay.textContent =
        "Focus Time";


    increaseTimeButton.disabled =
        false;

    decreaseTimeButton.disabled =
        false;


    updateDisplay();
}


// =========================================
// OPEN MODAL
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
// SAVE BUTTON
// =========================================

saveAccomplishmentButton
    .addEventListener(
        "click",
        saveAccomplishment
    );


// Ctrl + Enter submits

accomplishmentInput
    .addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                event.ctrlKey
            ) {

                saveAccomplishment();
            }
        }
    );


// =========================================
// SAVE ACCOMPLISHMENT
// =========================================

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

        duration:
            focusMinutes
    };


    sessions.push(
        session
    );


    saveSessions();


    closeAccomplishmentModal();


    /*
    Tomato visually falls before
    appearing permanently.
    */

    animateTomatoFall();


    displaySessionHistory(
        false
    );


    waitingForAccomplishment =
        false;


    startButton.disabled =
        false;

    resetButton.disabled =
        false;


    // Switch to break

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


    updateDisplay();
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
// FALLING TOMATO
// =========================================

function animateTomatoFall() {

    const fallingTomato =
        document.createElement(
            "div"
        );


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


            renderBasket(true);


            basketImpact();
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


    void basket.offsetWidth;


    basket.classList.add(
        "basket-impact"
    );


    const tomatoes =
        basketTomatoes.querySelectorAll(
            ".basket-tomato"
        );


    tomatoes.forEach(
        function (
            tomato,
            index
        ) {

            /*
            Slightly stagger the reaction.
            */

            const delay =
                index * 35;


            setTimeout(
                function () {

                    /*
                    Don't overwrite the
                    new tomato's landing
                    animation.
                    */

                    if (
                        tomato.classList.contains(
                            "new-tomato"
                        )
                    ) {
                        return;
                    }


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


    /*
    Restart the random idle system
    whenever the basket is rebuilt.
    */

    scheduleIdleMovement();
}


// =========================================
// RANDOM IDLE MOVEMENT
// =========================================

function scheduleIdleMovement() {

    /*
    Prevent multiple timers from
    accidentally running.
    */

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
    Wait somewhere between
    3 and 7 seconds.
    */

    const delay =
        3000 +
        Math.random() * 4000;


    idleMovementTimeout =
        setTimeout(
            function () {

                wiggleRandomTomato();


                /*
                Schedule the next random
                movement.
                */

                scheduleIdleMovement();

            },
            delay
        );
}


// =========================================
// WIGGLE ONE RANDOM TOMATO
// =========================================

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
        tomatoes[
            randomIndex
        ];


    /*
    Don't interrupt another animation.
    */

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

        JSON.stringify(
            sessions
        )

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


            // Accomplishment

            const accomplishmentElement =
                document.createElement(
                    "div"
                );


            accomplishmentElement
                .classList
                .add(
                    "session-task"
                );


            const description =
                session.accomplishment ||
                session.task ||
                "Completed focus session";


            accomplishmentElement.textContent =
                "🍅 " +
                description;


            // Time

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

displaySessionHistory();