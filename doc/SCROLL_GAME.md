# The Caliph's Scroll Module Documentation

## 1. Overview

"The Caliph's Scroll" is an educational word-guessing game (similar to Hangman) integrated into the Personal Web Desktop (SPA). Set in the theme of Al-Andalus, it challenges users to decipher terms related to either **Coding (The Scholar)** or **History (The Architect)** while managing resources like lives and time.

## 2. Features

### Core Requirements (Functional)

* **Dual Data Realms:** Users can toggle between two distinct word categories:
* **The Architect:** Historical terms (e.g., *ALHAMBRA*, *MINARET*).
* **The Scholar:** JavaScript terminology (e.g., *VARIABLE*, *PROMISE*).


* **Gameplay Mechanics:** Users guess letters via an on-screen QWERTY keyboard or physical keyboard input.
* **Win/Loss Logic:**
    * **Victory:** All letters revealed before lives/time run out.
    * **Defeat:** Lives reach zero or the timer expires.


* **Educational Value:**
    * **Hints:** A subtle clue is displayed during gameplay (e.g., *"The Red Fortress"*).
    * **Definitions:** Upon game completion (Win or Lose), the full definition of the word is revealed to reinforce learning.


* **Persistent Stats:** Tracks "Current Streak" and "Best Streak" (High Score) using `localStorage`.

### Non-Functional Requirements

* **Component Architecture:** Utilizes a reusable `Timer` class for countdown logic and UI rendering.
* **External Data:** Word lists, hints, and definitions are loaded asynchronously from a local JSON file (`words.json`).
* **Accessibility:** Fully navigable via keyboard (Tab, Arrow Keys, Enter) with visual focus states for all interactive elements.

## 3. Solution Path

The solution emphasizes **Separation of Concerns** by offloading logic to specialized helper classes and keeping the main game class focused on rules and state.

1. **Architecture (Component-Based):**
    * **Game Controller (`WordGame.js`):** Manages the game loop, user input, and win/loss conditions.
    * **UI Component (`Timer.js`):** A standalone class that handles the countdown logic, DOM creation, and color transitions (Emerald -> Terracotta). This component is shared with the Quiz app.
    * **Data Layer (`StorageManager.js`):** Handles reading/writing the `word-streak` and `word-best-streak` to local storage.


2. **State Management:**
    * **Configuration:** The `this.levels` object maps difficulty settings (e.g., `mujahid`) to specific rules (`hearts: 1`, `time: 15`).
    * **Dynamic Loading:** The `loadWords()` method fetches data asynchronously. If the fetch fails, a safe fallback set of error messages is loaded to prevent a crash.


3. **The "Best Streak" Logic:**
    * The game compares `currentStreak` vs `bestStreak` at the moment of victory.
    * If the current streak is higher, it updates the `bestStreak` in memory and persists it immediately via the `StorageManager`.



## 4. Key Learnings

* **Refactoring for Reusability:**
    * *Challenge:* Both the Quiz and Word Game needed a visual timer.
    * *Solution:* Extracted the timer logic into `Timer.js`. This class now handles its own DOM creation (`document.createElement`), styles, and interval management. This reduced code duplication by ~30 lines per file.


* **CSS Variable Fallbacks:**
    * *Challenge:* The timer bar turned invisible during refactoring because the JS applied a CSS variable that wasn't defined in the global scope.
    * *Solution:* Implemented robust fallback values in JavaScript (e.g., `var(--color-emerald, #2ecc71)`), ensuring the UI remains visible even if the theme breaks.


* **Focus Traps & Event Bubbling:**
    * *Challenge:* The standard `<select>` dropdown blocked the Window Manager's focus logic, making the window unclickable.
    * *Solution:* Replaced the dropdown with a **Toggle Button** for the Category and Difficulty selectors. This not only fixed the bug but improved the keyboard navigation experience (Arrow Up/Down flow).


## 5. Extensions & Advanced Features

### A. Progressive Difficulty Levels

* **Easy:** 6 Hearts, No Timer (Relaxed).
* **Normal:** 6 Hearts, 60s Timer.
* **Hard:** 3 Hearts, 60s Timer.
* **Brutal:** 3 Hearts, 30s Timer.
* **Mujahid:** 1 Heart, 15s Timer (Sudden Death).

### B. "The Elevator" (Keyboard Navigation)

* The Start Screen implements a vertical focus loop similar to the Quiz:
* **Arrow Down:** Path Toggle -> Difficulty Toggle -> Start Button.
* **Arrow Up:** Start Button -> Difficulty Toggle -> Path Toggle.


* **Game Over Screen:** Players can toggle between **"Play Again"** and **"Back to Menu"** using Up/Down arrows, preventing them from getting stuck in a gameplay loop.

### C. Visual Feedback & Polish

* **Interactive Keyboard:** On-screen keys visually react to input:
* **Green:** Correct guess.
* **Red:** Incorrect guess.
* **Disabled:** Letter already attempted.


* **Heart Animation:** Hearts turn gray and semi-transparent (`.lost` class) when a life is lost, rather than disappearing entirely, maintaining the layout structure.