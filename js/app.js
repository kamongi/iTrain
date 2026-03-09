// iTrain — Core App Logic
// Handles rendering, navigation, and workout session state

import { exercises } from './exercises.js';
import { programs, getProgramById } from './programs.js';
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

let activeProgram = null; // resolved program object for the current session

// --- Recovery Tips ---
const RECOVERY_TIPS = [
    'Get 7–9 hours of sleep tonight — growth hormone peaks during deep sleep.',
    'Eat a protein-rich meal within 2 hours of your workout to kickstart muscle repair.',
    'Stay hydrated: aim for at least 2–3 litres of water today and tomorrow.',
    'Light walking or movement today helps flush metabolic waste without adding stress.',
    'Foam-roll or stretch the muscles you trained for 10–15 minutes tonight.',
    'Avoid another heavy session tomorrow — give your body at least 48 hours to adapt.',
    'Contrast showers (1 min hot, 1 min cold, repeat × 3) can reduce muscle soreness.',
    'Prioritise carbohydrates post-workout to replenish glycogen stores in your muscles.',
    'Before your next session: if still sore, reduce working weight by 10% as a deload.',
    'Take short 5-minute walks every hour today to prevent stiffness and aid circulation.'
];

// --- Video Cycling State ---
// Tracks current video index per exercise so errors auto-advance to the next backup
const _videoState = {}; // { exId: { ids: string[], index: number } }

function _tryNextVideo(exId) {
    const state = _videoState[exId];
    if (!state) return;
    state.index++;
    if (state.index >= state.ids.length) {
        const container = document.getElementById(`video-${exId}`);
        if (container && !container.classList.contains('hidden')) {
            container.innerHTML = '<div class="video-unavailable">All backup videos are unavailable for this exercise.</div>';
        }
        return;
    }
    const iframe = document.querySelector(`iframe[data-exid="${exId}"]`);
    if (iframe) {
        iframe.src = `https://www.youtube.com/embed/${state.ids[state.index]}?autoplay=1&rel=0&enablejsapi=1`;
    }
}

// YouTube IFrame postMessage error listener — fires when a video is unavailable or embedding blocked
window.addEventListener('message', function (event) {
    if (event.origin !== 'https://www.youtube.com') return;
    let data;
    try { data = JSON.parse(event.data); } catch (e) { return; }
    if (data.event !== 'error') return;
    // Match error to its iframe via contentWindow reference
    document.querySelectorAll('iframe[data-exid]').forEach(iframe => {
        if (iframe.contentWindow === event.source) {
            _tryNextVideo(iframe.dataset.exid);
        }
    });
});

// --- Install Banner ---
// Captures the Android native install prompt before it fires so we can defer it.
let _deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _deferredInstallPrompt = e;
});

function maybeShowInstallBanner() {
    // Skip if already dismissed, or already running as installed app
    if (localStorage.getItem('itrain_install_dismissed')) return;
    if (window.navigator.standalone) return; // iOS standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) return; // Android standalone

    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);

    if (!isIOS && !isAndroid) return; // Desktop: skip

    const msg = isIOS
        ? `Tap the <strong>Share ⎙</strong> button in Safari, then <strong>"Add to Home Screen"</strong> for the best experience.`
        : `Tap <strong>"Add to Home Screen"</strong> in your browser menu to use iTrain like a native app.`;

    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.innerHTML = `
        <span class="install-banner-msg">${msg}</span>
        <div class="install-banner-actions">
            ${_deferredInstallPrompt ? `<button class="install-banner-btn install-banner-install" id="install-btn">Add to Home Screen</button>` : ''}
            <button class="install-banner-btn install-banner-dismiss" id="install-dismiss">✕</button>
        </div>
    `;
    document.body.insertBefore(banner, document.body.firstChild);

    document.getElementById('install-dismiss').addEventListener('click', () => {
        banner.remove();
        localStorage.setItem('itrain_install_dismissed', '1');
    });

    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            _deferredInstallPrompt.prompt();
            const { outcome } = await _deferredInstallPrompt.userChoice;
            if (outcome === 'accepted') {
                banner.remove();
                localStorage.setItem('itrain_install_dismissed', '1');
            }
            _deferredInstallPrompt = null;
        });
    }
}

