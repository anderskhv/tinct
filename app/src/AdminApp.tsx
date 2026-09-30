import { AdminMetricsDashboard } from './components/AdminMetricsDashboard'
import { useAuth } from './hooks/useAuth'
import { labSignInHref } from './lab/labAccountPrompt'

/** The private /admin/metrics page. Access is enforced by Supabase RLS; the route is noindex. */
export default function AdminApp() {
  const { session } = useAuth()
  return (
    <AdminMetricsDashboard
      session={session}
      onSignIn={() => window.location.assign(labSignInHref('signin', '/admin/metrics'))}
    />
  )
}
