<script lang="ts">
  import { onMount } from 'svelte'
  import { MainEventDistributor } from './core/event'
  import * as PIXI from 'pixi.js'
  import Renderer from './core/renderer'
  import { grid, onCellEnter, tick } from './logic'

  let containerElement: HTMLDivElement

  onMount(async () => {
    const app = new PIXI.Application()
    const width = 500
    const height = 500
    await app.init({
      width,
      height,
      antialias: false,
    })
    containerElement.appendChild(app.canvas)

    const greenColor = 0x00ff00
    const whiteColor = 0xffffff
    const blackColor = 0x000000

    const renderer = new Renderer(grid, app.screen.width, app.screen.height, {
      cellRenderer: cell => {
        const data = {
          color: cell.levelSet > 0 ? whiteColor : greenColor,
          stroke: { color: cell.isLiquid ? blackColor : whiteColor, width: 1 },
          label: { text: `${cell.levelSet.toFixed(1)}`, color: blackColor },
        }
        return data
      },
      cellRenderTrigger: { levelSet: true, isLiquid: true },
    })
    app.stage.addChild(renderer.pixiContainer)

    const mainEventDistributor = new MainEventDistributor(grid, app.canvas)
    mainEventDistributor.addListener('CELL_ENTER', onCellEnter)

    renderer.init()
    let lastTime = Date.now()
    app.ticker.add(() => {
      const now = Date.now()
      const delta = now - lastTime
      lastTime = now
      tick(delta)
      renderer.update()
    })
  })
</script>

<div id="container" bind:this={containerElement}></div>

<style>
  #container {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
