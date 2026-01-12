# Chat Application Module Documentation

## 1. Overview

The Chat Application is a real-time messaging tool integrated into the Personal Web Desktop (SPA). It utilizes WebSockets for instant communication and local storage for offline persistence, allowing users to communicate across different dynamic channels within the university's network.

## 2. Features

### Core Requirements (Functional)

* **WebSocket Integration:** Connects to the university's public WebSocket server using a custom JSON protocol.
* **Message Persistence:** Caches message history in the browser's `localStorage` so messages remain visible even after a reload or offline state.
* **Offline Handling:** Detects connection loss and updates the status indicator (Online/Offline) in real-time.
* **Username System:** Enforces username entry before connection and persists the user's identity.

### Non-Functional Requirements

* **Window Integration:** Extends the base `Window` class, inheriting dragging, z-index management, and focus behaviors.
* **Security:** API keys are encapsulated within the class; input sanitization is handled via standard DOM text node creation (preventing XSS).

## 3. Solution Path

The solution follows an Object-Oriented approach, creating a `Chat` class that manages both the Network Layer and the UI Layer.

1. **Architecture & State:**
    * **Network:** Managed via a single `WebSocket` instance. Event listeners (`open`, `message`, `close`) drive the UI updates.
    * **Storage Strategy:** To support multiple channels, `localStorage` keys are dynamic (`pwd-chat-history-PWD-General`, `pwd-chat-history-PWD-Social`, etc.). This prevents "ghost messages" from appearing in the wrong room.


2. **Channel System (Virtual Rooms):**
    * Since the server is a "Global Echo" (broadcasting all messages to everyone), the application implements **Client-Side Filtering**.
    * Incoming messages are checked against `this.defaultChannel`. If tags do not match, the message is discarded silently.


3. **UI/UX Design:**
    * **Al-Andalus Theme:** Uses the standard Emerald/Sandstone palette.
    * **Icons:** Replaced text buttons with semantic icons (Hashtag for Channels, Swap-Arrows for User Switch) to save header space.
    * **Overlay UI:** A custom DOM-based modal was built for the Channel Selector to avoid using native browser prompts (`window.prompt`), ensuring an immersive experience.

## 4. Key Learnings & Bug Fixes

* **The "Global Leak" Bug:**
    * *Issue:* Messages sent to "SecretRoom" were appearing in "General".
    * *Discovery:* Realized the server broadcasts *everything* regardless of channel tag.
    * *Fix:* Implemented a guard clause in the message listener: `if (data.channel !== this.defaultChannel) return`.


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
* **Smart Reconnection:** Switching channels automatically closes the old socket, clears the UI, loads the *specific* cached history for the new room, and reconnects.

### B. Visual Notifications

* **Visual Alert:** If a new message arrives while the window is inactive (blur), the window header turns **Terracotta (Red)** and pulses.
* **Focus Logic:** Clicking anywhere in the window instantly restores the standard Green header.

### C. Audio Notifications

* **Sound Alert:** Integrated a non-intrusive notification sound (`notification.mp3`) that triggers only when a new message arrives from *another* user while the window is in the background.
* **Browser Policy Handling:** Includes a `.catch()` block to gracefully handle modern browser policies that block auto-playing audio if the user hasn't interacted with the page yet.

### D. Advanced Persistence

* **Username:** Remembers the user between sessions.
* **History:** Caches the last 50 messages per channel. When switching back to a previously visited channel, history is instantly restored from disk before the connection is even established.
