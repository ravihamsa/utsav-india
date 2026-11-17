import { localUserId, SEED_VERSION } from './seedData'

const PREFIX = 'utsav:'

/**
 * Sample data is versioned so that improving it refreshes what people see,
 * while keeping them signed in.
 */
export function ensureSeed(): void {
  try {
    // Sessions created with an older ID prefix are carried over.
    const user = readLocal<{ id: string; email: string } | null>('user', null)
    if (user && !user.id.startsWith('local:')) {
      writeLocal('user', { ...user, id: localUserId(user.email) })
    }
    if (readLocal<number>('seedVersion', 0) === SEED_VERSION) return
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX) && key !== `${PREFIX}user`)
      .forEach((key) => localStorage.removeItem(key))
    writeLocal('seedVersion', SEED_VERSION)
  } catch {
    // Storage unavailable — the sample data still works in memory.
  }
}

export function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Storage may be unavailable (private mode / quota). The app still works in memory.
  }
}

export function removeLocal(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // ignore
  }
}
