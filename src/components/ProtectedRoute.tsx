import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { EmptyState, Spinner } from './UI'

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: ReactNode
  adminOnly?: boolean
}) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm font-semibold text-ink-500">
        <Spinner /> Checking your session…
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/signin"
        state={{ from: location.pathname + location.search }}
        replace
      />
    )
  }

  if (adminOnly && !isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admin access only"
        description="This review area is reserved for administrators. If you should have access, ask an admin to enable it on your profile."
        action={
          <a href="/" className="btn-primary">
            Back to discovery
          </a>
        }
      />
    )
  }

  return <>{children}</>
}
