# SyncTask — Elegant Dark Task Tracker

SyncTask is a high-fidelity, single-screen offline-first task tracker built with **React**, **Vite**, **Tailwind CSS**, and **Framer Motion**. It adopts a custom-crafted **"Elegant Dark"** aesthetic, featuring high-contrast text, glowing violet accent lines, clean typography, and a robust Web Audio API alarm engine.

---

## 🌌 The Elegant Dark Philosophy
SyncTask is designed from the ground up to minimize eye strain and maximize focus:
- **Pitch-Black & Charcoal Canvas**: Implemented using precise `#0F0F0F` backgrounds, combined with `#161616` cards and `#1E1E1E` elements.
- **Micro-Glow Visual Hierarchy**: Violet (`#7C3AED`) indicators and shadows provide subtle depth. Highlight badges for priority levels utilize carefully tuned alpha channels (`bg-red-950/40 text-red-400`).
- **Responsive Fluid Architecture**: Fluid transitions, hover effects, and staggered mounting lists powered by Framer Motion.

---

## 🔥 Features & Capabilities

### ⚡ Offline-Safe Local Persistence
- All task state is saved in the browser's `localStorage` instantly.
- Absolute zero network latency, immediate page loads, and bulletproof offline reliability.

### ⏰ Advanced Time & Loud Alarm System
- **Dual-Field Due Parameters**: Define both a calendar due date and an exact due time.
- **Harmonic Digital Buzzer**: When a scheduled task reaches its expiration, the app plays an attention-grabbing, multi-oscillator digital buzzer chime (powered by pure browser Web Audio API square/triangle waves) designed to cut through background noise.
- **Floating Overlays**: Active alarms display in a persistent, glowing floating toast alert enabling quick mark-complete or dismiss controls.

### ✍️ Comprehensive Inline Editing
- Edit **all** properties of an existing task on-the-fly.
- Clicking the edit button unlocks inline dropdowns for **Category**, **Priority**, **Due Date**, **Due Time**, and **Alarm Toggles**, rather than restricting modifications to text alone.

### 📊 Real-Time Metrics & Sorting
- Dynamic calculations counting **Total Tasks**, **Completed Items**, **Urgent Duties**, and a fluid **Completion Rate progress bar**.
- Sort options by *Date Added*, *Due Date*, and *Priority*.
- Filter task views instantaneously via Category tab headers.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 18+ (Vite)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion (`motion/react`)
- **Iconography**: Lucide React (feather-style clean strokes)
- **Audio synthesis**: Web Audio API (native hardware oscillators)

---

## 🚀 Getting Started

### 1. Installation
Install the required base dependencies from `package.json`:
```bash
npm install
```

### 2. Development Server
Launch the fast local Vite development server:
```bash
npm run dev
```

### 3. Build & Production Compilation
Compile a optimized production build of static assets:
```bash
npm run build
```
The compiled output will be generated inside the `/dist` directory.
