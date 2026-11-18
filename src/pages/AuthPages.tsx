import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Info,
  Lock,
  Mail,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { ErrorBanner } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { usePrivateSeo } from '../hooks/useSeo'
import { useToast } from '../context/ToastContext'
import { CATEGORIES } from '../lib/constants'
import { SEED_ACCOUNTS, type SeedAccount } from '../lib/seedData'
import { isSupabaseConfigured } from '../lib/supabase'

function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
      <div className="hidden flex-col justify-between rounded-3xl bg-gradient-to-br from-saffron-600 via-saffron-700 to-spice-700 p-10 text-white lg:flex">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.15] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" /> Utsav India
          </span>
          <h2 className="mt-8 text-4xl font-extrabold leading-tight">
            Every great event starts with showing up.
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/[0.85]">
            Save the events you love, set reminders, follow your interests and
            share your own with the community.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { emoji: '🎵', label: 'Music' },
            { emoji: '🍜', label: 'Food' },
            { emoji: '🎭', label: 'Culture' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <span className="text-2xl">{item.emoji}</span>
              <p className="mt-1 text-[11px] font-bold">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 sm:p-9">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
          {title}
        </h1>
        <p className="mt-2 text-sm text-ink-500">{subtitle}</p>
        <div className="mt-7">{children}</div>
        <div className="mt-7 border-t border-ink-800/[0.08] pt-5 text-center text-sm text-ink-500">
          {footer}
        </div>
      </div>
    </div>
  )
}

function LocalDataHint() {
  if (isSupabaseConfigured) return null
  return (
    <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-800">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <strong>Demo mode:</strong> the app is preloaded with events,
        favourites, reminders and pending submissions. Use the one-click
        accounts below, or any email with a 6+ character password (emails
        containing <em>admin</em> get admin access).
      </p>
    </div>
  )
}

export function SignInPage() {
  usePrivateSeo('Sign in', 'Sign in to your Utsav India account to save events and set reminders.')
  const { signIn } = useAuth()
  const { show } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signIn(email, password)
      show('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not sign in. Try again.'
      )
    } finally {
      setBusy(false)
    }
  }

  async function quickSignIn(account: SeedAccount) {
    setError(null)
    setBusy(true)
    try {
      await signIn(account.email, account.password)
      show(`Signed in as ${account.fullName}`)
      navigate(from, { replace: true })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not sign in. Try again.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to save favourites, set reminders and manage your events."
      footer={
        <>
          New to Utsav?{' '}
          <Link to="/signup" className="font-extrabold text-saffron-700 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {error && <ErrorBanner message={error} />}
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="field !pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              id="password"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              className="field !pl-10 !pr-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-ink-500 hover:text-ink-800"
              aria-label={visible ? 'Hide password' : 'Show password'}
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Signing in…' : 'Sign in'}
          {busy ? null : <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      {!isSupabaseConfigured && (
        <div className="mt-6 rounded-2xl border border-saffron-200 bg-saffron-50 p-4">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-saffron-800">
            One-click sample accounts
          </p>
          <div className="mt-3 space-y-2">
            {SEED_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                disabled={busy}
                onClick={() => void quickSignIn(account)}
                className="w-full rounded-xl border border-saffron-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-saffron-400 hover:shadow-soft disabled:opacity-60"
              >
                <span className="block text-xs font-extrabold text-ink-900">
                  {account.role}
                </span>
                <span className="mt-0.5 block text-[11px] font-medium text-ink-500">
                  {account.email} · password: {account.password}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <LocalDataHint />
    </AuthShell>
  )
}

export function SignUpPage() {
  usePrivateSeo('Create an account', 'Join Utsav India to discover, save and share events across India.')
  const { signUp } = useAuth()
  const { show } = useToast()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const result = await signUp(email, password, fullName, interests)
      if (result.needsConfirmation) {
        setConfirmation(true)
      } else {
        show('Your account is ready!')
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not create your account.'
      )
    } finally {
      setBusy(false)
    }
  }

  if (confirmation) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle="We sent you a confirmation link."
        footer={
          <Link to="/signin" className="font-extrabold text-saffron-700 hover:underline">
            Go to sign in
          </Link>
        }
      >
        <div className="rounded-2xl bg-turquoise-50 p-5 text-sm leading-6 text-turquoise-900">
          Open the link in your email to activate your account, then come back
          and sign in. If you don't see it, check your spam folder.
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Utsav to save events, set reminders and get personal picks."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/signin" className="font-extrabold text-saffron-700 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {error && <ErrorBanner message={error} />}
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <div>
          <label className="label" htmlFor="name">
            Full name
          </label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              id="name"
              className="field !pl-10"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6+ characters"
              minLength={6}
              required
            />
          </div>
        </div>
        <div>
          <p className="label">Interests (optional)</p>
          <p className="mb-3 text-xs text-ink-500">
            Pick a few so we can recommend events you'll love.
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = interests.includes(cat.value)
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() =>
                    setInterests((prev) =>
                      active
                        ? prev.filter((i) => i !== cat.value)
                        : [...prev, cat.value]
                    )
                  }
                  className={`chip !px-3 !py-1.5 ${
                    active ? 'text-white' : 'bg-white'
                  }`}
                  style={
                    active
                      ? { backgroundColor: cat.color, borderColor: cat.color }
                      : { borderColor: cat.color + '50', color: cat.color }
                  }
                >
                  {active && <Check className="h-3 w-3" />}
                  <span aria-hidden>{cat.emoji}</span>
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Creating account…' : 'Create account'}
          {busy ? null : <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
      <LocalDataHint />
    </AuthShell>
  )
}
