import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { CATEGORY_MAP } from '../lib/constants'
import { formatDate, formatTime } from '../lib/dateUtils'
import type { EventItem } from '../lib/types'
import FavoriteButton from './FavoriteButton'
import { CategoryBadge, PriceBadge } from './UI'

export default function EventCard({ event }: { event: EventItem }) {
  const [imageFailed, setImageFailed] = useState(false)
  const meta = CATEGORY_MAP[event.category] ?? CATEGORY_MAP.other

  return (
    <article className="card group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link
        to={`/events/${event.id}`}
        className="relative block h-44 shrink-0 overflow-hidden bg-cream-200"
      >
        {event.image_url && !imageFailed ? (
          <img
            src={event.image_url}
            alt={event.title}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${meta.soft}, ${meta.color}44)`,
            }}
          >
            <span className="text-5xl" aria-hidden>
              {meta.emoji}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-extrabold text-ink-900 shadow-sm backdrop-blur">
          <CalendarDays className="h-3.5 w-3.5 text-saffron-600" />
          {formatDate(event.starts_at)}
        </div>
        <div className="absolute bottom-3 right-3">
          <PriceBadge isFree={event.is_free} price={event.price} />
        </div>
      </Link>

      <div className="relative flex-1 p-4">
        <div className="absolute right-3 top-3">
          <FavoriteButton eventId={event.id} />
        </div>
        <div className="mb-2.5 pr-10">
          <CategoryBadge category={event.category} />
        </div>
        <Link to={`/events/${event.id}`}>
          <h3 className="line-clamp-2 text-[15px] font-extrabold leading-6 text-ink-900 transition group-hover:text-saffron-700">
            {event.title}
          </h3>
        </Link>
        <div className="mt-3 space-y-1.5 text-xs font-medium text-ink-500">
          <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-saffron-500" />
            {formatTime(event.starts_at)}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-saffron-500" />
            <span className="truncate">
              {event.venue_name} · {event.city}
            </span>
          </p>
        </div>
      </div>
    </article>
  )
}
