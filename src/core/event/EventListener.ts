export type EventData<T extends string, D> = {
  type: T
  data: D
}

export type CellEnterEventData = EventData<
  'CELL_ENTER',
  {
    x: number
    y: number
  }
>

export type CellLeaveEventData = EventData<
  'CELL_LEAVE',
  {
    x: number
    y: number
  }
>

export type AllEventData = CellEnterEventData | CellLeaveEventData

export type AllEventType = AllEventData['type']
export type EventDataFromType<T extends AllEventType> = Extract<
  AllEventData,
  { type: T }
>

export type EventListener<T extends AllEventType> = (
  event: EventDataFromType<T>
) => void
