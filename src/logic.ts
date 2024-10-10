import type { EventDataFromType } from './core/event/EventListener'
import Grid from './core/grid'
import { Tracked } from './core/tracked'

export interface Data {
  levelSet: number
  isLiquid: boolean
}
const width = 21
const height = 21
const originX = Math.floor(width / 2)
const originY = Math.floor(height / 2)
const radius = 5
const cellInit = (x: number, y: number) => {
  const levelSet = Math.sqrt((x - originX) ** 2 + (y - originY) ** 2) - radius
  return new Tracked<Data>({ levelSet: levelSet, isLiquid: false })
}
export const grid = new Grid(width, height, cellInit)

let lastCellX: number | null = null
let lastCellY: number | null = null

function loopOverPoints(
  originX: number,
  originY: number,
  radius: number,
  callback: (x: number, y: number) => void
) {
  for (let y = originY - radius; y <= originY + radius; y++) {
    for (let x = originX - radius; x <= originX + radius; x++) {
      const dx = x - originX
      const dy = y - originY
      if (dx * dx + dy * dy <= radius * radius) {
        const cell = grid.cell(x, y)
        if (cell !== null) {
          callback(x, y)
        }
      }
    }
  }
}

export function onCellEnter(event: EventDataFromType<'CELL_ENTER'>) {
  const cell = grid.cell(event.data.x, event.data.y)
  if (cell === null) return
  // remove liquid from the last cell
  if (lastCellX !== null && lastCellY !== null) {
    loopOverPoints(lastCellX, lastCellY, radius, (x, y) => {
      const cell = grid.cell(x, y)
      if (cell !== null) {
        cell.data.isLiquid = false
      }
    })
  }
  // set liquid to all cells in the radius
  loopOverPoints(event.data.x, event.data.y, radius, (x, y) => {
    const cell = grid.cell(x, y)
    if (cell !== null) {
      cell.data.isLiquid = true
    }
  })
  lastCellX = event.data.x
  lastCellY = event.data.y
}

let lastPositionX: number | null = null
let lastPositionY: number | null = null
export function tick(delta: number) {
  if (
    lastPositionX !== null &&
    lastPositionY !== null &&
    lastCellX !== null &&
    lastCellY !== null &&
    (lastCellX !== lastPositionX || lastCellY !== lastPositionY)
  ) {
    const distanceX = lastCellX - lastPositionX
    const distanceY = lastCellY - lastPositionY
    const speedX = distanceX / delta
    const speedY = distanceY / delta
    onMove(speedX, speedY, delta, distanceX, distanceY)
  }
  lastPositionX = lastCellX
  lastPositionY = lastCellY
}

function gradientLevelSet(
  targetGrid: Grid<Tracked<Data>>,
  x: number,
  y: number,
  distanceX: number,
  distanceY: number
): [number, number] | null {
  const currentCell = targetGrid.cell(x, y)
  if (currentCell === null) return null
  const cellX1 = targetGrid.cell(x + 1, y)
  const cellX2 = targetGrid.cell(x - 1, y)
  const cellY1 = targetGrid.cell(x, y + 1)
  const cellY2 = targetGrid.cell(x, y - 1)

  if (x === 10 && y === 10) {
    console.log('DEBUG: gradientLevelSet', {
      cellX1: cellX1?.data.levelSet,
      cellX2: cellX2?.data.levelSet,
      cellY1: cellY1?.data.levelSet,
      cellY2: cellY2?.data.levelSet,
    })
  }

  let gradientX: number | null = null
  if (cellX1 === null && cellX2 !== null) {
    gradientX = currentCell.data.levelSet - cellX2.data.levelSet
  } else if (cellX2 === null && cellX1 !== null) {
    gradientX = cellX1.data.levelSet - currentCell.data.levelSet
  } else if (cellX2 !== null && cellX1 !== null) {
    gradientX = (cellX1.data.levelSet - cellX2.data.levelSet) / 2
  } else {
    return null
  }

  let gradientY: number | null = null
  if (cellY1 === null && cellY2 !== null) {
    gradientY = currentCell.data.levelSet - cellY2.data.levelSet
  } else if (cellY2 === null && cellY1 !== null) {
    gradientY = cellY1.data.levelSet - currentCell.data.levelSet
  } else if (cellY2 !== null && cellY1 !== null) {
    gradientY = (cellY1.data.levelSet - cellY2.data.levelSet) / 2
  } else {
    return null
  }

  const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
  if (gradientX === 0 && gradientY === 0)
    return [(distanceX / distance) * -1, (distanceY / distance) * -1]

  return [gradientX, gradientY]
}

function onMove(
  speedX: number,
  speedY: number,
  delta: number,
  distanceX: number,
  distanceY: number
) {
  // update level set
  {
    const clonedGrid = new Grid(grid.getWidth(), grid.getHeight(), (x, y) => {
      const cell = grid.cell(x, y)
      if (cell === null) throw new Error('Cell is null')
      return cell.clone()
    })
    grid.loopOverCells((x, y) => {
      const gradient = gradientLevelSet(clonedGrid, x, y, distanceX, distanceY)
      if (gradient === null) return
      const [gradientX, gradientY] = gradient
      if (x === originX && y === originY) {
        console.log('DEBUG: gradient', gradient)
      }

      const levelSetDelta = (gradientX * distanceX + gradientY * distanceY) * -1
      const clonedCell = clonedGrid.cell(x, y)
      if (clonedCell === null) return
      const cell = grid.cell(x, y)
      if (cell === null) return
      cell.data.levelSet = clonedCell.data.levelSet + levelSetDelta
    })
  }

  // TODO: re initialize level set
}
