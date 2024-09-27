import type { EventDataFromType } from './core/event/EventListener'
import Grid from './core/grid'
import { Tracked } from './core/tracked'

export interface Data {
  levelSet: number
  isLiquid: boolean
}

const originX = 10
const originY = 10
const radius = 5
const cellInit = (x: number, y: number) => {
  const levelSet = Math.sqrt((x - originX) ** 2 + (y - originY) ** 2) - radius
  return new Tracked<Data>({ levelSet: levelSet, isLiquid: false })
}
export const grid = new Grid(21, 21, cellInit)

let lastCellX: number | null = null
let lastCellY: number | null = null

export function onCellEnter(event: EventDataFromType<'CELL_ENTER'>) {
  const cell = grid.cell(event.data.x, event.data.y)
  if (cell === null) return
  // remove liquid from the last cell
  if (lastCellX !== null && lastCellY !== null) {
    const cell = grid.cell(lastCellX, lastCellY)
    if (cell !== null) {
      cell.data.isLiquid = false
    }
    for (let y = lastCellY - radius; y <= lastCellY + radius; y++) {
      for (let x = lastCellX - radius; x <= lastCellX + radius; x++) {
        const dx = x - lastCellX
        const dy = y - lastCellY
        if (dx * dx + dy * dy < radius * radius) {
          const cell = grid.cell(x, y)
          if (cell !== null) {
            cell.data.isLiquid = false
          }
        }
      }
    }
  }
  // set liquid to all cells in the radius
  for (let y = event.data.y - radius; y <= event.data.y + radius; y++) {
    for (let x = event.data.x - radius; x <= event.data.x + radius; x++) {
      const dx = x - event.data.x
      const dy = y - event.data.y
      if (dx * dx + dy * dy < radius * radius) {
        const cell = grid.cell(x, y)
        if (cell !== null) {
          cell.data.isLiquid = true
        }
      }
    }
  }
  lastCellX = event.data.x
  lastCellY = event.data.y
}
