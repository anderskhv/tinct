interface PanelToggleTabProps {
  isOpen: boolean
  onClick: () => void
}

export function PanelToggleTab({ isOpen, onClick }: PanelToggleTabProps) {
  return (
    <button
      className={`panel-toggle-tab ${isOpen ? 'panel-toggle-tab-open' : ''}`}
      onClick={onClick}
      title={isOpen ? 'Close panel' : 'Open panel'}
    >
      <span className="panel-toggle-tab-text">Tinct</span>
    </button>
  )
}
