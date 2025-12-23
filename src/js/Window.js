/**
 * Base Window class for the PWD.
 * Handles DOM creation, closing, and basic structure.
 */
export class Window {
  constructor (title) {
    this.title = title
    this.element = this.#createWindowElement()
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

    const titleSpan = document.createElement('span')
    titleSpan.textContent = this.title

    const closeBtn = document.createElement('button')
    closeBtn.classList.add('close-btn')
    closeBtn.textContent = 'x'
    
    // Close window
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
}
