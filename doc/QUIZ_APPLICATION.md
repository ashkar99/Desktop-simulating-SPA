# Al-Andalus Quiz Module Documentation

## 1. Overview
The Al-Andalus Quiz is a time-sensitive trivia application integrated into the Personal Web Desktop (SPA). It challenges users with history questions using a hybrid architecture that supports both online (server-based) and offline (local) gameplay.

## 2. Features

### Core Requirements (Functional)
* **Hybrid Data Source:** Users can toggle between connecting to the university server (LNU) or using a local JSON database.
* **Question Types:** Supports both open-ended text input and multiple-choice (radio button) questions.
* **Persistent Timer:** A countdown timer is **visible at all times** during gameplay. If it hits zero, the game ends immediately.
* **Game Over Navigation:** When a user answers incorrectly or times out, the game provides clear options to **Restart** or view the **High Score** list.
* **High Score System:** Persists top 5 scores to `localStorage` via the shared `StorageManager`, displaying the nickname and total time taken.
* **Feedback Loop:** Provides immediate visual feedback for network errors, wrong answers, or victory.

### Non-Functional Requirements
* **Security (XSS Prevention):** All UI rendering uses `document.createElement` and `textContent`. No user-generated content is ever rendered via `innerHTML`.
* **Accessibility:** The application is fully navigable via keyboard (Arrow keys, Enter) for rapid gameplay.
* **Window Integration:** Extends the base `Window` class for dragging, closing, and focus management.

## 3. Solution Path

The solution uses the **Strategy Pattern** for data and a **Shared Service** for storage.

1.  **Architecture (The Strategy Pattern):**
    * The `Quiz` class relies on a "Provider" interface.
    * **Online Strategy (`QuizAPI`):** Fetches real data from the LNU REST API.
    * **Offline Strategy (`LocalProvider`):** Fetches data from `questions.json` and simulates network latency.

2.  **State Management:**
    * **Mode Handling:** The Start Screen allows toggling "Source" (Server/Local) and "Level" (Normal/Hard).
    * **Score Segmentation:** High Scores are saved to unique keys based on the selected settings (e.g., `quiz-server-normal`), ensuring users compete on fair grounds.

3. **Game Loop & Timer (Component Architecture):**
    * **Refactoring:** The countdown logic was moved from the main controller to a reusable `Timer` component (`Timer.js`).
    * **Shared Logic:** This component is used by both the Quiz and the Word Game, ensuring consistent visual behavior (Green -> Red transition) and logic across the desktop.
    * **Accumulation:** When the timer stops (via answer submission), the elapsed time returned by the component is added to `this.totalTime`.

4.  **Shared Storage:**
    * Instead of writing raw `localStorage` code, the Quiz uses the `StorageManager` class (shared with Chat) to save and retrieve high scores safely.

## 4. Key Learnings

* **Secure DOM Manipulation:**
    * *Challenge:* Rendering HTML strings (`innerHTML`) is risky.
    * *Solution:* Refactored the entire rendering pipeline (including radio buttons and high score lists) to use `document.createElement`. This prevents script injection attacks.

* **Offline Logic Simulation:**
    * *Challenge:* The server uses Next URLs to navigate, but local files don't have URLs.
    * *Solution:* The `LocalProvider` mimics the server structure by returning the next Question ID as the `nextURL`. The `Quiz` controller treats them identically.

* **Event Cleanup:**
    * *Learned:* Intervals (`setInterval`) continue running even if the window is closed.
    * *Fix:* Added a `close()` method override that calls `this.stopTimer()` to prevent memory leaks.

* **Component Reusability (DRY Principle):**
    * *Challenge:* Both the Quiz and Word Game required identical visual timers with "Game Over" callbacks.
    * *Solution:* Extracted the timer logic into a standalone `Timer` class. This reduced code duplication and centralized the styling (CSS) and DOM creation for the timer bar.

## 5. Extensions & Advanced Features

### A. Dynamic Difficulty Levels
* **Normal Mode:** Default setting with a **10-second** limit per question.
* **Hard Mode:** Reduces the limit to **5 seconds** per question for a greater challenge.
* **Visual Cues:** The UI buttons change color (Gold for Normal, Terracotta for Hard) to indicate the active state.

### B. Segmentation Storage
* **Segmented Storage:** High scores are saved to separate lists based on difficulty and source (e.g., `quiz-local-hard` -> local source quiz + hard mode).

### C. "The Elevator" (Keyboard Navigation)
* The Start Screen implements a vertical focus chain:
    * **Arrow Down:** Input -> Source Button -> Level Button -> Start Button.
    * **Arrow Up:** Start Button -> Level Button -> Source Button -> Input.
    * **Arrow Right:** Start Button -> High Scores Button
    * **Arrow Left:** High Scores Button -> Start Button 
* The app automatically focuses the relevant input field or button on every screen transition (Start -> Question -> Victory), enabling a "mouse-less" experience.

### D. Visual Polishing
* **Colors:** Uses the standard Al-Andalus palette (Azure for Server mode, Emerald for Local mode).
* **Loaders:** Displays a "Consulting the Oracle..." text loader during asynchronous fetch operations.

### E. Audio Feedback

* **Contextual Sound Effects:** The application provides immediate auditory cues to reinforce game state changes:
    * **Correct Answer:** A chime (`correct.mp3`) plays when advancing to the next question.
    * **Victory:** A celebratory sound (`win.mp3`) plays upon completing the quiz.
    * **Defeat:** A distinct error sound (`lose.mp3`) plays on wrong answers or timeout.
* **Error Handling:** Audio playback uses `.play().catch()` to ensure the game logic (navigation/scoring) continues smoothly even if the browser blocks autoplay or the sound file is missing.




