/**
 * End the Supabase session on this device whatever the server answers. After an account is deleted the server no
 * longer knows the session and refuses the sign-out (403); supabase-js then keeps the stored session, and the
 * reader looked signed in to a deleted account (Anders, 2 Nov 2026). The local sign-out needs no server.
 */
export async function endSession(auth: { signOut: (options?: { scope?: 'global' | 'local' | 'others' }) => Promise<{ error: unknown }> } | null | undefined): Promise<void> {
  if (!auth) return
  let ended = false
  try { ended = !(await auth.signOut()).error } catch { /* the local sign-out below */ }
  if (!ended) { try { await auth.signOut({ scope: 'local' }) } catch { /* the caller's device wipe still runs */ } }
}
