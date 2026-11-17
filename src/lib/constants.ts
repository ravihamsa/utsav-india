import type { Category, EventFilters } from './types'

export interface CategoryMeta {
  value: Category
  label: string
  color: string
  soft: string
  emoji: string
}

export const CATEGORIES: CategoryMeta[] = [
  { value: 'music', label: 'Music', color: '#ea580c', soft: '#fff1e6', emoji: '🎵' },
  { value: 'food', label: 'Food', color: '#b45309', soft: '#fef3c7', emoji: '🍜' },
  { value: 'tech', label: 'Tech', color: '#0d9488', soft: '#ccfbf1', emoji: '💻' },
  { value: 'culture', label: 'Culture', color: '#dc2626', soft: '#fee2e2', emoji: '🎭' },
  { value: 'sports', label: 'Sports', color: '#16a34a', soft: '#dcfce7', emoji: '🏏' },
  { value: 'arts', label: 'Arts', color: '#e11d48', soft: '#ffe4e6', emoji: '🎨' },
  { value: 'community', label: 'Community', color: '#2563eb', soft: '#dbeafe', emoji: '🤝' },
  { value: 'other', label: 'Other', color: '#64748b', soft: '#f1f5f9', emoji: '✨' },
]

export const CATEGORY_MAP: Record<Category, CategoryMeta> = CATEGORIES.reduce(
  (acc, item) => {
    acc[item.value] = item
    return acc
  },
  {} as Record<Category, CategoryMeta>
)

export const INTERESTS = CATEGORIES.map((c) => c.value)

export interface CityMeta {
  name: string
  state: string
  lat: number
  lng: number
}

export const CITIES: CityMeta[] = [
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
  { name: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
  { name: 'Goa', state: 'Goa', lat: 15.2993, lng: 74.124 },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { name: 'Chandigarh', state: 'Punjab', lat: 30.7333, lng: 76.7794 },
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
]

export const CITY_MAP: Record<string, CityMeta> = CITIES.reduce(
  (acc, city) => {
    acc[city.name] = city
    return acc
  },
  {} as Record<string, CityMeta>
)

export const DEFAULT_FILTERS: EventFilters = {
  query: '',
  city: 'all',
  category: 'all',
  fromDate: '',
  toDate: '',
  price: 'all',
  sort: 'soonest',
}

export const REMINDER_OPTIONS = [
  { value: 15, label: '15 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
  { value: 2880, label: '2 days before' },
  { value: 10080, label: '1 week before' },
]

export const INDIA_CENTER: [number, number] = [22.5, 79]
