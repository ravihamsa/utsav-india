import { useState } from 'react'
import { Bell, BellRing, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { REMINDER_OPTIONS } from '../lib/constants'

interface Props {
  eventId: string
  showLabel?: boolean
}

export default function ReminderButton({ eventId, showLabel = false }: Props) {
  const { user } = useAuth()
  const { reminders, addEventReminder, deleteReminder } = useData()
  const { show } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const existing = reminders.filter((r) => r.event_id === eventId)

  async function setReminder(minutes: number) {
    if (!user) {
      show('Sign in to set a reminder.', 'info')
      navigate('/signin', {
        state: { from: location.pathname + location.search },
      })
      return
    }
    setBusy(true)
    try {
      await addEventReminder(eventId, minutes)
      const label = REMINDER_OPTIONS.find((o) => o.value === minutes)?.label
      show(`Reminder set: ${label ?? `${minutes} minutes before`}.`)
      setOpen(false)
    } catch (error) {
      show(
        error instanceof Error ? error.message : 'Could not set reminder.',
        'error'
      )
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    setBusy(true)
    try {
      await deleteReminder(id)
      show('Reminder removed.')
    } catch {
      show('Could not remove reminder.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        title="Set a reminder"
        className={`inline-flex items-center gap-1.5 rounded-lg font-bold transition ${
          showLabel
            ? 'border border-ink-800/10 bg-white px-3 py-2 text-xs text-ink-700 hover:border-saffron-300 hover:text-saffron-700'
            : 'p-2 text-ink-500 hover:bg-cream-200 hover:text-saffron-700'
        }`}
      >
        {existing.length > 0 ? (
          <BellRing className="h-[18px] w-[18px] text-saffron-600" />
        ) : (
          <Bell className="h-[18px] w-[18px]" />
        )}
        {showLabel && (
          <span>{existing.length > 0 ? 'Reminder set' : 'Remind me'}</span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close reminder menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setOpen(false)
            }}
          />
          <div
            className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-ink-800/10 bg-white p-2 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-xs font-extrabold uppercase tracking-wide text-ink-700">
                Remind me
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-0.5 text-ink-500 hover:bg-cream-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {existing.length > 0 && (
              <div className="mx-1 mb-1 rounded-xl bg-saffron-50 p-2">
                {existing.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-2 py-0.5 text-[11px] font-semibold text-saffron-800"
                  >
                    <span>
                      {
                        REMINDER_OPTIONS.find((o) => o.value === r.minutes_before)
                          ?.label ?? `${r.minutes_before} min before`
                      }
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void remove(r.id)}
                      className="font-bold text-spice-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="max-h-56 overflow-y-auto">
              {REMINDER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={busy}
                  onClick={() => void setReminder(option.value)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-ink-700 hover:bg-cream-100 hover:text-saffron-700"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
