/**
 * Main entry point for the Personal Web Desktop Application.
 * Imports the main PWD class and initializes it.
 */

import { PWD } from './PWD.js'

/**
 * Event listener to ensure the DOM is fully loaded before starting the app.
 */
document.addEventListener('DOMContentLoaded', () => {
  const app = new PWD()
  app.init()
})
