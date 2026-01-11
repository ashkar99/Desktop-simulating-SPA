# Memory Game Module Documentation

## 1. Overview
The Memory Game is a tile-matching puzzle application integrated into the Personal Web Desktop (SPA). It demonstrates DOM manipulation, state management, and accessible UI design within a windowed environment.

## 2. Features

### Core Requirements (Functional)
* **Card Grid:** Renders a grid of cards based on selected difficulty.
* **Flip Logic:** Users can flip two cards at a time.
* **Matching Engine:**
    * If cards match: They remain face-up (or are marked as solved).
    * If cards differ: They flip back over after a short delay (1000ms).
* **Victory Condition:** Detects when all pairs are found and displays a victory message.
* **Randomization:** Shuffles the deck content at the start of every game.

### Non-Functional Requirements
* **Window Integration:** Must extend the base `Window` class (draggable, focusable).
* **No External Libraries:** Built entirely with Vanilla JavaScript and CSS.
* **Responsive Design:** The card grid adapts to the window size without breaking aspect ratios.

## 3. Solution Path

The solution follows an Object-Oriented approach, creating a `MemoryGame` class that extends the system's generic `Window` class.

1.  **Architecture:**
    * State is managed via class properties (`this.tiles`, `this.flippedCards`, `this.isTwoPlayer`).
    * The UI is divided into two distinct layouts: **Menu Mode** (Block layout) and **Game Mode** (Flexbox layout).

2.  **Grid System:**
    * Uses **CSS Grid** (`repeat(cols, 1fr)`) to generate the board.
    * Cards use `aspect-ratio: 1/1` to remain square.
    * *Challenge:* Prevented grid "locking" during resize by applying `min-width: 0` to grid items.

3.  **Interaction Handling:**
    * **Mouse:** Standard 'click' listeners on the grid container (Event Delegation).
    * **Keyboard:** Implemented a "virtual cursor" (`activeIndex`). Arrow keys move focus; Enter/Space triggers a flip.
    * **Focus Sync:** Hovering over menu items automatically updates the keyboard focus index to prevent navigation conflicts.

## 4. Key Learnings

* **CSS Layout Conflicts:** Learned that mixing manual height calculations (`calc(100% - 50px)`) with dynamic content causes overflow issues. Switched to **Flexbox** (`flex-direction: column`) to let the browser handle the Status Bar vs. Grid spacing naturally.
* **State Management Bugs:** Discovered that shared variables (like timers) can crash the application when switching modes if not properly reset or checked (e.g., ensuring `timerDisplay` exists before updating it).
* **Accessibility (a11y):** Learned that `tabindex="0"` is essential for making non-button elements (divs) focusable, and that visual focus rings must be synchronized with logical focus.

## 5. Extensions & Advanced Features

Beyond the basic requirements, the following extensions were implemented:

### A. Two-Player Mode (Local Multiplayer)
* Added a toggle in the main menu.
* **Turn Logic:** Matches grant an extra turn; misses switch the active player.
* **Visual Feedback:** The active player's name is highlighted in Gold/Bold, while the inactive player is dimmed.

### B. Dynamic Difficulty
* Users can choose between **Easy (2x2)**, **Medium (2x4)**, or **Hard (4x4)**.
* **Smart Resizing:** The window automatically resizes to fit the chosen grid size and enforces dynamic `min-width` / `min-height` limits to prevent layout breakage.

### C. Advanced Statistics
* **Single Player:** Features a **Millisecond Timer** (MM:SS:MS) and an "Attempts" counter.
* **Two Player:** Replaces the timer with a competitive Scoreboard.

### D. Polished UI/UX
* **Theming:** Uses the "Al-Andalus" color palette (Sandstone, Emerald, Azure, Gold).
* **3D Animations:** CSS `transform: rotateY(180deg)` for realistic card flipping.
* **Focus Following:** Mouse hover events take priority over keyboard focus to create a seamless "hybrid" input experience.