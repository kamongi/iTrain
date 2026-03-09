// iTrain — Progressive Training Programs
// Three phases designed to take you from raw beginner to fully realised athlete.
//
// Phase 1 · Foundation   (4–8 weeks)  — master movement patterns
// Phase 2 · Build        (12 weeks)   — volume, new stimulus, more muscle
// Phase 3 · Mastery      (26 weeks)   — periodised strength & peak potential
//
// Each program owns its exercise array and medical-flag swap mappings.
// getActiveExercises(medicalFlags) applies swaps and returns the session list.

import { exercises as foundationExercises, medicalMappings as foundationMedical } from './exercises.js';

// ---------------------------------------------------------------------------
// Shared helper — applies medical swaps to any exercise list + mapping object
// ---------------------------------------------------------------------------
function applyMedicalSwaps(exList, mappings, medicalFlags = []) {
    return exList.map(ex => {
        const copy = { ...ex };
        copy.isSwapped = false;
        copy.safetyNote = null;

        for (const flag of medicalFlags) {
            const mapping = mappings[flag];
            if (mapping && mapping.swaps[ex.id]) {
                copy.isSwapped = true;
                copy.activeName = ex.alt;
                copy.safetyNote = mapping.swaps[ex.id].safetyNote;
                copy.swapReason = mapping.swaps[ex.id].reason;
                break;
            }
        }

        if (!copy.isSwapped) copy.activeName = ex.name;
        return copy;
    });
}

// ===========================================================================
// PHASE 2 — BUILD (12 weeks)
// Goal: More volume, new exercises, hypertrophy + strength blend.
// Protocol: 4–5 × 5–10 for compounds; 3 × 10–15 for accessories.
// ===========================================================================

