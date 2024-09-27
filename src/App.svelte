<script lang="ts">
  import Grid from './core/grid'

  import { onMount } from 'svelte'
  import { MainEventDistributor } from './core/event'
  import * as PIXI from 'pixi.js'
  import Renderer, { Tracked } from './core/renderer'

  let containerElement: HTMLDivElement

  onMount(async () => {
    const app = new PIXI.Application()
    const width = 500
    const height = 500
    await app.init({ width, height, antialias: false })
    containerElement.appendChild(app.canvas)
    const grid = new Grid(21, 21, (x, y) => {
      const originX = 10
      const originY = 10
      const distance = Math.sqrt((x - originX) ** 2 + (y - originY) ** 2)
      return new Tracked({ value: distance })
    })

    const cellRenderer = (cell: { value: number }) => {
      const data = {
        color: cell.value > 0 ? 0xffffff : 0x00ff00,
        stroke: { color: 0x000000, width: 1 },
        label: { text: `${cell.value.toFixed(1)}`, color: 0x000000 },
      }
      return data
    }

    const renderer = new Renderer(
      grid,
      app.screen.width,
      app.screen.height,
      cellRenderer
    )
    app.stage.addChild(renderer.pixiContainer)

    const mainEventDistributor = new MainEventDistributor(grid, app.canvas)
    mainEventDistributor.addListener('CELL_ENTER', event => {
      const cell = grid.cell(event.data.x, event.data.y)
      if (cell === null) return
      cell.data.value = cell.data.value * -1
    })

    mainEventDistributor.addListener('CELL_LEAVE', event => {
      const cell = grid.cell(event.data.x, event.data.y)
      if (cell === null) return
      cell.data.value = cell.data.value * -1
    })

    renderer.init()
  })
</script>

<main>
  <div id="container" bind:this={containerElement}></div>
</main>

<style>
  #container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
