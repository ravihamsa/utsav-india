import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import {
  addFavorite,
  addReminder,
  createEvent,
  deleteEvent,
  loadAllEvents,
  loadApprovedEvents,
  loadFavorites,
  loadMySubmissions,
  loadReminders,
  removeFavorite,
  removeReminder,
  updateEvent,
  updateEventStatus,
} from '../lib/dataService'
import type {
  EventDraft,
  EventItem,
  EventStatus,
  Reminder,
} from '../lib/types'

interface DataContextValue {
  events: EventItem[]
  allEvents: EventItem[]
  mySubmissions: EventItem[]
  favorites: string[]
  reminders: Reminder[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  getEvent: (id: string) => EventItem | undefined
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => Promise<void>
  addEventReminder: (id: string, minutes: number) => Promise<void>
  deleteReminder: (id: string) => Promise<void>
  submitEvent: (draft: EventDraft) => Promise<EventItem>
  changeEventStatus: (id: string, status: EventStatus) => Promise<void>
  editEvent: (id: string, draft: EventDraft) => Promise<void>
  removeEvent: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth()
  const [events, setEvents] = useState<EventItem[]>([])
  const [allEvents, setAllEvents] = useState<EventItem[]>([])
  const [mySubmissions, setMySubmissions] = useState<EventItem[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = user?.id ?? null

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const approved = await loadApprovedEvents()
      setEvents(approved)
      if (userId) {
        const [favs, rems, subs] = await Promise.all([
          loadFavorites(userId),
          loadReminders(userId),
          loadMySubmissions(userId),
        ])
        setFavorites(favs)
        setReminders(rems)
        setMySubmissions(subs)
      } else {
        setFavorites([])
        setReminders([])
        setMySubmissions([])
      }
      if (isAdmin) {
        setAllEvents(await loadAllEvents())
      } else {
        setAllEvents([])
      }
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while loading events.'
      )
    } finally {
      setLoading(false)
    }
  }, [isAdmin, userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const getEvent = useCallback(
    (id: string) =>
      [...events, ...allEvents, ...mySubmissions].find((e) => e.id === id),
    [allEvents, events, mySubmissions]
  )

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  )

  const toggleFavorite = useCallback(
    async (id: string) => {
      if (!userId) throw new Error('Sign in to save favourites.')
      const saved = favorites.includes(id)
      // Optimistic update
      setFavorites((prev) =>
        saved ? prev.filter((f) => f !== id) : [...prev, id]
      )
      try {
        if (saved) await removeFavorite(userId, id)
        else await addFavorite(userId, id)
      } catch (err) {
        setFavorites((prev) =>
          saved ? [...prev, id] : prev.filter((f) => f !== id)
        )
        throw err
      }
    },
    [favorites, userId]
  )

  const addEventReminder = useCallback(
    async (id: string, minutes: number) => {
      if (!userId) throw new Error('Sign in to set a reminder.')
      const created = await addReminder(userId, id, minutes)
      setReminders((prev) => [created, ...prev])
    },
    [userId]
  )

  const deleteReminder = useCallback(
    async (id: string) => {
      if (!userId) return
      await removeReminder(userId, id)
      setReminders((prev) => prev.filter((r) => r.id !== id))
    },
    [userId]
  )

  const submitEvent = useCallback(
    async (draft: EventDraft) => {
      const created = await createEvent(draft, userId)
      if (userId) setMySubmissions((prev) => [created, ...prev])
      return created
    },
    [userId]
  )

  const changeEventStatus = useCallback(
    async (id: string, status: EventStatus) => {
      await updateEventStatus(id, status)
      setAllEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e))
      )
      if (status === 'approved') {
        const approved = await loadApprovedEvents()
        setEvents(approved)
      } else {
        setEvents((prev) => prev.filter((e) => e.id !== id))
      }
    },
    []
  )

  const editEvent = useCallback(
    async (id: string, draft: EventDraft) => {
      await updateEvent(id, draft)
      await refresh()
    },
    [refresh]
  )

  const removeEvent = useCallback(
    async (id: string) => {
      await deleteEvent(id)
      await refresh()
    },
    [refresh]
  )

  const value = useMemo<DataContextValue>(
    () => ({
      events,
      allEvents,
      mySubmissions,
      favorites,
      reminders,
      loading,
      error,
      refresh,
      getEvent,
      isFavorite,
      toggleFavorite,
      addEventReminder,
      deleteReminder,
      submitEvent,
      changeEventStatus,
      editEvent,
      removeEvent,
    }),
    [
      events,
      allEvents,
      mySubmissions,
      favorites,
      reminders,
      loading,
      error,
      refresh,
      getEvent,
      isFavorite,
      toggleFavorite,
      addEventReminder,
      deleteReminder,
      submitEvent,
      changeEventStatus,
      editEvent,
      removeEvent,
    ]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
