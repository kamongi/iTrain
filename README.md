# iTrain

**Privacy-First Strength Training Companion** — A client-side web app for tracking progressive overload, auto-regulating intensity, and removing "brain fog" during workouts.

Hosted on [GitHub Pages](https://pages.github.com/). All data stays on your device.

**Live app: [https://kamongi.github.io/iTrain/](https://kamongi.github.io/iTrain/)**

---

## Architecture

iTrain uses a **Client-Side Only** architecture. No database, no login, no tracking.

| Component | Technology | Role |
|---|---|---|
| Hosting | GitHub Pages | Static hosting of HTML/CSS/JS files |
| Frontend | HTML5 / CSS3 | Mobile-first interface (OLED dark theme) |
| Logic/State | Vanilla JavaScript (ES Modules) | Progression engine, workout flow, plate math |
| Storage | `localStorage` / `IndexedDB` | Persists profile, history, and weights on-device only |
| Video | YouTube IFrame API | Embeds demo videos for each movement pattern |
| Charts | Chart.js (CDN) | Volume tracking and consistency heat map |
| Celebration | Confetti.js (CDN) | Workout completion animation |

## Core Features

### Progression Engine (Auto-Regulation)
- **RPE Input** (Rate of Perceived Exertion): 1–10 slider for each set
- RPE ≤ 7 → suggest +2.5% to 5% weight increase next week
- RPE 8 → maintain current weight
- RPE 9–10 → suggest staying at the same weight to "own the movement"
- Two consecutive RPE 10 sessions → suggest a **Deload Week** (−20% weight)

### Plate Calculator
Takes the target weight, subtracts the bar (45 lb), and divides by available plates (45, 25, 10, 5, 2.5) to show a **visual loading guide** — icons of exactly which plates go on each side of the bar.

### The "Flex" Button (Swap / Skip)
- **Switch**: Toggles between a Primary and Alternative exercise. Weight is tracked separately for both.
- **Skip**: Marks the exercise as `null` for the day. Progress carries over to the next session.

### Rest Timer with Haptics
- Countdown timer (90s–120s) triggers on "Set Complete"
- Subtle notification sound + haptic vibration when rest is over

### Medical / Safety Logic
- First-launch questionnaire: "Do you have any joint sensitivity?"
- **Lower Back Pain** → Back Squat defaults to Goblet Squat + bracing safety note
- **Shoulder Impingement** → Seated Press defaults to Landmine Press
- **Knee Sensitivity** → Reverse Lunge defaults to Step-Ups

### Motivation Engine
A local array of 50+ quotes from legends like Arnold Schwarzenegger, Dr. John Rusin, and technical cues from Josh Shepherd. A random quote displays on each session load.

### Warm-Up Protocol
Optional button that calculates 3 warm-up sets at 50%, 70%, and 90% of work weight.

### Tempo Cues
Displays tempo notation (e.g., "3-0-1-0") next to exercises for controlling eccentric/concentric phases.

### Superset Grouping
Link two exercises (e.g., Bench + Row) so the app alternates between them automatically.

### Local Video Mirror (Form Check)
Uses the `MediaDevices` API for a live camera feed inside the app — no video is saved or transmitted. Just a mirror for checking form.

### PR (Personal Record) Alerts
Automatic detection and celebration when you hit a new personal best for volume or weight on any exercise.

### Volume Charting
Line graph of Total Volume (Sets × Reps × Weight) over time using Chart.js.

### Consistency Streaks
A heat map (GitHub contribution graph style) showing training days. Streak visibility encourages consistency.

## Exercise Library (Pristine Phase 1)

| Exercise | Sets × Reps | Pattern | Alternative |
|---|---|---|---|
| Back Squat | 4 × 8 | Squat | Goblet Squat |
| Bench Press | 4 × 8 | Push | Push-Ups |
| Romanian Deadlift | 3 × 10 | Hinge | Kettlebell Deadlift |
| Strict Rows | 4 × 10 | Pull | Band Rows |
| Reverse Lunges | 3 × 12 | Lunge | Step-Ups |
| Seated Press | 3 × 12 | Press | Landmine Press |
| Hip Thrusts | 3 × 12 | Glute | Glute Bridge |
| Farmer's Walk | 3 × 30m | Carry | Suitcase Carry |

## Medical Concern Mapping

| User Profile Flag | Primary Exercise | Suggested Alternative | Reason |
|---|---|---|---|
| Lower Back Pain | Back Squat | Goblet Squat | Keeps torso upright, reduces shear force |
| Shoulder Impingement | Seated Press | Landmine Press | Safer overhead trajectory for the joint |
| Knee Sensitivity | Reverse Lunge | Step-Ups | Easier to control the eccentric phase |

## Privacy

- **All data resides in localStorage / IndexedDB**. No external API calls are made except for YouTube IFrame embeds and CDN libraries.
- "Clear All Data" button instantly wipes all stored data.
- No analytics, no cookies, no third-party tracking.

## Project Structure

```
iTrain/
├── index.html          # Single-page app shell
├── css/
│   └── style.css       # OLED dark theme
├── js/
│   ├── app.js          # Core app logic, rendering, navigation
│   ├── exercises.js    # Exercise library & medical mappings
│   ├── motivation.js   # 50+ motivational quotes
│   ├── plates.js       # Plate calculator & visual loading
│   ├── profile.js      # Medical profile questionnaire
│   ├── progression.js  # RPE-based progression engine
│   ├── storage.js      # localStorage / IndexedDB persistence
│   └── timer.js        # Rest timer with haptics
└── README.md
```

## Getting Started

1. Clone the repository
2. Open `index.html` in a browser — or deploy to GitHub Pages
3. Complete the first-launch profile questionnaire
4. Start training

## Deployment (GitHub Pages)

1. Go to **Settings → Pages**
2. Select the **main** branch and root (`/`) folder
3. Your app will be live at `https://<username>.github.io/iTrain/`

## Citation

If you use iTrain in your research, project, or build upon it, please cite it as:

```
Kamongi, P. (2026). iTrain: A Privacy-First Strength Training Companion [Software].
GitHub. https://github.com/kamongi/iTrain
```

Or in BibTeX:

```bibtex
@software{kamongi2024itrain,
  author  = {Kamongi, Patrick},
  title   = {{iTrain}: A Privacy-First Strength Training Companion},
  year    = {2026},
  url     = {https://github.com/kamongi/iTrain},
  note    = {Client-side progressive overload tracker with RPE-based auto-regulation}
}
```

For questions or collaboration, contact: [info@kamongi.com](mailto:info@kamongi.com)

---

*Inspired by Dr. John Rusin & Josh Shepherd*
