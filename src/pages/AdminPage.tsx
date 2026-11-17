import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  Clock,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react'
import { EmptyState, ErrorBanner, PageHeading, Spinner } from '../components/UI'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../lib/dateUtils'
import type { EventStatus } from '../lib/types'

const tabs: { value: EventStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]

const statusStyles: Record<EventStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-turquoise-100 text-turquoise-800',
  rejected: 'bg-spice-100 text-spice-800',
}

export default function AdminPage() {
  const { allEvents, changeEventStatus, loading, error } = useData()
  const { show } = useToast()
  const [tab, setTab] = useState<EventStatus | 'all'>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)

  const counts = useMemo(
    () => ({
      pending: allEvents.filter((e) => e.status === 'pending').length,
      approved: allEvents.filter((e) => e.status === 'approved').length,
      rejected: allEvents.filter((e) => e.status === 'rejected').length,
    }),
    [allEvents]
  )

  const shown = useMemo(
    () =>
      (tab === 'all'
        ? allEvents
        : allEvents.filter((e) => e.status === tab)
      ).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [allEvents, tab]
  )

  async function decide(id: string, status: EventStatus) {
    setBusyId(id)
    try {
      await changeEventStatus(id, status)
      show(status === 'approved' ? 'Event approved and published.' : 'Event updated.')
    } catch (err) {
      show(
        err instanceof Error ? err.message : 'Could not update the event.',
        'error'
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeading
        eyebrow="Protected area"
        title="Admin review"
        description="Approve or reject organiser submissions. Approved events appear everywhere across Utsav."
      >
        <span className="inline-flex items-center gap-2 rounded-xl bg-saffron-100 px-3 py-2 text-xs font-extrabold text-saffron-800">
          <ShieldCheck className="h-4 w-4" /> Admin access
        </span>
      </PageHeading>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Pending review', value: counts.pending, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Published', value: counts.approved, color: 'text-turquoise-800', bg: 'bg-turquoise-50' },
          { label: 'Rejected', value: counts.rejected, color: 'text-spice-700', bg: 'bg-spice-50' },
        ].map((stat) => (
          <div key={stat.label} className={`card p-5 ${stat.bg}`}>
            <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-xs font-bold text-ink-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="card overflow-hidden">
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-ink-800/[0.08] p-3">
          {tabs.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                tab === item.value
                  ? 'bg-saffron-600 text-white'
                  : 'text-ink-600 hover:bg-cream-100'
              }`}
            >
              {item.label}
              {item.value !== 'all' && (
                <span className="ml-1.5 opacity-70">
                  {counts[item.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-500">
            <Spinner /> Loading submissions…
          </div>
        ) : shown.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={tab === 'pending' ? Check : Clock}
              title={
                tab === 'pending'
                  ? 'All caught up!'
                  : `No ${tab} events`
              }
              description={
                tab === 'pending'
                  ? 'There are no submissions waiting for review right now.'
                  : 'Events with this status will show up here.'
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-ink-800/[0.08]">
            {shown.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/events/${event.id}`}
                      className="text-sm font-extrabold text-ink-900 hover:text-saffron-700"
                    >
                      {event.title}
                    </Link>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold capitalize ${statusStyles[event.status]}`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-500">
                    {event.city} · {formatDate(event.starts_at)} · by{' '}
                    {event.organizer_name}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-ink-500">
                    {event.description}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {event.status === 'pending' && (
                    <button
                      type="button"
                      disabled={busyId === event.id}
                      onClick={() => void decide(event.id, 'approved')}
                      className="btn-primary !px-3 !py-2 !text-xs"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                  {event.status !== 'rejected' && (
                    <button
                      type="button"
                      disabled={busyId === event.id}
                      onClick={() => void decide(event.id, 'rejected')}
                      className="btn-secondary !px-3 !py-2 !text-xs text-spice-700"
                    >
                      {event.status === 'approved' ? (
                        <XCircle className="h-3.5 w-3.5" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      {event.status === 'approved' ? 'Unpublish' : 'Reject'}
                    </button>
                  )}
                  {event.status === 'rejected' && (
                    <button
                      type="button"
                      disabled={busyId === event.id}
                      onClick={() => void decide(event.id, 'approved')}
                      className="btn-secondary !px-3 !py-2 !text-xs"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
