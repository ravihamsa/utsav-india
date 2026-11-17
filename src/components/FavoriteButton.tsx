import { Heart } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'

interface Props {
  eventId: string
  showLabel?: boolean
  className?: string
}

export default function FavoriteButton({
  eventId,
  showLabel = false,
  className = '',
}: Props) {
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useData()
  const { show } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const saved = isFavorite(eventId)

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      show('Sign in to save favourites.', 'info')
      navigate('/signin', {
        state: { from: location.pathname + location.search },
      })
      return
    }
    try {
      await toggleFavorite(eventId)
      show(saved ? 'Removed from favourites.' : 'Saved to your favourites!')
    } catch (error) {
      show(
        error instanceof Error ? error.message : 'Could not update favourites.',
        'error'
      )
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={saved ? 'Remove from favourites' : 'Save to favourites'}
      aria-label={saved ? 'Remove from favourites' : 'Save to favourites'}
      className={`group inline-flex items-center gap-1.5 rounded-lg font-bold transition ${
        showLabel ? 'border border-ink-800/10 bg-white px-3 py-2 text-xs' : 'p-2'
      } ${className}`}
    >
      <Heart
        className={`h-[18px] w-[18px] transition ${
          saved
            ? 'fill-spice-600 text-spice-600'
            : 'text-ink-500 group-hover:text-spice-600'
        }`}
      />
      {showLabel && (
        <span className={saved ? 'text-spice-700' : 'text-ink-700'}>
          {saved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  )
}
