// Medical Profile Questionnaire
// First-launch modal that collects body weight, experience, and joint sensitivity

import * as storage from './storage.js';

/**
 * Render the profile questionnaire modal.
 * @param {function} onComplete - Called with the profile object when submitted
 * @returns {string} HTML string for the modal
 */
export function renderProfileModal(onComplete) {
    // Store callback globally so the form handler can access it
    window._itrainProfileCallback = onComplete;

    return `
        <div id="profile-modal" class="modal-overlay">
            <div class="modal-content">
                <h2 class="modal-title">Welcome to iTrain</h2>
                <p class="modal-subtitle">Let's set up your profile. This stays on your device only.</p>

                <form id="profile-form" onsubmit="return false;">
                    <div class="form-group">
                        <label for="profile-weight">Body Weight (lbs)</label>
                        <input type="number" id="profile-weight" placeholder="e.g. 180" min="50" max="500" required>
                    </div>

                    <div class="form-group">
                        <label for="profile-experience">Training Experience</label>
                        <select id="profile-experience" required>
                            <option value="">Select...</option>
                            <option value="beginner">Beginner (0-6 months)</option>
                            <option value="intermediate">Intermediate (6-24 months)</option>
                            <option value="advanced">Advanced (2+ years)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Do you have any joint sensitivity? (select all that apply)</label>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="medical" value="lower_back">
                                <span>Lower Back</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="medical" value="shoulder">
                                <span>Shoulder</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="medical" value="knee">
                                <span>Knee</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="medical" value="none">
                                <span>None</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="profile-rest">Preferred Rest Timer (seconds)</label>
                        <select id="profile-rest">
                            <option value="90">90s (Standard)</option>
                            <option value="120" selected>120s (Recommended)</option>
                            <option value="150">150s (Heavy lifting)</option>
                            <option value="180">180s (Powerlifting)</option>
                        </select>
                    </div>

                    <button type="button" id="profile-submit" class="btn-primary" onclick="window._itrainSubmitProfile()">
                        Start Training
                    </button>
                </form>
            </div>
        </div>
    `;
}

/**
 * Set up the profile form submission handler.
 */
export function initProfileForm() {
    window._itrainSubmitProfile = function () {
        const weight = document.getElementById('profile-weight').value;
        const experience = document.getElementById('profile-experience').value;
        const restTime = document.getElementById('profile-rest').value;

        if (!weight || !experience) {
            alert('Please fill in your body weight and experience level.');
            return;
        }

        // Gather medical flags
        const checkboxes = document.querySelectorAll('input[name="medical"]:checked');
        const medicalFlags = Array.from(checkboxes)
            .map(cb => cb.value)
            .filter(v => v !== 'none');

        const profile = {
            bodyWeight: parseFloat(weight),
            experience,
            medicalFlags,
            restTime: parseInt(restTime, 10),
            createdAt: new Date().toISOString()
        };

        storage.saveProfile(profile);

        // Close modal
        const modal = document.getElementById('profile-modal');
        if (modal) modal.remove();

        // Fire callback
        if (window._itrainProfileCallback) {
            window._itrainProfileCallback(profile);
        }
    };
}

/**
 * Suggest starting weights based on body weight and experience.
 * @param {number} bodyWeight
 * @param {string} experience - 'beginner' | 'intermediate' | 'advanced'
 * @returns {object} Map of exercise ID to suggested starting weight
 */
export function suggestStartingWeights(bodyWeight, experience) {
    const multipliers = {
        beginner: {
            squat: 0.5, bench: 0.4, rdl: 0.5, row: 0.3,
            lunge: 0.2, press: 0.2, thrust: 0.4, carry: 0.3
        },
        intermediate: {
            squat: 0.8, bench: 0.6, rdl: 0.7, row: 0.5,
            lunge: 0.3, press: 0.3, thrust: 0.6, carry: 0.5
        },
        advanced: {
            squat: 1.2, bench: 0.9, rdl: 1.0, row: 0.7,
            lunge: 0.5, press: 0.5, thrust: 0.8, carry: 0.7
        }
    };

    const mults = multipliers[experience] || multipliers.beginner;
    const suggestions = {};

    for (const [exId, mult] of Object.entries(mults)) {
        // Round to nearest 5 lbs
        suggestions[exId] = Math.round((bodyWeight * mult) / 5) * 5;
    }

    return suggestions;
}
