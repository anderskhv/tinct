import { useState, useEffect, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import { clearLocalUserData } from '../services/storage'
import type { UserProfile } from '../types'
import { getAttributionPayload } from '../utils/attribution'
import { trackEvent } from '../utils/analytics'

interface UseAuthReturn {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  likelyAuthenticated: boolean
  isPasswordRecovery: boolean
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updatePassword: (newPassword: string) => Promise<{ error?: string }>
  clearPasswordRecovery: () => void
}

export function hasLikelySupabaseSession(): boolean {
  if (typeof window === 'undefined') return false
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !/^sb-.*-auth-token(\.\d+)?$/.test(key)) continue
      const raw = localStorage.getItem(key)
      if (raw && raw !== 'null' && raw !== '""') return true
    }
  } catch { /* ignore */ }
  try {
    return (document.cookie || '').split(';').some(cookie => cookie.trim() === 'tinct_auth=1')
  } catch {
    return false
  }
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [likelyAuthenticated, setLikelyAuthenticated] = useState(() => hasLikelySupabaseSession())
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data as UserProfile)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setIsLoading(false)
      return
    }

    // Mark-signed-in cookie is read by the Cloudflare Worker on GET / to
    // 302 signed-in users straight to /read before serving landing.html.
    // The client-side inline redirect in landing.html is belt-and-suspenders
    // for cookie-disabled browsers; the cookie makes the redirect
    // deterministic across mobile Safari, refreshed caches, and stale
    // localStorage edge cases that bit us before.
    const setSignedInCookie = () => {
      try {
        document.cookie = 'tinct_auth=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure'
      } catch { /* ignore */ }
    }
    const clearSignedInCookie = () => {
      try {
        document.cookie = 'tinct_auth=; Path=/; Max-Age=0; SameSite=Lax; Secure'
      } catch { /* ignore */ }
    }

    // Get initial session. Race against a 3s timeout so the app can open
    // offline — `getSession()` reads from localStorage but may still hang on
    // a network-bound token refresh, leaving `isLoading=true` forever and
    // blocking the entire downstream init chain (storage, position, render).
    let resolved = false
    const finishLoading = () => {
      if (resolved) return
      resolved = true
      setIsLoading(false)
    }
    const likelyAtStart = hasLikelySupabaseSession()
    setLikelyAuthenticated(likelyAtStart)
    const offlineTimeout = setTimeout(() => {
      console.warn('[useAuth] getSession() timed out — proceeding offline')
      finishLoading()
    }, likelyAtStart ? 12000 : 3000)
    supabase.auth.getSession()
      .then(({ data: { session: s } }) => {
        clearTimeout(offlineTimeout)
        setSession(s)
        setUser(s?.user ?? null)
        if (s?.user) {
          setLikelyAuthenticated(true)
          setSignedInCookie()
          fetchProfile(s.user.id)
        } else if (!hasLikelySupabaseSession()) {
          setLikelyAuthenticated(false)
          clearSignedInCookie()
        }
        finishLoading()
      })
      .catch((e) => {
        clearTimeout(offlineTimeout)
        console.warn('[useAuth] getSession() failed (likely offline):', e)
        finishLoading()
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, s) => {
        setSession(s)
        setUser(s?.user ?? null)
        if (s?.user) {
          setLikelyAuthenticated(true)
          setSignedInCookie()
          fetchProfile(s.user.id)
        } else {
          setLikelyAuthenticated(false)
          if (event === 'SIGNED_OUT') clearSignedInCookie()
          setProfile(null)
        }
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Auth not configured' }
    // Preserve the user's current page so the email-confirmation link returns
    // them to their book, not the landing page.
    const path = window.location.pathname === '/' ? '/read' : window.location.pathname
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${path}`,
        data: { attribution: getAttributionPayload() },
      },
    })
    if (error) return { error: error.message }
    trackEvent('signup_completed', { method: 'email', path })
    return {}
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Auth not configured' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    trackEvent('signin_completed', { method: 'email' })
    return {}
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return
    // Preserve the user's current location so OAuth doesn't bounce them to the
    // landing page. The SPA will process Supabase's OAuth URL fragment on
    // return, populate the session, and the user stays on their book.
    const path = window.location.pathname === '/' ? '/read' : window.location.pathname
    trackEvent('signup_started', { method: 'google', path })
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${path}` },
    })
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    clearLocalUserData()
    // Hard-redirect so React in-memory state (useLibrary, position, etc.)
    // can't re-persist wiped data on the next render. Lands on landing.html.
    window.location.href = '/'
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return { error: 'Auth not configured' }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}?reset-password=true`,
    })
    if (error) return { error: error.message }
    return {}
  }, [])

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!supabase) return { error: 'Auth not configured' }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { error: error.message }
    return {}
  }, [])

  const clearPasswordRecovery = useCallback(() => setIsPasswordRecovery(false), [])

  return {
    user,
    profile,
    session,
    isLoading,
    likelyAuthenticated,
    isPasswordRecovery,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
    resetPassword,
    updatePassword,
    clearPasswordRecovery,
  }
}
