import { LabApp } from './LabApp'
import { LabLanding } from './LabLanding'
import { LabLibrary } from './LabLibrary'
import { labSurface } from './labRoute'

export function LabRouter() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/lab/phone'
  const surface = labSurface(pathname)
  if (surface === 'landing') return <LabLanding />
  if (surface === 'library') return <LabLibrary />
  return <LabApp pathname={pathname} />
}
