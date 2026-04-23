import { useState, useEffect, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import type { UserProfile } from '../types'

interface UseAuthReturn {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
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

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) fetchProfile(s.user.id)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, s) => {
        setSession(s)
        setUser(s?.user ?? null)
        if (s?.user) fetchProfile(s.user.id)
        else setProfile(null)
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
      options: { emailRedirectTo: `${window.location.origin}${path}` },
    })
    if (error) return { error: error.message }
    return {}
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Auth not configured' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return
    // Preserve the user's current location so OAuth doesn't bounce them to the
    // landing page. The SPA will process Supabase's OAuth URL fragment on
    // return, populate the session, and the user stays on their book.
    const path = window.location.pathname === '/' ? '/read' : window.location.pathname
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${path}` },
    })
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
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
