type TrackedListener<D> = (newValue: D, key: keyof D) => void

export class Tracked<D extends Record<string, any>> {
  private _trackedData: D
  private _listener: TrackedListener<D> | null = null

  constructor(trackedData: D) {
    this._trackedData = new Proxy(trackedData, {
      set: (target: any, p, newValue) => {
        if (target[p] === newValue) return true
        target[p] = newValue
        if (this._listener !== null) {
          this._listener(trackedData, p as keyof D)
        }
        return true
      },
    })
  }

  set listener(newListener: TrackedListener<D> | null) {
    this._listener = newListener
  }

  get data(): D {
    return this._trackedData
  }
}