const buildExercises = [
    {
        id: 'squat',
        name: 'Back Squat',
        alt: 'Goblet Squat',
        pattern: 'Squat',
        sets: 5, reps: 5,
        tempo: '3-0-1-0',
        videos:    ['aOzrA4FgnM0','3PRwtVpyslo','rrJIyZGlK8c','-bJIpOq-LWk','Dy28eq2PjcM','gcNh17Ckjgg','U11z1PmtohU','LuK4lwzwwqQ','-sM5af2545M','my0tLDaWyDU'],
        videosAlt: ['9KzZD_n2r64','9W5KAqHfDe8','gCESNsDsbqk','gm4ln6PO4rc','CkFzgR55gho','q4CSeayuKbo','hFD8CIQM3GU','dxtgqrJC6gI','MeIiIdhvXT4','6mf0oa2GGUc'],
        notes: 'Heavier 5×5 — brace hard, drive through the floor.'
    },
    {
        id: 'deadlift',
        name: 'Conventional Deadlift',
        alt: 'Trap Bar Deadlift',
        pattern: 'Hinge',
        sets: 4, reps: 5,
        tempo: '1-0-1-2',
        videos:    ['XxWcirHIwVo','VL5Ab0T07e4','p2OPUi4xGrM','r4MzxtBKyNE','19ZeTrLZdyQ','mlOUL-Pkzls','cclUh49qOww','MBbyAqvTNkU','TM1mpvglJq4','xxFpHWEi6UE'],
        videosAlt: ['EsqwERaSTMI','a7sQPZsmxvA','1jC_nqcSCp8','5BpuTmfQjro','TU2xZ7s4jus','Jf4G9vx0MVk','2SJ9HkKaxwU','Zz_CKzN949Y','k7x-oDgcTkk','7K9wTlqg_OE'],
        notes: 'Full hip extension, bar stays close to shins throughout.'
    },
    {
        id: 'bench',
        name: 'Bench Press',
        alt: 'Push-Ups',
        pattern: 'Push',
        sets: 4, reps: 8,
        tempo: '3-0-1-0',
        videos:    ['4Y2ZdHCOXok','lWFknlOTbyM','rxD321l2svE','gRVjAtPip0Y','JvOJdUtx6UQ','-J4P-XOEtFY','-MAABwVKxok','8k_57QM4jg8','iJ0py9JQIZY','vthMCtgVtFw'],
        videosAlt: ['I9fsqKE5XHo','WDIpL0pjun0','IODxDxX7oi4','mECzqUIDWfU','bt5b9x9N0KU','i9sTjhN4Z3M','MO10KOoQx5E','hAhCweMfrF8','e22iFFXY8vw','ryncZFQCB8I'],
        notes: 'Arch slightly, drive feet, touch chest every rep.'
    },
    {
        id: 'incline',
        name: 'Incline Barbell Press',
        alt: 'Incline Dumbbell Press',
        pattern: 'Push',
        sets: 3, reps: 10,
        tempo: '3-0-1-0',
        videos:    ['5kyLUGVq_pk','SrqOu55lrYU','kQtx01Qz6s8','VFbjmiAAwJE','lJ2o89kcnxY','DutO2wEtqaw','jPLdzuHckI8','O9x7xRhtA9Q','vcjgIlEvCgU','4Y2ZdHCOXok'],
        videosAlt: ['IP4oeKh1Sd4','0f6-uCUKqgA','SHsUIZiNdeY','0G2_XV7slIg','8iPEnn-ltC8','VDU5bzE2qOE','QsYre__-aro','hChjZQhX1Ls','gl8H4QLXKTo','XgwXopZadqs'],
        notes: 'Set bench 30–45°, control the bar to upper chest.'
    },
    {
        id: 'pullup',
        name: 'Pull-Ups',
        alt: 'Band-Assisted Pull-Ups',
        pattern: 'Pull',
        sets: 4, reps: 8,
        tempo: '2-1-1-0',
        videos:    ['eGo4IYlbE5g','rmdn5X_KLkY','uj3qg3gRFTk','_hd2oTEOA1U','NIDEQeDydeU','MhokcbRLP5w','p40iUjf02j0','D-TL5hDQucI','sIvJTfGxdFo','Hdc7Mw6BIEE'],
        videosAlt: ['EkpJkHpJXmM','XEi4RY60Lls','CDU2ssAPip8','l_fpT0nwD6s','Dx6DNiOklZI','QqkFbHu3uFU','5EVtgA7vZRA','MajmFI5KpUM','w5f9DVGjYhQ','XcG2xH621Bc'],
        notes: 'Dead hang start, chin clears bar, full extension each rep.'
    },
    {
        id: 'cable_row',
        name: 'Seated Cable Row',
        alt: 'Band Row',
        pattern: 'Pull',
        sets: 3, reps: 12,
        tempo: '2-1-1-0',
        videos:    ['vwHG9Jfu4sw','CsROhQ1onAg','NYok5zjbDcw','7o2oolbmzeI','xQNrFHEMhI4','7BkgqzC6WsM','UCXxvVItLoM','4mRy8U542Fo','sP_4vybjVJs','GZbfZ033f74'],
        videosAlt: ['whSXi-EXbqI','LSkyinhmA8k','WlH9m4QEe4g','ovn27-bSHj4','SPfNhP2hDaI','EetDX48DndY','-QhNIQigMxg','TBNt2DBvkl4','lHuGxZZ09nY','Jy-WCFAofBY'],
        notes: 'Keep torso upright, drive elbows back, squeeze at peak.'
    },
    {
        id: 'facepull',
        name: 'Face Pulls',
        alt: 'Band Face Pull',
        pattern: 'Pull',
        sets: 3, reps: 15,
        tempo: '2-1-1-0',
        videos:    ['0Po47vvj9g4','ljgqer1ZpXg','VT-O6YIP-II','dKluhLck1Zs','-ruNWmEoytM','cc0tasCalHg','eFxMixk_qPQ','3pToT5_DUiY','owJjmr07C_4','FqfYvaRgKyM'],
        videosAlt: ['toHfpKStJ48','FWALf08dLV4','CSP7YpPv3ds','2RX2OYWlHcU','ljgqer1ZpXg','d3SvguM80_s','hbo-nSIEmXo','uX5W2kynMIo','hYKitv0GNZw','JBpj9-3tP0c'],
        notes: 'Pull to forehead height, externally rotate at peak contraction.'
    },
    {
        id: 'lateral',
        name: 'Lateral Raises',
        alt: 'Cable Lateral Raise',
        pattern: 'Press',
        sets: 3, reps: 15,
        tempo: '2-0-2-0',
        videos:    ['PzsMitRdI_8','K5hFLVJnnsw','Y29xKcze8Ik','n5dsI9qQXwY','Gmi_DCnJ93c','3JTKLkd8ZAs','XPPfnSEATJA','dPsTJOO4HCs','OuG1smZTsQQ','NNAs8jx_zJI'],
        videosAlt: ['BGw_YA3KiHs','Sp8be0IFNvk','Z5FA9aq3L6A','VOAvDZGHOOI','qitQHqNZbeM','ozpcrgmwyto','aNx_eiH2TG0','NNAs8jx_zJI','zpbm-xRHB6k','PPrzBWZDOhA'],
        notes: 'Slight forward lean, lead with elbows, stop at shoulder height.'
    },
    {
        id: 'bss',
        name: 'Bulgarian Split Squat',
        alt: 'Dumbbell Step-Up',
        pattern: 'Lunge',
        sets: 3, reps: 10,
        tempo: '3-0-1-0',
        videos:    ['hiLF_pF3EJM','SkNsa3eBwLA','vgn7bSXkgkA','9FOMyxA3Lw4','hPlKPjohFS0','-4LVK1crLSw','LoH5u2Vdo4s','fSyiHxm1Igw','JLEyaXRMv8o','m8mQ_92_Ylg'],
        videosAlt: ['9ZknEYboBOQ','aKj-6hgiViA','2bjBtT94Zxo','DxUNi119Qzs','WRqHvOWkWbU','7AtIjR-QqVA','XlXe_k5QR8s','xdDQAFGFrek','sb1ANEVSi4k','hgkk12L_Umk'],
        notes: 'Rear foot elevated, front knee tracks toe, full range of motion.'
    },
    {
        id: 'thrust',
        name: 'Hip Thrusts',
        alt: 'Glute Bridge',
        pattern: 'Glute',
        sets: 4, reps: 10,
        tempo: '2-1-1-0',
        videos:    ['xDmFkJxPzeM','pF17m_CXfL0','LM8XHLYJoYs','C1wpa1CWauI','EF7jXP17DPE','S_uZP4UH6J0','tztHvSLdXLA','Zp26q4BY5HE','aweBS7K71l8','ZSPmIyX9RZs'],
        videosAlt: ['wPM8icPu6H8','OUgsJ8-Vi0E','Q_Bpj91Yiis','L9KZfxT654Y','bUjVlVtJOk0','EEtd0uY-bMw','E3Kt5qUYWfY','nuapk_-Q2BI','xDmFkJxPzeM','Iv3r2kulhI8'],
        notes: 'Load the barbell across hips, drive into full hip extension hard.'
    },
    {
        id: 'ab_wheel',
        name: 'Ab Wheel Rollout',
        alt: 'Dead Bug',
        pattern: 'Core',
        sets: 3, reps: 10,
        tempo: '3-0-2-0',
        videos:    ['rqiTPdK1c_I','vncVOEtMhpk','A3uK5TPzHq8','9ZCoAbI7uX0','OJIWMlLa38Q','uYBOBBv9GzY','3C1TRMJveXo','2zVNyi5Uk44','PK4n7qJpOhM','CxS10wcWq2s'],
        videosAlt: ['4XLEnwUr1d8','o4GKiEoYClI','vnozpFoI8ug','zechBkcIMf0','GbSC02oU3To','0XVbn86Btj0','MCVX9wRd_h0','jbWmbhElf3Q','g_BYB0R-4Ws','JrcoGEZn6L4'],
        notes: 'Brace maximally before rolling, stop before hips sag.'
    },
    {
        id: 'carry',
        name: "Farmer's Walk",
        alt: 'Suitcase Carry',
        pattern: 'Carry',
        sets: 4, reps: 40,
        repsUnit: 'm',
        tempo: null,
        videos:    ['nqGfgIVteoM','z7E_YU9P1jU','NH7Xv-7NQNQ','8OtwXwrJizk','E94UNm8fD-4','Ujv88lNIxP0','rt17lmnaLSM','48aT-a0w9Sg','xaVkucAW7RA','dfwx0-RVxEU'],
        videosAlt: ['tNHdx7pmrGI','phlwn7v04Pc','LJaq4BS7KpE','C1Or0XpzKEU','BzrnPp0TOlw','y-TA2Tw0y28','z7E_YU9P1jU','oFKYTKTZ1s8','2hfwbcdpce4','OEWi1J3MacE'],
        notes: 'Heavier than Phase 1 — keep a rigid torso, head up, march.'
    }
];

