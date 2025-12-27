import { Window } from './Window.js'
import { MemoryGame } from './MemoryGame.js'

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
        name: 'Memory',
        icon: './img/memory-icon.png',
        action: () => new MemoryGame()
      },
      {
        id: 'chat',
        name: 'Chat',
        icon: './img/chat-icon.png',
        action: () => new Window('Chat')
      },
      {
        id: 'quiz',
        name: 'Quiz',
        icon: './img/quiz-icon.png',
        action: () => new Window('Quiz')
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

  openWindow (windowObj) {
    this.windows.push(windowObj)
    this.desktopArea.appendChild(windowObj.element)
    
    // Position the CURRENT window
    windowObj.element.style.top = `${this.nextWindowY}px`
    windowObj.element.style.left = `${this.nextWindowX}px`
    // Prepare position for the NEXT window
    this.nextWindowX += 20
    this.nextWindowY += 20

    // Check Vertical Bound
    if (this.nextWindowY > window.innerHeight - 350) {
      this.nextWindowY = 50
      this.nextWindowX += 10 
    }
    // Check Horizontal Bound
    if (this.nextWindowX > window.innerWidth - 200) {
      this.nextWindowX = 50
      this.nextWindowY = 50
    }

    this.#focusWindow(windowObj)

    // Auto-Focus Content on Open
    if (typeof windowObj.focus === 'function') {
      windowObj.focus()
    }

    // Auto-Focus Content on Click (Switching between windows)
    windowObj.element.addEventListener('mousedown', () => {
      this.#focusWindow(windowObj)
      if (typeof windowObj.focus === 'function') {
        windowObj.focus()
      }
    })
  }

  /**
   * Brings a specific window to the front.
   * @param {Window} windowObj 
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