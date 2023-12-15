type EventType = 'joined' | 'otherjoin' | 'full' | 'leaved' | 'bye' | 'disconnect' | 'message' | 'created'
const event_map = new Map()
export function addListen(type: EventType, callback: () => void) {
  let events = event_map.get(type)
  if (!events) {
    event_map.set(type, (events = new Set()))
  }
  events.add(callback)
}

export function removeListen(type: EventType, callback: () => void) {
  const events = event_map.get(type)
  if (!events) {
    return
  }
  events.delete(callback)
}

export function clear() {
  event_map.clear()
}

export function runEvents(type: EventType, ...data: any[]) {
  const events = event_map.get(type)
  if (!events) {
    return
  }
  events.forEach((event) => {
    event(...data)
  })
}