const buildMedical = {
    lower_back: {
        label: 'Lower Back',
        swaps: {
            squat: {
                reason: 'Goblet squat keeps torso upright, reduces spinal load.',
                safetyNote: 'Brace your core before each rep. Keep the weight close to your body.'
            },
            deadlift: {
                reason: 'Trap bar shifts load to legs, reduces lumbar shear.',
                safetyNote: 'Start with a neutral spine, drive through the floor, avoid rounding.'
            }
        }
    },
    shoulder: {
        label: 'Shoulder Impingement',
        swaps: {
            incline: {
                reason: 'Dumbbells allow natural wrist rotation, less impingement risk.',
                safetyNote: 'Keep elbows at 45–75° from torso. Stop if you feel a pinch.'
            },
            lateral: {
                reason: 'Cable keeps constant tension without awkward shoulder loading.',
                safetyNote: 'Use lighter weight. Avoid shrugging at the top.'
            }
        }
    },
    knee: {
        label: 'Knee Sensitivity',
        swaps: {
            bss: {
                reason: 'Step-up is easier to control and reduces knee stress.',
                safetyNote: 'Drive through the heel of the stepping foot. Avoid knee cave.'
            }
        }
    }
};

// ===========================================================================
// PHASE 3 — MASTERY (26 weeks / ~6 months)
// Goal: Peak strength, full development, periodised training, unlock potential.
// Protocol: Rotating strength (3–5 reps) → hypertrophy (8–12 reps) blocks.
// ===========================================================================

