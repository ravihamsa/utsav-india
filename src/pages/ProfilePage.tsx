import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Clock, PlusCircle, ShieldCheck, XCircle } from 'lucide-react'
import { EmptyState, PageHeading } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { usePrivateSeo } from '../hooks/useSeo'
import { useToast } from '../context/ToastContext'
import { CATEGORIES } from '../lib/constants'
import { formatDate } from '../lib/dateUtils'
import type { EventStatus } from '../lib/types'

const statusStyles: Record<EventStatus, string> = {
  approved: 'bg-turquoise-100 text-turquoise-800',
  pending: 'bg-amber-100 text-amber-800',
  rejected: 'bg-spice-100 text-spice-800',
}

export default function ProfilePage() {
  usePrivateSeo('My profile', 'Manage your Utsav India profile and interests.')
  const { user, profile, isAdmin, updateProfile } = useAuth()
  const { mySubmissions } = useData()
  const { show } = useToast()
  const [fullName, setFullName] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name)
      setInterests(profile.interests)
    }
  }, [profile])

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    )
  }

  async function save() {
    setSaving(true)
    try {
      await updateProfile({ full_name: fullName.trim(), interests })
      show('Profile updated!')
    } catch (error) {
      show(
        error instanceof Error ? error.message : 'Could not save profile.',
        'error'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-10">
      <PageHeading
        eyebrow="Your account"
        title="My profile"
        description="Update your details and tell us what you like — we use your interests to personalise recommendations."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="card p-5 sm:p-7">
          <h2 className="text-lg font-extrabold text-ink-900">Details</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                className="field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="field !bg-cream-100"
                value={user?.email ?? ''}
                readOnly
              />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-ink-900">
                  Your interests
                </h3>
                <p className="mt-1 text-xs text-ink-500">
                  Pick as many as you like. {interests.length} selected.
                </p>
              </div>
              {interests.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInterests([])}
                  className="text-xs font-bold text-spice-700 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const active = interests.includes(category.value)
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => toggleInterest(category.value)}
                    className={`chip !px-4 !py-2 ${
                      active ? 'text-white' : 'bg-white'
                    }`}
                    style={
                      active
                        ? {
                            backgroundColor: category.color,
                            borderColor: category.color,
                          }
                        : {
                            borderColor: category.color + '50',
                            color: category.color,
                          }
                    }
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    <span aria-hidden>{category.emoji}</span>
                    {category.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-extrabold text-ink-900">
              Account status
            </h2>
            <div className="mt-4 space-y-3 text-xs font-semibold">
              <p className="flex items-center justify-between">
                <span className="text-ink-500">Signed in as</span>
                <span className="max-w-[170px] truncate text-ink-900">
                  {user?.email}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-ink-500">Role</span>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-saffron-100 px-2 py-1 text-saffron-800">
                    <ShieldCheck className="h-3 w-3" /> Admin
                  </span>
                ) : (
                  <span className="rounded-full bg-cream-200 px-2 py-1 text-ink-700">
                    Member
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-saffron-200 bg-saffron-50 p-5">
            <h3 className="text-sm font-extrabold text-saffron-900">
              Have an event to share?
            </h3>
            <p className="mt-1.5 text-xs leading-5 text-saffron-800">
              Submit it for review and it will go live once an admin approves.
            </p>
            <Link to="/submit" className="btn-primary mt-4 w-full !py-2">
              <PlusCircle className="h-4 w-4" /> Submit an event
            </Link>
          </div>
        </aside>
      </div>

      <section>
        <h2 className="mb-5 text-xl font-extrabold text-ink-900">
          My submissions
        </h2>
        {mySubmissions.length > 0 ? (
          <div className="card divide-y divide-ink-800/[0.08]">
            {mySubmissions.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link
                    to={`/events/${event.id}`}
                    className="text-sm font-extrabold text-ink-900 hover:text-saffron-700"
                  >
                    {event.title}
                  </Link>
                  <p className="mt-1 text-xs text-ink-500">
                    {event.city} · {formatDate(event.starts_at)}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold capitalize ${statusStyles[event.status]}`}
                >
                  {event.status === 'pending' && <Clock className="h-3 w-3" />}
                  {event.status === 'approved' && <Check className="h-3 w-3" />}
                  {event.status === 'rejected' && (
                    <XCircle className="h-3 w-3" />
                  )}
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PlusCircle}
            title="No submissions yet"
            description="Events you submit will appear here with their approval status."
            action={
              <Link to="/submit" className="btn-primary">
                Submit an event
              </Link>
            }
          />
        )}
      </section>
    </div>
  )
}
