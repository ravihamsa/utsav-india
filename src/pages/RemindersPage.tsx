import { Link } from 'react-router-dom'
import { Bell, CalendarDays, Clock, MapPin, Trash2 } from 'lucide-react'
import { EmptyState, ErrorBanner, PageHeading } from '../components/UI'
import { useData } from '../context/DataContext'
import { REMINDER_OPTIONS } from '../lib/constants'
import { formatDate, formatTime, relativeTime } from '../lib/dateUtils'

export default function RemindersPage() {
  const { reminders, events, mySubmissions, deleteReminder, loading, error } =
    useData()

  const rows = reminders
    .map((reminder) => {
      const event = [...events, ...mySubmissions].find(
        (e) => e.id === reminder.event_id
      )
      return event ? { reminder, event } : null
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => a.event.starts_at.localeCompare(b.event.starts_at))

  return (
    <div>
      <PageHeading
        eyebrow="Never miss out"
        title="My reminders"
        description="A nudge before the events you care about begin. Reminders are saved to your account."
      />
      {error && <ErrorBanner message={error} />}
      {loading ? null : rows.length > 0 ? (
        <div className="space-y-4">
          {rows.map(({ reminder, event }) => (
            <div
              key={reminder.id}
              className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-saffron-100 text-saffron-700">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <Link
                    to={`/events/${event.id}`}
                    className="text-sm font-extrabold text-ink-900 hover:text-saffron-700"
                  >
                    {event.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-ink-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(event.starts_at)} · {formatTime(event.starts_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.city}
                    </span>
                  </div>
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-turquoise-50 px-2.5 py-1 text-[11px] font-extrabold text-turquoise-800">
                    <Clock className="h-3 w-3" />
                    {
                      REMINDER_OPTIONS.find(
                        (o) => o.value === reminder.minutes_before
                      )?.label ?? `${reminder.minutes_before} min before`
                    }
                    <span className="font-semibold text-turquoise-700">
                      · {relativeTime(event.starts_at)}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void deleteReminder(reminder.id)}
                className="btn-secondary shrink-0 !py-2 text-spice-700 hover:border-spice-200 hover:bg-spice-50"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No reminders set"
          description="Open any event and tap the bell to choose when you'd like to be reminded."
          action={
            <Link to="/" className="btn-primary">
              Find an event
            </Link>
          }
        />
      )}
    </div>
  )
}
