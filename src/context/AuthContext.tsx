import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ensureProfile, loadProfile, saveProfile } from '../lib/dataService'
import { readLocal, removeLocal, writeLocal } from '../lib/storage'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'

export interface AppUser {
  id: string
  email: string
}

interface AuthContextValue {
  user: AppUser | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string,
    fullName: string,
    interests: string[]
  ) => Promise<{ needsConfirmation: boolean }>
  signOut: () => Promise<void>
  updateProfile: (patch: Partial<Pick<Profile, 'full_name' | 'interests'>>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function localUserId(email: string) {
  return `local:${email.toLowerCase()}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const hydrateProfile = useCallback(async (currentUser: AppUser) => {
    try {
      let p = await loadProfile(currentUser.id)
      if (!p) p = await ensureProfile(currentUser)
      setProfile(p)
    } catch (error) {
      console.warn('Could not load profile', error)
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function init() {
      if (!supabase) {
        const stored = readLocal<AppUser | null>('user', null)
        if (stored && active) {
          setUser(stored)
          await hydrateProfile(stored)
        }
        setLoading(false)
        return
      }

      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user
      const mapped = sessionUser
        ? { id: sessionUser.id, email: sessionUser.email ?? '' }
        : null
      if (!active) return
      setUser(mapped)
      if (mapped) await hydrateProfile(mapped)
      setLoading(false)
    }

    init().catch(() => {
      if (active) setLoading(false)
    })

    let unsubscribe: (() => void) | undefined
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const next = session?.user
          ? { id: session.user.id, email: session.user.email ?? '' }
          : null
        setUser(next)
        if (next) void hydrateProfile(next)
        else setProfile(null)
        setLoading(false)
      })
      unsubscribe = data.subscription.unsubscribe
    }

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [hydrateProfile])

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!email.includes('@') || password.length < 6) {
        throw new Error('Enter a valid email and a password of at least 6 characters.')
      }
      if (!supabase) {
        const next = { id: localUserId(email), email }
        await ensureProfile({
          ...next,
          fullName: email.includes('admin')
            ? 'Meera Iyer'
            : email.split('@')[0].replace(/[._-]/g, ' '),
        })
        if (email.includes('admin')) {
          const p = await loadProfile(next.id)
          if (p) {
            writeLocal(`profile:${next.id}`, { ...p, is_admin: true })
          }
        }
        writeLocal('user', next)
        setUser(next)
        await hydrateProfile(next)
        return
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    [hydrateProfile]
  )

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      interests: string[]
    ): Promise<{ needsConfirmation: boolean }> => {
      if (!email.includes('@') || password.length < 6) {
        throw new Error('Enter a valid email and a password of at least 6 characters.')
      }
      if (!fullName.trim()) throw new Error('Please tell us your name.')
      if (!supabase) {
        const next = { id: localUserId(email), email }
        const p: Profile = {
          id: next.id,
          email,
          full_name: fullName.trim(),
          interests,
          is_admin: email.includes('admin'),
          created_at: new Date().toISOString(),
        }
        writeLocal(`profile:${next.id}`, p)
        writeLocal('user', next)
        setUser(next)
        setProfile(p)
        return { needsConfirmation: false }
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName.trim(), interests } },
      })
      if (error) throw error
      if (!data.session) return { needsConfirmation: true }
      return { needsConfirmation: false }
    },
    []
  )

  const signOut = useCallback(async () => {
    if (!supabase) {
      removeLocal('user')
      setUser(null)
      setProfile(null)
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
  }, [])

  const updateProfile = useCallback(
    async (patch: Partial<Pick<Profile, 'full_name' | 'interests'>>) => {
      if (!user || !profile) throw new Error('You need to be signed in.')
      const next = { ...profile, ...patch }
      await saveProfile(next)
      setProfile(next)
    },
    [profile, user]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isAdmin: Boolean(profile?.is_admin),
      signIn,
      signUp,
      signOut,
      updateProfile,
    }),
    [user, profile, loading, signIn, signUp, signOut, updateProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
