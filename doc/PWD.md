# Personal Web Desktop (PWD) Core Documentation

## 1. Overview

The Personal Web Desktop (PWD) is the central "operating system" for the single-page application. It acts as the window manager, task scheduler, and visual shell, orchestrating the lifecycle of all sub-applications (Memory, Chat, Quiz). It provides a unified environment where multiple applications can coexist, overlap, and interact.


## 2. Features

### Core Requirements (Functional)

* **Window Management:** Users can open multiple application instances simultaneously without conflict.
* **Taskbar (Dock):** A MacOS-style dock at the bottom of the screen allows users to launch applications via icons.
* **Z-Index Stacking:** The currently active window is always brought to the foreground (`z-index`), ensuring it visually overlaps inactive windows.
* **Window Operations:** All windows support:
    * **Dragging:** Moving the window by clicking and holding the header.
    * **Closing:** Removing the window from the DOM and memory via a standard 'X' button.
    * **Focusing:** Clicking anywhere on a window activates it and its keyboard functionality.


### Non-Functional Requirements

* **Modular Architecture:** The system uses ES Modules (`import/export`) to dynamically load application classes (`MemoryGame`, `Chat`, `Quiz`) only when needed.
* **Visual Consistency:** Enforces a shared "Al-Andalus" design language (Sandstone, Emerald, Gold) across all windows via global CSS variables.
* **Responsive Layout:** The desktop area fills `100vh`, and the taskbar features a slide-up animation to maximize screen real estate.


## 3. Solution Path

The core system is split into two primary classes: the **Manager** (`PWD`) and the **Component** (`Window`).

1. **The Window Manager (`PWD.js`):**
    * **Lifecycle Management:** Maintains a registry (`this.windows`) of all open apps. When a window is closed, it is filtered out of this array to prevent memory leaks.
    * **Focus Logic:** Uses a global `zIndexCounter`. When a window is focused, this counter increments, and the window's `z-index` is updated. This guarantees that the most recently clicked window is always on top.
    * **Smart Tiling:** Implements a "Cascade" positioning algorithm. New windows open at offset coordinates (`nextWindowX`, `nextWindowY`) to prevent them from completely covering existing windows.


2. **The Base Component (`Window.js`):**
    * **DOM Construction:** Encapsulates the creation of the standard window frame (Header, Content Area, Close Button, Resize Handle).
    * **Event Handling:** Manages its own `mousedown`, `mousemove`, and `mouseup` events for dragging. It uses `bind(this)` to ensure event listeners maintain the correct class context.
    * **Cleanup:** Provides a `close()` method that removes the DOM element and triggers an `onClose` callback to notify the PWD.


3. **The Taskbar System:**
    * The taskbar is generated dynamically based on an `apps` configuration array. This makes it easy to add new apps (like the Quiz) by simply adding an object to the list.


## 4. Key Learnings

* **Aggressive Focus Restoration:**
    * *Challenge:* Clicking inside a window (e.g., on empty space) often caused the browser to shift focus to the `<body>`, making the window "inactive."
    * *Solution:* Implemented a `mousedown` listener on the window element that calls `e.preventDefault()` for non-interactive elements. This forces the browser to keep the focus context within the application.


* **Ghost Dragging:**
    * *Challenge:* Dragging a window rapidly sometimes caused the mouse to leave the header area, breaking the drag operation.
    * *Solution:* Attached the `mousemove` and `mouseup` listeners to the `document` (global scope) instead of the element itself during a drag operation. This ensures the drag continues even if the cursor moves outside the window bounds.


* **CSS Context Stacking:**
    * *Learned:* Using `transform` on the Taskbar created a new stacking context, initially causing it to render *behind* windows.
    * *Fix:* Applied a high `z-index` (10000) to the `#taskbar-container` to ensure it always floats above application windows.


## 5. Extensions & Advanced Features

### A. Window Resizing

* Implemented a custom drag handle in the bottom-right corner of every window.
* **Logic:** Calculates the delta between the mouse start position and current position, updating `width` and `height` styles in real-time.
* **Constraints:** Enforces `min-width` and `min-height` via CSS and JS to prevent windows from collapsing into unusable sizes.

### B. "MacOS" Style Dock

* The taskbar is hidden by default (positioned off-screen).
* **Interaction:** It slides up smoothly (`transition: transform 0.4s`) only when the user hovers near the bottom of the screen, maximizing the usable workspace.
* **Feedback:** Icons scale up (`transform: scale(1.1)`) and display tooltips on hover.

### C. Application Encapsulation

* The `Window` class provides a generic `window-content` container. Sub-classes (like `MemoryGame` or `Chat`) simply append their specific UI to this container, ensuring a clear Separation of Concerns between the Window Frame (System) and the Application Logic (User).