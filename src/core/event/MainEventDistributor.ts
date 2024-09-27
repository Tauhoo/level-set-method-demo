import EventDistributor from './EventDistributor'
import type Grid from '../grid'
import type { AllEventType, EventListener } from './EventListener'
import MouseMoveEventDistributor from './MouseMoveEventDistributor'

class MainEventDistributor<D> {
  private eventDistributor: EventDistributor
  private mouseMoveEventDistributor: MouseMoveEventDistributor<D>

  constructor(grid: Grid<D>, canvas: HTMLCanvasElement) {
    this.eventDistributor = new EventDistributor()
    this.mouseMoveEventDistributor = new MouseMoveEventDistributor(
      grid,
      canvas,
      this.eventDistributor
    )
  }

  addListener<T extends AllEventType>(type: T, listener: EventListener<T>) {
    this.eventDistributor.add(type, listener)
  }

  destroy() {
    this.mouseMoveEventDistributor.destroy()
  }
}

export default MainEventDistributor
