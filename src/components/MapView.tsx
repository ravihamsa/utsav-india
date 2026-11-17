import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import {
  AlertTriangle,
  CalendarDays,
  ExternalLink,
  Layers,
  Map as MapIcon,
  MapPin,
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { CATEGORY_MAP, CITY_MAP, INDIA_CENTER } from '../lib/constants'
import { formatDate } from '../lib/dateUtils'
import type { EventItem } from '../lib/types'
import { EmptyState } from './UI'

interface Props {
  events: EventItem[]
  cityFilter: string
}

class MapBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 })
  }, [center[0], center[1], zoom, map])
  return null
}

function pinIcon(color: string, emoji: string) {
  return L.divIcon({
    className: 'event-pin-wrapper',
    html: `<div class="event-pin" style="background:${color}"><span>${emoji}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -28],
  })
}

function PreviewCard({ event }: { event: EventItem }) {
  const meta = CATEGORY_MAP[event.category] ?? CATEGORY_MAP.other
  const [imageFailed, setImageFailed] = useState(false)
  return (
    <div className="w-[250px] overflow-hidden rounded-2xl bg-white">
      <div
        className="flex h-24 items-center justify-center text-3xl"
        style={{ backgroundColor: meta.soft }}
      >
        {event.image_url && !imageFailed ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span aria-hidden>{meta.emoji}</span>
        )}
      </div>
      <div className="p-3">
        <p
          className="mb-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold"
          style={{ backgroundColor: meta.soft, color: meta.color }}
        >
          {meta.emoji} {meta.label}
        </p>
        <h4 className="line-clamp-2 text-xs font-extrabold leading-5 text-ink-900">
          {event.title}
        </h4>
        <p className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-ink-500">
          <CalendarDays className="h-3 w-3 text-saffron-600" />
          {formatDate(event.starts_at)} · {event.city}
        </p>
        <Link
          to={`/events/${event.id}`}
          className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-extrabold text-saffron-700 hover:underline"
        >
          View details <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}

export default function MapView({ events, cityFilter }: Props) {
  const [mode, setMode] = useState<'map' | 'list'>('map')
  const tileErrors = useRef(0)

  const selectedCity = cityFilter !== 'all' ? CITY_MAP[cityFilter] : undefined
  const center: [number, number] = selectedCity
    ? [selectedCity.lat, selectedCity.lng]
    : INDIA_CENTER
  const zoom = selectedCity ? 11 : 4

  const grouped = useMemo(() => {
    const map = new Map<string, EventItem[]>()
    events.forEach((event) => {
      const list = map.get(event.city) ?? []
      list.push(event)
      map.set(event.city, list)
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [events])

  function handleTileError() {
    tileErrors.current += 1
    if (tileErrors.current >= 8 && mode === 'map') setMode('list')
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-cream-100 p-1">
            <button
              type="button"
              onClick={() => setMode('map')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-extrabold transition ${
                mode === 'map'
                  ? 'bg-white text-saffron-700 shadow-sm'
                  : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" /> Interactive map
            </button>
            <button
              type="button"
              onClick={() => setMode('list')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-extrabold transition ${
                mode === 'list'
                  ? 'bg-white text-saffron-700 shadow-sm'
                  : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> City list
            </button>
          </div>
          <span className="hidden text-[11px] font-medium text-ink-500 sm:block">
            {events.length} pinned event{events.length === 1 ? '' : 's'}
          </span>
        </div>
        <p className="flex items-center gap-1.5 text-[11px] text-ink-500">
          <MapPin className="h-3.5 w-3.5 text-saffron-500" />
          Powered by OpenStreetMap · auto-fallback if tiles fail
        </p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No events to pin"
          description="Adjust your filters to see events on the map."
          icon={MapPin}
        />
      ) : mode === 'list' ? (
        <div className="space-y-5">
          {grouped.map(([city, cityEvents]) => {
            const cityMeta = CITY_MAP[city]
            return (
              <div key={city} className="card p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-ink-800/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-saffron-100 text-saffron-700">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-ink-900">
                        {city}
                      </h3>
                      <p className="text-[11px] text-ink-500">
                        {cityMeta?.state ?? 'India'} · {cityEvents.length} event
                        {cityEvents.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cityEvents.map((event) => (
                    <div
                      key={event.id}
                      className="overflow-hidden rounded-xl border border-ink-800/10"
                    >
                      <PreviewCard event={event} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <MapBoundary
          onError={() => {
            setMode('list')
          }}
        >
          <div className="card overflow-hidden p-2">
            <div className="h-[560px] w-full overflow-hidden rounded-2xl">
              <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  eventHandlers={{ tileerror: handleTileError }}
                />
                <Recenter center={center} zoom={zoom} />
                {events.map((event) => {
                  const meta = CATEGORY_MAP[event.category] ?? CATEGORY_MAP.other
                  return (
                    <Marker
                      key={event.id}
                      position={[event.latitude, event.longitude]}
                      icon={pinIcon(meta.color, meta.emoji)}
                    >
                      <Popup>
                        <PreviewCard event={event} />
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
            </div>
          </div>
        </MapBoundary>
      )}

      {mode === 'list' && (
        <p className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
          <AlertTriangle className="h-3.5 w-3.5" />
          Showing the reliable city-grouped view. Switch back to the interactive
          map any time.
        </p>
      )}
    </div>
  )
}
