// Exercise Library & Medical Concern Mappings
// Inspired by Josh Shepherd's "Pristine 16" Phase 1 & Dr. John Rusin's 6x6 Protocol

export const exercises = [
    {
        id: 'squat',
        name: 'Back Squat',
        alt: 'Dumbbell Goblet Squat',
        pattern: 'Squat',
        sets: 4,
        reps: 8,
        tempo: '3-0-1-0',
        videos:    ['aOzrA4FgnM0','3PRwtVpyslo','rrJIyZGlK8c','-bJIpOq-LWk','Dy28eq2PjcM','gcNh17Ckjgg','U11z1PmtohU','LuK4lwzwwqQ','-sM5af2545M','my0tLDaWyDU'],
        videosAlt: ['9KzZD_n2r64','gm4ln6PO4rc','9W5KAqHfDe8','gCESNsDsbqk','Xef_H9ZLkdY','CkFzgR55gho','7X8Z5akeDPU','dxtgqrJC6gI','Xjo_fY9Hl9w','5fH5RacAZG0'],
        notes: 'Drive knees out, brace core, chest up.'
    },
    {
        id: 'bench',
        name: 'Bench Press',
        alt: 'Dumbbell Chest Press',
        pattern: 'Push',
        sets: 4,
        reps: 8,
        tempo: '3-0-1-0',
        videos:    ['4Y2ZdHCOXok','lWFknlOTbyM','rxD321l2svE','gRVjAtPip0Y','JvOJdUtx6UQ','-J4P-XOEtFY','-MAABwVKxok','8k_57QM4jg8','iJ0py9JQIZY','vthMCtgVtFw'],
        videosAlt: ['VmB1G1K7v94','YwrzZaNqJWU','O7ECGhZj_Hc','i1fywF_g-1U','YQ2s_Y7g5Qk','ZzFblmTUxYU','5Y3VZsLb1Ys','IP4oeKh1Sd4','QsYre__-aro','SzcSrpVr0GA'],
        notes: 'Retract shoulder blades, feet flat, controlled descent.'
    },
    {
        id: 'rdl',
        name: 'Romanian Deadlift',
        alt: 'Dumbbell Romanian Deadlift',
        pattern: 'Hinge',
        sets: 3,
        reps: 10,
        tempo: '3-0-1-0',
        videos:    ['5zmlnbWb-g4','5bJEigM5iVg','3VXmecChYYM','_oyxCn2iSjU','k6cUaJasD5U','5WxMW-Fu5KU','FUwsp0OVyVM','hQgFixeXdZo','7j-2w4-P14I','WIcpu2UkJoY'],
        videosAlt: ['hQgFixeXdZo','5zmlnbWb-g4','5WxMW-Fu5KU','Ipi8_vz8_z0','ndfZi5fDaVM','uUjqvxEWcbo','ZEnWV4kguKc','WIcpu2UkJoY','plb5jEO4Unw','cWoPMoxYHz0'],
        notes: 'Hinge at hips, soft knees, feel hamstring stretch.'
    },
    {
        id: 'row',
        name: 'Strict Rows',
        alt: 'Dumbbell Bent-Over Row',
        pattern: 'Pull',
        sets: 4,
        reps: 10,
        tempo: '2-1-1-0',
        videos:    ['RQU8wZPbioA','Qzw9tpo5L_0','FWJR5Ve8bnQ','qXrTDQG1oUQ','T3N-TO4reLQ','YcK7pyFXmWk','gQBSRBgRLVI','6JVSjte9F-M','DAKGiwO9Gj0','A1tmBJKKfVs'],
        videosAlt: ['gfUg6qWohTk','ayBUERt_w6g','6gvmcqr226U','dFzUjzfih7k','5PoEksoJNaw','68XmdhvpqtA','6TSP1TRMUzs','qXrTDQG1oUQ','DMo3HJoawrU','QFq5jdwWwX4'],
        notes: 'Squeeze shoulder blades at the top, no momentum.'
    },
    {
        id: 'lunge',
        name: 'Reverse Lunges',
        alt: 'Dumbbell Reverse Lunges',
        pattern: 'Lunge',
        sets: 3,
        reps: 12,
        tempo: '2-0-1-0',
        videos:    ['Ry-wqegeKlE','ugW5I-a5A-Q','5frs7_F2SrU','7pwO2gemRyg','SXYrUTUwFoc','C_P3Q-PssvY','u_zSfK5ZFU4','U5Q5HfUyy78','xrPteyQLGAo','gxc-lNSm8UM'],
        videosAlt: ['RZKXLMxPF_I','5frs7_F2SrU','xrPteyQLGAo','hiLF_pF3EJM','sjlsISvHyZs','Q2k3kYbtOcI','SXYrUTUwFoc','9aqXSshQQks','u_zSfK5ZFU4','QwcBZLq7Jkw'],
        notes: 'Control the descent, knee tracks over toe.'
    },
    {
        id: 'press',
        name: 'Seated Press',
        alt: 'Dumbbell Shoulder Press',
        pattern: 'Press',
        sets: 3,
        reps: 12,
        tempo: '2-0-1-0',
        videos:    ['KP1sYz2VICk','YNK3eQVevIs','F3QY5vMz_6I','oBGeXxnigsQ','_RlRDWO2jfg','QAQ64hK4Xxs','nNMR9fRGRjQ','G2qpTG1Eh40','2N5P_iWkluQ','g83mWGS0Zl4'],
        videosAlt: ['rO_iEImwHyo','poD_-zaG9hk','vlFGTI5JzjI','qEwKCR5JCog','HzIiNhHhhtA','nHboL27_Sn0','hOTABpGvhBc','TsduLWuhlFM','B-aVuyhvLHU','ris9tKqMwgU'],
        notes: 'Brace core, press straight overhead, no arching.'
    },
    {
        id: 'thrust',
        name: 'Hip Thrusts',
        alt: 'Dumbbell Hip Thrust',
        pattern: 'Glute',
        sets: 3,
        reps: 12,
        tempo: '2-1-1-0',
        videos:    ['xDmFkJxPzeM','pF17m_CXfL0','LM8XHLYJoYs','C1wpa1CWauI','EF7jXP17DPE','S_uZP4UH6J0','tztHvSLdXLA','Zp26q4BY5HE','aweBS7K71l8','ZSPmIyX9RZs'],
        videosAlt: ['29OfN4ztW_g','q_kYnAShnnI','QPTcLlOWSl4','pUdIL5x0fWg','xDmFkJxPzeM','a1Gp_RevjmY','79z6y5U5w2E','004M9Rpvchk','4z_2oHvIvkA','CFF4vI0oGPg'],
        notes: 'Full hip extension at top, squeeze glutes hard.'
    },
    {
        id: 'carry',
        name: "Farmer's Walk",
        alt: 'Dumbbell Suitcase Carry',
        pattern: 'Carry',
        sets: 3,
        reps: 30, // meters
        repsUnit: 'm',
        tempo: null,
        videos:    ['nqGfgIVteoM','z7E_YU9P1jU','NH7Xv-7NQNQ','8OtwXwrJizk','E94UNm8fD-4','Ujv88lNIxP0','rt17lmnaLSM','48aT-a0w9Sg','xaVkucAW7RA','dfwx0-RVxEU'],
        videosAlt: ['NH7Xv-7NQNQ','8OtwXwrJizk','1fb0Q2d0cd0','z7E_YU9P1jU','tNHdx7pmrGI','E94UNm8fD-4','ZH9dZEiLiqA','zDjBc2tJ358','LJaq4BS7KpE','3RKKnZhhelE'],
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
                safetyNote: 'Avoid pressing directly overhead if you feel a pinch. Use a neutral grip and controlled range of motion with the dumbbells to keep your shoulder in a safer position.'
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
