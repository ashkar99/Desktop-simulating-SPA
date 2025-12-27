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
    this.isResizing = false
    this.dragOffsetX = 0
    this.dragOffsetY = 0

    // Bind methods to 'this' so adding/removing them easily
    this.boundDrag = this.#drag.bind(this)
    this.boundStopDrag = this.#stopDrag.bind(this)
    this.boundResize = this.#resize.bind(this)
    this.boundStopResize = this.#stopResize.bind(this)
  }

  /**
   * Creates the DOM structure for the window.
   * @returns {HTMLElement} The window container
   */
  #createWindowElement () {
    const wrapper = document.createElement('div')
    wrapper.classList.add('window')


    const header = document.createElement('div')
    header.classList.add('window-header')
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

    const resizeHandle = document.createElement('div')
    resizeHandle.classList.add('resize-handle')
    resizeHandle.addEventListener('mousedown', (e) => this.#startResize(e))

    wrapper.appendChild(header)
    wrapper.appendChild(content)
    wrapper.appendChild(resizeHandle)

    return wrapper
  }

  /**
   * Removes the window from the DOM.
   */
  close () {
    if (this.element) {
      this.element.remove()
    }

    if (typeof this.onClose === 'function') {
      this.onClose()
    }
  }


  /**
   * Initiates dragging when clicking the header.
   * @param {MouseEvent} e
   */
  #startDrag (e) {
    e.preventDefault() // Prevent text selection
    this.isDragging = true
    this.dragOffsetX = e.clientX - this.element.offsetLeft
    this.dragOffsetY = e.clientY - this.element.offsetTop
    this.element.style.opacity = '0.8'

    document.addEventListener('mousemove', this.boundDrag)
    document.addEventListener('mouseup', this.boundStopDrag)
    
  }

  /**
   * Updates window position during drag.
   * @param {MouseEvent} e
   */
  #drag (e) {
    if (!this.isDragging) return
    const x = e.clientX - this.dragOffsetX
    const y = e.clientY - this.dragOffsetY

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
    
    this.element.style.opacity = '1'
  }
  #startResize (e) {
    e.preventDefault()
    e.stopPropagation() // Don't trigger drag
    this.isResizing = true
    
    // Capture starting dimensions
    this.startWidth = this.element.offsetWidth
    this.startHeight = this.element.offsetHeight
    this.startX = e.clientX
    this.startY = e.clientY

    document.addEventListener('mousemove', this.boundResize)
    document.addEventListener('mouseup', this.boundStopResize)
  }

  #resize (e) {
    if (!this.isResizing) return
    
    // Calculate new size = start size + movement delta
    const newWidth = this.startWidth + (e.clientX - this.startX)
    const newHeight = this.startHeight + (e.clientY - this.startY)

    // Apply (CSS min-width/min-height will prevent it from getting too small)
    this.element.style.width = `${newWidth}px`
    this.element.style.height = `${newHeight}px`
  }

  #stopResize () {
    this.isResizing = false
    document.removeEventListener('mousemove', this.boundResize)
    document.removeEventListener('mouseup', this.boundStopResize)
  }
}