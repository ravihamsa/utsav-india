import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DEFAULT_FILTERS } from '../lib/constants'
import type { EventFilters, EventItem, ViewMode } from '../lib/types'

const PARAM_KEYS: Record<keyof EventFilters, string> = {
  query: 'q',
  city: 'city',
  category: 'category',
  fromDate: 'from',
  toDate: 'to',
  price: 'price',
  sort: 'sort',
}

export function useFilters() {
  const [params, setParams] = useSearchParams()

  const filters: EventFilters = {
    query: params.get('q') ?? DEFAULT_FILTERS.query,
    city: params.get('city') ?? DEFAULT_FILTERS.city,
    category:
      (params.get('category') as EventFilters['category']) ??
      DEFAULT_FILTERS.category,
    fromDate: params.get('from') ?? DEFAULT_FILTERS.fromDate,
    toDate: params.get('to') ?? DEFAULT_FILTERS.toDate,
    price:
      (params.get('price') as EventFilters['price']) ?? DEFAULT_FILTERS.price,
    sort: (params.get('sort') as EventFilters['sort']) ?? DEFAULT_FILTERS.sort,
  }

  const view = (params.get('view') as ViewMode) ?? 'list'

  const setFilters = useCallback(
    (patch: Partial<EventFilters>) => {
      const next = new URLSearchParams(params)
      Object.entries(patch).forEach(([key, value]) => {
        const param = PARAM_KEYS[key as keyof EventFilters]
        const stringValue = String(value ?? '')
        const defaultValue = String(
          DEFAULT_FILTERS[key as keyof EventFilters]
        )
        if (!stringValue || stringValue === defaultValue) next.delete(param)
        else next.set(param, stringValue)
      })
      setParams(next, { replace: true })
    },
    [params, setParams]
  )

  const setView = useCallback(
    (nextView: ViewMode) => {
      const next = new URLSearchParams(params)
      if (nextView === 'list') next.delete('view')
      else next.set('view', nextView)
      setParams(next)
    },
    [params, setParams]
  )

  const clearFilters = useCallback(() => {
    const next = new URLSearchParams(params)
    Object.values(PARAM_KEYS).forEach((key) => next.delete(key))
    setParams(next, { replace: true })
  }, [params, setParams])

  return { filters, view, setFilters, setView, clearFilters }
}

export function filterEvents(
  events: EventItem[],
  filters: EventFilters
): EventItem[] {
  const q = filters.query.trim().toLowerCase()
  const from = filters.fromDate
    ? new Date(`${filters.fromDate}T00:00:00`).getTime()
    : null
  const to = filters.toDate
    ? new Date(`${filters.toDate}T23:59:59`).getTime()
    : null

  const result = events.filter((event) => {
    if (event.status !== 'approved') return false
    if (filters.city !== 'all' && event.city !== filters.city) return false
    if (filters.category !== 'all' && event.category !== filters.category)
      return false
    if (filters.price === 'free' && !event.is_free) return false
    if (filters.price === 'paid' && event.is_free) return false
    const starts = new Date(event.starts_at).getTime()
    if (from !== null && starts < from) return false
    if (to !== null && starts > to) return false
    if (q) {
      const haystack = [
        event.title,
        event.description,
        event.city,
        event.venue_name,
        event.organizer_name,
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  return result.sort((a, b) => {
    if (filters.sort === 'newest') {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }
    return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
  })
}
