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

const basketTomatoes =
    document.getElementById("basketTomatoes");

const basket =
    document.getElementById("basket");

const bigPomoImage =
    document.getElementById("bigPomoImage");

const tomato =
    document.querySelector(".tomato");

const tomatoContent =
    document.querySelector(".tomato-content");


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

const animatedTomatoImage =
    "assets/bigPomoAPNG.png";


// =========================================
// TEST MODE
// =========================================

// Change this to true while testing.
// Focus sessions will last 5 seconds.

const TEST_MODE = false;

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

let isTransitioning = false;


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


function showAnimatedTomato() {

    // Reload APNG so animation
    // starts fresh each focus session.

    bigPomoImage.src =
        animatedTomatoImage +
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

    updateTabTitle();
}


// =========================================
// CHROME TAB TITLE
// =========================================

function updateTabTitle() {

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

    const time =
        `${minutes}:${formattedSeconds}`;

    const mode =
        isFocusMode
            ? "Focus"
            : "Break";


    if (waitingForAccomplishment) {

        document.title =
            "🍅 Focus complete! | Pomodoro";

        return;
    }


    if (isRunning) {

        document.title =
            `🍅 ${time} • ${mode} | Pomodoro`;

    } else {

        document.title =
            `⏸ ${time} • ${mode} | Pomodoro`;
    }
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
            waitingForAccomplishment ||
            isTransitioning
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
            isTransitioning ||
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

        if (
            waitingForAccomplishment ||
            isTransitioning
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

    updateTabTitle();

    startButton.textContent =
        "Pause";


    if (isFocusMode) {

        showAnimatedTomato();

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

    clearInterval(
        timerInterval
    );

    timerInterval = null;

    isRunning = false;

    startButton.textContent =
        "Start";

    showStillTomato();

    updateTabTitle();


    if (
        isFocusMode &&
        !waitingForAccomplishment &&
        !isTransitioning
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
            waitingForAccomplishment ||
            isTransitioning
        ) {
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


    // -------------------------
    // FOCUS FINISHED
    // -------------------------

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

        updateTabTitle();

        openAccomplishmentModal();

        return;
    }


    // -------------------------
    // BREAK FINISHED
    // -------------------------

    isFocusMode =
        true;

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

        duration:
            focusMinutes
    };


    sessions.push(
        session
    );


    saveSessions();

    closeAccomplishmentModal();


    // Update history now,
    // but wait to update basket
    // until tomato reaches it.

    displaySessionHistory(
        false
    );


    waitingForAccomplishment =
        false;


    animateBigTomatoToBasket();
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

    closeAccomplishmentModal();

    waitingForAccomplishment =
        false;

    moveToBreak();

    animateNewBigTomatoIn();
}


// =========================================
// BIG TOMATO -> BASKET
// =========================================

async function animateBigTomatoToBasket() {

    isTransitioning =
        true;


    startButton.disabled =
        true;

    resetButton.disabled =
        true;

    increaseTimeButton.disabled =
        true;

    decreaseTimeButton.disabled =
        true;


    // -------------------------
    // FADE TIMER CONTENT
    // -------------------------

    const contentFade =
        tomatoContent.animate(
            [
                {
                    opacity: 1
                },

                {
                    opacity: 0
                }
            ],
            {
                duration: 250,
                easing: "ease-out",
                fill: "forwards"
            }
        );


    await contentFade.finished;


    // -------------------------
    // GET POSITIONS
    // -------------------------

    const tomatoRect =
        tomato.getBoundingClientRect();

    const basketRect =
        basket.getBoundingClientRect();


    const tomatoCenterX =
        tomatoRect.left +
        tomatoRect.width / 2;

    const tomatoCenterY =
        tomatoRect.top +
        tomatoRect.height / 2;


    const basketCenterX =
        basketRect.left +
        basketRect.width / 2;


    const basketTargetY =
        basketRect.top +
        basketRect.height * 0.35;


    const moveX =
        basketCenterX -
        tomatoCenterX;

    const moveY =
        basketTargetY -
        tomatoCenterY;


    // -------------------------
    // SHRINK INTO BASKET
    // -------------------------

    const fallAnimation =
        tomato.animate(
            [
                {
                    transform:
                        "translate(0px, 0px) scale(1)",

                    opacity: 1
                },

                {
                    transform:
                        `translate(${moveX * 0.25}px, ${moveY * 0.35}px) scale(0.72)`,

                    opacity: 1,

                    offset: 0.4
                },

                {
                    transform:
                        `translate(${moveX}px, ${moveY}px) scale(0.10)`,

                    opacity: 0.9
                }
            ],
            {
                duration: 950,

                easing:
                    "cubic-bezier(.55, .05, .7, .4)",

                fill: "forwards"
            }
        );


    await fallAnimation.finished;


    // -------------------------
    // ADD TOMATO TO BASKET
    // -------------------------

    renderBasket(
        true
    );

    basketImpact();


    // -------------------------
    // RESET BIG TOMATO
    // -------------------------

    tomato.style.opacity =
        "0";


    fallAnimation.cancel();


    tomato.style.transform =
        "none";


    // -------------------------
    // PREPARE BREAK
    // -------------------------

    moveToBreak();


    // -------------------------
    // NEW TOMATO FALLS IN
    // -------------------------

    await animateNewBigTomatoIn();


    isTransitioning =
        false;


    startButton.disabled =
        false;

    resetButton.disabled =
        false;
}


// =========================================
// NEW BIG TOMATO FALLS IN
// =========================================

async function animateNewBigTomatoIn() {

    showStillTomato();


    // Keep timer content hidden
    // while tomato falls.

    tomatoContent.style.opacity =
        "0";


    tomato.style.opacity =
        "1";


    const tomatoRect =
        tomato.getBoundingClientRect();


    const distanceFromTop =
        tomatoRect.bottom +
        150;


    const entranceAnimation =
        tomato.animate(
            [
                {
                    transform:
                        `translateY(-${distanceFromTop}px) scale(0.95)`
                },

                {
                    transform:
                        "translateY(20px) scaleX(1.04) scaleY(0.96)",

                    offset: 0.78
                },

                {
                    transform:
                        "translateY(-8px) scaleX(0.98) scaleY(1.02)",

                    offset: 0.9
                },

                {
                    transform:
                        "translateY(0px) scale(1)"
                }
            ],
            {
                duration: 900,

                easing:
                    "cubic-bezier(.35, .8, .45, 1)",

                fill: "forwards"
            }
        );


    await entranceAnimation.finished;


    entranceAnimation.cancel();


    // -------------------------
    // FADE TIMER CONTENT BACK IN
    // -------------------------

    const contentAppear =
        tomatoContent.animate(
            [
                {
                    opacity: 0
                },

                {
                    opacity: 1
                }
            ],
            {
                duration: 300,

                easing:
                    "ease-out",

                fill: "forwards"
            }
        );


    await contentAppear.finished;


    contentAppear.cancel();


    tomatoContent.style.opacity =
        "1";
}


// =========================================
// MOVE TO BREAK
// =========================================

function moveToBreak() {

    waitingForAccomplishment =
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
            ".basket-tomato:not(.new-tomato)"
        );


    tomatoes.forEach(
        function (
            littleTomato,
            index
        ) {

            const delay =
                index * 35;


            setTimeout(
                function () {

                    littleTomato
                        .classList
                        .remove(
                            "idle-wiggle"
                        );


                    littleTomato
                        .classList
                        .add(
                            "tomato-jiggle"
                        );


                    setTimeout(
                        function () {

                            littleTomato
                                .classList
                                .remove(
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

            const littleTomato =
                document.createElement(
                    "div"
                );


            littleTomato.classList.add(
                "basket-tomato"
            );


            const rotation =
                rotations[
                    index %
                    rotations.length
                ];


            littleTomato.style.setProperty(
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

                littleTomato.classList.add(
                    "new-tomato"
                );


                littleTomato.addEventListener(
                    "animationend",
                    function () {

                        littleTomato
                            .classList
                            .remove(
                                "new-tomato"
                            );

                    },
                    {
                        once: true
                    }
                );
            }


            basketTomatoes.appendChild(
                littleTomato
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


    const delay =
        3000 +
        Math.random() *
        4000;


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


    const littleTomato =
        tomatoes[
            randomIndex
        ];


    if (
        littleTomato
            .classList
            .contains(
                "new-tomato"
            )

        ||

        littleTomato
            .classList
            .contains(
                "tomato-jiggle"
            )
    ) {
        return;
    }


    littleTomato.classList.add(
        "idle-wiggle"
    );


    littleTomato.addEventListener(
        "animationend",
        function () {

            littleTomato
                .classList
                .remove(
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
                        hour:
                            "numeric",

                        minute:
                            "2-digit"
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