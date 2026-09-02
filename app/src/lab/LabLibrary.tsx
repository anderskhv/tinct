import './labRoutes.css'

export function LabLibrary() {
  return (
    <main className="lab-wireframe-surface" data-testid="lab-library">
      <iframe
        title="Tinct library"
        src="/lab-wireframe.html?embed=1&view=library"
      />
    </main>
  )
}
