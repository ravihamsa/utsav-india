import { useEffect } from 'react'
import { applySeo, type SeoOptions } from '../lib/seo'

/** Apply route-specific metadata; stringify so freshly built objects don't re-run it. */
export function useSeo(options: SeoOptions): void {
  const key = JSON.stringify(options)

  useEffect(() => {
    applySeo(JSON.parse(key) as SeoOptions)
  }, [key])
}

/** Account/utility pages should not appear in search results. */
export function usePrivateSeo(title: string, description: string): void {
  useSeo({ title, description, noindex: true })
}
