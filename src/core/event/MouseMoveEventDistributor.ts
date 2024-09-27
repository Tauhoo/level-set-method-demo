import EventDistributor from './EventDistributor'
import type Grid from '../grid'

class MouseMoveEventDistributor<D> {
  private eventDistributor: EventDistributor
  private lastEnteredCell: { x: number; y: number } | null = null
  private grid: Grid<D>
  private canvas: HTMLCanvasElement

  constructor(
    grid: Grid<D>,
    canvas: HTMLCanvasElement,
    eventDistributor: EventDistributor
  ) {
    this.eventDistributor = eventDistributor
    this.grid = grid
    this.canvas = canvas
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
  }

  private handleMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect()
    const x = e.offsetX
    const y = e.offsetY
    const cellHeightSize = rect.width / this.grid.getWidth()
    const cellWidthSize = rect.height / this.grid.getHeight()
    const cellX = Math.max(
      0,
      Math.min(this.grid.getWidth() - 1, Math.floor(x / cellWidthSize))
    )
    const cellY = Math.max(
      0,
      Math.min(this.grid.getHeight() - 1, Math.floor(y / cellHeightSize))
    )

    if (
      this.lastEnteredCell !== null &&
      this.lastEnteredCell.x === cellX &&
      this.lastEnteredCell.y === cellY
    ) {
      return
    }
    this.eventDistributor.emit({
      type: 'CELL_ENTER',
      data: { x: cellX, y: cellY },
    })

    if (this.lastEnteredCell !== null)
      this.eventDistributor.emit({
        type: 'CELL_LEAVE',
        data: { x: this.lastEnteredCell.x, y: this.lastEnteredCell.y },
      })
    this.lastEnteredCell = { x: cellX, y: cellY }
  }

  destroy() {
    this.canvas.removeEventListener('mousemove', this.handleMouseMove)
  }
}

export default MouseMoveEventDistributor
