import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// A very common mistake is pasting the dashboard URL
// (https://supabase.com/dashboard/org/...) instead of the API URL
// (https://<project-ref>.supabase.co). Requests to the dashboard fail CORS.
const isDashboardUrl = Boolean(url?.includes('supabase.com/dashboard'))

if (isDashboardUrl) {
  console.error(
    'VITE_SUPABASE_URL is the Supabase dashboard URL. Use Project Settings → API → Project URL (https://<project-ref>.supabase.co) instead.'
  )
}
if (anonKey?.includes('service_role')) {
  console.error(
    'VITE_SUPABASE_ANON_KEY contains a service_role key. Use the anon/public key only.'
  )
}

export const isSupabaseConfigured = Boolean(
  url &&
    anonKey &&
    !isDashboardUrl &&
    !url.includes('your-project') &&
    !anonKey.includes('your-anon')
)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'utsav-auth',
      },
    })
  : null
