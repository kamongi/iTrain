// iTrain — Core App Logic
// Handles rendering, navigation, and workout session state

import { exercises, getActiveExercises, medicalMappings } from './exercises.js';
import { getRandomQuote } from './motivation.js';
import { getPlates, getWarmupWeights, renderPlateVisual } from './plates.js';
import { startTimer, stopTimer, formatTime, isTimerRunning } from './timer.js';
import { suggestNextWeight, checkDeload, calculateVolume, detectPR, isNewWeek } from './progression.js';
import * as storage from './storage.js';
import { renderProfileModal, initProfileForm, suggestStartingWeights } from './profile.js';

// --- App State ---
let sessionState = {
    exercises: [],  // current session exercise states
    startTime: null,
    completed: false
};

// --- Initialization ---
export function init() {
    // Check if profile exists
    if (!storage.hasProfile()) {
        showProfileModal();
    } else {
        renderApp();
    }
}

function showProfileModal() {
    const app = document.getElementById('app');
    app.innerHTML = renderProfileModal((profile) => {
        // Profile submitted — set starting weights if no history
        const suggestions = suggestStartingWeights(profile.bodyWeight, profile.experience);
        for (const [exId, weight] of Object.entries(suggestions)) {
            if (!storage.getWeight(exId)) {
                storage.saveWeight(exId, weight);
            }
        }
        renderApp();
    });
    initProfileForm();
}

// --- Main Render ---
function renderApp() {
    const profile = storage.getProfile();
    const medicalFlags = profile ? profile.medicalFlags : [];
    const activeExercises = getActiveExercises(medicalFlags);
    const quote = getRandomQuote();

    // Initialize session state
    sessionState.exercises = activeExercises.map(ex => ({
        id: ex.id,
        weight: storage.getWeight(ex.id, ex.isSwapped) || 0,
        rpe: 7,
        setsCompleted: 0,
        totalSets: ex.sets,
        skipped: false,
        swapped: ex.isSwapped,
        activeName: ex.activeName,
        done: false
    }));
    sessionState.startTime = new Date();
    sessionState.completed = false;

    const app = document.getElementById('app');
    app.innerHTML = `
        <header>
            <h1>iTrain</h1>
            <p class="motivation-quote" id="quote">${quote}</p>
        </header>

        <div id="timer-bar" class="timer-bar hidden">
            <div>
                <div class="timer-display" id="timer-display">0:00</div>
                <div class="timer-label" id="timer-label">Rest Timer</div>
            </div>
            <button class="timer-btn" id="timer-btn" onclick="window._itrainStopTimer()">Skip Rest</button>
        </div>

        <div id="workout-list">
            ${activeExercises.map((ex, i) => renderExerciseCard(ex, i)).join('')}
        </div>

        <div id="session-complete" class="hidden"></div>

        <div class="mt-4">
            <button class="btn-primary" id="finish-btn" onclick="window._itrainFinishSession()">Finish Session</button>
        </div>

        <footer>
            <p>Inspired by Dr. John Rusin & Josh Shepherd</p>
            <div class="footer-actions">
                <button class="btn-clear-data" onclick="window._itrainClearData()">Privacy: Clear Data</button>
            </div>
        </footer>
    `;

    // Set up global handlers
    setupGlobalHandlers(activeExercises, profile);
}

