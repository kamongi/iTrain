// Progression Engine — RPE-based Auto-Regulation
// Calculates next-week weights based on current session RPE and volume

/**
 * Suggest weight adjustment based on RPE.
 * - RPE <= 7: increase by 2.5% to 5%
 * - RPE 8: maintain
 * - RPE >= 9: maintain ("own the movement")
 *
 * @param {number} currentWeight - Current working weight in lbs
 * @param {number} rpe - Rate of Perceived Exertion (1-10)
 * @returns {{ nextWeight: number, suggestion: string, action: string }}
 */
export function suggestNextWeight(currentWeight, rpe) {
    if (rpe <= 7) {
        // Comfortable — suggest increase
        const increase = rpe <= 5 ? 0.05 : 0.025;
        const raw = currentWeight * (1 + increase);
        const nextWeight = roundToNearest(raw, 2.5);
        const pctLabel = increase === 0.05 ? '5%' : '2.5%';
        return {
            nextWeight,
            suggestion: `Felt strong! Increase by ${pctLabel} next week.`,
            action: 'increase'
        };
    }

    if (rpe === 8) {
        return {
            nextWeight: currentWeight,
            suggestion: 'Solid effort. Maintain weight and build consistency.',
            action: 'maintain'
        };
    }

    // RPE 9-10
    return {
        nextWeight: currentWeight,
        suggestion: 'Maximal effort. Stay here and own the movement.',
        action: 'maintain'
    };
}

/**
 * Check if the user should do a deload week.
 * Triggered when RPE 10 is logged two sessions in a row for the same exercise.
 *
 * @param {object[]} recentSessions - Last N sessions for an exercise (newest first)
 * @returns {{ shouldDeload: boolean, deloadWeight: number|null, message: string }}
 */
export function checkDeload(recentSessions) {
    if (recentSessions.length < 2) {
        return { shouldDeload: false, deloadWeight: null, message: '' };
    }

    const [latest, previous] = recentSessions;

    if (latest.rpe >= 10 && previous.rpe >= 10) {
        const deloadWeight = roundToNearest(latest.weight * 0.8, 2.5);
        return {
            shouldDeload: true,
            deloadWeight,
            message: `Two consecutive max-effort sessions detected. Consider a deload week at ${deloadWeight} lbs (-20%) to recover and prevent injury.`
        };
    }

    return { shouldDeload: false, deloadWeight: null, message: '' };
}

/**
 * Calculate total volume for a session.
 * Volume = sets x reps x weight
 *
 * @param {number} sets
 * @param {number} reps
 * @param {number} weight
 * @returns {number}
 */
export function calculateVolume(sets, reps, weight) {
    return sets * reps * weight;
}

/**
 * Detect a personal record (PR) by comparing current volume to historical max.
 *
 * @param {number} currentVolume
 * @param {number} historicalMax
 * @returns {{ isPR: boolean, message: string }}
 */
export function detectPR(currentVolume, historicalMax) {
    if (currentVolume > historicalMax) {
        return {
            isPR: true,
            message: 'New Personal Best! That is the most volume you have ever moved on this exercise.'
        };
    }
    return { isPR: false, message: '' };
}

/**
 * Determine if it's a new week based on the last session timestamp.
 * "New week" = more than 6 days since last session.
 *
 * @param {string|null} lastSessionDate - ISO date string of last session
 * @returns {boolean}
 */
export function isNewWeek(lastSessionDate) {
    if (!lastSessionDate) return true;

    const last = new Date(lastSessionDate);
    const now = new Date();
    const diffMs = now - last;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays > 6;
}

/**
 * Round a weight to the nearest increment.
 * @param {number} weight
 * @param {number} increment - e.g., 2.5 or 5
 * @returns {number}
 */
function roundToNearest(weight, increment) {
    return Math.round(weight / increment) * increment;
}
