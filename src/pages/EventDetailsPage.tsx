import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Share2,
  Ticket,
  UserRound,
} from 'lucide-react'
import EventCard from '../components/EventCard'
import FavoriteButton from '../components/FavoriteButton'
import ReminderButton from '../components/ReminderButton'
import {
  CategoryBadge,
  EmptyState,
  ErrorBanner,
  LoadingGrid,
  PriceBadge,
} from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { useSeo } from '../hooks/useSeo'
import { CATEGORY_MAP, CITY_MAP } from '../lib/constants'
import { formatLongDate, formatTime } from '../lib/dateUtils'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  SITE_NAME,
  absoluteImageUrl,
  absoluteUrl,
  seoSnippet,
} from '../lib/seo'
import type { EventItem } from '../lib/types'

function eventJsonLd(event: EventItem): Record<string, unknown> {
  const city = CITY_MAP[event.city]
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: seoSnippet(event.description),
    startDate: event.starts_at,
    ...(event.ends_at ? { endDate: event.ends_at } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventType: CATEGORY_MAP[event.category]?.label,
    image: absoluteImageUrl(event.image_url),
    url: absoluteUrl(`/events/${event.id}`),
    location: {
      '@type': 'Place',
      name: event.venue_name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.venue_address,
        addressLocality: event.city,
        addressRegion: city?.state,
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: event.latitude,
        longitude: event.longitude,
      },
    },
    organizer: { '@type': 'Organization', name: event.organizer_name },
    offers: {
      '@type': 'Offer',
      url: event.registration_url,
      price: event.is_free ? 0 : event.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
  }
}

export default function EventDetailsPage() {
  const { id } = useParams()
  const { getEvent, events, loading, error } = useData()
  const { user } = useAuth()
  const { show } = useToast()
  const [imageFailed, setImageFailed] = useState(false)
  const event = id ? getEvent(id) : undefined

  useSeo(
    event
      ? {
          title: `${event.title} | ${SITE_NAME}`,
          description:
            event.description || `${event.title} at ${event.venue_name}, ${event.city}.`,
          path: `/events/${event.id}`,
          image: event.image_url ?? DEFAULT_IMAGE,
          type: 'article',
          noindex: event.status !== 'approved',
          jsonLd: event.status === 'approved' ? eventJsonLd(event) : null,
        }
      : {
          title: 'Event not found',
          description: DEFAULT_DESCRIPTION,
          noindex: true,
        }
  )

  if (loading) return <LoadingGrid count={3} />

  if (!event) {
    return (
      <EmptyState
        title="Event not found"
        description="This event may have been removed, or the link might be incorrect."
        action={
          <Link to="/" className="btn-primary">
            Browse events
          </Link>
        }
      />
    )
  }

  const meta = CATEGORY_MAP[event.category] ?? CATEGORY_MAP.other
  const related = events
    .filter(
      (e) =>
        e.id !== event.id &&
        (e.city === event.city || e.category === event.category)
    )
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, 3)

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      show('Link copied to clipboard!')
    } catch {
      show('Could not copy the link.', 'error')
    }
  }

  return (
    <div className="space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-ink-500 hover:text-saffron-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>

      {error && <ErrorBanner message={error} />}

      {event.status !== 'approved' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          This is a {event.status} submission. It is visible to you{' '}
          {user ? '(your account)' : ''} and will appear publicly once approved.
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="relative h-64 overflow-hidden sm:h-80 lg:h-96">
          {event.image_url && !imageFailed ? (
            <img
              src={event.image_url}
              alt={event.title}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${meta.soft}, ${meta.color}55)`,
              }}
            >
              <span className="text-7xl" aria-hidden>
                {meta.emoji}
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink-900/70 to-transparent" />
          <div className="absolute bottom-5 left-5 flex flex-wrap items-center gap-2 sm:left-8">
            <CategoryBadge category={event.category} size="md" />
            <div className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-extrabold text-ink-900">
              {formatLongDate(event.starts_at)}
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_320px]">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-4xl">
              {event.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-ink-500">
                Organised by
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-ink-800">
                <UserRound className="h-4 w-4 text-saffron-600" />
                {event.organizer_name}
              </span>
            </div>
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-extrabold text-ink-900">
                About this event
              </h2>
              <p className="whitespace-pre-line text-sm leading-7 text-ink-700">
                {event.description}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-cream-100 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-ink-500">
                  <CalendarDays className="h-4 w-4 text-saffron-600" /> When
                </p>
                <p className="text-sm font-extrabold text-ink-900">
                  {formatLongDate(event.starts_at)}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink-600">
                  <Clock className="h-3.5 w-3.5" /> {formatTime(event.starts_at)}
                  onwards
                </p>
              </div>
              <div className="rounded-2xl bg-cream-100 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-ink-500">
                  <MapPin className="h-4 w-4 text-saffron-600" /> Where
                </p>
                <p className="text-sm font-extrabold text-ink-900">
                  {event.venue_name}
                </p>
                <p className="mt-1 text-sm font-semibold text-ink-600">
                  {event.venue_address}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-saffron-700 hover:underline"
                >
                  <Navigation className="h-3.5 w-3.5" /> Get directions
                </a>
              </div>
            </div>
          </div>

          <aside className="h-fit space-y-4 lg:sticky lg:top-28">
            <div className="card border-saffron-200 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wide text-ink-500">
                  Entry
                </span>
                <PriceBadge isFree={event.is_free} price={event.price} />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-ink-900">
                {event.is_free ? 'Free entry' : `₹${event.price.toLocaleString('en-IN')}`}
              </p>
              <a
                href={event.registration_url}
                target="_blank"
                rel="noreferrer"
                className="btn-primary mt-5 w-full"
              >
                <Ticket className="h-4 w-4" /> Register now
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <p className="mt-2 text-center text-[11px] text-ink-500">
                Registration opens on the organiser's website
              </p>
              <div className="mt-4 flex gap-2 border-t border-ink-800/[0.08] pt-4">
                <div className="flex-1">
                  <FavoriteButton eventId={event.id} showLabel />
                </div>
                <ReminderButton eventId={event.id} showLabel />
              </div>
            </div>
            <button
              type="button"
              onClick={() => void share()}
              className="btn-secondary w-full"
            >
              <Share2 className="h-4 w-4" /> Share this event
            </button>
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="mb-5 text-xl font-extrabold text-ink-900">
            You might also like
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <EventCard key={item.id} event={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