// --- Initialization ---
export function init() {
    if (!storage.hasProfile()) {
        showProfileModal();
    } else {
        renderApp();
    }
    maybeShowInstallBanner();
}

function showProfileModal() {
    const app = document.getElementById('app');
    app.innerHTML = renderProfileModal((profile) => {
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
    const programData = storage.getCurrentProgram();
    activeProgram = getProgramById(programData.id);
    const activeExercises = activeProgram.getActiveExercises(medicalFlags);
    const quote = getRandomQuote();

    sessionState.exercises = activeExercises.map(ex => ({
        id: ex.id,
        weight: storage.getWeight(ex.id, ex.isSwapped) || 0,
        rpe: 7,
        reps: 5,
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

        <nav class="nav-tabs">
            <button class="nav-tab active" id="tab-home" onclick="window._itrainShowTab('home')">Home</button>
            <button class="nav-tab" id="tab-train" onclick="window._itrainShowTab('train')">Train</button>
            <button class="nav-tab" id="tab-progress" onclick="window._itrainShowTab('progress')">Progress</button>
        </nav>

        <div id="view-home">
            ${renderHomePage(activeProgram)}
        </div>

        <div id="view-train" class="hidden">
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
        </div>

        <div id="view-progress" class="hidden">
            ${renderDashboard()}
        </div>

        <footer>
            <div class="footer-links no-print">
                <button class="footer-link-btn footer-link-clear" onclick="window._itrainClearData()" title="Erase all local data">
                    🔒 Clear Data
                </button>
            </div>
        </footer>
    `;

    setupGlobalHandlers(activeExercises, profile);
}

// ===========================================================================
// HOME PAGE
// ===========================================================================

function renderHomePage(program) {
    const currentWeek = storage.getCurrentProgramWeek();
    const clampedWeek = Math.min(currentWeek, program.durationWeeks);
    const progress = Math.round((clampedWeek / program.durationWeeks) * 100);
    const exList = program.getExercises();

    return `
        <div class="home-page">

            <!-- Current Program Hero -->
            <div class="program-hero" style="border-color:${program.color}20;background:linear-gradient(135deg,${program.colorDim}40 0%,#111 100%)">
                <div class="program-hero-header">
                    <div>
                        <div class="phase-badge" style="background:${program.colorDim};color:${program.color}">Phase ${program.phase} · ${program.durationLabel}</div>
                        <h2 class="program-name" style="color:${program.color}">${program.icon} ${program.name}</h2>
                        <p class="program-tagline">${program.tagline}</p>
                    </div>
                </div>

                <div class="program-progress-wrap">
                    <div class="program-progress-bar">
                        <div class="program-progress-fill" style="width:${progress}%;background:${program.color}"></div>
                    </div>
                    <div class="program-progress-label">Week ${clampedWeek} of ${program.durationWeeks} &nbsp;·&nbsp; ${progress}% complete</div>
                </div>
            </div>

            <!-- CTA -->
            <button class="btn-cta" style="background:${program.color}" onclick="window._itrainShowTab('train')">→ Start Today's Session</button>

            <!-- Description -->
            <div class="home-card">
                <p class="program-description">${program.description}</p>
                <div class="program-goals">
                    ${program.goals.map(g => `<div class="goal-item"><span class="goal-check" style="color:${program.color}">✓</span>${g}</div>`).join('')}
                </div>
            </div>

            <!-- Protocol info -->
            <div class="home-card protocol-card">
                <div class="protocol-row">
                    <span class="protocol-label">Protocol</span>
                    <span class="protocol-value">${program.protocol}</span>
                </div>
                <div class="protocol-row">
                    <span class="protocol-label">Structure</span>
                    <span class="protocol-value">${program.structure}</span>
                </div>
            </div>

            <!-- Exercise chips -->
            <div class="home-card">
                <div class="home-card-title">This Program · ${exList.length} Exercises</div>
                <div class="exercise-chips">
                    ${exList.map(e => `<span class="exercise-chip" style="border-color:${program.color}30">${e.name}</span>`).join('')}
                </div>
            </div>

            <!-- Phase Journey Timeline -->
            <div class="home-card">
                <div class="home-card-title">Your Journey</div>
                <div class="phase-timeline">
                    ${programs.map((p, i) => `
                        <div class="phase-timeline-node ${p.id === program.id ? 'active' : (p.phase < program.phase ? 'done' : '')}">
                            <div class="phase-node-left">
                                <div class="phase-dot" style="${p.id === program.id ? `background:${p.color};border-color:${p.color}` : (p.phase < program.phase ? `background:#333;border-color:#555` : `border-color:#333`)}">${p.phase < program.phase ? '✓' : p.phase}</div>
                                ${i < programs.length - 1 ? `<div class="phase-line ${p.phase < program.phase ? 'done' : ''}"></div>` : ''}
                            </div>
                            <div class="phase-node-info">
                                <div class="phase-node-name" style="${p.id === program.id ? `color:${p.color}` : ''}">${p.icon} ${p.name}</div>
                                <div class="phase-node-duration">${p.durationLabel}</div>
                                ${p.id === program.id ? `<div class="phase-node-current" style="color:${p.color}">← current</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Switch Program -->
            <div class="home-card program-switch-card">
                <div class="home-card-title">Switch Program</div>
                <p class="program-switch-hint">Ready to advance? Or revisit a previous phase? Pick a program below.</p>
                <div class="program-switch-list">
                    ${programs.map(p => `
                        <button class="program-switch-btn ${p.id === program.id ? 'active' : ''}" onclick="window._itrainSwitchProgram('${p.id}')" style="${p.id === program.id ? `border-color:${p.color};background:${p.colorDim}30` : ''}">
                            <span class="psb-icon">${p.icon}</span>
                            <span class="psb-info">
                                <span class="psb-name" style="${p.id === program.id ? `color:${p.color}` : ''}">${p.name}</span>
                                <span class="psb-dur">${p.durationLabel}</span>
                            </span>
                            ${p.id === program.id ? '<span class="psb-active-badge">Active</span>' : '<span class="psb-arrow">→</span>'}
                        </button>
                    `).join('')}
                </div>
            </div>

        </div>
    `;
}

// --- Dashboard ---
function renderDashboard() {
    const history = storage.getHistory();
    const trainingDates = storage.getTrainingDates();
    const totalSessions = history.length;
    const streak = computeStreak(trainingDates);
    const totalVol = history.reduce((sum, s) => {
        if (!s.exercises) return sum;
        return sum + s.exercises.reduce((sv, e) => {
            if (e.skipped || !e.weight || !e.sets || !e.reps) return sv;
            return sv + e.sets * e.reps * e.weight;
        }, 0);
    }, 0);

    return `
        <div class="dashboard">
            <h2 class="mb-2">Progress</h2>
            <div class="dash-stats">
                <div class="dash-stat">
                    <div class="dash-stat-value">${totalSessions}</div>
                    <div class="dash-stat-label">Sessions</div>
                </div>
                <div class="dash-stat">
                    <div class="dash-stat-value">${streak}</div>
                    <div class="dash-stat-label">Day Streak</div>
                </div>
                <div class="dash-stat">
                    <div class="dash-stat-value">${formatVolumeLbl(totalVol)}</div>
                    <div class="dash-stat-label">Volume</div>
                </div>
            </div>

            <div class="heatmap-container">
                <div class="heatmap-legend">Last 10 Weeks</div>
                <div class="heatmap-day-labels">
                    <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
                <div class="heatmap-grid">${buildCalendarCells(trainingDates)}</div>
                <div class="heatmap-key">
                    <span class="heatmap-cell" style="display:inline-block;width:12px;height:12px;vertical-align:middle;"></span>&nbsp;Rest&nbsp;&nbsp;
                    <span class="heatmap-cell active" style="display:inline-block;width:12px;height:12px;vertical-align:middle;"></span>&nbsp;Trained
                </div>
            </div>

            <h3 class="mt-4 mb-2">Recent Sessions</h3>
            ${buildRecentSessions(history.slice(0, 5))}
        </div>
    `;
}

function computeStreak(trainingDates) {
    const dateSet = new Set(trainingDates);
    const today = new Date().toISOString().split('T')[0];
    const d = new Date();
    let streak = 0;
    // Start from yesterday if today not yet logged, today if already logged
    if (!dateSet.has(today)) d.setDate(d.getDate() - 1);
    for (let i = 0; i < 365; i++) {
        const ds = d.toISOString().split('T')[0];
        if (dateSet.has(ds)) {
            streak++;
            d.setDate(d.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

function formatVolumeLbl(v) {
    if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
    if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
    return v.toLocaleString();
}

function buildCalendarCells(trainingDates) {
    const dateSet = new Set(trainingDates);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    // Align to Monday of the week 10 weeks ago
    const start = new Date(today);
    start.setDate(today.getDate() - 69);
    const dow = start.getDay(); // 0=Sun
    start.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1));
    const cells = [];
    for (let i = 0; i < 70; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const ds = d.toISOString().split('T')[0];
        const cls = ['heatmap-cell'];
        if (dateSet.has(ds)) cls.push('active');
        if (ds === todayStr) cls.push('today');
        if (ds > todayStr) cls.push('future');
        cells.push(`<div class="${cls.join(' ')}" title="${ds}"></div>`);
    }
    return cells.join('');
}

function buildRecentSessions(sessions) {
    if (!sessions.length) {
        return '<p class="empty-state">No sessions yet. Complete your first workout!</p>';
    }
    const moodMap = { great: '💪', good: '👍', okay: '😐', tough: '😤' };
    return sessions.map(s => {
        const date = new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const done = (s.exercises || []).filter(e => !e.skipped);
        const vol = done.reduce((sum, e) => sum + (e.sets * e.reps * (e.weight || 0)), 0);
        const moodIcon = s.mood ? `<span class="mood-badge">${moodMap[s.mood] || ''} ${s.mood}</span>` : '';
        return `
            <div class="history-entry">
                <div class="history-date">${date} ${moodIcon}</div>
                ${done.map(e => `
                    <div class="history-exercise">
                        <span>${e.name}</span>
                        <span>${e.sets}×${e.reps} @ ${e.weight || '—'} lbs</span>
                    </div>`).join('')}
                ${vol ? `<div class="history-vol">Volume: ${vol.toLocaleString()} lbs${s.notes ? ' · ' + s.notes : ''}</div>` : ''}
            </div>`;
    }).join('');
}

// --- Exercise Card ---
function renderExerciseCard(ex, index) {
    const savedWeight = storage.getWeight(ex.id, ex.isSwapped) || '';

    const history = storage.getExerciseHistory(ex.id, 2);
    let suggestionHtml = '';
    let deloadHtml = '';

    if (history.length > 0) {
        const lastSession = history[0];
        if (lastSession.rpe && lastSession.weight) {
            const suggestion = suggestNextWeight(lastSession.weight, lastSession.rpe);
            const cssClass = suggestion.action === 'increase' ? 'increase' : 'maintain';
            suggestionHtml = `<div class="suggestion ${cssClass}">${suggestion.suggestion}</div>`;
            const deloadCheck = checkDeload(history);
            if (deloadCheck.shouldDeload) {
                deloadHtml = `<div class="suggestion deload">${deloadCheck.message}</div>`;
            }
        }
    }

    let safetyHtml = '';
    if (ex.safetyNote) {
        safetyHtml = `<div class="safety-note">${ex.safetyNote}</div>`;
    }

    return `
        <div class="card" id="card-${ex.id}">
            <div class="card-header">
                <div>
                    <h3 id="title-${ex.id}">${ex.activeName}</h3>
                    <span class="card-pattern">${ex.pattern} &bull; ${ex.sets} sets</span>
                    ${ex.tempo ? `<span class="card-tempo">Tempo: ${ex.tempo}</span>` : ''}
                </div>
                <button class="card-video-btn" id="video-btn-${ex.id}" onclick="window._itrainToggleVideo('${ex.id}')" title="Watch demo">&#x25B6;</button>
            </div>
            <div id="video-${ex.id}" class="video-container hidden"></div>

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

            <div class="input-row reps-row">
                <span class="reps-label">Reps</span>
                <button class="reps-btn" onclick="window._itrainAdjustReps('${ex.id}', -1)">−</button>
                <span class="reps-value" id="reps-val-${ex.id}">5</span>
                <button class="reps-btn" onclick="window._itrainAdjustReps('${ex.id}', 1)">+</button>
            </div>

            <div class="input-row">
                <span class="weight-unit" id="sets-label-${ex.id}">Sets: 0/${ex.sets}</span>
                <button class="btn-done" id="done-${ex.id}" onclick="window._itrainSetDone('${ex.id}', ${ex.sets})">Set Done</button>
            </div>

            <div id="warmup-${ex.id}" class="hidden"></div>

            <div class="flex-actions">
                <button class="flex-btn" id="switch-btn-${ex.id}" onclick="window._itrainSwitch('${ex.id}')">Switch to ${ex.isSwapped ? ex.name : ex.alt}</button>
                <button class="flex-btn" id="skip-btn-${ex.id}" onclick="window._itrainSkip('${ex.id}')">Skip Today</button>
                <button class="flex-btn" onclick="window._itrainShowWarmup('${ex.id}')">Warm-Up</button>
            </div>
        </div>
    `;
}

// --- Global Event Handlers ---
function setupGlobalHandlers(activeExercises, profile) {
    const restSeconds = (profile && profile.restTime) ? profile.restTime : 120;
    let lastSessionData = null;

    // Update plate visual — defined first because it's called during initialization below
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

    // Update plate display for initial weights
    activeExercises.forEach(ex => {
        window._itrainUpdatePlates(ex.id);
    });

    // Adjust reps stepper
    window._itrainAdjustReps = function (exId, delta) {
        const state = sessionState.exercises.find(e => e.id === exId);
        if (!state) return;
        state.reps = Math.max(1, (state.reps || 5) + delta);
        const el = document.getElementById(`reps-val-${exId}`);
        if (el) el.textContent = state.reps;
    };

    // Set Done
    window._itrainSetDone = function (exId, totalSets) {
        const state = sessionState.exercises.find(e => e.id === exId);
        if (!state || state.done) return;

        state.setsCompleted++;
        const weight = parseFloat(document.getElementById(`weight-${exId}`).value) || 0;
        const rpe = parseInt(document.getElementById(`rpe-${exId}`).value) || 7;
        state.weight = weight;
        state.rpe = rpe;

        storage.saveWeight(exId, weight, state.swapped);
        document.getElementById(`sets-label-${exId}`).textContent = `Sets: ${state.setsCompleted}/${totalSets}`;

        if (state.setsCompleted >= totalSets) {
            state.done = true;
            const btn = document.getElementById(`done-${exId}`);
            btn.textContent = 'Complete ✓';
            btn.classList.add('completed');
            btn.disabled = true;

            const vol = calculateVolume(totalSets, state.reps || 5, weight);
            const maxVol = storage.getMaxVolume(exId);
            const prCheck = detectPR(vol, maxVol);
            if (prCheck.isPR) {
                const card = document.getElementById(`card-${exId}`);
                card.insertAdjacentHTML('beforeend', `<div class="pr-alert">${prCheck.message}</div>`);
            }
        } else {
            showTimer(restSeconds);
        }
    };

    // Switch exercise
    window._itrainSwitch = function (exId) {
        const exList = activeProgram ? activeProgram.getExercises() : exercises;
        const ex = exList.find(e => e.id === exId);
        if (!ex) return;

        const titleEl = document.getElementById(`title-${exId}`);
        const switchBtn = document.getElementById(`switch-btn-${exId}`);
        const videoBtn = document.getElementById(`video-btn-${exId}`);
        const state = sessionState.exercises.find(e => e.id === exId);

        state.swapped = !state.swapped;

        // Close any open video and reset its cycling state so the new swap starts fresh
        const videoContainer = document.getElementById(`video-${exId}`);
        if (videoContainer) { videoContainer.innerHTML = ''; videoContainer.classList.add('hidden'); }
        if (videoBtn) videoBtn.textContent = '▶';
        delete _videoState[exId];

        if (state.swapped) {
            titleEl.textContent = ex.alt;
            state.activeName = ex.alt;
            if (switchBtn) switchBtn.textContent = `Switch to ${ex.name}`;
        } else {
            titleEl.textContent = ex.name;
            state.activeName = ex.name;
            if (switchBtn) switchBtn.textContent = `Switch to ${ex.alt}`;
        }

        const savedWeight = storage.getWeight(exId, state.swapped);
        if (savedWeight) document.getElementById(`weight-${exId}`).value = savedWeight;
        window._itrainUpdatePlates(exId);
    };

    // Skip exercise — toggleable
    window._itrainSkip = function (exId) {
        const card = document.getElementById(`card-${exId}`);
        const skipBtn = document.getElementById(`skip-btn-${exId}`);
        const state = sessionState.exercises.find(e => e.id === exId);
        if (!state) return;

        state.skipped = !state.skipped;
        card.classList.toggle('skipped', state.skipped);
        if (skipBtn) skipBtn.textContent = state.skipped ? 'Un-Skip' : 'Skip Today';
    };

    // Toggle inline YouTube video player — uses backup array with auto-advance on error
    window._itrainToggleVideo = function (exId) {
        const container = document.getElementById(`video-${exId}`);
        const btn = document.getElementById(`video-btn-${exId}`);
        if (!container) return;

        if (!container.classList.contains('hidden')) {
            container.innerHTML = '';
            container.classList.add('hidden');
            if (btn) btn.textContent = '▶';
            return;
        }

        // Determine which video array to use based on current swap state and active program
        const exList = activeProgram ? activeProgram.getExercises() : exercises;
        const ex = exList.find(e => e.id === exId);
        if (!ex) return;
        const state = sessionState.exercises.find(e => e.id === exId);
        const isSwapped = state ? state.swapped : false;
        const ids = isSwapped ? (ex.videosAlt || ex.videos) : (ex.videos || ex.videosAlt);
        if (!ids || !ids.length) return;

        // Initialise cycling state (reset if switching between primary/alt resets it)
        if (!_videoState[exId]) {
            _videoState[exId] = { ids, index: 0 };
        }

        const { ids: videoIds, index } = _videoState[exId];
        container.innerHTML = `
            <div class="video-wrapper">
                <iframe
                    data-exid="${exId}"
                    src="https://www.youtube.com/embed/${videoIds[index]}?autoplay=1&rel=0&enablejsapi=1"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                ></iframe>
            </div>`;
        container.classList.remove('hidden');
        if (btn) btn.textContent = '✕';
    };

    // Show / hide warm-up sets (toggleable)
    window._itrainShowWarmup = function (exId) {
        const warmupDiv = document.getElementById(`warmup-${exId}`);
        if (!warmupDiv.classList.contains('hidden')) {
            warmupDiv.classList.add('hidden');
            return;
        }

        const weightInput = document.getElementById(`weight-${exId}`);
        const workWeight = parseFloat(weightInput.value);

        if (!workWeight || workWeight <= 0) {
            warmupDiv.innerHTML = '<div class="warmup-section"><p class="warmup-title">Enter a work weight first</p></div>';
            warmupDiv.classList.remove('hidden');
            return;
        }

        const warmups = getWarmupWeights(workWeight);
        const ex = activeExercises.find(e => e.id === exId);
        const unit = ex && ex.repsUnit ? ex.repsUnit : 'lbs';
        warmupDiv.innerHTML = `
            <div class="warmup-section">
                <div class="warmup-title">Warm-Up Protocol</div>
                ${warmups.map((w, i) => {
                    const pct = [50, 70, 90][i];
                    return `<div class="warmup-set"><span>Set ${i + 1} — ${pct}%</span><span>${w} ${unit}</span></div>`;
                }).join('')}
            </div>
        `;
        warmupDiv.classList.remove('hidden');
    };

    // Stop timer
    window._itrainStopTimer = function () {
        stopTimer();
        document.getElementById('timer-bar').classList.add('hidden');
    };

    // Tab switching — Home / Train / Progress
    window._itrainShowTab = function (tab) {
        const homeView    = document.getElementById('view-home');
        const trainView   = document.getElementById('view-train');
        const progressView = document.getElementById('view-progress');
        const tabHome     = document.getElementById('tab-home');
        const tabTrain    = document.getElementById('tab-train');
        const tabProgress = document.getElementById('tab-progress');

        [homeView, trainView, progressView].forEach(v => v && v.classList.add('hidden'));
        [tabHome, tabTrain, tabProgress].forEach(t => t && t.classList.remove('active'));

        if (tab === 'home') {
            homeView.classList.remove('hidden');
            tabHome.classList.add('active');
        } else if (tab === 'train') {
            trainView.classList.remove('hidden');
            tabTrain.classList.add('active');
        } else {
            progressView.innerHTML = renderDashboard();
            progressView.classList.remove('hidden');
            tabProgress.classList.add('active');
        }
    };

    // Switch active program
    window._itrainSwitchProgram = function (programId) {
        if (programId === storage.getCurrentProgram().id) return;
        const prog = getProgramById(programId);
        if (!confirm(`Switch to "${prog.name}" program?\n\nThis will reset your program start date to today. Your workout history is preserved.\n\nContinue?`)) return;
        storage.setCurrentProgram(programId);
        location.reload();
    };

    // Finish session — saves data, shows enhanced completion screen
    window._itrainFinishSession = function () {
        const sessionData = {
            date: sessionState.startTime.toISOString(),
            programId: activeProgram ? activeProgram.id : 'foundation',
            exercises: sessionState.exercises.map(e => ({
                id: e.id,
                name: e.activeName,
                weight: e.weight,
                rpe: e.rpe,
                sets: e.setsCompleted,
                reps: e.reps || 5,
                skipped: e.skipped,
                swapped: e.swapped
            }))
        };

        storage.saveSession(sessionData);
        lastSessionData = sessionData;

        let totalVolume = 0;
        sessionData.exercises.forEach(e => {
            if (!e.skipped && e.weight && e.sets && e.reps) {
                totalVolume += e.sets * e.reps * e.weight;
            }
        });

        const completedCount = sessionData.exercises.filter(e => !e.skipped).length;
        const duration = getSessionDuration();
        const tips = [...RECOVERY_TIPS].sort(() => Math.random() - 0.5).slice(0, 3);

        document.getElementById('session-complete').innerHTML = `
            <div class="session-summary" id="print-summary">
                <h3>Session Complete</h3>
                <div class="summary-stat">
                    <span>Date</span>
                    <span class="value">${new Date(sessionData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                <div class="summary-stat">
                    <span>Program</span>
                    <span class="value">${activeProgram ? activeProgram.name : 'Foundation'}</span>
                </div>
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
                    <span class="value">${duration}</span>
                </div>

                <div class="session-notes-form no-print">
                    <div class="notes-label">How did it feel?</div>
                    <div class="mood-picker">
                        <button class="mood-btn" onclick="window._itrainSelectMood('great',this)" data-mood="great">💪 Great</button>
                        <button class="mood-btn" onclick="window._itrainSelectMood('good',this)" data-mood="good">👍 Good</button>
                        <button class="mood-btn" onclick="window._itrainSelectMood('okay',this)" data-mood="okay">😐 Okay</button>
                        <button class="mood-btn" onclick="window._itrainSelectMood('tough',this)" data-mood="tough">😤 Tough</button>
                    </div>
                    <textarea id="session-notes" class="session-notes-input" placeholder="Any notes about today's session…" rows="2"></textarea>
                    <button id="save-notes-btn" class="btn-save-notes" onclick="window._itrainSaveNotes()">Save Notes</button>
                </div>

                <div class="session-export no-print">
                    <button class="btn-export" onclick="window.print()">🖨 Print</button>
                    <button class="btn-export" onclick="window._itrainEmailSession()">📧 Email</button>
                </div>

                <div class="recovery-section no-print">
                    <div class="recovery-title">Today's Recovery</div>
                    ${tips.slice(0, 2).map(t => `<div class="recovery-tip">${t}</div>`).join('')}
                    <div class="recovery-title mt-4">Before Your Next Session</div>
                    <div class="recovery-tip">${tips[2]}</div>
                </div>

                <button class="btn-primary no-print" onclick="window._itrainNewSession()" style="margin-top:16px;">→ Done — View Progress</button>
            </div>
        `;

        document.getElementById('session-complete').classList.remove('hidden');
        document.getElementById('finish-btn').classList.add('hidden');

        if (window.confetti) {
            window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    };

    // Select mood
    window._itrainSelectMood = function (_mood, el) {
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
        el.classList.add('selected');
    };

    // Save session notes & mood to localStorage
    window._itrainSaveNotes = function () {
        const notes = document.getElementById('session-notes')?.value?.trim() || '';
        const mood = document.querySelector('.mood-btn.selected')?.dataset.mood || '';
        storage.updateLatestSessionNotes(notes, mood);
        const btn = document.getElementById('save-notes-btn');
        if (btn) { btn.textContent = 'Saved ✓'; btn.disabled = true; }
    };

    // Email session summary via mailto:
    window._itrainEmailSession = function () {
        if (!lastSessionData) return;
        const date = new Date(lastSessionData.date).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        const done = lastSessionData.exercises.filter(e => !e.skipped);
        const vol = done.reduce((sum, e) => sum + (e.sets * e.reps * (e.weight || 0)), 0);
        const mood = document.querySelector('.mood-btn.selected')?.dataset.mood || '';
        const notes = document.getElementById('session-notes')?.value?.trim() || '';

        const lines = [
            `Date: ${date}`,
            `Program: ${activeProgram ? activeProgram.name : 'Foundation'}`,
            `Duration: ${getSessionDuration()}`,
            mood ? `Feeling: ${mood}` : '',
            '',
            'Exercises Completed:',
            ...done.map(e => `  • ${e.name}: ${e.sets} sets × ${e.reps} reps @ ${e.weight || 0} lbs`),
            '',
            `Total Volume: ${vol.toLocaleString()} lbs`,
            notes ? `\nNotes:\n${notes}` : '',
            '',
            '— Logged with iTrain'
        ].filter(l => l !== null);

        const subject = encodeURIComponent(`iTrain Workout — ${date}`);
        const body = encodeURIComponent(lines.join('\n'));
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    // Start a new session — save tab preference then reload
    window._itrainNewSession = function () {
        sessionStorage.setItem('itrain_startTab', 'progress');
        location.reload();
    };

    // Custom app enquiry — opens pre-filled mailto
    window._itrainCustomApp = function () {
        const subject = encodeURIComponent('Custom Training App — Enquiry');
        const body = encodeURIComponent(
            'Hi,\n\nI\'m interested in a custom training app similar to iTrain.\n\n' +
            'I am a: (personal trainer / gym / athlete / other)\n\n' +
            'What I need:\n\n' +
            'Number of clients / users:\n\n' +
            'Looking forward to hearing from you!'
        );
        window.location.href = `mailto:info@kamongi.com?subject=${subject}&body=${body}`;
    };

    // Clear all data
    window._itrainClearData = function () {
        if (confirm('Erase all your local workout history? This cannot be undone.')) {
            storage.clearAll();
            location.reload();
        }
    };

    // Auto-switch to saved tab after reload (e.g. after session completion)
    const startTab = sessionStorage.getItem('itrain_startTab');
    if (startTab) {
        sessionStorage.removeItem('itrain_startTab');
        window._itrainShowTab(startTab);
    }
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
        (timeLeft) => { timerDisplay.textContent = formatTime(timeLeft); },
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
