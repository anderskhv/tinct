import { supabase } from './services/supabase'
const status = document.querySelector<HTMLElement>('#status')!
const signIn = document.querySelector<HTMLElement>('#signin')!
async function openPreview() {
 try {
  const session = await supabase?.auth.getSession()
  const token = session?.data.session?.access_token
  if (!token) { status.textContent = 'Sign in with your admin account to view this design.'; signIn.hidden = false; return }
  const response = await fetch('/api/featured-preview', { headers: { Authorization: 'Bearer ' + token }, cache: 'no-store' })
  if (!response.ok) { status.textContent = response.status === 403 ? 'This preview is available to site administrators.' : 'The preview could not load. Please reload to try again.'; return }
  const frame = document.createElement('iframe')
  frame.title = 'Featured books design preview'
  frame.srcdoc = await response.text()
  document.querySelector('#gate')!.remove()
  document.body.append(frame)
 } catch { status.textContent = 'The preview could not load. Please reload to try again.' }
}
void openPreview()
