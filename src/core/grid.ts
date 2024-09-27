class Grid<D> {
  private width: number
  private height: number
  private _cells: D[][]
  private defaultCellGenerator: (x: number, y: number) => D
  constructor(
    width: number,
    height: number,
    defaultCellGenerator: (x: number, y: number) => D
  ) {
    this.width = width
    this.height = height
    this.defaultCellGenerator = defaultCellGenerator
    this._cells = Array(height)
      .fill(null)
      .map((_, y) =>
        Array(width)
          .fill(null)
          .map((_, x) => this.defaultCellGenerator(x, y))
      )
  }

  cell(x: number, y: number): D | null {
    const row = this._cells[y]
    if (row === undefined) {
      return null
    }
    const cell = row[x]
    if (cell === undefined) {
      return null
    }
    return cell
  }

  getWidth(): number {
    return this.width
  }

  getHeight(): number {
    return this.height
  }
}

export default Grid