const masteryExercises = [
    {
        id: 'front_squat',
        name: 'Front Squat',
        alt: 'High-Bar Back Squat',
        pattern: 'Squat',
        sets: 5, reps: 4,
        tempo: '3-0-X-0',
        videos:    ['nmUof3vszxM','v-mQm_droHg','0ect9ETE6t0','7pyxT5hqmQY','VfBOBhwXbro','7zXlyHoDaAE','Q1Ypb8ZNzI4','wyDbagKS7Rg','Ut1CvqDdaqA','OafwrCoaQj0'],
        videosAlt: ['xOJQfvHsHMU','a9-7af_anJk','hFD8CIQM3GU','ANWLY7aTj8I','DaXJYegU1T4','SKNjAj3ZXl0','TqAPP2qaHGY','3u2wXLxj9kE','CkFzgR55gho','Dm7BqvOsbkk'],
        notes: 'Elbows high, torso vertical, catch bar across shoulders — no wrist bend.'
    },
    {
        id: 'deadlift',
        name: 'Conventional Deadlift',
        alt: 'Sumo Deadlift',
        pattern: 'Hinge',
        sets: 5, reps: 3,
        tempo: '1-0-1-3',
        videos:    ['XxWcirHIwVo','VL5Ab0T07e4','p2OPUi4xGrM','r4MzxtBKyNE','19ZeTrLZdyQ','mlOUL-Pkzls','cclUh49qOww','MBbyAqvTNkU','TM1mpvglJq4','xxFpHWEi6UE'],
        videosAlt: ['EsqwERaSTMI','LwA7YQPK374','vdgkc_qJOzA','Bq2mkjGa2HA','D6p5z_JNBiA','ePmiNHNlO_k','XEn1p0HJEZg','kOPT-BIzqME','Vc3drPyxioA','G7K4kOi4lAE'],
        notes: 'Max tension before the pull — this is your peak strength lift.'
    },
    {
        id: 'ohp',
        name: 'Barbell Overhead Press',
        alt: 'Seated Dumbbell Press',
        pattern: 'Press',
        sets: 4, reps: 6,
        tempo: '2-0-1-0',
        videos:    ['KP1sYz2VICk','wol7Hko8RhY','wJlKUo2-P4o','eNFXEEdfQp4','iJ0py9JQIZY','cGnhixvC8uA','_RlRDWO2jfg','Y5FRD8Q3DJM','CnBmiBqp-AI','x2-vA3W2blo'],
        videosAlt: ['rO_iEImwHyo','poD_-zaG9hk','vlFGTI5JzjI','nHboL27_Sn0','Did01dFR3Lk','HzIiNhHhhtA','b5JzUH8gsOg','GFblCmuEE18','qEwKCR5JCog','hOTABpGvhBc'],
        notes: 'Lock ribs down, glutes squeezed, press straight to the sky.'
    },
    {
        id: 'weighted_pullup',
        name: 'Weighted Pull-Up',
        alt: 'Lat Pulldown',
        pattern: 'Pull',
        sets: 4, reps: 6,
        tempo: '2-1-1-0',
        videos:    ['oEbTjXOOk3E','g7vykv7nGNY','KOw6VhY8McQ','VDlQP5OEd6w','XRQnWomofIY','gpzsIKY4TbE','wk2HkH2_3m0','cD51lZxAwrY','Qh0jSDYu2Os','5joIx-VL2XI'],
        videosAlt: ['SALxEARiMkw','43hWj8mfYGY','qMLOzlpHvDk','chYBfpk2Bdk','b_eislFFVhk','0xzwnBT17Fk','M9xUoJYtXtc','u3gQT2aMVaI','awT3nShAnws','V1T3x5n50cM'],
        notes: 'Hang a plate or use a dip belt. Full dead-hang start, explosive pull.'
    },
    {
        id: 'incline',
        name: 'Incline Bench Press',
        alt: 'Incline Dumbbell Press',
        pattern: 'Push',
        sets: 4, reps: 8,
        tempo: '3-0-1-0',
        videos:    ['5kyLUGVq_pk','SrqOu55lrYU','kQtx01Qz6s8','VFbjmiAAwJE','lJ2o89kcnxY','DutO2wEtqaw','jPLdzuHckI8','O9x7xRhtA9Q','vcjgIlEvCgU','4Y2ZdHCOXok'],
        videosAlt: ['IP4oeKh1Sd4','0f6-uCUKqgA','SHsUIZiNdeY','0G2_XV7slIg','8iPEnn-ltC8','VDU5bzE2qOE','QsYre__-aro','hChjZQhX1Ls','gl8H4QLXKTo','XgwXopZadqs'],
        notes: 'Primary upper chest developer. Touch above nipple line.'
    },
    {
        id: 'pendlay',
        name: 'Pendlay Row',
        alt: 'Barbell Bent-Over Row',
        pattern: 'Pull',
        sets: 4, reps: 6,
        tempo: '1-0-1-2',
        videos:    ['axoeDmW0oAY','T3N-TO4reLQ','RQU8wZPbioA','h4nkoayPFWw','Qzw9tpo5L_0','4_M37vdSLX8','FWJR5Ve8bnQ','-4sJODDf_gk','Wv7f0uIKh8o','C_p-s66KBpg'],
        videosAlt: ['qXrTDQG1oUQ','T3N-TO4reLQ','FWJR5Ve8bnQ','Qzw9tpo5L_0','RQU8wZPbioA','6FZHJGzMFEc','kBWAon7ItDw','7B5Exks1KJE','YcK7pyFXmWk','rqTOAM8WoeM'],
        notes: 'Bar starts on floor each rep — explosive pull, controlled descent.'
    },
    {
        id: 'weighted_dip',
        name: 'Weighted Dip',
        alt: 'Ring Dip',
        pattern: 'Push',
        sets: 3, reps: 8,
        tempo: '3-0-1-0',
        videos:    ['oEbTjXOOk3E','Ew7NwCMzX-c','33Ot_vI8IyM','g7vykv7nGNY','0ofmwaUE90s','KoS_NMmuxMM','LflvzI3zqvs','fPVCFcbk7Ow','HXj2kIeBmYY','kFICm6gYUaU'],
        videosAlt: ['EyA7h8zCmkQ','jCtSXZk9nko','2bdNrGhoyuk','Kr5Uuuy5DAI','qpTYND8fVR0','Ikeg_v5fvz4','MOxkFoT0mIs','MblDC8COZBA','xXWH8ASZyh4','vi1-BOcj3cQ'],
        notes: 'Use a dip belt. Lean slightly forward for chest emphasis, upright for triceps.'
    },
    {
        id: 'facepull',
        name: 'Face Pulls',
        alt: 'Band Face Pull',
        pattern: 'Pull',
        sets: 4, reps: 20,
        tempo: '2-1-1-0',
        videos:    ['0Po47vvj9g4','ljgqer1ZpXg','VT-O6YIP-II','dKluhLck1Zs','-ruNWmEoytM','cc0tasCalHg','eFxMixk_qPQ','3pToT5_DUiY','owJjmr07C_4','FqfYvaRgKyM'],
        videosAlt: ['toHfpKStJ48','FWALf08dLV4','CSP7YpPv3ds','2RX2OYWlHcU','ljgqer1ZpXg','d3SvguM80_s','hbo-nSIEmXo','uX5W2kynMIo','hYKitv0GNZw','JBpj9-3tP0c'],
        notes: 'High volume shoulder health work — never skip this. Rear delts = longevity.'
    },
    {
        id: 'bss',
        name: 'Bulgarian Split Squat',
        alt: 'Dumbbell Step-Up',
        pattern: 'Lunge',
        sets: 4, reps: 8,
        tempo: '3-0-1-0',
        videos:    ['hiLF_pF3EJM','SkNsa3eBwLA','vgn7bSXkgkA','9FOMyxA3Lw4','hPlKPjohFS0','-4LVK1crLSw','LoH5u2Vdo4s','fSyiHxm1Igw','JLEyaXRMv8o','m8mQ_92_Ylg'],
        videosAlt: ['9ZknEYboBOQ','aKj-6hgiViA','2bjBtT94Zxo','DxUNi119Qzs','WRqHvOWkWbU','7AtIjR-QqVA','XlXe_k5QR8s','xdDQAFGFrek','sb1ANEVSi4k','hgkk12L_Umk'],
        notes: 'Weighted version — barbell or heavy dumbbells. Full depth every rep.'
    },
    {
        id: 'slrdl',
        name: 'Single-Leg RDL',
        alt: 'Stiff-Leg Dumbbell Deadlift',
        pattern: 'Hinge',
        sets: 3, reps: 10,
        tempo: '3-0-1-0',
        videos:    ['Zfr6wizR8rs','GoKjrvJi-Iw','84hrdsHgDuQ','J0bEKhnP-Mw','SuNgD0x2U6U','lI8-igvsnVQ','5zmlnbWb-g4','gz9l8UA_KXs','ViVhUZGk6i4','_oyxCn2iSjU'],
        videosAlt: ['KE2A7G_nDc8','cYKYGwcg0U8','Xy1O99wrKYE','CN_7cz3P-1U','Ipi8_vz8_z0','3Kg2BD1ZlRY','iXbGzZE84aI','2fHE6zxftYw','z2p-qoY6rCc','w9_PudlkeLI'],
        notes: 'Hinge on one leg — hip, not back. Keep hips square to the floor.'
    },
    {
        id: 'cgbp',
        name: 'Close-Grip Bench Press',
        alt: 'Skull Crushers',
        pattern: 'Push',
        sets: 3, reps: 10,
        tempo: '3-0-1-0',
        videos:    ['UYJsFzqdgK4','vEUyEOVn3yM','cXbSJHtjrQQ','6PYhvgQ4zSU','_g97w3QfD6E','dUBQ4BcW4TU','2YGRPVB_NXk','pE1oekSPVOo','hWEpF7lFR9Q','FiQUzPtS90E'],
        videosAlt: ['S0fmDR60X-o','NIWKqcmpBug','d_KZxkY_0cM','jR7Y5YcugYc','D47mYdoKllE','QXzhjRnYRT0','kcvdV0LkhUk','VP9Qp72zZ_c','mUxMSEtz9ag','9baX4-wEYx8'],
        notes: 'Elbows in, feel the triceps. Lockout fully at the top.'
    },
    {
        id: 'carry',
        name: "Farmer's Walk",
        alt: 'Suitcase Carry',
        pattern: 'Carry',
        sets: 5, reps: 50,
        repsUnit: 'm',
        tempo: null,
        videos:    ['nqGfgIVteoM','z7E_YU9P1jU','NH7Xv-7NQNQ','8OtwXwrJizk','E94UNm8fD-4','Ujv88lNIxP0','rt17lmnaLSM','48aT-a0w9Sg','xaVkucAW7RA','dfwx0-RVxEU'],
        videosAlt: ['tNHdx7pmrGI','phlwn7v04Pc','LJaq4BS7KpE','C1Or0XpzKEU','BzrnPp0TOlw','y-TA2Tw0y28','z7E_YU9P1jU','oFKYTKTZ1s8','2hfwbcdpce4','OEWi1J3MacE'],
        notes: 'As heavy as possible for 50 m. This is your test of real-world strength.'
    }
];

