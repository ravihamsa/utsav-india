import { useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  PlusCircle,
  ShieldCheck,
  type LucideIcon,
  Sparkles,
  User as UserIcon,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCityNavigate } from '../hooks/useCityNavigate'
import { CITIES } from '../lib/constants'
import { cityFromPath } from '../lib/navigation'
import { isSupabaseConfigured } from '../lib/supabase'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const navItems: NavItem[] = [
  { to: '/', label: 'Discover', icon: Sparkles, end: true },
  { to: '/favourites', label: 'Favourites', icon: Heart },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/submit', label: 'Submit Event', icon: PlusCircle },
]

function Brand() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-saffron-500 to-spice-600 text-white shadow-soft transition group-hover:rotate-6">
        <CalendarDays className="h-5 w-5" />
      </span>
      <span className="leading-none">
        <span className="block text-lg font-extrabold tracking-tight text-ink-900">
          Utsav
        </span>
        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-saffron-600">
          India
        </span>
      </span>
    </Link>
  )
}

function AccountMenu() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/signin" className="btn-ghost hidden sm:inline-flex">
          Sign in
        </Link>
        <Link to="/signup" className="btn-primary !px-3.5 !py-2">
          Get started
        </Link>
      </div>
    )
  }

  const initial = (profile?.full_name || user.email).charAt(0).toUpperCase()

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-ink-800/10 bg-white py-1 pl-1 pr-2.5 transition hover:border-saffron-300"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-saffron-100 text-sm font-extrabold text-saffron-700">
          {initial}
        </span>
        <span className="hidden max-w-[110px] truncate text-xs font-bold text-ink-800 sm:block">
          {profile?.full_name || user.email.split('@')[0]}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-ink-500" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close account menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-ink-800/10 bg-white p-2 shadow-soft">
            <div className="border-b border-ink-800/[0.08] px-2 pb-2.5 pt-1">
              <p className="truncate text-sm font-extrabold text-ink-900">
                {profile?.full_name || 'My account'}
              </p>
              <p className="truncate text-[11px] text-ink-500">{user.email}</p>
            </div>
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2.5 rounded-lg px-2 py-2 text-xs font-semibold text-ink-700 hover:bg-cream-100"
            >
              <UserIcon className="h-4 w-4 text-saffron-600" /> My profile
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-xs font-semibold text-ink-700 hover:bg-cream-100"
              >
                <ShieldCheck className="h-4 w-4 text-saffron-600" /> Admin review
              </Link>
            )}
            <button
              type="button"
              onClick={async () => {
                await signOut()
                setOpen(false)
                navigate('/')
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs font-semibold text-spice-700 hover:bg-spice-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function CityStrip() {
  const [params] = useSearchParams()
  const location = useLocation()
  const goToCity = useCityNavigate()
  const active =
    cityFromPath(location.pathname) ??
    (location.pathname === '/' ? params.get('city') ?? 'all' : 'all')

  return (
    <div className="border-b border-ink-800/[0.08] bg-white/70">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <span className="hidden shrink-0 items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-ink-500 md:flex">
          <MapPinned className="h-3.5 w-3.5 text-saffron-600" />
          Quick cities
        </span>
        <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
          {['all', ...CITIES.map((c) => c.name)].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => goToCity(city)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                active === city
                  ? 'bg-saffron-600 text-white shadow-sm'
                  : 'bg-cream-100 text-ink-700 hover:bg-saffron-100 hover:text-saffron-800'
              }`}
            >
              {city === 'all' ? '📍 All India' : city}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Reset scroll on page navigation, but not when only URL filters change. */
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = isAdmin
    ? [
        ...navItems,
        { to: '/admin', label: 'Admin', icon: LayoutDashboard },
      ]
    : navItems

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <header className="sticky top-0 z-50 border-b border-ink-800/[0.08] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Brand />
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={Boolean(end)}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                    isActive
                      ? 'bg-saffron-50 text-saffron-700'
                      : 'text-ink-700 hover:bg-cream-100'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {!isSupabaseConfigured && (
              <span
                title="Add your Supabase URL and anon key to .env.local to connect a real database. Until then you are exploring sample data."
                className="hidden rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-amber-800 sm:block"
              >
                Demo mode
              </span>
            )}
            <AccountMenu />
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-xl p-2 text-ink-700 hover:bg-cream-100 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="border-t border-ink-800/[0.08] bg-white px-4 py-3 lg:hidden">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold ${
                    isActive
                      ? 'bg-saffron-50 text-saffron-700'
                      : 'text-ink-700 hover:bg-cream-100'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <CityStrip />
      <main
        key={location.pathname}
        className="mx-auto w-full max-w-7xl flex-1 animate-fade-in px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      >
        {children}
      </main>
      <footer className="border-t border-ink-800/[0.08] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-saffron-600" />
            <span className="font-bold text-ink-800">Utsav India</span>
            <span>· Discover what brings us together.</span>
          </div>
          <p>Made with ❤️ for events across India.</p>
        </div>
      </footer>
    </div>
  )
}
