// Storage Layer — localStorage with IndexedDB upgrade path
// All data stays on-device. No external calls.

const STORAGE_PREFIX = 'itrain_';

// --- localStorage helpers (primary storage) ---

/**
 * Save a value to localStorage.
 * @param {string} key
 * @param {*} value - Will be JSON-serialized
 */
export function save(key, value) {
    try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
        console.warn('Storage save failed:', e);
    }
}

/**
 * Load a value from localStorage.
 * @param {string} key
 * @param {*} fallback - Default value if key not found
 * @returns {*}
 */
export function load(key, fallback = null) {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + key);
        return raw !== null ? JSON.parse(raw) : fallback;
    } catch (e) {
        console.warn('Storage load failed:', e);
        return fallback;
    }
}

/**
 * Remove a value from localStorage.
 * @param {string} key
 */
export function remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
}

/**
 * Clear all iTrain data from localStorage.
 */
export function clearAll() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(k);
        }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
}

// --- Session History ---

/**
 * Save a completed workout session.
 * @param {object} session - { date, exercises: [{ id, weight, sets, reps, rpe, skipped, swapped }] }
 */
export function saveSession(session) {
    const history = load('history', []);
    history.push({
        ...session,
        date: session.date || new Date().toISOString()
    });
    save('history', history);
}

/**
 * Get all saved sessions, newest first.
 * @returns {object[]}
 */
export function getHistory() {
    return load('history', []).sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Get recent sessions for a specific exercise.
 * @param {string} exerciseId
 * @param {number} count - Number of sessions to return
 * @returns {object[]}
 */
export function getExerciseHistory(exerciseId, count = 5) {
    const history = getHistory();
    const results = [];

    for (const session of history) {
        if (!session.exercises) continue;
        const entry = session.exercises.find(e => e.id === exerciseId && !e.skipped);
        if (entry) {
            results.push({ ...entry, date: session.date });
            if (results.length >= count) break;
        }
    }

    return results;
}

/**
 * Get the max volume ever recorded for an exercise.
 * @param {string} exerciseId
 * @returns {number}
 */
export function getMaxVolume(exerciseId) {
    const history = getHistory();
    let max = 0;

    for (const session of history) {
        if (!session.exercises) continue;
        const entry = session.exercises.find(e => e.id === exerciseId && !e.skipped);
        if (entry && entry.weight && entry.sets && entry.reps) {
            const vol = entry.sets * entry.reps * entry.weight;
            if (vol > max) max = vol;
        }
    }

    return max;
}

// --- User Profile ---

/**
 * Save the user profile (body weight, experience, medical flags).
 * @param {object} profile
 */
export function saveProfile(profile) {
    save('profile', profile);
}

/**
 * Load the user profile.
 * @returns {object|null}
 */
export function getProfile() {
    return load('profile', null);
}

/**
 * Check if a user profile exists (first-launch detection).
 * @returns {boolean}
 */
export function hasProfile() {
    return getProfile() !== null;
}

// --- Exercise Weight Tracking ---

/**
 * Save the current working weight for an exercise (primary or alt).
 * @param {string} exerciseId
 * @param {number} weight
 * @param {boolean} isAlt - Whether this is the alternative exercise weight
 */
export function saveWeight(exerciseId, weight, isAlt = false) {
    const key = isAlt ? `weight_alt_${exerciseId}` : `weight_${exerciseId}`;
    save(key, weight);
}

/**
 * Get the current working weight for an exercise.
 * @param {string} exerciseId
 * @param {boolean} isAlt
 * @returns {number|null}
 */
export function getWeight(exerciseId, isAlt = false) {
    const key = isAlt ? `weight_alt_${exerciseId}` : `weight_${exerciseId}`;
    return load(key, null);
}

// --- Training Streak ---

/**
 * Get training dates for the consistency heat map.
 * @returns {string[]} Array of ISO date strings
 */
export function getTrainingDates() {
    const history = getHistory();
    return history.map(s => s.date ? s.date.split('T')[0] : null).filter(Boolean);
}

/**
 * Update the most recently saved session with mood and notes.
 * @param {string} notes - Short text note about the session
 * @param {string} mood - One of: 'great', 'good', 'okay', 'tough'
 */
export function updateLatestSessionNotes(notes, mood) {
    const history = load('history', []);
    if (history.length === 0) return;
    const last = history[history.length - 1];
    last.notes = notes;
    last.mood = mood;
    save('history', history);
}

// --- Program Selection ---

/**
 * Get the user's current active program.
 * @returns {{ id: string, startDate: string }}
 */
export function getCurrentProgram() {
    return load('program', { id: 'foundation', startDate: new Date().toISOString() });
}

/**
 * Switch to a new program (resets startDate to today).
 * @param {string} programId
 */
export function setCurrentProgram(programId) {
    save('program', { id: programId, startDate: new Date().toISOString() });
}

/**
 * Get current week number within the active program (1-indexed).
 * @returns {number}
 */
export function getCurrentProgramWeek() {
    const { startDate } = getCurrentProgram();
    const start = new Date(startDate);
    const now = new Date();
    const diffDays = Math.floor((now - start) / 86400000);
    return Math.max(1, Math.floor(diffDays / 7) + 1);
}

// --- Data Portability ---

/**
 * Export all iTrain data as a structured JSON object.
 * @returns {{ version: number, exportedAt: string, data: object }}
 */
export function exportAllData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
            try { data[k] = JSON.parse(localStorage.getItem(k)); }
            catch { data[k] = localStorage.getItem(k); }
        }
    }
    return { version: 1, exportedAt: new Date().toISOString(), data };
}

/**
 * Import a previously exported backup, overwriting current data.
 * @param {{ version: number, data: object }} backup
 */
export function importAllData(backup) {
    if (!backup || !backup.data) throw new Error('Invalid backup file.');
    for (const [k, v] of Object.entries(backup.data)) {
        if (k.startsWith(STORAGE_PREFIX)) {
            localStorage.setItem(k, JSON.stringify(v));
        }
    }
}

/**
 * Get the last month (YYYY-MM) when the backup reminder was shown.
 * @returns {string|null}
 */
export function getLastBackupReminderMonth() {
    return load('backup_reminded', null);
}

/**
 * Record that the backup reminder was shown this month.
 * @param {string} yearMonth - e.g. "2026-03"
 */
export function setLastBackupReminderMonth(yearMonth) {
    save('backup_reminded', yearMonth);
}
