// Plate Calculator — Visual Loading Guide
// Subtracts bar weight (45 lb), divides remainder by available plates per side

const BAR_WEIGHT = 45;
const AVAILABLE_PLATES = [45, 25, 10, 5, 2.5];

// Plate colors for visual display
const PLATE_COLORS = {
    45: '#3B82F6',   // blue
    25: '#22C55E',   // green
    10: '#EAB308',   // yellow
    5: '#EF4444',    // red
    2.5: '#A855F7'   // purple
};

const PLATE_WIDTHS = {
    45: 48,
    25: 40,
    10: 32,
    5: 24,
    2.5: 18
};

/**
 * Calculate plates needed per side for a target weight.
 * @param {number} targetWeight - Total target weight in lbs
 * @returns {{ plates: number[], label: string, perSide: number }}
 */
export function getPlates(targetWeight) {
    let weight = targetWeight - BAR_WEIGHT;

    if (weight <= 0) {
        return { plates: [], label: 'Bar Only (45 lbs)', perSide: 0 };
    }

    const plates = [];
    let perSide = weight / 2;
    let remaining = perSide;

    for (const plate of AVAILABLE_PLATES) {
        while (remaining >= plate) {
            plates.push(plate);
            remaining -= plate;
        }
    }

    const label = plates.length > 0
        ? plates.join(' + ') + ' lbs per side'
        : 'Bar Only (45 lbs)';

    return { plates, label, perSide };
}

/**
 * Calculate warm-up set weights at 50%, 70%, 90% of work weight.
 * Rounds to nearest 5 lbs.
 * @param {number} workWeight - The working set weight
 * @returns {number[]}
 */
export function getWarmupWeights(workWeight) {
    const percentages = [0.5, 0.7, 0.9];
    return percentages.map(pct => {
        const raw = workWeight * pct;
        return Math.round(raw / 5) * 5; // round to nearest 5
    });
}

/**
 * Render a visual plate loading diagram as an HTML string.
 * Shows a horizontal bar with colored plate icons.
 * @param {number[]} plates - Array of plate weights per side
 * @returns {string} HTML string
 */
export function renderPlateVisual(plates) {
    if (plates.length === 0) {
        return '<div class="plate-visual"><span class="plate-bar-only">Bar Only — 45 lbs</span></div>';
    }

    const plateElements = plates.map(p => {
        const color = PLATE_COLORS[p] || '#666';
        const width = PLATE_WIDTHS[p] || 20;
        return `<div class="plate-icon" style="background:${color};width:${width}px;" title="${p} lbs">${p}</div>`;
    }).join('');

    // Mirror plates for right side
    const mirrorElements = [...plates].reverse().map(p => {
        const color = PLATE_COLORS[p] || '#666';
        const width = PLATE_WIDTHS[p] || 20;
        return `<div class="plate-icon" style="background:${color};width:${width}px;" title="${p} lbs">${p}</div>`;
    }).join('');

    return `
        <div class="plate-visual">
            <div class="plate-side">${plateElements}</div>
            <div class="plate-bar-center">| BAR |</div>
            <div class="plate-side">${mirrorElements}</div>
        </div>
    `;
}
