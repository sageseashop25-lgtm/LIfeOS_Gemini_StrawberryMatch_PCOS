# 🌸 Matcha Life & Cycle Companion

A highly responsive, mobile-first companion application combining a **3-Lens Lifecycle Calendar**, **Private Mood Journal**, and **Menstrual Cycle Tracker**. It is designed with clean typography, smooth layout transitions powered by `motion`, and offline-first persistence.

---

## 🎨 Design Philosophy
*   **Aesthetic & Mood:** Calming, tactile tones inspired by organic Matcha greens (`#97b58e`), warm slate backgrounds, and soft off-white surfaces.
*   **Typography:** Elegant display typography paired with clean, readable monospaced layout elements for indicators.
*   **Touch & Mobile First:** Pinned sidebar responsive tab navigation optimizing access for touch targets and screen-width adaptation.

---

## ✨ Features

### 1. 📅 3-Lens Lifecycle Calendar
*   **Content Lens (🎬):** Visualizes planned content pipelines, publication timelines, and tracking statuses.
*   **Social Lens (🥂):** Tracks personal event commitments, networking, and social phases.
*   **Evidence Lens (🎯):** Monitors deliverables, targets met, and positive action history.
*   **Mood Heatmap Overlay:** Dynamically overlay average mood energy intensities directly onto calendar cells with custom colors matching emotional peaks and valleys.
*   **Interactive Hover Tooltips:** Detailed tooltip cards revealing cycle phases, daily average mood metrics with visual scale meters, tag summaries, first journal entry snippets, and planned deliverables breakdown.

### 2. 📝 Mood Journal & Cycle Tracker
*   **Symptom & Flow Logger:** Log cycle flow intensity and common physical symptoms.
*   **Emotional Tracker:** Rate daily mood, write deep-reflective logs, and attach customized categorized tags.
*   **Cycle Analytics Charting:** Responsive Recharts data visualizers charting mood/energy correlations plotted against cycle days and menstrual phases.

### 3. 📱 Mobile Navigation Tab Rail
*   **Flexible Layout Toggle:** Quickly swap workspace modes between **Journal Panel Only**, **Calendar Panel Only**, or **Combined Split-Screen Grid Layout** on large screens.
*   **Adaptive Defaulting:** Detects screen width on launch to automatically preset single-pane navigation for optimal mobile viewing.

---

## 🛠️ Tech Stack & Dependencies
*   **Frontend Framework:** [React 19](https://react.dev/) + [Vite](https://vite.dev/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Animation System:** [Motion](https://motion.dev/) (from `motion/react`)
*   **Visualizations:** [Recharts](https://recharts.org/) for data-rich interactive graphing
*   **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started & Installation

Follow these steps to run, develop, and build this companion app locally:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18.x or above) and [npm](https://www.npmjs.com/) installed on your machine.

### 2. Install Dependencies
Clone the repository, navigate into the directory, and run:
```bash
npm install
```

### 3. Running the Development Server
Launch the local dev environment with hot-reloading:
```bash
npm run dev
```
The application will default to running on [http://localhost:3000](http://localhost:3000) (or whichever port is defined by your host configuration).

### 4. Code Quality & Linting
Run the TypeScript compiler to check for type issues and syntax errors:
```bash
npm run lint
```

### 5. Building for Production
Compile a highly optimized static build suitable for hosting on platforms like Netlify, Vercel, or static web servers:
```bash
npm run build
```
The output assets will be generated inside the `dist/` folder.

---

## 📂 Project Architecture

```
├── src/
│   ├── components/
│   │   ├── CalendarModule.tsx    # Calendar engine, Lens triggers, and Tooltip overlays
│   │   └── JournalModule.tsx     # Rich-text logger, symptom tracking, analytics graphs
│   ├── utils/
│   │   └── cycleUtils.ts         # Math calculation algorithms for predicting cycle phases
│   ├── types.ts                  # Shared TS structures for Entries, Events, and Settings
│   ├── App.tsx                   # Main state orchestrator, layout controller, and localStorage engine
│   ├── main.tsx                  # Vite runtime entrypoint
│   └── index.css                 # Global CSS importing Tailwind CSS variables
├── package.json                  # Dependencies, script workflows, and manifest declarations
└── vite.config.ts                # Configuration for Vite plugins
```

---

## 🪵 Data Management & Persistence
*   **Local Storage Engine:** Custom lightweight hooks bind state updates to `localStorage` keys so users can log diaries offline.
*   **Dynamic Reset:** Pre-seeded with calendar schedules and logs around the default pivot date (`2026-07-19`) to show immediate interactive state.

---

## 🔧 Maintenance & Upkeep Guidelines

### Adding New Symptoms or Mood Scales
To add new symptoms, extend the symptom arrays or mood objects in `/src/types.ts` and modify `/src/components/JournalModule.tsx` in the entry loggers.

### Upgrading Tailwind CSS
Tailwind CSS is configured utilizing `@import "tailwindcss";` in `/src/index.css` alongside `@tailwindcss/vite` configuration within the build system. Do not introduce standard custom config scripts unless extending the theme values directly.

### Transition Animations
To edit tab-swapping behavior or tooltips, configure custom delay and spring settings in `motion.div` within `/src/components/CalendarModule.tsx` or `/src/App.tsx`.
