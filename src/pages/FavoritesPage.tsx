import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import EventCard from '../components/EventCard'
import { EmptyState, ErrorBanner, PageHeading } from '../components/UI'
import { useData } from '../context/DataContext'

export default function FavoritesPage() {
  const { events, mySubmissions, favorites, loading, error } = useData()
  const saved = [...events, ...mySubmissions].filter((e) =>
    favorites.includes(e.id)
  )

  return (
    <div>
      <PageHeading
        eyebrow="Your collection"
        title="My favourites"
        description="All the events you've hearted, in one place. Tap the heart again on any event to remove it."
      />
      {error && <ErrorBanner message={error} />}
      {loading ? null : saved.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No favourites yet"
          description="Find an event you love and tap the heart to save it here for later."
          action={
            <Link to="/" className="btn-primary">
              Discover events
            </Link>
          }
        />
      )}
    </div>
  )
}
