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
  }

  /**
   * Initializes the PWD application.
   * Sets up event listeners and prepares the desktop.
   */
  init () {
    // Test: Open TWO windows to test stacking/focus
    const win1 = new Window('Window 1')
    const win2 = new Window('Window 2')
    
    // Offset the second window slightly so they don't perfectly overlap
    win2.element.style.left = '60px'
    win2.element.style.top = '60px'

    this.openWindow(win1)
    this.openWindow(win2)
  }

  /**
   * Opens a window and adds it to the desktop.
   * @param {Window} windowObj - The window instance to open
   */
  openWindow (windowObj) {
    this.windows.push(windowObj)
    this.desktopArea.appendChild(windowObj.element)

    // Focus immediately upon opening
    this.#focusWindow(windowObj)
    // Add listener to focus when clicked
    windowObj.element.addEventListener('mousedown', () => {
      this.#focusWindow(windowObj)
    })
  }

  /**
   * Brings a specific window to the front.
   * @param {Window} windowObj 
   */
  #focusWindow (windowObj) {
    // Only update if it's not already on top
    const currentZ = parseInt(windowObj.element.style.zIndex || 0)
    
    if (currentZ !== this.zIndexCounter) {
      this.zIndexCounter++
      windowObj.element.style.zIndex = this.zIndexCounter
      
      // Add a class to indicate active state
      this.windows.forEach(w => w.element.classList.remove('active-window'))
      windowObj.element.classList.add('active-window')
    }
  }
}