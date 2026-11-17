import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { CATEGORY_MAP } from '../lib/constants'
import {
  formatDate,
  getCalendarMonth,
  isSameDay,
  monthLabel,
  toDateInputValue,
} from '../lib/dateUtils'
import type { EventItem } from '../lib/types'
import EventCard from './EventCard'
import { EmptyState } from './UI'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarView({ events }: { events: EventItem[] }) {
  const today = new Date()
  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  })
  const [selected, setSelected] = useState<Date>(today)

  const byDay = useMemo(() => {
    const map = new Map<string, EventItem[]>()
    events.forEach((event) => {
      const key = toDateInputValue(event.starts_at)
      const list = map.get(key) ?? []
      list.push(event)
      map.set(key, list)
    })
    return map
  }, [events])

  const cells = useMemo(
    () => getCalendarMonth(cursor.year, cursor.month),
    [cursor]
  )

  const selectedEvents = byDay.get(toDateInputValue(selected)) ?? []

  function shiftMonth(offset: number) {
    const d = new Date(cursor.year, cursor.month + offset, 1)
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
  }

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800/[0.08] p-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="rounded-xl border border-ink-800/10 p-2 text-ink-700 hover:bg-cream-100"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="min-w-[150px] text-center text-lg font-extrabold text-ink-900">
              {monthLabel(cursor.year, cursor.month)}
            </h2>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="rounded-xl border border-ink-800/10 p-2 text-ink-700 hover:bg-cream-100"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setCursor({ year: today.getFullYear(), month: today.getMonth() })
              setSelected(today)
            }}
            className="rounded-full bg-cream-100 px-3 py-1.5 text-[11px] font-extrabold text-ink-700 hover:bg-saffron-100"
          >
            Jump to today
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-ink-800/[0.08] bg-cream-100">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[10px] font-extrabold uppercase tracking-wide text-ink-500"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            const key = toDateInputValue(cell.date.toISOString())
            const dayEvents = byDay.get(key) ?? []
            const selectedDay = isSameDay(cell.date, selected)
            const isToday = isSameDay(cell.date, today)
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(cell.date)}
                className={`min-h-[92px] border-b border-r border-ink-800/[0.08] p-1.5 text-left align-top transition sm:min-h-[110px] sm:p-2 ${
                  selectedDay
                    ? 'bg-saffron-50 ring-2 ring-inset ring-saffron-400'
                    : 'hover:bg-cream-100'
                } ${!cell.inMonth ? 'bg-cream-50/60 opacity-50' : ''}`}
              >
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold ${
                    isToday
                      ? 'bg-saffron-600 text-white'
                      : 'text-ink-700'
                  }`}
                >
                  {cell.date.getDate()}
                </span>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map((event) => {
                    const meta = CATEGORY_MAP[event.category] ?? CATEGORY_MAP.other
                    return (
                      <Link
                        key={event.id}
                        to={`/events/${event.id}`}
                        onClick={(e) => e.stopPropagation()}
                        title={event.title}
                        className="block truncate rounded px-1.5 py-0.5 text-[9px] font-bold sm:text-[10px]"
                        style={{ backgroundColor: meta.soft, color: meta.color }}
                      >
                        {event.title}
                      </Link>
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <span className="block px-1.5 text-[9px] font-bold text-ink-500">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-extrabold text-ink-900">
            Events on {formatDate(selected.toISOString())}
            <span className="ml-2 text-sm font-semibold text-ink-500">
              ({selectedEvents.length})
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {(['music', 'food', 'tech', 'culture', 'sports', 'arts'] as const).map(
              (key) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 text-[10px] font-bold capitalize"
                  style={{ color: CATEGORY_MAP[key].color }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_MAP[key].color }}
                  />
                  {key}
                </span>
              )
            )}
          </div>
        </div>
        {selectedEvents.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {selectedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nothing on this day"
            description="Try another date, or clear a filter to see more events."
          />
        )}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-ink-500">
        <MapPin className="h-3.5 w-3.5 text-saffron-500" />
        City and category filters apply to the calendar too. Click any day to
        see everything happening on it.
      </p>
    </div>
  )
}
