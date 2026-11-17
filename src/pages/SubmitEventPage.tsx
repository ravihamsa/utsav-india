import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
  Info,
  MapPin,
  PlusCircle,
  Send,
} from 'lucide-react'
import { ErrorBanner, PageHeading } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { CATEGORIES, CITIES, CITY_MAP } from '../lib/constants'
import type { Category, EventDraft, EventItem } from '../lib/types'

const emptyForm = {
  title: '',
  description: '',
  category: 'music' as Category,
  city: CITIES[0].name,
  starts_at: '',
  ends_at: '',
  venue_name: '',
  venue_address: '',
  latitude: String(CITIES[0].lat),
  longitude: String(CITIES[0].lng),
  image_url: '',
  registration_url: '',
  organizer_name: '',
  is_free: true,
  price: 0,
}

export default function SubmitEventPage() {
  const { user } = useAuth()
  const { submitEvent } = useData()
  const { show } = useToast()
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<EventItem | null>(null)

  function update<K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function chooseCity(city: string) {
    const meta = CITY_MAP[city]
    setForm((prev) => ({
      ...prev,
      city,
      venue_address: prev.venue_address
        ? prev.venue_address
        : meta
          ? `${prev.venue_name || 'Venue'}, ${city}`
          : city,
      latitude: String(meta?.lat ?? 22.5),
      longitude: String(meta?.lng ?? 79),
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.venue_name.trim() ||
      !form.starts_at
    ) {
      setError('Please fill in the title, description, venue and date/time.')
      return
    }
    if (!/^https?:\/\//i.test(form.registration_url)) {
      setError('Please enter a registration link starting with https://')
      return
    }
    if (!form.is_free && (!form.price || form.price < 0)) {
      setError('Please enter a valid ticket price.')
      return
    }

    const draft: EventDraft = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      city: form.city,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: form.ends_at
        ? new Date(form.ends_at).toISOString()
        : null,
      venue_name: form.venue_name.trim(),
      venue_address: form.venue_address.trim() || `${form.venue_name}, ${form.city}`,
      latitude: Number(form.latitude) || CITY_MAP[form.city]?.lat || 22.5,
      longitude: Number(form.longitude) || CITY_MAP[form.city]?.lng || 79,
      image_url: form.image_url.trim() || null,
      registration_url: form.registration_url.trim(),
      organizer_name: form.organizer_name.trim() || 'Independent organiser',
      is_free: form.is_free,
      price: form.is_free ? 0 : Number(form.price),
    }

    setBusy(true)
    try {
      const event = await submitEvent(draft)
      setCreated(event)
      show('Event submitted for review!')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not submit the event.'
      )
    } finally {
      setBusy(false)
    }
  }

  if (created) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-turquoise-100 text-turquoise-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900">
            Thanks for sharing!
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-500">
            <strong className="text-ink-800">{created.title}</strong> is now
            pending review. An admin will approve or reject it, and it will
            appear across the site once approved.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-primary">
              Back to events
            </Link>
            {user && (
              <Link to="/profile" className="btn-secondary">
                View my submissions
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading
        eyebrow="For organisers"
        title="Submit an event"
        description="Share something happening in your city. Submissions are reviewed by an admin before they go live."
      />

      <div className="mb-6 flex gap-3 rounded-2xl border border-turquoise-200 bg-turquoise-50 p-4 text-xs leading-5 text-turquoise-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          You don't need an account to submit. If you are signed in, the event
          is linked to your profile so you can track its status. Approved
          events appear in the list, calendar and map views.
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="card space-y-8 p-5 sm:p-8"
      >
        <fieldset className="space-y-5">
          <legend className="mb-4 text-sm font-extrabold uppercase tracking-wide text-saffron-700">
            The basics
          </legend>
          <div>
            <label className="label" htmlFor="title">
              Event title *
            </label>
            <input
              id="title"
              className="field"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Sunset Jazz Evening"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="description">
              Description *
            </label>
            <textarea
              id="description"
              className="field min-h-[120px] resize-y"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="What can people expect? Tell them what makes it special."
              required
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="category">
                Category *
              </label>
              <select
                id="category"
                className="field"
                value={form.category}
                onChange={(e) => update('category', e.target.value as Category)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="city">
                City *
              </label>
              <select
                id="city"
                className="field"
                value={form.city}
                onChange={(e) => chooseCity(e.target.value)}
              >
                {CITIES.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}, {city.state}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-5 border-t border-ink-800/[0.08] pt-8">
          <legend className="mb-4 text-sm font-extrabold uppercase tracking-wide text-saffron-700">
            When &amp; where
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="starts_at">
                Starts at *
              </label>
              <input
                id="starts_at"
                type="datetime-local"
                className="field"
                value={form.starts_at}
                onChange={(e) => update('starts_at', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="ends_at">
                Ends at (optional)
              </label>
              <input
                id="ends_at"
                type="datetime-local"
                className="field"
                value={form.ends_at}
                onChange={(e) => update('ends_at', e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="venue_name">
                Venue name *
              </label>
              <input
                id="venue_name"
                className="field"
                value={form.venue_name}
                onChange={(e) => update('venue_name', e.target.value)}
                placeholder="e.g. Jio World Garden"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="venue_address">
                Full address
              </label>
              <input
                id="venue_address"
                className="field"
                value={form.venue_address}
                onChange={(e) => update('venue_address', e.target.value)}
                placeholder="Street, area, city"
              />
            </div>
            <div>
              <label className="label" htmlFor="latitude">
                Latitude
              </label>
              <input
                id="latitude"
                type="number"
                step="any"
                className="field"
                value={form.latitude}
                onChange={(e) => update('latitude', e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="longitude">
                Longitude
              </label>
              <input
                id="longitude"
                type="number"
                step="any"
                className="field"
                value={form.longitude}
                onChange={(e) => update('longitude', e.target.value)}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => chooseCity(form.city)}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-saffron-700 hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" />
            Use {form.city} city-centre coordinates
          </button>
        </fieldset>

        <fieldset className="space-y-5 border-t border-ink-800/[0.08] pt-8">
          <legend className="mb-4 text-sm font-extrabold uppercase tracking-wide text-saffron-700">
            Tickets &amp; links
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="organizer_name">
                Organiser name
              </label>
              <input
                id="organizer_name"
                className="field"
                value={form.organizer_name}
                onChange={(e) => update('organizer_name', e.target.value)}
                placeholder="Your name or group"
              />
            </div>
            <div>
              <label className="label" htmlFor="registration_url">
                Registration link *
              </label>
              <input
                id="registration_url"
                type="url"
                className="field"
                value={form.registration_url}
                onChange={(e) => update('registration_url', e.target.value)}
                placeholder="https://…"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="image_url">
                Image URL (optional)
              </label>
              <input
                id="image_url"
                type="url"
                className="field"
                value={form.image_url}
                onChange={(e) => update('image_url', e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex flex-1 flex-col gap-1.5">
                <span className="label !mb-0">Ticket type</span>
                <select
                  className="field"
                  value={form.is_free ? 'free' : 'paid'}
                  onChange={(e) => update('is_free', e.target.value === 'free')}
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </label>
              {!form.is_free && (
                <label className="flex flex-1 flex-col gap-1.5">
                  <span className="label !mb-0">Price (₹)</span>
                  <input
                    type="number"
                    min="0"
                    className="field"
                    value={form.price}
                    onChange={(e) => update('price', Number(e.target.value))}
                  />
                </label>
              )}
            </div>
          </div>
          {form.image_url && (
            <p className="flex items-center gap-1.5 text-[11px] text-ink-500">
              <ImageIcon className="h-3.5 w-3.5" /> Image preview will appear on
              the event card once approved.
            </p>
          )}
        </fieldset>

        <div className="flex flex-col-reverse gap-3 border-t border-ink-800/[0.08] pt-6 sm:flex-row sm:justify-end">
          <Link to="/" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? 'Submitting…' : 'Submit for review'}
            {busy ? null : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-500">
        <PlusCircle className="h-3.5 w-3.5" />
        Questions? Explore existing events to see what a great listing looks
        like. <ArrowRight className="h-3 w-3" />
      </p>
    </div>
  )
}
