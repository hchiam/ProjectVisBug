import { HandlesStyles, RotationStyles } from '../styles.store'

export class Rotation extends HTMLElement {
  constructor() {
    super()
    this.$shadow = this.attachShadow({mode: 'closed'})
    this.styles = [HandlesStyles, RotationStyles]
    this.startAngle = 0
    this.currentAngle = 0
  }

  connectedCallback() {
    this.$shadow.adoptedStyleSheets = this.styles
  }

  set position({el}) {
    this.targetElement = el
    const {left, top, width, height} = el.getBoundingClientRect()
    const isFixed = getComputedStyle(el).position === 'fixed'

    this.style.setProperty('--top', `${top + (isFixed ? 0 : window.scrollY)}px`)
    this.style.setProperty('--left', `${left}px`)
    this.style.setProperty('--position', isFixed ? 'fixed' : 'absolute')
    this.style.setProperty('--width', `${width}px`)
    
    this.$shadow.innerHTML = this.render()
    this.setupRotationHandlers()
  }

  setupRotationHandlers() {
    const handle = this.$shadow.querySelector('.rotation-handle')
    
    const onMouseDown = e => {
      e.preventDefault()
      const {left, top, width, height} = this.targetElement.getBoundingClientRect()
      this.originalCenter = {
        x: left + width / 2,
        y: top + height / 2
      }
      this.startAngle = Math.atan2(
        e.clientY - this.originalCenter.y,
        e.clientX - this.originalCenter.x
      )
      
      this.handleRadius = Math.sqrt(
        Math.pow(e.clientX - this.originalCenter.x, 2) + 
        Math.pow(e.clientY - this.originalCenter.y, 2)
      )
      
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    const onMouseMove = e => {
      const currentAngle = Math.atan2(
        e.clientY - this.originalCenter.y,
        e.clientX - this.originalCenter.x
      )
      
      const rotation = currentAngle - this.startAngle
      this.currentAngle = rotation
      
      const rotationDegrees = this.currentAngle * (180 / Math.PI)
      this.targetElement.style.transform = `rotate(${rotationDegrees}deg)`
      
      this.handleRadius = Math.sqrt(
        Math.pow(e.clientX - this.originalCenter.x, 2) + 
        Math.pow(e.clientY - this.originalCenter.y, 2)
      )
      
      const handle = this.$shadow.querySelector('.rotation-handle')
      
      const handleX = this.originalCenter.x + this.handleRadius * Math.cos(currentAngle)
      const handleY = this.originalCenter.y + this.handleRadius * Math.sin(currentAngle)
      
      const hostRect = this.getBoundingClientRect()
      handle.style.left = `${handleX - hostRect.left - 12}px`
      handle.style.top = `${handleY - hostRect.top}px`
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    handle.addEventListener('mousedown', onMouseDown)
    
    this.cleanup = () => {
      handle.removeEventListener('mousedown', onMouseDown)
    }
  }

  disconnectedCallback() {
    this.cleanup && this.cleanup()
  }

  render() {
    return `
      <div class="rotation-handle">
        <svg class="rotation-icon" viewBox="0 0 24 24">
          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
        </svg>
      </div>
    `
  }
}

customElements.define('visbug-rotation', Rotation)
