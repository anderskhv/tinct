import './labRoutes.css'

export function LabLanding() {
  return (
    <main className="lab-wireframe-surface" data-testid="lab-landing">
      <iframe
        title="Tinct landing"
        src="/lab-wireframe.html?embed=1&view=landing"
      />
    </main>
  )
}