// --- Exercise Card ---
function renderExerciseCard(ex, index) {
    const savedWeight = storage.getWeight(ex.id, ex.isSwapped) || '';
    const repsLabel = ex.repsUnit ? `${ex.sets}x${ex.reps}${ex.repsUnit}` : `${ex.sets}x${ex.reps}`;

    // Check for progression suggestion from last session
    const history = storage.getExerciseHistory(ex.id, 2);
    let suggestionHtml = '';
    let deloadHtml = '';

    if (history.length > 0) {
        const lastSession = history[0];
        if (lastSession.rpe && lastSession.weight) {
            const suggestion = suggestNextWeight(lastSession.weight, lastSession.rpe);
            const cssClass = suggestion.action === 'increase' ? 'increase' : 'maintain';
            suggestionHtml = `<div class="suggestion ${cssClass}">${suggestion.suggestion}</div>`;

            // Check deload
            const deloadCheck = checkDeload(history);
            if (deloadCheck.shouldDeload) {
                deloadHtml = `<div class="suggestion deload">${deloadCheck.message}</div>`;
            }
        }
    }

    // Safety note from medical mapping
    let safetyHtml = '';
    if (ex.safetyNote) {
        safetyHtml = `<div class="safety-note">${ex.safetyNote}</div>`;
    }

    return `
        <div class="card" id="card-${ex.id}">
            <div class="card-header">
                <div>
                    <h3 id="title-${ex.id}">${ex.activeName}</h3>
                    <span class="card-pattern">${ex.pattern} &bull; ${repsLabel}</span>
                    ${ex.tempo ? `<span class="card-tempo">Tempo: ${ex.tempo}</span>` : ''}
                </div>
                <button class="card-video-btn" onclick="window.open('${ex.video}', '_blank')" title="Watch demo">&#x25B6;</button>
            </div>

            ${safetyHtml}
            ${suggestionHtml}
            ${deloadHtml}

            <div class="input-row">
                <input type="number" id="weight-${ex.id}" class="weight-input" placeholder="lbs" value="${savedWeight}" min="0" step="2.5"
                    oninput="window._itrainUpdatePlates('${ex.id}')">
                <span class="weight-unit">lbs</span>

                <div style="display:flex;align-items:center;gap:4px;margin-left:8px;">
                    <span class="rpe-label">RPE</span>
                    <input type="range" class="rpe-slider" id="rpe-${ex.id}" min="1" max="10" value="7"
                        oninput="document.getElementById('rpe-val-${ex.id}').textContent=this.value">
                    <span class="rpe-value" id="rpe-val-${ex.id}">7</span>
                </div>
            </div>

            <div id="plates-${ex.id}" class="plate-visual"></div>

            <div class="input-row">
                <span class="weight-unit" id="sets-label-${ex.id}">Sets: 0/${ex.sets}</span>
                <button class="btn-done" id="done-${ex.id}" onclick="window._itrainSetDone('${ex.id}', ${ex.sets})">Set Done</button>
            </div>

            <div id="warmup-${ex.id}" class="hidden"></div>

            <div class="flex-actions">
                <button class="flex-btn" onclick="window._itrainSwitch('${ex.id}')">Switch to ${ex.isSwapped ? ex.name : ex.alt}</button>
                <button class="flex-btn" onclick="window._itrainSkip('${ex.id}')">Skip Today</button>
                <button class="flex-btn" onclick="window._itrainShowWarmup('${ex.id}')">Warm-Up</button>
            </div>
        </div>
    `;
}

