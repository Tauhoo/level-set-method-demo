import * as PIXI from 'pixi.js'
import Grid from './grid'
import type { Tracked } from './tracked'

interface Stroke {
  color: number
  width: number
}

interface Label {
  text: string
  color: number
}

interface RenderData {
  color: number
  stroke: Stroke
  label: Label
}

export type CellRenderer<T> = (cell: T) => RenderData

export type CellRenderOptions<
  D extends Record<string, any>,
  T extends string
> = {
  cellRenderer: CellRenderer<{ [K in T]: D[K] }>
  cellRenderTrigger: Record<T, boolean>
}

class Renderer<K extends string, D extends Record<K, any>> {
  private grid: Grid<Tracked<D>>
  private width: number
  private height: number
  private updateStack: Map<number, Map<number, boolean>> = new Map()
  private container = new PIXI.Container()
  private gridGraphics: Grid<PIXI.Graphics>
  private labelCells: Grid<PIXI.BitmapText>

  constructor(
    grid: Grid<Tracked<D>>,
    width: number,
    height: number,
    private cellRenderOptions: CellRenderOptions<D, K>
  ) {
    this.grid = grid
    this.width = width
    this.height = height
    this.gridGraphics = new Grid<PIXI.Graphics>(
      grid.getWidth(),
      grid.getHeight(),
      (x, y) => {
        const graphics = new PIXI.Graphics()
        this.container.addChild(graphics)
        return graphics
      }
    )
    this.labelCells = new Grid<PIXI.BitmapText>(
      grid.getWidth(),
      grid.getHeight(),
      (x, y) => {
        const style = new PIXI.TextStyle({
          fontSize: 10,
          fill: 0xffffff,
        })
        const text = new PIXI.BitmapText()
        text.style = style
        this.container.addChild(text)
        return text
      }
    )
  }

  renderCell(x: number, y: number, data: D) {
    const cellWidth = this.width / this.grid.getWidth()
    const cellHeight = this.height / this.grid.getHeight()
    const renderData = this.cellRenderOptions.cellRenderer(data)
    const graphics = this.gridGraphics.cell(x, y)
    const labelCell = this.labelCells.cell(x, y)
    if (graphics === null || labelCell === null) return
    graphics
      .clear()
      .rect(
        x * cellWidth + renderData.stroke.width,
        y * cellHeight + renderData.stroke.width,
        cellWidth - renderData.stroke.width,
        cellHeight - renderData.stroke.width
      )
      .fill({
        color: renderData.color,
      })
      .stroke({
        color: renderData.stroke.color,
        width: renderData.stroke.width,
      })

    const label = renderData.label

    const labelHeight = labelCell.height
    const labelWidth = labelCell.width

    labelCell.text = label.text
    labelCell.style.fill = label.color
    labelCell.x = x * cellWidth + cellWidth / 2 - labelWidth / 2
    labelCell.y = y * cellHeight + cellHeight / 2 - labelHeight / 2
  }

  init(): void {
    for (let y = 0; y < this.grid.getHeight(); y++) {
      for (let x = 0; x < this.grid.getWidth(); x++) {
        const cell = this.grid.cell(x, y)
        if (cell === null) continue
        cell.listener = (value, key) => {
          if (Object.hasOwn(this.cellRenderOptions.cellRenderTrigger, key)) {
            const xList = this.updateStack.get(x)
            if (xList) {
              xList.set(y, true)
            } else {
              this.updateStack.set(x, new Map([[y, true]]))
            }
          }
        }
      }
    }
    for (let y = 0; y < this.grid.getHeight(); y++) {
      for (let x = 0; x < this.grid.getWidth(); x++) {
        const cell = this.grid.cell(x, y)
        if (cell === null) continue
        this.renderCell(x, y, cell.data)
      }
    }
  }

  update(): void {
    this.updateStack.forEach((yList, x) => {
      yList.forEach((_, y) => {
        const cell = this.grid.cell(x, y)
        if (cell === null) return
        this.renderCell(x, y, cell.data)
      })
      yList.clear()
    })
    this.updateStack.clear()
  }

  get pixiContainer(): PIXI.Container {
    return this.container
  }
}

export default Renderer
