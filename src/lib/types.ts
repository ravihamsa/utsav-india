export type Category =
  | 'music'
  | 'food'
  | 'tech'
  | 'culture'
  | 'sports'
  | 'arts'
  | 'community'
  | 'other'

export type EventStatus = 'pending' | 'approved' | 'rejected'

export interface EventItem {
  id: string
  title: string
  description: string
  category: Category
  city: string
  venue_name: string
  venue_address: string
  latitude: number
  longitude: number
  starts_at: string
  ends_at: string | null
  image_url: string | null
  registration_url: string
  organizer_name: string
  is_free: boolean
  price: number
  status: EventStatus
  submitted_by: string | null
  created_at: string
}

export type EventDraft = Omit<
  EventItem,
  'id' | 'status' | 'submitted_by' | 'created_at'
>

export interface Profile {
  id: string
  email: string
  full_name: string
  interests: string[]
  is_admin: boolean
  created_at: string
}

export interface Reminder {
  id: string
  user_id: string
  event_id: string
  minutes_before: number
  created_at: string
}

export interface EventFilters {
  query: string
  city: string
  category: Category | 'all'
  fromDate: string
  toDate: string
  price: 'all' | 'free' | 'paid'
  sort: 'soonest' | 'newest'
}

export type ViewMode = 'list' | 'calendar' | 'map'
