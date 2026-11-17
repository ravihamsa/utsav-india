import { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cityPath } from '../lib/navigation'

/** Navigate to a city page while keeping the other browse filters in the URL. */
export function useCityNavigate() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  return useCallback(
    (city: string) => {
      const next = new URLSearchParams(params)
      next.delete('city')
      navigate({ pathname: cityPath(city), search: next.toString() })
    },
    [navigate, params]
  )
}
