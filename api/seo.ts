export const config = { runtime: 'edge' }

const SITE_NAME = 'Utsav India'
const DEFAULT_TITLE = 'Utsav India — Discover Events Across India'
const DEFAULT_DESCRIPTION =
  'Discover concerts, food festivals, tech meets, cultural nights and sports events across India. Browse upcoming events by city, date and category in a list, on a calendar or on the map.'
const DEFAULT_IMAGE = '/og-image.png'

type PageMeta = {
  title: string
  description: string
  image: string
  url: string
  type: 'website' | 'article'
  robots: string
  jsonLd?: Record<string, unknown>
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function absolute(origin: string, path?: string | null): string {
  if (!path) return `${origin}${DEFAULT_IMAGE}`
  if (/^https?:\/\//i.test(path)) return path
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

function snippet(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean
}

function cityFromPath(pathname: string): string | null {
  const prefix = '/city/'
  if (!pathname.startsWith(prefix)) return null
  try {
    return decodeURIComponent(pathname.slice(prefix.length))
  } catch {
    return null
  }
}

async function fetchEvent(id: string, origin: string): Promise<Record<string, any> | null> {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key || url.includes('supabase.com/dashboard')) return null
  try {
    const response = await fetch(
      `${url.replace(/\/+$/, '')}/rest/v1/events?id=eq.${encodeURIComponent(id)}` +
        '&select=id,title,description,image_url,city,venue_name,starts_at,ends_at,' +
        'organizer_name,is_free,price,status,latitude,longitude&limit=1',
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Accept: 'application/json',
        },
      }
    )
    if (!response.ok) return null
    const rows = await response.json()
    const event = Array.isArray(rows) ? rows[0] : null
    return event && typeof event === 'object' ? event : null
  } catch {
    return null
  }
}

function eventJsonLd(event: Record<string, any>, origin: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: snippet(event.description ?? ''),
    startDate: event.starts_at,
    ...(event.ends_at ? { endDate: event.ends_at } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: [absolute(origin, event.image_url)],
    url: `${origin}/events/${event.id}`,
    location: {
      '@type': 'Place',
      name: event.venue_name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.city,
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: event.latitude,
        longitude: event.longitude,
      },
    },
    organizer: { '@type': 'Organization', name: event.organizer_name },
    offers: {
      '@type': 'Offer',
      price: event.is_free ? 0 : event.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
  }
}

async function metaFor(pathname: string, origin: string): Promise<PageMeta> {
  const base: PageMeta = {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    image: absolute(origin, DEFAULT_IMAGE),
    url: `${origin}${pathname}`,
    type: 'website',
    robots: 'index, follow',
  }

  if (pathname === '/') {
    return {
      ...base,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: origin,
        description: DEFAULT_DESCRIPTION,
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${origin}/?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    }
  }

  const city = cityFromPath(pathname)
  if (city) {
    return {
      ...base,
      title: `Events in ${city} | ${SITE_NAME}`,
      description: `Discover upcoming events in ${city} — music, food, culture, tech, sports and more. Browse what's on in ${city}, India on Utsav India.`,
      url: `${origin}/city/${encodeURIComponent(city)}`,
    }
  }

  const eventMatch = pathname.match(/^\/events\/([^/]+)\/?$/)
  if (eventMatch) {
    const event = await fetchEvent(decodeURIComponent(eventMatch[1]), origin)
    if (event) {
      const isPublic = event.status === 'approved'
      return {
        title: `${event.title} | ${SITE_NAME}`,
        description: snippet(
          event.description || `${event.title} at ${event.venue_name}, ${event.city}.`
        ),
        image: absolute(origin, event.image_url),
        url: `${origin}/events/${event.id}`,
        type: 'article',
        robots: isPublic ? 'index, follow' : 'noindex, nofollow',
        jsonLd: isPublic ? eventJsonLd(event, origin) : undefined,
      }
    }
    return {
      ...base,
      title: `Event not found | ${SITE_NAME}`,
      robots: 'noindex, nofollow',
    }
  }

  // Private / utility pages shouldn't compete with public event pages.
  return {
    ...base,
    title: pathname === '/submit' ? `Submit an event | ${SITE_NAME}` : DEFAULT_TITLE,
    description:
      pathname === '/submit'
        ? 'Submit your event to Utsav India and share it with people across the country.'
        : DEFAULT_DESCRIPTION,
    robots: 'noindex, nofollow',
  }
}

function renderHead(meta: PageMeta): string {
  const jsonLd = meta.jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c')}</script>`
    : ''
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const image = escapeHtml(meta.image)
  const url = escapeHtml(meta.url)

  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="${meta.robots}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:type" content="${meta.type}" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="${title}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    ${jsonLd}`
}

export default async function handler(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url)
  const configuredSite = process.env.VITE_SITE_URL || process.env.SITE_URL
  const origin = (configuredSite?.trim() || requestUrl.origin).replace(/\/+$/, '')

  const [meta, htmlResponse] = await Promise.all([
    metaFor(requestUrl.pathname, origin),
    fetch(`${requestUrl.origin}/index.html`),
  ])
  const html = await htmlResponse.text()
  const output = html.replace(
    /<!-- SEO_START -->[\s\S]*?<!-- SEO_END -->/,
    () => `<!-- SEO_START -->${renderHead(meta)}<!-- SEO_END -->`
  )

  return new Response(output, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
