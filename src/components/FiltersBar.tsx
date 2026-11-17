import {
  Calendar,
  ChevronDown,
  List,
  Map,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { CATEGORIES, CITIES } from '../lib/constants'
import { addDays, toDateInputValue } from '../lib/dateUtils'
import type { EventFilters, ViewMode } from '../lib/types'

interface Props {
  filters: EventFilters
  setFilters: (patch: Partial<EventFilters>) => void
  clearFilters: () => void
  view: ViewMode
  setView: (view: ViewMode) => void
  resultCount: number
  /** When provided, city changes are navigated (e.g. to a city page). */
  onCityChange?: (city: string) => void
  /** Hide the city picker when the city is already fixed by the route. */
  showCityFilter?: boolean
}

const views: { value: ViewMode; label: string; icon: typeof List }[] = [
  { value: 'list', label: 'List', icon: List },
  { value: 'calendar', label: 'Calendar', icon: Calendar },
  { value: 'map', label: 'Map', icon: Map },
]

export default function FiltersBar({
  filters,
  setFilters,
  clearFilters,
  view,
  setView,
  resultCount,
  onCityChange,
  showCityFilter = true,
}: Props) {
  const hasFilters =
    filters.query !== '' ||
    filters.city !== 'all' ||
    filters.category !== 'all' ||
    filters.fromDate !== '' ||
    filters.toDate !== '' ||
    filters.price !== 'all'

  const today = new Date()
  const presets = [
    {
      label: 'Today',
      from: toDateInputValue(today),
      to: toDateInputValue(today),
    },
    {
      label: 'Next 7 days',
      from: toDateInputValue(today),
      to: toDateInputValue(addDays(today, 7)),
    },
    {
      label: 'Next 30 days',
      from: toDateInputValue(today),
      to: toDateInputValue(addDays(today, 30)),
    },
  ]

  return (
    <div className="card mb-6 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-ink-800/[0.08] p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => setFilters({ query: e.target.value })}
            placeholder="Search events, venues, cities…"
            className="field !pl-10"
            aria-label="Search events"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {showCityFilter && (
            <div className="relative">
              <select
                value={filters.city}
                onChange={(e) =>
                  onCityChange
                    ? onCityChange(e.target.value)
                    : setFilters({ city: e.target.value })
                }
                className="field !w-auto min-w-[140px] appearance-none !pr-9"
                aria-label="Filter by city"
              >
                <option value="all">All cities</option>
                {CITIES.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            </div>
          )}
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) =>
                setFilters({ sort: e.target.value as EventFilters['sort'] })
              }
              className="field !w-auto min-w-[150px] appearance-none !pr-9"
              aria-label="Sort events"
            >
              <option value="soonest">Soonest first</option>
              <option value="newest">Newest posted</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          </div>
          <div className="inline-flex rounded-xl border border-ink-800/[0.12] bg-white p-1">
            {(['all', 'free', 'paid'] as const).map((price) => (
              <button
                key={price}
                type="button"
                onClick={() => setFilters({ price })}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-extrabold capitalize transition ${
                  filters.price === price
                    ? 'bg-saffron-600 text-white'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                {price}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-ink-800/[0.08] px-4 py-3">
        <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-ink-500" />
        <button
          type="button"
          onClick={() => setFilters({ category: 'all' })}
          className={`chip shrink-0 ${
            filters.category === 'all'
              ? 'border-saffron-600 bg-saffron-600 text-white'
              : 'border-ink-800/10 bg-white text-ink-700 hover:border-saffron-300'
          }`}
        >
          All categories
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category.value}
            type="button"
            onClick={() => setFilters({ category: category.value })}
            className={`chip shrink-0 ${
              filters.category === category.value ? 'text-white' : 'bg-white'
            }`}
            style={
              filters.category === category.value
                ? { backgroundColor: category.color, borderColor: category.color }
                : { borderColor: category.color + '40', color: category.color }
            }
          >
            <span aria-hidden>{category.emoji}</span>
            {category.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-ink-500">
            Date range
          </span>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => setFilters({ fromDate: e.target.value })}
            className="field !w-auto !py-1.5 !text-xs"
            aria-label="From date"
          />
          <span className="text-xs text-ink-500">to</span>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters({ toDate: e.target.value })}
            className="field !w-auto !py-1.5 !text-xs"
            aria-label="To date"
          />
          <div className="ml-1 hidden gap-1 sm:flex">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  setFilters({ fromDate: preset.from, toDate: preset.to })
                }
                className="rounded-full bg-cream-100 px-2.5 py-1 text-[10px] font-bold text-ink-700 hover:bg-saffron-100"
              >
                {preset.label}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-spice-700 hover:bg-spice-50"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="whitespace-nowrap text-xs font-semibold text-ink-500">
            {resultCount} event{resultCount === 1 ? '' : 's'}
          </span>
          <div className="inline-flex rounded-xl bg-cream-100 p-1">
            {views.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                title={`${label} view`}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold transition ${
                  view === value
                    ? 'bg-white text-saffron-700 shadow-sm'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