const masteryMedical = {
    lower_back: {
        label: 'Lower Back',
        swaps: {
            front_squat: {
                reason: 'High-bar back squat still upright-ish with less wrist stress.',
                safetyNote: 'Brace completely before descent. No butt wink past parallel.'
            },
            deadlift: {
                reason: 'Sumo stance reduces lumbar moment arm significantly.',
                safetyNote: 'Wide stance, toes out, pull the floor apart before lifting.'
            }
        }
    },
    shoulder: {
        label: 'Shoulder Impingement',
        swaps: {
            ohp: {
                reason: 'Seated dumbbells allow natural wrist rotation and safer arc.',
                safetyNote: 'Stop just below ear level if you feel impingement. Use lighter weight.'
            },
            weighted_dip: {
                reason: 'Ring dips allow wrists to rotate naturally, reducing shoulder stress.',
                safetyNote: 'Keep a slight forward lean. Stop immediately if sharp pain occurs.'
            }
        }
    },
    knee: {
        label: 'Knee Sensitivity',
        swaps: {
            front_squat: {
                reason: 'High-bar back squat reduces anterior knee force.',
                safetyNote: 'Avoid going past 90° if painful. Knee sleeves recommended.'
            },
            bss: {
                reason: 'Step-up is more controlled, less shear on the knee joint.',
                safetyNote: 'Slow eccentric, drive through the heel. Stop if sharp pain.'
            }
        }
    }
};

