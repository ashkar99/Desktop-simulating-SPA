# Al-Andalus Quiz Module Documentation

## 1. Overview
The Al-Andalus Quiz is a time-sensitive trivia application integrated into the Personal Web Desktop (SPA). It challenges users with history questions using a hybrid architecture that supports both online (server-based) and offline (local) gameplay.

## 2. Features

### Core Requirements (Functional)
* **Hybrid Data Source:** Users can toggle between connecting to the university server (LNU) or using a local JSON database.
* **Question Types:** Supports both open-ended text input and multiple-choice (radio button) questions.
* **Time Constraints:** Enforces a countdown timer for every question. If the timer hits zero, the game ends immediately.
* **High Score System:** Persists top 5 scores to `localStorage`, displaying the nickname and total time taken.
* **Feedback Loop:** Provides immediate visual feedback for network errors, wrong answers, or victory.

### Non-Functional Requirements
* **Security (XSS Prevention):** All UI rendering uses `document.createElement` and `textContent`. No user-generated content or API data is ever rendered via `innerHTML`.
* **Accessibility:** The application is fully navigable via keyboard (Arrow keys, Enter) without requiring a mouse.
* **Window Integration:** Extends the base `Window` class for dragging, closing, and focus management.

## 3. Solution Path

The solution uses the **Strategy Pattern** to decouple the game logic from the data source.

1.  **Architecture (The Strategy Pattern):**
    * The `Quiz` class does not know where questions come from. It relies on a "Provider" interface.
    * **Online Strategy (`QuizAPI`):** Fetches real data from the LNU REST API.
    * **Offline Strategy (`LocalProvider`):** Fetches data from `questions.json` and simulates network latency (`setTimeout`) to mimic the server's behavior.

2.  **State Management:**
    * **Mode Handling:** The Start Screen allows toggling "Source" (Server/Local) and "Level" (Normal/Hard).
    * **Score Segmentation:** To ensure fair play, High Scores are saved to unique keys based on the selected settings (e.g., `quiz-server-normal` vs `quiz-local-hard`).

3.  **Game Loop & Timer:**
    * The timer is managed via `setInterval` (100ms precision).
    * **Visuals:** The timer bar shrinks in width and changes color from **Emerald** to **Terracotta** when time runs low (<30%).
    * **Accumulation:** When a question is answered, the elapsed time for that specific question is added to `this.totalTime`.

## 4. Key Learnings

* **Secure DOM Manipulation:**
    * *Challenge:* Rendering HTML strings (`innerHTML`) is risky for API data.
    * *Solution:* Refactored the entire rendering pipeline (including radio buttons and high score lists) to use `document.createElement`. This prevents script injection attacks.

* **Offline Logic Simulation:**
    * *Challenge:* The server uses Next URLs to navigate, but local files don't have URLs.
    * *Solution:* The `LocalProvider` mimics the server structure by returning the next Question ID as the `nextURL`. The `Quiz` controller treats them identically.

* **Event Cleanup:**
    * *Learned:* Intervals (`setInterval`) continue running even if the window is closed.
    * *Fix:* Added a `close()` method override that calls `this.stopTimer()` to prevent memory leaks.

## 5. Extensions & Advanced Features

### A. Dynamic Difficulty Levels
* **Normal Mode:** Default setting with a **10-second** limit per question.
* **Hard Mode:** Reduces the limit to **5 seconds** per question for a greater challenge.
* **Visual Cues:** The UI buttons change color (Gold for Normal, Terracotta for Hard) to indicate the active state.

### B. "The Elevator" (Keyboard Navigation)
* The Start Screen implements a vertical focus chain:
    * **Arrow Down:** Input -> Source Button -> Level Button -> Start Button.
    * **Arrow Up:** Start Button -> Level Button -> Source Button -> Input.
* The app automatically focuses the relevant input field or button on every screen transition (Start -> Question -> Victory), enabling a "mouse-less" experience.

### C. Visual Polishing
* **Colors:** Uses the standard Al-Andalus palette (Azure for Server mode, Emerald for Local mode).
* **Loaders:** Displays a "Consulting the Oracle..." text loader during asynchronous fetch operations.