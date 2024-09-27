import type {
  AllEventType,
  EventDataFromType,
  EventListener,
} from './EventListener'

class EventDistributor {
  private listeners: {
    [key in AllEventType]?: EventListener<key>[]
  } = {}

  public add<T extends AllEventType>(
    eventType: T,
    listener: EventListener<T>
  ): void {
    this.listeners[eventType] = this.listeners[eventType] || []
    this.listeners[eventType].push(listener)
  }

  public emit<T extends AllEventType>(event: EventDataFromType<T>): void {
    const listeners = this.listeners[event.type]
    if (listeners) {
      listeners.forEach(listener => {
        listener(event)
      })
    }
  }
}

export default EventDistributor
