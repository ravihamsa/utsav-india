import { useEffect, useState, type FormEvent } from 'react'
import { Save, X } from 'lucide-react'
import { CATEGORIES, CITIES } from '../lib/constants'
import type { Category, EventDraft, EventItem } from '../lib/types'

function toInputDate(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  const pad = (n: number) => `${n}`.padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface FormState {
  title: string
  description: string
  category: Category
  city: string
  starts_at: string
  ends_at: string
  venue_name: string
  venue_address: string
  latitude: string
  longitude: string
  image_url: string
  registration_url: string
  organizer_name: string
  is_free: boolean
  price: string
}

interface Props {
  event: EventItem
  onClose: () => void
  onSave: (draft: EventDraft) => Promise<void>
}

export default function EventEditDialog({ event, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>({
    title: event.title,
    description: event.description,
    category: event.category,
    city: event.city,
    starts_at: toInputDate(event.starts_at),
    ends_at: toInputDate(event.ends_at),
    venue_name: event.venue_name,
    venue_address: event.venue_address,
    latitude: String(event.latitude),
    longitude: String(event.longitude),
    image_url: event.image_url ?? '',
    registration_url: event.registration_url,
    organizer_name: event.organizer_name,
    is_free: event.is_free,
    price: String(event.price),
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [busy, onClose])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim() || !form.venue_name.trim() || !form.starts_at) {
      setError('Title, description, venue and start date/time are required.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        city: form.city,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        venue_name: form.venue_name.trim(),
        venue_address: form.venue_address.trim(),
        latitude: Number(form.latitude) || 22.5,
        longitude: Number(form.longitude) || 79,
        image_url: form.image_url.trim() || null,
        registration_url: form.registration_url.trim(),
        organizer_name: form.organizer_name.trim(),
        is_free: form.is_free,
        price: form.is_free ? 0 : Number(form.price) || 0,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the event.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-ink-900/50 p-4 backdrop-blur-sm sm:p-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-event-title"
        className="card my-4 w-full max-w-2xl p-5 shadow-soft sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="edit-event-title" className="text-xl font-extrabold text-ink-900">
              Edit event
            </h2>
            <p className="mt-1 text-xs text-ink-500">
              Changes are visible everywhere once saved. Status stays as{' '}
              <span className="font-bold capitalize">{event.status}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close editor"
            className="rounded-xl p-2 text-ink-500 hover:bg-cream-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-spice-200 bg-spice-50 px-3 py-2 text-xs font-semibold text-spice-700">
            {error}
          </div>
        )}

        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <div>
            <label className="label" htmlFor="edit-title">Title</label>
            <input id="edit-title" className="field" value={form.title} onChange={(e) => update('title', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="edit-description">Description</label>
            <textarea id="edit-description" rows={4} className="field" value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="edit-category">Category</label>
              <select id="edit-category" className="field" value={form.category} onChange={(e) => update('category', e.target.value as Category)}>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="edit-city">City</label>
              <select id="edit-city" className="field" value={form.city} onChange={(e) => update('city', e.target.value)}>
                {CITIES.map((city) => (
                  <option key={city.name} value={city.name}>{city.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="edit-starts">Starts at</label>
              <input id="edit-starts" type="datetime-local" className="field" value={form.starts_at} onChange={(e) => update('starts_at', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="edit-ends">Ends at (optional)</label>
              <input id="edit-ends" type="datetime-local" className="field" value={form.ends_at} onChange={(e) => update('ends_at', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="edit-venue">Venue name</label>
            <input id="edit-venue" className="field" value={form.venue_name} onChange={(e) => update('venue_name', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="edit-address">Venue address</label>
            <input id="edit-address" className="field" value={form.venue_address} onChange={(e) => update('venue_address', e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="edit-lat">Latitude</label>
              <input id="edit-lat" type="number" step="any" className="field" value={form.latitude} onChange={(e) => update('latitude', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="edit-lng">Longitude</label>
              <input id="edit-lng" type="number" step="any" className="field" value={form.longitude} onChange={(e) => update('longitude', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="edit-image">Image URL (optional)</label>
            <input id="edit-image" className="field" value={form.image_url} onChange={(e) => update('image_url', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="edit-registration">Registration link</label>
            <input id="edit-registration" className="field" value={form.registration_url} onChange={(e) => update('registration_url', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="edit-organizer">Organiser</label>
            <input id="edit-organizer" className="field" value={form.organizer_name} onChange={(e) => update('organizer_name', e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-bold text-ink-800">
              <input type="checkbox" checked={form.is_free} onChange={(e) => update('is_free', e.target.checked)} className="h-4 w-4 accent-saffron-600" />
              Free entry
            </label>
            <div>
              <label className="label" htmlFor="edit-price">Price (₹)</label>
              <input id="edit-price" type="number" min="0" className="field disabled:opacity-50" disabled={form.is_free} value={form.price} onChange={(e) => update('price', e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-ink-800/[0.08] pt-4">
            <button type="button" onClick={onClose} disabled={busy} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary">
              <Save className="h-4 w-4" /> {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
