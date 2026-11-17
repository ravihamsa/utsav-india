/** URL for a city's dedicated browse page ('all' means the home page). */
export function cityPath(city: string): string {
  return city && city !== 'all'
    ? `/city/${encodeURIComponent(city)}`
    : '/'
}

/** Reads the city from a city-page pathname, if we're on one. */
export function cityFromPath(pathname: string): string | null {
  const prefix = '/city/'
  if (!pathname.startsWith(prefix)) return null
  try {
    return decodeURIComponent(pathname.slice(prefix.length))
  } catch {
    return null
  }
}
