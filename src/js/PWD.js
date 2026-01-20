import { Window } from './Window.js'
import { MemoryGame } from './MemoryGame.js'
import { Chat } from './Chat.js'
import { Quiz } from './Quiz.js'
import { WordGame } from './WordGame.js'

/**
 * The main Personal Web Desktop (PWD) application class.
 * This class manages the desktop environment, window stacking, and taskbar interactions.
 */
export class PWD {
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
      },
      {
        id: 'wordgame',
        name: 'The Scroll',
        icon: './img/word-icon.png',
        action: () => new WordGame()
      }
    ]
  }

  init () {
    console.log('Al-Andalus PWD initialized.')
    this.#renderIcons()
    this.#setupCenterWidget()
  }

  /**
   * Creates the center widget containing the wallpaper and clock.
   */
  #setupCenterWidget () {
    const container = document.createElement('div')
    container.id = 'center-widget'

    const img = document.createElement('img')
    img.src = './img/wallpaper.png' 
    img.alt = 'Al-Andalus Emblem'
    img.className = 'widget-wallpaper'
    
    img.onerror = () => { img.style.display = 'none' }
    const clockDiv = document.createElement('div')
    clockDiv.className = 'widget-clock'
    
    const timeSpan = document.createElement('div')
    timeSpan.className = 'clock-time'
    
    const dateSpan = document.createElement('div')
    dateSpan.className = 'clock-date'

    clockDiv.appendChild(timeSpan)
    clockDiv.appendChild(dateSpan)
    container.appendChild(clockDiv)
    container.appendChild(img)
    this.desktopArea.prepend(container)

    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      timeSpan.textContent = `${hours}:${minutes}`

      const options = { weekday: 'long', month: 'long', day: 'numeric' }
      dateSpan.textContent = now.toLocaleDateString('en-US', options)
    }

    updateTime()
    setInterval(updateTime, 1000)
  }

  #renderIcons () {
    this.taskbar.innerHTML = '' // Clear to prevent duplicates

    this.apps.forEach(app => {
      const iconContainer = document.createElement('div')
      iconContainer.classList.add('desktop-icon')

      const iconImg = document.createElement('img')
      iconImg.src = app.icon
      iconImg.alt = app.name
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
    windowObj.onClose = () => {
      this.removeWindow(windowObj)
    }

    this.windows.push(windowObj)
    this.desktopArea.appendChild(windowObj.element)

    // Measure the environment
    const winHeight = windowObj.element.offsetHeight
    const winWidth = windowObj.element.offsetWidth
    const desktopH = this.desktopArea.clientHeight
    const desktopW = this.desktopArea.clientWidth

    // Check Bounds before positioning
    if (this.nextWindowY + winHeight > desktopH) {
      this.nextWindowY = 50
      this.nextWindowX += 40
    }
    if (this.nextWindowX + winWidth > desktopW) {
      this.nextWindowX = 50
      this.nextWindowY = 50
    }

    windowObj.element.style.top = `${this.nextWindowY}px`
    windowObj.element.style.left = `${this.nextWindowX}px`
    this.nextWindowX += 20
    this.nextWindowY += 20

    this.#focusWindow(windowObj)
    if (typeof windowObj.focus === 'function') {
      windowObj.focus()
    }

    // Aggressive Focus Restoration
    windowObj.element.addEventListener('mousedown', (e) => {
      this.#focusWindow(windowObj)
      
      // Generic check for ANY interactive element
      const clickedInteractive = e.target.closest('button, input, textarea, a, select, [tabindex]:not([tabindex="-1"])')

      if (!clickedInteractive) {
        e.preventDefault() 
        
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
