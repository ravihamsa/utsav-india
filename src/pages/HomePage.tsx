import { lazy, Suspense, useMemo } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Compass,
  Heart,
  Search,
  Sparkles,
  Ticket,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import CalendarView from '../components/CalendarView'
import EventCard from '../components/EventCard'
import FiltersBar from '../components/FiltersBar'
import ListView from '../components/ListView'
import { EmptyState, ErrorBanner, LoadingGrid } from '../components/UI'
import { useFilters, filterEvents } from '../hooks/useFilters'
import { useCityNavigate } from '../hooks/useCityNavigate'
import { CATEGORY_MAP, CITY_MAP } from '../lib/constants'
import { cityPath } from '../lib/navigation'
import { isSupabaseConfigured } from '../lib/supabase'

const MapView = lazy(() => import('../components/MapView'))

export default function HomePage() {
  const { events, loading, error } = useData()
  const { user, profile } = useAuth()
  const { filters, view, setFilters, setView, clearFilters } = useFilters()
  const [params] = useSearchParams()
  const goToCity = useCityNavigate()

  const filtered = useMemo(
    () => filterEvents(events, filters),
    [events, filters]
  )

  const weekEvents = useMemo(() => {
    const now = Date.now()
    return events
      .filter((e) => {
        const t = new Date(e.starts_at).getTime()
        return t >= now && t <= now + 7 * 86400000
      })
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
      .slice(0, 8)
  }, [events])

  const recommended = useMemo(() => {
    if (!user || !profile?.interests.length) return []
    return events
      .filter(
        (e) =>
          profile.interests.includes(e.category) &&
          new Date(e.starts_at).getTime() >= Date.now()
      )
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
      .slice(0, 3)
  }, [events, profile, user])

  // Old links with ?city=... land on the dedicated city page instead of the hero.
  if (filters.city !== 'all' && CITY_MAP[filters.city]) {
    const next = new URLSearchParams(params)
    next.delete('city')
    return (
      <Navigate
        to={{ pathname: cityPath(filters.city), search: next.toString() }}
        replace
      />
    )
  }

  return (
    <div className="space-y-12">
      {/* Demo guide */}
      {!isSupabaseConfigured && !user && (
        <div className="flex flex-col gap-3 rounded-2xl border border-saffron-200 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-ink-900">
              Exploring the sample data
            </p>
            <p className="mt-1 text-xs leading-5 text-ink-500">
              72 events are preloaded. Sign in with one click to see favourites,
              reminders, personalised picks and the admin review flow.
            </p>
          </div>
          <Link to="/signin" className="btn-primary shrink-0 !py-2">
            See sample accounts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-saffron-600 via-saffron-700 to-spice-700 px-6 py-12 text-white shadow-soft sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[36px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 right-40 h-64 w-64 rounded-full border-[28px] border-white/10" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.15] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> India-wide event discovery
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Find your next{' '}
            <span className="text-amber-200">great moment.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/[0.85] sm:text-base">
            Concerts, food festivals, tech meets, cultural nights and more —
            happening in cities across India. Discover it all in a list, on a
            calendar or on the map.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
              <input
                type="search"
                value={filters.query}
                onChange={(e) => setFilters({ query: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    document
                      .getElementById('browse')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
                placeholder="Try 'garba', 'startup', 'Goa'…"
                className="w-full rounded-2xl border-0 bg-white px-12 py-4 text-sm font-semibold text-ink-900 shadow-lg outline-none placeholder:text-ink-500/70 focus:ring-4 focus:ring-amber-200/60"
              />
            </div>
            <a
              href="#browse"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink-900 px-6 py-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-ink-800"
            >
              Explore <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-xs font-semibold text-white/80">
            <span className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-amber-200" />
              {events.length}+ curated events
            </span>
            <span className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-amber-200" />
              {new Set(events.map((e) => e.city)).size} cities
            </span>
            <span className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-amber-200" />
              Save what you love
            </span>
          </div>
        </div>
      </section>

      {/* Recommended */}
      {user && recommended.length > 0 && (
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.18em] text-saffron-600">
                Picked for you
              </p>
              <h2 className="text-2xl font-extrabold text-ink-900">
                Recommended for you
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Based on the interests on your profile.
              </p>
            </div>
            <Link
              to="/profile"
              className="hidden shrink-0 text-xs font-extrabold text-saffron-700 hover:underline sm:block"
            >
              Edit interests
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {user && profile && profile.interests.length === 0 && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-saffron-200 bg-saffron-50 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-extrabold text-saffron-900">
              Make this space yours
            </p>
            <p className="mt-1 text-xs text-saffron-800">
              Choose your interests to get personal recommendations on the home
              page.
            </p>
          </div>
          <Link to="/profile" className="btn-primary shrink-0 !py-2">
            Choose interests <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Happening this week */}
      {weekEvents.length > 0 && (
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-spice-600">
                <TrendingUp className="h-3.5 w-3.5" /> Don't miss out
              </p>
              <h2 className="text-2xl font-extrabold text-ink-900">
                Happening this week
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                const today = new Date()
                const to = new Date(today.getTime() + 7 * 86400000)
                const fmt = (d: Date) =>
                  `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`
                setFilters({ fromDate: fmt(today), toDate: fmt(to) })
                document
                  .getElementById('browse')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="hidden shrink-0 text-xs font-extrabold text-saffron-700 hover:underline sm:block"
            >
              See all this week
            </button>
          </div>
          <div className="no-scrollbar -mx-1 flex gap-5 overflow-x-auto px-1 pb-2">
            {weekEvents.map((event) => (
              <div key={event.id} className="w-[280px] shrink-0 sm:w-[310px]">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Browse */}
      <section id="browse" className="scroll-mt-32">
        <div className="mb-5">
          <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.18em] text-turquoise-700">
            Browse everything
          </p>
          <h2 className="text-2xl font-extrabold text-ink-900">
            Explore events your way
          </h2>
        </div>

        {error && <ErrorBanner message={error} />}

        <FiltersBar
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          view={view}
          setView={setView}
          resultCount={filtered.length}
          onCityChange={goToCity}
        />

        {loading ? (
          <LoadingGrid />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No events match those filters"
            description="Try a different city, category or date range — or clear everything to see all events."
            action={
              <button type="button" onClick={clearFilters} className="btn-primary">
                Clear all filters
              </button>
            }
          />
        ) : view === 'calendar' ? (
          <CalendarView events={filtered} />
        ) : view === 'map' ? (
          <Suspense fallback={<LoadingGrid count={3} />}>
            <MapView events={filtered} cityFilter={filters.city} />
          </Suspense>
        ) : (
          <ListView events={filtered} />
        )}
      </section>

      {/* Category quick links */}
      <section className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
        <h2 className="text-lg font-extrabold text-ink-900">
          What are you in the mood for?
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Jump straight to a category you love.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {Object.values(CATEGORY_MAP).map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                setFilters({ category: cat.value })
                document
                  .getElementById('browse')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-ink-800/[0.08] p-3 transition hover:-translate-y-0.5 hover:shadow-soft"
              style={{ backgroundColor: cat.soft }}
            >
              <span className="text-2xl" aria-hidden>
                {cat.emoji}
              </span>
              <span className="text-[11px] font-extrabold" style={{ color: cat.color }}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
