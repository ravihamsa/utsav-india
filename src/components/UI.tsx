import {
  AlertCircle,
  CalendarOff,
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { CATEGORY_MAP } from '../lib/constants'
import type { Category } from '../lib/types'

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`h-4 w-4 animate-spin ${className}`} />
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse overflow-hidden">
          <div className="h-44 bg-cream-200" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-20 rounded bg-cream-200" />
            <div className="h-4 w-4/5 rounded bg-cream-200" />
            <div className="h-3 w-3/5 rounded bg-cream-200" />
            <div className="h-3 w-1/2 rounded bg-cream-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = CalendarOff,
}: {
  title: string
  description: string
  action?: ReactNode
  icon?: LucideIcon
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-saffron-100 text-saffron-600">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-extrabold text-ink-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-spice-200 bg-spice-50 px-4 py-3 text-sm text-spice-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export function CategoryBadge({
  category,
  size = 'sm',
}: {
  category: Category
  size?: 'sm' | 'md'
}) {
  const meta = CATEGORY_MAP[category] ?? CATEGORY_MAP.other
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${
        size === 'md' ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]'
      }`}
      style={{ backgroundColor: meta.soft, color: meta.color }}
    >
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </span>
  )
}

export function PriceBadge({
  isFree,
  price,
}: {
  isFree: boolean
  price: number
}) {
  return (
    <span
      className={`rounded-lg px-2 py-1 text-[11px] font-extrabold ${
        isFree ? 'bg-turquoise-100 text-turquoise-800' : 'bg-cream-200 text-ink-800'
      }`}
    >
      {isFree ? 'FREE' : `₹${price.toLocaleString('en-IN')}`}
    </span>
  )
}

export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-saffron-600">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
