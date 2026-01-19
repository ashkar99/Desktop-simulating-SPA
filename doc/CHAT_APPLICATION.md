# Chat Application Module Documentation

## 1. Overview
The Chat Application is a real-time messaging tool integrated into the Personal Web Desktop (SPA). It utilizes WebSockets for instant communication and a centralized Storage Manager for offline persistence, allowing users to communicate across different dynamic channels within the university's network.

## 2. Features

### Core Requirements (Functional)
* **WebSocket Integration:** Connects to the university's public WebSocket server using a custom JSON protocol.
* **Message Persistence:** Caches message history in `localStorage` so messages remain visible even after a reload or offline state.
* **Offline Handling:** Detects connection loss and updates the status indicator (Online/Offline) in real-time.
* **Username System:** Enforces username entry before connection and persists the user's identity.

### Non-Functional Requirements
* **Window Integration:** Extends the base `Window` class, inheriting dragging, z-index management, and focus behaviors.
* **Separation of Concerns:** Networking logic is isolated in a dedicated API class, separate from the UI logic.

## 3. Solution Path

The solution follows a modular architecture, splitting responsibilities into three distinct classes:

1.  **UI Controller (`Chat.js`):**
    * Manages the DOM, user input, and window events.
    * Delegates networking to `ChatAPI` and persistence to `StorageManager`.
    
2.  **Network Layer (`ChatAPI.js`):**
    * Encapsulates the `WebSocket` connection.
    * Handles protocol specifics (Heartbeats, JSON parsing, API Keys).
    * Implements the **Observer Pattern** by accepting callbacks (`onMessage`, `onError`) from the UI.

3. **Channel System (Virtual Rooms):**
    * Since the server is a "Global Echo" (broadcasting all messages to everyone), the application implements **Client-Side Filtering**.
    * Incoming messages are checked against `this.defaultChannel` by sending it to `ChatAPI`. If tags do not match, the message is discarded silently.

4.  **Persistence Layer (`StorageManager.js`):**
    * Centralizes all `localStorage` operations.
    * Generates dynamic keys for channels (e.g., `pwd-chat-history-General`) to prevent data leaks between rooms.

5. **UI/UX Design:**
    * **Al-Andalus Theme:** Uses the standard Emerald/Sandstone palette.
    * **Icons:** Replaced text buttons with semantic icons (Hashtag for Channels, Swap-Arrows for User Switch) to save header space.
    * **Overlay UI:** A custom DOM-based modal was built for the Channel Selector to avoid using native browser prompts (`window.prompt`), ensuring an immersive experience.

## 4. Key Learnings & Bug Fixes

* **The "Global Leak" Bug:**
    * *Issue:* Messages sent to "SecretRoom" were appearing in "General".
    * *Discovery:* Realized the server broadcasts *everything* regardless of channel tag.
    * *Fix:* Implemented a guard clause in `ChatAPI` to filter messages before passing them to the UI: `if (data.channel !== channel) return`.

* **Refactoring for Maintainability:**
    * *Challenge:* The original `Chat.js` file was too large and handled both UI and Networking.
    * *Solution:* Extracted `ChatAPI` and `StorageManager`. This reduced code duplication (Quiz and Chat now share the storage logic) and made the code easier to test.

* **The "Unread" Logic:**
    * *Issue:* The notification light would stay red even after the user started typing.
    * *Fix:* Added `focus` and `click` listeners to the `textarea` that trigger a `markAsRead()` helper, ensuring the UI feels responsive.

* **CSS Positioning:**
    * *Issue:* The Channel Selector overlay was covering the Window Header.
    * *Fix:* Added `position: relative` to the `.chat-wrapper`. This forced the absolute-positioned overlay to anchor inside the content area, not the entire window.

## 5. Extensions & Advanced Features

The following advanced features were implemented to meet Optional Requirements:

### A. Channel Switcher & Lobby

* Users are not stuck in one room. A "Channel Lobby" overlay allows quick selection of preset rooms (General, Social, Help) or entry of a custom private room name.
* **Smart Reconnection:** Switching channels automatically disconnects the API, clears the UI, loads the *specific* cached history ffrom `StorageManager`, and reconnects to the new stream.

### B. Visual Notifications

* **Visual Alert:** If a new message arrives while the window is inactive (blur), the window header turns **Terracotta (Red)** and pulses.
* **Focus Logic:** Clicking anywhere in the window instantly restores the standard Green header.

### C. Audio Notifications

* **Sound Alert:** Integrated a non-intrusive notification sound (`notification.mp3`) that triggers only when a new message arrives from *another* user while the window is in the background.
* **Browser Policy Handling:**  `SoundPlayer.js` includes a `play().catch()` block to gracefully handle modern browser policies that block auto-playing audio if the user hasn't interacted with the page yet.

### D. Advanced Persistence
* **Username:** Remembers the user between sessions via `StorageManager.getUsername()`.
* **History:** Caches the last 50 messages per channel. When switching back to a previously visited channel, history is instantly restored from disk before the connection is even established.