// --- Global Event Handlers ---
function setupGlobalHandlers(activeExercises, profile) {
    const restSeconds = (profile && profile.restTime) ? profile.restTime : 120;

    // Update plate display for initial weights
    activeExercises.forEach(ex => {
        window._itrainUpdatePlates(ex.id);
    });

    // Set Done
    window._itrainSetDone = function (exId, totalSets) {
        const state = sessionState.exercises.find(e => e.id === exId);
        if (!state || state.done) return;

        state.setsCompleted++;
        const weight = parseFloat(document.getElementById(`weight-${exId}`).value) || 0;
        const rpe = parseInt(document.getElementById(`rpe-${exId}`).value) || 7;
        state.weight = weight;
        state.rpe = rpe;

        // Save weight for next time
        storage.saveWeight(exId, weight, state.swapped);

        // Update sets label
        document.getElementById(`sets-label-${exId}`).textContent = `Sets: ${state.setsCompleted}/${totalSets}`;

        if (state.setsCompleted >= totalSets) {
            state.done = true;
            const btn = document.getElementById(`done-${exId}`);
            btn.textContent = 'Complete';
            btn.classList.add('completed');
            btn.disabled = true;

            // Check for PR
            const vol = calculateVolume(totalSets, activeExercises.find(e => e.id === exId).reps, weight);
            const maxVol = storage.getMaxVolume(exId);
            const prCheck = detectPR(vol, maxVol);
            if (prCheck.isPR) {
                const card = document.getElementById(`card-${exId}`);
                card.insertAdjacentHTML('beforeend', `<div class="pr-alert">${prCheck.message}</div>`);
            }
        } else {
            // Start rest timer
            showTimer(restSeconds);
        }
    };

    // Switch exercise
    window._itrainSwitch = function (exId) {
        const ex = exercises.find(e => e.id === exId);
        if (!ex) return;

        const titleEl = document.getElementById(`title-${exId}`);
        const state = sessionState.exercises.find(e => e.id === exId);
        const isCurrentlyPrimary = titleEl.textContent === ex.name;

        if (isCurrentlyPrimary) {
            titleEl.textContent = ex.alt;
            state.swapped = true;
            state.activeName = ex.alt;
        } else {
            titleEl.textContent = ex.name;
            state.swapped = false;
            state.activeName = ex.name;
        }

        // Load saved weight for the variant
        const savedWeight = storage.getWeight(exId, state.swapped);
        if (savedWeight) {
            document.getElementById(`weight-${exId}`).value = savedWeight;
        }
        window._itrainUpdatePlates(exId);
    };

    // Skip exercise
    window._itrainSkip = function (exId) {
        const card = document.getElementById(`card-${exId}`);
        card.classList.add('skipped');
        const state = sessionState.exercises.find(e => e.id === exId);
        if (state) state.skipped = true;
    };

    // Update plate visual
    window._itrainUpdatePlates = function (exId) {
        const weightInput = document.getElementById(`weight-${exId}`);
        const platesContainer = document.getElementById(`plates-${exId}`);
        if (!weightInput || !platesContainer) return;

        const weight = parseFloat(weightInput.value);
        if (!weight || weight < 45) {
            platesContainer.innerHTML = '';
            return;
        }

        const result = getPlates(weight);
        platesContainer.innerHTML = renderPlateVisual(result.plates);
    };

    // Show warm-up sets
    window._itrainShowWarmup = function (exId) {
        const warmupDiv = document.getElementById(`warmup-${exId}`);
        const weightInput = document.getElementById(`weight-${exId}`);
        const workWeight = parseFloat(weightInput.value);

        if (!workWeight || workWeight <= 45) {
            warmupDiv.innerHTML = '<div class="warmup-section"><p class="warmup-title">Enter a work weight first</p></div>';
            warmupDiv.classList.remove('hidden');
            return;
        }

        const warmups = getWarmupWeights(workWeight);
        warmupDiv.innerHTML = `
            <div class="warmup-section">
                <div class="warmup-title">Warm-Up Protocol</div>
                ${warmups.map((w, i) => {
                    const pct = [50, 70, 90][i];
                    return `<div class="warmup-set"><span>Set ${i + 1} — ${pct}%</span><span>${w} lbs</span></div>`;
                }).join('')}
            </div>
        `;
        warmupDiv.classList.remove('hidden');
    };

    // Stop timer
    window._itrainStopTimer = function () {
        stopTimer();
        const timerBar = document.getElementById('timer-bar');
        timerBar.classList.add('hidden');
    };

    // Finish session
    window._itrainFinishSession = function () {
        const sessionData = {
            date: sessionState.startTime.toISOString(),
            exercises: sessionState.exercises.map(e => ({
                id: e.id,
                name: e.activeName,
                weight: e.weight,
                rpe: e.rpe,
                sets: e.setsCompleted,
                reps: activeExercises.find(a => a.id === e.id)?.reps || 0,
                skipped: e.skipped,
                swapped: e.swapped
            }))
        };

        storage.saveSession(sessionData);

        // Calculate total volume
        let totalVolume = 0;
        sessionData.exercises.forEach(e => {
            if (!e.skipped && e.weight && e.sets && e.reps) {
                totalVolume += e.sets * e.reps * e.weight;
            }
        });

        const completedCount = sessionData.exercises.filter(e => !e.skipped).length;

        document.getElementById('session-complete').innerHTML = `
            <div class="session-summary">
                <h3>Session Complete</h3>
                <div class="summary-stat">
                    <span>Exercises</span>
                    <span class="value">${completedCount}/${sessionData.exercises.length}</span>
                </div>
                <div class="summary-stat">
                    <span>Total Volume</span>
                    <span class="value">${totalVolume.toLocaleString()} lbs</span>
                </div>
                <div class="summary-stat">
                    <span>Duration</span>
                    <span class="value">${getSessionDuration()}</span>
                </div>
            </div>
        `;
        document.getElementById('session-complete').classList.remove('hidden');
        document.getElementById('finish-btn').classList.add('hidden');

        // Trigger confetti if available
        if (window.confetti) {
            window.confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    };

    // Clear data
    window._itrainClearData = function () {
        if (confirm('Erase all your local workout history? This cannot be undone.')) {
            storage.clearAll();
            location.reload();
        }
    };
}

// --- Timer Display ---
function showTimer(seconds) {
    const timerBar = document.getElementById('timer-bar');
    const timerDisplay = document.getElementById('timer-display');
    const timerLabel = document.getElementById('timer-label');
    const timerBtn = document.getElementById('timer-btn');

    timerBar.classList.remove('hidden');
    timerLabel.textContent = 'Rest Timer';
    timerLabel.classList.remove('timer-complete');
    timerBtn.textContent = 'Skip Rest';

    startTimer(seconds,
        (timeLeft) => {
            timerDisplay.textContent = formatTime(timeLeft);
        },
        () => {
            timerLabel.textContent = 'Rest Over! Next Set';
            timerLabel.classList.add('timer-complete');
            timerBtn.textContent = 'Dismiss';
            timerDisplay.textContent = '0:00';
        }
    );
}

// --- Helpers ---
function getSessionDuration() {
    if (!sessionState.startTime) return '0 min';
    const diff = new Date() - sessionState.startTime;
    const minutes = Math.round(diff / 60000);
    return `${minutes} min`;
}

// --- Boot ---
document.addEventListener('DOMContentLoaded', init);
