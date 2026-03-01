// Exercise Library & Medical Concern Mappings
// Inspired by Josh Shepherd's "Pristine 16" Phase 1 & Dr. John Rusin's 6x6 Protocol

export const exercises = [
    {
        id: 'squat',
        name: 'Back Squat',
        alt: 'Goblet Squat',
        pattern: 'Squat',
        sets: 4,
        reps: 8,
        tempo: '3-0-1-0',
        video: 'https://www.youtube.com/shorts/demo_squat',
        notes: 'Drive knees out, brace core, chest up.'
    },
    {
        id: 'bench',
        name: 'Bench Press',
        alt: 'Push-Ups',
        pattern: 'Push',
        sets: 4,
        reps: 8,
        tempo: '3-0-1-0',
        video: 'https://www.youtube.com/shorts/demo_bench',
        notes: 'Retract shoulder blades, feet flat, controlled descent.'
    },
    {
        id: 'rdl',
        name: 'Romanian Deadlift',
        alt: 'Kettlebell Deadlift',
        pattern: 'Hinge',
        sets: 3,
        reps: 10,
        tempo: '3-0-1-0',
        video: 'https://www.youtube.com/shorts/demo_rdl',
        notes: 'Hinge at hips, soft knees, feel hamstring stretch.'
    },
    {
        id: 'row',
        name: 'Strict Rows',
        alt: 'Band Rows',
        pattern: 'Pull',
        sets: 4,
        reps: 10,
        tempo: '2-1-1-0',
        video: 'https://www.youtube.com/shorts/demo_row',
        notes: 'Squeeze shoulder blades at the top, no momentum.'
    },
    {
        id: 'lunge',
        name: 'Reverse Lunges',
        alt: 'Step-Ups',
        pattern: 'Lunge',
        sets: 3,
        reps: 12,
        tempo: '2-0-1-0',
        video: 'https://www.youtube.com/shorts/demo_lunge',
        notes: 'Control the descent, knee tracks over toe.'
    },
    {
        id: 'press',
        name: 'Seated Press',
        alt: 'Landmine Press',
        pattern: 'Press',
        sets: 3,
        reps: 12,
        tempo: '2-0-1-0',
        video: 'https://www.youtube.com/shorts/demo_press',
        notes: 'Brace core, press straight overhead, no arching.'
    },
    {
        id: 'thrust',
        name: 'Hip Thrusts',
        alt: 'Glute Bridge',
        pattern: 'Glute',
        sets: 3,
        reps: 12,
        tempo: '2-1-1-0',
        video: 'https://www.youtube.com/shorts/demo_thrust',
        notes: 'Full hip extension at top, squeeze glutes hard.'
    },
    {
        id: 'carry',
        name: "Farmer's Walk",
        alt: 'Suitcase Carry',
        pattern: 'Carry',
        sets: 3,
        reps: 30, // meters
        repsUnit: 'm',
        tempo: null,
        video: 'https://www.youtube.com/shorts/demo_carry',
        notes: 'Shoulders packed, tall posture, steady pace.'
    }
];

// Medical concern mappings
// Maps a body region to the exercises that should be swapped and safety notes
export const medicalMappings = {
    lower_back: {
        label: 'Lower Back',
        swaps: {
            squat: {
                reason: 'Keeps torso upright, reduces shear force on the lumbar spine.',
                safetyNote: 'Focus on bracing: take a deep breath into your belly before each rep. Keep your core tight throughout the movement.'
            }
        }
    },
    shoulder: {
        label: 'Shoulder Impingement',
        swaps: {
            press: {
                reason: 'Safer overhead trajectory that reduces impingement risk.',
                safetyNote: 'Avoid pressing directly overhead if you feel a pinch. The landmine angle keeps your shoulder in a safer position.'
            }
        }
    },
    knee: {
        label: 'Knee Sensitivity',
        swaps: {
            lunge: {
                reason: 'Easier to control the eccentric (lowering) phase and reduce knee stress.',
                safetyNote: 'Keep a controlled pace. If you feel sharp pain (not just discomfort), stop and reduce the range of motion.'
            }
        }
    }
};

// Superset pairings (optional grouping)
export const supersetPairs = [
    { a: 'bench', b: 'row', label: 'Bench + Row' },
    { a: 'press', b: 'lunge', label: 'Press + Lunge' }
];

/**
 * Get the active exercise list based on the user's medical profile.
 * If a medical flag is set, the primary exercise is swapped to its alternative.
 */
export function getActiveExercises(medicalFlags = []) {
    return exercises.map(ex => {
        const copy = { ...ex };
        copy.isSwapped = false;
        copy.safetyNote = null;

        for (const flag of medicalFlags) {
            const mapping = medicalMappings[flag];
            if (mapping && mapping.swaps[ex.id]) {
                copy.isSwapped = true;
                copy.activeName = ex.alt;
                copy.safetyNote = mapping.swaps[ex.id].safetyNote;
                copy.swapReason = mapping.swaps[ex.id].reason;
                break;
            }
        }

        if (!copy.isSwapped) {
            copy.activeName = ex.name;
        }

        return copy;
    });
}
