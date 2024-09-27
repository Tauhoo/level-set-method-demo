import * as PIXI from 'pixi.js'
import type Grid from './grid'

interface LabelCell {
  styles: PIXI.TextStyle
  text: PIXI.BitmapText
}

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

type CellRenderer<D> = (cell: D) => RenderData

class Renderer<D extends Record<string, any>> {
  private grid: Grid<Tracked<D>>
  private width: number
  private height: number
  private labelCells: LabelCell[][]
  private container = new PIXI.Container()
  private graphics = new PIXI.Graphics()
  private cellRenderer: CellRenderer<D>

  constructor(
    grid: Grid<Tracked<D>>,
    width: number,
    height: number,
    cellRenderer: CellRenderer<D>
  ) {
    this.cellRenderer = cellRenderer
    this.grid = grid
    this.width = width
    this.height = height
    this.labelCells = Array(height)
      .fill(null)
      .map((_, y) =>
        Array(width)
          .fill(null)
          .map((_, x) => {
            const style = new PIXI.TextStyle({
              fontFamily: 'Arial',
              fontSize: 10,
              fill: 0xffffff,
            })
            const text = new PIXI.BitmapText()
            text.style = style
            return { styles: style, text: text }
          })
      )

    this.container.addChild(this.graphics)
    for (let y = 0; y < this.grid.getHeight(); y++) {
      for (let x = 0; x < this.grid.getWidth(); x++) {
        this.container.addChild(this.labelCells[y][x].text)
      }
    }
  }

  renderCell(x: number, y: number, data: D) {
    const cellWidth = this.width / this.grid.getWidth()
    const cellHeight = this.height / this.grid.getHeight()
    const renderData = this.cellRenderer(data)
    this.graphics
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
    this.labelCells[y][x].text.text = label.text
    const labelHeight = this.labelCells[y][x].text.height
    const labelWidth = this.labelCells[y][x].text.width
    this.labelCells[y][x].styles.fill = label.color
    this.labelCells[y][x].text.x =
      x * cellWidth + cellWidth / 2 - labelWidth / 2
    this.labelCells[y][x].text.y =
      y * cellHeight + cellHeight / 2 - labelHeight / 2
  }

  init(): void {
    for (let y = 0; y < this.grid.getHeight(); y++) {
      for (let x = 0; x < this.grid.getWidth(); x++) {
        const cell = this.grid.cell(x, y)
        if (cell === null) continue
        cell.listener = (value: D) => {
          this.renderCell(x, y, value)
        }
        this.renderCell(x, y, cell.data)
      }
    }
  }

  get pixiContainer(): PIXI.Container {
    return this.container
  }
}

export default Renderer

export class Tracked<D extends Record<string, any>> {
  private _trackedData: D
  private _listener: ((newValue: D) => void) | null = null

  constructor(trackedData: D) {
    this._trackedData = new Proxy(trackedData, {
      set: (target: any, p, newValue) => {
        target[p] = newValue
        if (this._listener !== null) {
          this._listener(trackedData)
        }
        return true
      },
    })
  }

  set listener(newListener: ((newValue: D) => void) | null) {
    this._listener = newListener
  }

  get data(): D {
    return this._trackedData
  }
}
