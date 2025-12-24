import { Window } from './Window.js'

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
    
    // Start z-index at 10. Every click will bump this number.
    this.zIndexCounter = 10

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
        const win = app.action()
        this.openWindow(win)
      })

      this.taskbar.appendChild(iconContainer)
    })
  }

  openWindow (windowObj) {
    this.windows.push(windowObj)
    this.desktopArea.appendChild(windowObj.element)
    this.#focusWindow(windowObj)

    windowObj.element.addEventListener('mousedown', () => {
      this.#focusWindow(windowObj)
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