// ===========================================================================
// PROGRAMS — exported registry
// ===========================================================================

export const programs = [
    {
        id: 'foundation',
        phase: 1,
        name: 'Foundation',
        tagline: 'Master Movement. Build Your Base.',
        description: 'Forge the neuromuscular patterns that every elite athlete is built on. Eight primal compound movements — squat, hinge, push, pull, carry — trained with precision tempo and structured rest. Nothing flashy. Just the fundamentals, done with intention.',
        durationWeeks: 8,
        durationLabel: '4–8 Weeks',
        color: '#3B82F6',
        colorDim: '#1E3A5F',
        icon: '🏗️',
        protocol: "Dr. John Rusin's Pain-Free Performance + Josh Shepherd's Pristine 16",
        structure: '4×8 strength sets with 3-0-1-0 tempo. Rest 2–3 min between sets. Two training days per week minimum.',
        goals: [
            'Master all 8 primal movement patterns',
            'Build the base of neurological strength',
            'Establish sustainable training habits',
            'Learn your body — proprioception and control'
        ],
        getExercises() { return foundationExercises; },
        getActiveExercises(medicalFlags = []) {
            return applyMedicalSwaps(foundationExercises, foundationMedical, medicalFlags);
        }
    },
    {
        id: 'build',
        phase: 2,
        name: 'Build',
        tagline: 'More Volume. New Stimulus. More Muscle.',
        description: 'The foundation is set — now you build the structure. Twelve exercises over 12 weeks introduce higher volume, true hypertrophy work, and exercises that target individual muscle groups with greater precision. The big compound lifts remain the centre of gravity.',
        durationWeeks: 12,
        durationLabel: '12 Weeks (3 Months)',
        color: '#10B981',
        colorDim: '#064E3B',
        icon: '💪',
        protocol: "5×5 for primary compounds · 3×10–15 for accessories · Superset where marked",
        structure: 'Train 3 days/week. Heavy compounds first, accessories after. Deload week at week 6 and week 12.',
        goals: [
            'Add 10–20 lbs to all primary compound lifts',
            'Develop noticeable muscle across all major groups',
            'Introduce posterior chain isolation and shoulder health work',
            'Build the capacity for 3-day-a-week training'
        ],
        getExercises() { return buildExercises; },
        getActiveExercises(medicalFlags = []) {
            return applyMedicalSwaps(buildExercises, buildMedical, medicalFlags);
        }
    },
    {
        id: 'mastery',
        phase: 3,
        name: 'Mastery',
        tagline: 'Unlock Your Full Potential.',
        description: 'Six months of periodised training designed for the well-trained athlete who is ready to unlock everything. Rotating strength and hypertrophy blocks, advanced movement patterns, and the discipline to push limits while staying injury-free. This is where your true potential lives.',
        durationWeeks: 26,
        durationLabel: '6 Months',
        color: '#8B5CF6',
        colorDim: '#2E1065',
        icon: '🏆',
        protocol: "Block periodisation: Strength Block (3–5 reps) → Hypertrophy Block (8–12 reps) → repeat",
        structure: 'Train 4 days/week (Upper/Lower split). Block 1 (6 wks) strength-focused. Block 2 (6 wks) hypertrophy. Repeat × 2. Deload every 4th week.',
        goals: [
            'Achieve near-maximal strength on all primary lifts',
            'Develop a balanced, powerful physique',
            'Master advanced movement patterns (front squat, OHP, weighted calisthenics)',
            'Build a sustainable, self-regulating training practice for life'
        ],
        getExercises() { return masteryExercises; },
        getActiveExercises(medicalFlags = []) {
            return applyMedicalSwaps(masteryExercises, masteryMedical, medicalFlags);
        }
    }
];

export function getProgramById(id) {
    return programs.find(p => p.id === id) || programs[0];
}
