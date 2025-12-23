/**
 * Base Window class for the PWD.
 * Handles DOM creation, closing, and drag functionality.
 */
export class Window {
  constructor (title) {
    this.title = title
    this.element = this.#createWindowElement()
    
    // Drag state variables
    this.isDragging = false
    this.dragOffsetX = 0
    this.dragOffsetY = 0

    // Bind methods to 'this' so adding/removing them easily
    this.boundDrag = this.#drag.bind(this)
    this.boundStopDrag = this.#stopDrag.bind(this)
  }

  /**
   * Creates the DOM structure for the window.
   * @returns {HTMLElement} The window container
   */
  #createWindowElement () {
    const wrapper = document.createElement('div')
    wrapper.classList.add('window')

    //
    // TODO: Improve window positioning
    // Default position
    //
    wrapper.style.left = '50px'
    wrapper.style.top = '50px'

    const header = document.createElement('div')
    header.classList.add('window-header')
    
    // Only the header triggers the drag start
    header.addEventListener('mousedown', (e) => this.#startDrag(e))
    const titleSpan = document.createElement('span')
    titleSpan.textContent = this.title
    
    const closeBtn = document.createElement('button')
    closeBtn.classList.add('close-btn')
    closeBtn.textContent = 'x'

    // Prevent drag when clicking close, and close the window
    closeBtn.addEventListener('mousedown', (e) => e.stopPropagation())
    closeBtn.addEventListener('click', () => this.close())

    header.appendChild(titleSpan)
    header.appendChild(closeBtn)

    const content = document.createElement('div')
    content.classList.add('window-content')

    wrapper.appendChild(header)
    wrapper.appendChild(content)

    return wrapper
  }

  /**
   * Removes the window from the DOM.
   */
  close () {
    if (this.element) {
      this.element.remove()
    }
  }


  /**
   * Initiates dragging when clicking the header.
   * @param {MouseEvent} e
   */
  #startDrag (e) {
    e.preventDefault() // Prevent text selection
    this.isDragging = true
    
    // Calculate where the mouse is relative to the window corner
    this.dragOffsetX = e.clientX - this.element.offsetLeft
    this.dragOffsetY = e.clientY - this.element.offsetTop

    // Listen to mouse movements
    document.addEventListener('mousemove', this.boundDrag)
    document.addEventListener('mouseup', this.boundStopDrag)
    
    // Visual cue
    this.element.style.opacity = '0.8'
  }

  /**
   * Updates window position during drag.
   * @param {MouseEvent} e
   */
  #drag (e) {
    if (!this.isDragging) return

    // Calculate new position
    const x = e.clientX - this.dragOffsetX
    const y = e.clientY - this.dragOffsetY

    // Apply new position
    this.element.style.left = `${x}px`
    this.element.style.top = `${y}px`
  }

  /**
   * Stops dragging and cleans up event listeners.
   */
  #stopDrag () {
    this.isDragging = false
    document.removeEventListener('mousemove', this.boundDrag)
    document.removeEventListener('mouseup', this.boundStopDrag)
    
    // Reset visual cue
    this.element.style.opacity = '1'
  }
}