import type { EventItem } from '../lib/types'
import EventCard from './EventCard'

export default function ListView({ events }: { events: EventItem[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
