export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`
}

export function toDateInputValue(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value)
  const month = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function daysFromNow(days: number, hour = 18, minute = 0): string {
  const d = addDays(new Date(), days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 3600000).toISOString()
}

export function isUpcoming(iso: string): boolean {
  return new Date(iso).getTime() >= Date.now()
}

export interface CalendarCell {
  date: Date
  inMonth: boolean
}

export function getCalendarMonth(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1)
  const gridStart = addDays(first, -first.getDay())
  const cells: CalendarCell[] = []
  for (let i = 0; i < 42; i += 1) {
    const date = addDays(gridStart, i)
    cells.push({ date, inMonth: date.getMonth() === month })
  }
  return cells
}

export function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
}

export function relativeTime(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  const abs = Math.abs(diff)
  const minutes = Math.round(abs / 60000)
  const hours = Math.round(abs / 3600000)
  const days = Math.round(abs / 86400000)
  let text: string
  if (minutes < 60) text = `${minutes} min`
  else if (hours < 24) text = `${hours} hr`
  else text = `${days} day${days === 1 ? '' : 's'}`
  return diff >= 0 ? `in ${text}` : `${text} ago`
}
