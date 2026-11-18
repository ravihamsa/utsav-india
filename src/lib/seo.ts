export const SITE_NAME = 'Utsav India'

export const DEFAULT_TITLE = 'Utsav India — Discover Events Across India'

export const DEFAULT_DESCRIPTION =
  'Discover concerts, food festivals, tech meets, cultural nights and sports events across India. Browse upcoming events by city, date and category in a list, on a calendar or on the map.'

export const DEFAULT_IMAGE = '/og-image.png'

export type SeoType = 'website' | 'article'

export interface SeoOptions {
  title: string
  description: string
  path?: string
  image?: string | null
  type?: SeoType
  noindex?: boolean
  jsonLd?: Record<string, unknown> | null
}

export const DEFAULT_SITE_URL = 'https://utsav-india.vercel.app'

/** Public site URL used for canonical and social tags. Override with VITE_SITE_URL. */
export function getSiteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL as string | undefined
  const base = configured?.trim() || DEFAULT_SITE_URL
  return base.replace(/\/+$/, '')
}

export function absoluteUrl(path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${getSiteUrl()}${clean}`
}

export function absoluteImageUrl(image?: string | null): string {
  if (!image) return absoluteUrl(DEFAULT_IMAGE)
  if (/^https?:\/\//i.test(image)) return image
  return absoluteUrl(image.startsWith('/') ? image : `/${image}`)
}

export function seoSnippet(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`
  )
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function setCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  )
  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.appendChild(element)
  }
  element.href = url
}

function setJsonLd(data: Record<string, unknown> | null | undefined) {
  const id = 'seo-json-ld'
  document.getElementById(id)?.remove()
  if (!data) return
  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

/** Keeps <head> metadata in sync with the current client-side route. */
export function applySeo(options: SeoOptions): void {
  const title = options.title.includes(SITE_NAME)
    ? options.title
    : `${options.title} | ${SITE_NAME}`
  const description = seoSnippet(options.description)
  const url = absoluteUrl(options.path ?? window.location.pathname)
  const image = absoluteImageUrl(options.image)

  document.title = title
  setMeta('name', 'description', description)
  setMeta('name', 'robots', options.noindex ? 'noindex, nofollow' : 'index, follow')
  setMeta('property', 'og:site_name', SITE_NAME)
  setMeta('property', 'og:type', options.type ?? 'website')
  setMeta('property', 'og:locale', 'en_IN')
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', url)
  setMeta('property', 'og:image', image)
  setMeta('property', 'og:image:alt', title)
  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)
  setMeta('name', 'twitter:image', image)
  setCanonical(url)
  setJsonLd(options.jsonLd)
}
