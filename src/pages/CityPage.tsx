import { lazy, Suspense, useMemo } from 'react'
import { ArrowLeft, MapPinned } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import CalendarView from '../components/CalendarView'
import FiltersBar from '../components/FiltersBar'
import ListView from '../components/ListView'
import { EmptyState, ErrorBanner, LoadingGrid } from '../components/UI'
import { useData } from '../context/DataContext'
import { filterEvents, useFilters } from '../hooks/useFilters'
import { CITY_MAP, DEFAULT_FILTERS } from '../lib/constants'

const MapView = lazy(() => import('../components/MapView'))

export default function CityPage() {
  const { city: cityParam } = useParams()
  const city = cityParam ? decodeURIComponent(cityParam) : ''
  const meta = CITY_MAP[city]
  const { events, loading, error } = useData()
  const { filters, view, setFilters, setView, clearFilters } = useFilters()

  const cityCount = useMemo(
    () => filterEvents(events, { ...DEFAULT_FILTERS, city }).length,
    [events, city]
  )

  const filtered = useMemo(
    () => filterEvents(events, { ...filters, city }),
    [events, filters, city]
  )

  if (!meta) {
    return (
      <EmptyState
        icon={MapPinned}
        title="City not found"
        description={`We don't have a page for “${city}” yet. Head back to all events to explore the rest of India.`}
        action={
          <Link to="/" className="btn-primary">
            <ArrowLeft className="h-4 w-4" /> All India events
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Compact city header — no home hero, events start right here. */}
      <header className="flex flex-col gap-4 rounded-3xl border border-ink-800/[0.08] bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-saffron-100 text-saffron-600">
            <MapPinned className="h-6 w-6" />
          </div>
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-ink-500 hover:text-saffron-700"
            >
              <ArrowLeft className="h-3 w-3" /> All India
            </Link>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
              Events in {city}
            </h1>
            <p className="mt-1 text-xs text-ink-500 sm:text-sm">
              {meta.state} · {cityCount} upcoming event{cityCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <p className="text-xs font-semibold text-ink-500 sm:text-right">
          Browse below in list, calendar or map view.
        </p>
      </header>

      {error && <ErrorBanner message={error} />}

      <FiltersBar
        filters={{ ...filters, city: 'all' }}
        setFilters={setFilters}
        clearFilters={clearFilters}
        view={view}
        setView={setView}
        resultCount={filtered.length}
        showCityFilter={false}
      />

      {loading ? (
        <LoadingGrid />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={`No events in ${city} match those filters`}
          description="Try another category, price or date range — or reset everything to see all events in the city."
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
          <MapView events={filtered} cityFilter={city} />
        </Suspense>
      ) : (
        <ListView events={filtered} />
      )}
    </div>
  )
}
