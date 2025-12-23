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
    /** @type {HTMLElement} The main desktop area where windows live */
    this.desktopArea = document.querySelector('#desktop-area')

    /** @type {HTMLElement} The taskbar element */
    this.taskbar = document.querySelector('#taskbar')

    /** @type {Array} List of active window instances */
    this.windows = []
  }

  /**
   * Initializes the PWD application.
   * Sets up event listeners and prepares the desktop.
   */
  init () {
    // testing initialization
    console.log('Al-Andalus PWD initialized.')
  }
}
