// Rest Timer with Haptics
// Countdown timer that triggers on "Set Complete"

let timerInterval = null;
let timerCallback = null;

/**
 * Start a rest countdown timer.
 * @param {number} seconds - Duration in seconds (default 90)
 * @param {function} onTick - Called each second with remaining time
 * @param {function} onComplete - Called when timer hits zero
 */
export function startTimer(seconds = 90, onTick, onComplete) {
    stopTimer();

    let timeLeft = seconds;

    // Initial tick
    if (onTick) onTick(timeLeft, seconds);

    timerInterval = setInterval(() => {
        timeLeft--;

        if (onTick) onTick(timeLeft, seconds);

        if (timeLeft <= 0) {
            stopTimer();
            triggerNotification();
            if (onComplete) onComplete();
        }
    }, 1000);

    timerCallback = onComplete;
}

/**
 * Stop the currently running timer.
 */
export function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

/**
 * Check if a timer is currently running.
 * @returns {boolean}
 */
export function isTimerRunning() {
    return timerInterval !== null;
}

/**
 * Format seconds as M:SS string.
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Trigger haptic feedback and/or notification sound.
 */
function triggerNotification() {
    // Haptic vibration (mobile browsers that support it)
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Play a short notification tone using Web Audio API
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = 880; // A5 note
        osc.type = 'sine';
        gain.gain.value = 0.3;

        osc.start();
        osc.stop(ctx.currentTime + 0.5);

        // Second beep
        setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.frequency.value = 1100;
            osc2.type = 'sine';
            gain2.gain.value = 0.3;
            osc2.start();
            osc2.stop(ctx.currentTime + 0.3);
        }, 600);
    } catch (e) {
        // Audio not available — silent fallback
    }
}
