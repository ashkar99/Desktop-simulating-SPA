# Project Requirements: Personal Web Desktop (PWD)

The requirements are divided into Feature sections (F1, F2, and so on). All feature sections are mandatory, except those marked with **(OPTIONAL)** which can be implemented to reach a higher grade.

Please check that your application meets the requirements below before submitting your final version.

---

TODO:
- document.style in all files
- window down limit wall ( bcs different window size)
- focus keyboard on windows
- refactor

## F1: PWD Functional Requirements
The PWD application should be a single page application.

* The user shall be able to open multiple windows (not browser windows/tabs but custom windows created using the DOM) within the application.
* The user shall be able to drag and move the windows inside the PWD.
* The user shall be able to open new windows of the desired application by clicking or double clicking an icon at the desktop.
* The icon used to close the window should be represented in the upper bar of the window.
* Windows should get focus when clicked/dragged.
* The window with focus shall be on top of all other windows.
* The following three window applications should at least be included in the desktop application:
    * A memory game.
    * A chat connected to a central chat channel using websockets.
    * One, by you, designed and decided application (perhaps the quiz or another application).

## F2: PWD Non-Functional Requirements
* The application shall be visually appealing.
* The `README.md` should contain a short description on the application with a representative image. It should also explain how the user can start the application.
* A complete git commit history should be present for assessment. For this assignment somewhere between 30 and 200 commits is normal.
* The code shall be organized in appropriate ES modules.
* All exported functions, modules and classes should be commented using JSDoc.
* The code standard standard should be followed.
* The linters (html, css, javascript) should pass without notices when running `npm run lint`.
* Build the distribution code and verify that it works. The distribution code should be saved in `dist/`.

## F3: Memory Game Window Application
*Read for a description of the memory application.*
These are the requirements for the Memory application that should exists as a window application in the PWD.

* The user should be able to open and play multiple memory games simultaneously.
* The user should be able to play the game using only the keyboard (accessibility).
* One, by you decided, extended feature for the game.

## F4: Chat Window Application
*Read the description of the chat application.*
The chat application should exists as a window application in the PWD. The chat application shall be connected to other students chat clients via the web socket-server.

* The user should be able to have several chat applications running at the same time.
* When the user opens the application for the first time the user should be asked to write his/her username.
* The username should remain the same the next time the user starts a chat application or the PWD is restarted.
* The user should be able to send chat messages using a textarea.
* The user should be able to see at least the 20 latest messages since the chat applications was opened.
* One, by you decided, extended feature.

## F5: An Additional Window Application
* You should add one additional window application to your PWD.
* It should be developed by yourself and it can for example be the Quiz application or another application you choose to develop.

## F6: An Enhanced Chat Application (OPTIONAL)
*This is an optional feature that might help you to a higher grade.*

Fulfill some (at least four) requirements to enhance your chat application. Here are suggestions and feel free to add your own enhancements.
* Ability to choose which channel to listen to.
* Caching message history.
* Added support for emojis.
* Added support for writing code.
* Ability to change username.
* Encrypted messages on a special channel to allow secret communication.
* Added functionality to the "chat protocol". Discuss with others in the course and agree upon added functionality to add to the sent messages.
* Use the messages to play memory against an opponent. Preferably using a separate channel.
* Define your own enhancement.

## F7: Additional Enhancements (OPTIONAL)
*This is an optional feature that might help you to a higher grade. You need to have implemented F6 to be able to solve this requirement.*

You may implement and document additional enhancements to your PDW and the applications to make it more personal, flexible and usable. You may define these requirements on your own, document them and explain how they work.

Write and explain how you improved the following parts:
* The PWD itself.
* The Memory application.
* The extra application.

Examples of enhancements:
* Maximize and normalize window size.
* Resize windows.
* Keep track on open windows, minimize them.
* You may also add an extra extra application, developed by yourself.

## F8: Documentation on Code Structure (OPTIONAL)
*This is an optional feature that might help you to a higher grade. You need to have implemented F7 to be able to solve this requirement.*

* Write a documentation of your code, explaining in your own words how the code is structured, what classes/modules you have and how they relate to each other.
* Write 15-30 sentences.
* Add at least one picture showing the code modules and how they relate to each other.
* Write this in the `README.md` file or direct in the issue.