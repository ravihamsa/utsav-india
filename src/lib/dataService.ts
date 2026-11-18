import {
  SEED_EVENTS,
  seedFavoritesFor,
  seedProfileFor,
  seedRemindersFor,
} from './seedData'
import { ensureSeed, readLocal, writeLocal } from './storage'
import { supabase } from './supabase'
import type { EventDraft, EventItem, EventStatus, Profile, Reminder } from './types'

function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

function localEvents(): EventItem[] {
  ensureSeed()
  const stored = readLocal<EventItem[] | null>('events', null)
  if (stored) return stored
  writeLocal('events', SEED_EVENTS)
  return SEED_EVENTS
}

function saveLocalEvents(events: EventItem[]) {
  writeLocal('events', events)
}

export async function loadApprovedEvents(): Promise<EventItem[]> {
  if (!supabase) return localEvents().filter((e) => e.status === 'approved')
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'approved')
    .order('starts_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as EventItem[]
}

export async function loadAllEvents(): Promise<EventItem[]> {
  if (!supabase) return localEvents()
  const { data, error } = await requireSupabase()
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as EventItem[]
}

export async function loadMySubmissions(userId: string): Promise<EventItem[]> {
  if (!supabase) {
    return localEvents().filter((e) => e.submitted_by === userId)
  }
  const { data, error } = await requireSupabase()
    .from('events')
    .select('*')
    .eq('submitted_by', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as EventItem[]
}

export async function createEvent(
  draft: EventDraft,
  userId: string | null
): Promise<EventItem> {
  const now = new Date().toISOString()
  if (!supabase) {
    const event: EventItem = {
      ...draft,
      id: `sub-${Date.now()}`,
      status: 'pending',
      submitted_by: userId,
      created_at: now,
    }
    saveLocalEvents([...localEvents(), event])
    return event
  }
  const { data, error } = await supabase
    .from('events')
    .insert({
      ...draft,
      status: 'pending',
      submitted_by: userId,
      created_at: now,
    })
    .select()
    .single()
  if (error) throw error
  return data as EventItem
}

export async function updateEventStatus(
  id: string,
  status: EventStatus
): Promise<void> {
  if (!supabase) {
    saveLocalEvents(
      localEvents().map((e) => (e.id === id ? { ...e, status } : e))
    )
    return
  }
  const { error } = await requireSupabase()
    .from('events')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

/** Admin edit: change the listing details without touching status/ownership. */
export async function updateEvent(id: string, draft: EventDraft): Promise<void> {
  if (!supabase) {
    saveLocalEvents(
      localEvents().map((e) => (e.id === id ? { ...e, ...draft } : e))
    )
    return
  }
  const { error } = await requireSupabase()
    .from('events')
    .update(draft)
    .eq('id', id)
  if (error) throw error
}

/** Admin removal. Supabase cascades favourites/reminders via foreign keys. */
export async function deleteEvent(id: string): Promise<void> {
  if (!supabase) {
    saveLocalEvents(localEvents().filter((e) => e.id !== id))
    Object.keys(localStorage)
      .filter(
        (key) =>
          key.startsWith('utsav:favorites:') ||
          key.startsWith('utsav:reminders:')
      )
      .forEach((key) => {
        try {
          const value: unknown = JSON.parse(localStorage.getItem(key) ?? 'null')
          if (!Array.isArray(value)) return
          const next = key.startsWith('utsav:favorites:')
            ? value.filter((item) => item !== id)
            : value.filter(
                (item) =>
                  typeof item === 'object' &&
                  item !== null &&
                  (item as { event_id?: string }).event_id !== id
              )
          localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // Ignore malformed local entries.
        }
      })
    return
  }
  const { error } = await requireSupabase()
    .from('events')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function loadFavorites(userId: string): Promise<string[]> {
  if (!supabase) {
    ensureSeed()
    const stored = readLocal<string[] | null>(`favorites:${userId}`, null)
    if (stored) return stored
    const seeded = seedFavoritesFor(userId) ?? []
    writeLocal(`favorites:${userId}`, seeded)
    return seeded
  }
  const { data, error } = await requireSupabase()
    .from('favorites')
    .select('event_id')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map((row) => row.event_id as string)
}

export async function addFavorite(userId: string, eventId: string): Promise<void> {
  if (!supabase) {
    const ids = readLocal<string[]>(`favorites:${userId}`, [])
    if (!ids.includes(eventId)) writeLocal(`favorites:${userId}`, [...ids, eventId])
    return
  }
  const { error } = await requireSupabase()
    .from('favorites')
    .insert({ user_id: userId, event_id: eventId })
  if (error) throw error
}

export async function removeFavorite(userId: string, eventId: string): Promise<void> {
  if (!supabase) {
    writeLocal(
      `favorites:${userId}`,
      readLocal<string[]>(`favorites:${userId}`, []).filter((id) => id !== eventId)
    )
    return
  }
  const { error } = await requireSupabase()
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('event_id', eventId)
  if (error) throw error
}

export async function loadReminders(userId: string): Promise<Reminder[]> {
  if (!supabase) {
    ensureSeed()
    const stored = readLocal<Reminder[] | null>(`reminders:${userId}`, null)
    if (stored) return stored
    const seeded = seedRemindersFor(userId) ?? []
    writeLocal(`reminders:${userId}`, seeded)
    return seeded
  }
  const { data, error } = await requireSupabase()
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Reminder[]
}

export async function addReminder(
  userId: string,
  eventId: string,
  minutesBefore: number
): Promise<Reminder> {
  const reminder: Reminder = {
    id: `rem-${Date.now()}`,
    user_id: userId,
    event_id: eventId,
    minutes_before: minutesBefore,
    created_at: new Date().toISOString(),
  }
  if (!supabase) {
    writeLocal(`reminders:${userId}`, [
      ...readLocal<Reminder[]>(`reminders:${userId}`, []),
      reminder,
    ])
    return reminder
  }
  const { data, error } = await supabase
    .from('reminders')
    .insert({ user_id: userId, event_id: eventId, minutes_before: minutesBefore })
    .select()
    .single()
  if (error) throw error
  return data as Reminder
}

export async function removeReminder(userId: string, id: string): Promise<void> {
  if (!supabase) {
    writeLocal(
      `reminders:${userId}`,
      readLocal<Reminder[]>(`reminders:${userId}`, []).filter((r) => r.id !== id)
    )
    return
  }
  const { error } = await requireSupabase()
    .from('reminders')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function loadProfile(userId: string): Promise<Profile | null> {
  if (!supabase) {
    ensureSeed()
    const stored = readLocal<Profile | null>(`profile:${userId}`, null)
    if (stored) return stored
    const seeded = seedProfileFor(userId)
    if (seeded) writeLocal(`profile:${userId}`, seeded)
    return seeded
  }
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return (data as Profile | null) ?? null
}

export async function ensureProfile(user: {
  id: string
  email: string
  fullName?: string
}): Promise<Profile> {
  const fallback: Profile = {
    id: user.id,
    email: user.email,
    full_name: user.fullName || user.email.split('@')[0],
    interests: [],
    is_admin: false,
    created_at: new Date().toISOString(),
  }
  if (!supabase) {
    ensureSeed()
    const existing = readLocal<Profile | null>(`profile:${user.id}`, null)
    if (existing) return existing
    const seeded = seedProfileFor(user.id)
    const next = seeded ?? fallback
    writeLocal(`profile:${user.id}`, next)
    return next
  }
  // Do not pass interests here: an upsert that includes them would overwrite
  // interests the user already saved. The column has a safe default.
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email,
        full_name: fallback.full_name,
      },
      { onConflict: 'id' }
    )
    .select()
    .single()
  if (error) throw error
  return data as Profile
}

export async function saveProfile(profile: Profile): Promise<void> {
  if (!supabase) {
    writeLocal(`profile:${profile.id}`, profile)
    return
  }
  const { error } = await requireSupabase()
    .from('profiles')
    .update({
      full_name: profile.full_name,
      interests: profile.interests,
    })
    .eq('id', profile.id)
  if (error) throw error
}
