export class Timer {
  /**
   * @param {HTMLElement} parentElement - The element to append the timer bar to.
   * @param {number} durationSeconds - Total time in seconds.
   * @param {function} onTimeout - Callback when time runs out.
   */
  constructor (parentElement, durationSeconds, onTimeout) {
    this.parent = parentElement
    this.duration = durationSeconds * 1000 // ms
    this.onTimeout = onTimeout
    
    this.intervalId = null
    this.startTime = 0
    this.barElement = null // The visible green bar
    this.container = null  // The gray track
  }

  /**
   * Creates the UI and starts the countdown.
   */
  start () {
    this.render() // 1. Create UI
    
    this.startTime = Date.now()
    
    // 2. Start Loop
    this.intervalId = setInterval(() => {
      const elapsed = Date.now() - this.startTime
      const remaining = this.duration - elapsed
      const percentage = Math.max(0, (remaining / this.duration) * 100)

      // Update UI
      if (this.barElement) {
        this.barElement.style.width = `${percentage}%`
        
        // Color Change Logic (Green -> Red)
        if (percentage < 25) {
          this.barElement.style.backgroundColor = 'var(--color-terracotta)'
        } else {
          this.barElement.style.backgroundColor = 'var(--color-emerald)'
        }
      }

      // Time Up
      if (remaining <= 0) {
        this.stop()
        if (this.onTimeout) this.onTimeout()
      }
    }, 100)
  }

  /**
   * Stops timer and cleans up.
   * @returns {number} Elapsed time in ms.
   */
  stop () {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    return Date.now() - this.startTime
  }

  /**
   * Internal: Builds the DOM elements.
   */
  render () {
    // Clean up old timer if exists
    if (this.container) this.container.remove()

    this.container = document.createElement('div')
    this.container.className = 'timer-container'

    this.barElement = document.createElement('div')
    this.barElement.className = 'timer-fill'

    this.container.appendChild(this.barElement)
    
    // Insert at the top of the parent
    this.parent.prepend(this.container)
  }
}