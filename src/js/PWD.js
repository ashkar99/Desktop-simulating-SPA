import { Window } from './Window.js'
import { MemoryGame } from './MemoryGame.js'
import { Chat } from './Chat.js'
import { Quiz } from './Quiz.js'

/**
 * The main Personal Web Desktop (PWD) application class.
 * This class manages the desktop environment, window stacking, and taskbar interactions.
 * @class
 */
export class PWD {
  /**
   * Creates an instance of the PWD.
   * Sets up references to the main desktop area and taskbar.
   */
  constructor () {
    this.desktopArea = document.querySelector('#desktop-area')
    this.taskbar = document.querySelector('#taskbar')
    this.windows = []
    this.zIndexCounter = 10
    this.nextWindowX = 50
    this.nextWindowY = 50

    this.apps = [
      {
        id: 'memory',
        name: 'Memory Game',
        icon: './img/memory-icon.png',
        action: () => new MemoryGame()
      },
      {
        id: 'chat',
        name: 'Chat Channel',
        icon: './img/chat-icon.png',
        action: () => new Chat()
      },
      {
        id: 'quiz',
        name: 'Quizzes',
        icon: './img/quiz-icon.png',
        action: () => new Quiz()
      }
    ]
  }

  init () {
    console.log('Al-Andalus PWD initialized.')
    this.#renderIcons()
  }

  #renderIcons () {
    this.taskbar.innerHTML = '' // Clear to prevent duplicates

    this.apps.forEach(app => {
      const iconContainer = document.createElement('div')
      iconContainer.classList.add('desktop-icon')

      const iconImg = document.createElement('img')
      iconImg.src = app.icon
      iconImg.alt = app.name
      // Drag prevention for the image itself so it doesn't ghost-drag
      iconImg.addEventListener('dragstart', (e) => e.preventDefault())

      const iconLabel = document.createElement('span')
      iconLabel.textContent = app.name

      iconContainer.appendChild(iconImg)
      iconContainer.appendChild(iconLabel)

      iconContainer.addEventListener('click', () => {
        try {
          const win = app.action()
          this.openWindow(win)
        } catch (error) {
          console.error('Error opening app:', error)
        }
      })

      this.taskbar.appendChild(iconContainer)
    })
  }

  /**
   * Opens a new window and manages its position and focus.
   * @param {Window} windowObj - The window object to open.
   */
  openWindow (windowObj) {
    // Hook up the Close Event to clean up PWD state
    windowObj.onClose = () => {
      this.removeWindow(windowObj)
    }

    this.windows.push(windowObj)
    this.desktopArea.appendChild(windowObj.element)

    // Position the CURRENT window & prepare for the NEXT one
    windowObj.element.style.top = `${this.nextWindowY}px`
    windowObj.element.style.left = `${this.nextWindowX}px`
    this.nextWindowX += 20
    this.nextWindowY += 20

    if (this.nextWindowY > window.innerHeight - 350) {
      this.nextWindowY = 50; this.nextWindowX += 10
    }
    if (this.nextWindowX > window.innerWidth - 200) {
      this.nextWindowX = 50; this.nextWindowY = 50
    }

    this.#focusWindow(windowObj)
    if (typeof windowObj.focus === 'function') {
      windowObj.focus()
    }

    // Aggressive Focus Restoration
    windowObj.element.addEventListener('mousedown', (e) => {
      this.#focusWindow(windowObj)

      // Check if the target is NOT a button, input, or card.
      const clickedInteractive = e.target.closest('button, .memory-card, input, textarea, a')
      if (!clickedInteractive) {
        // Prevent default browser behavior (which steals focus)
        e.preventDefault()

        // Force focus back to the game immediately
        if (typeof windowObj.focus === 'function') {
          windowObj.focus()
        }
      }
    })
  }

  /**
   * Removes a window from tracking and passes focus to the next available one.
   * @param {Window} windowObj - The window object to remove.
   */
  removeWindow (windowObj) {
    this.windows = this.windows.filter(w => w !== windowObj)

    if (this.windows.length > 0) {
      const lastWin = this.windows[this.windows.length - 1]
      setTimeout(() => {
        this.#focusWindow(lastWin)
        if (typeof lastWin.focus === 'function') {
          lastWin.focus()
        }
      }, 50)
    }
  }

  /**
   * Brings a specific window to the front.
   * @param {Window} windowObj - The window object to focus.
   */
  #focusWindow (windowObj) {
    const currentZ = parseInt(windowObj.element.style.zIndex || 0)
    if (currentZ !== this.zIndexCounter) {
      this.zIndexCounter++
      windowObj.element.style.zIndex = this.zIndexCounter
      this.windows.forEach(w => w.element.classList.remove('active-window'))
      windowObj.element.classList.add('active-window')
    }
  }
}
