interface ProactiveInsightProps {
  text: string
  onDiscuss: () => void
  onDismiss: () => void
}

export function ProactiveInsight({ text, onDiscuss, onDismiss }: ProactiveInsightProps) {
  return (
    <div className="proactive-insight">
      <div className="proactive-insight-dot" />
      <p className="proactive-insight-text">{text}</p>
      <div className="proactive-insight-actions">
        <button className="proactive-insight-discuss" onClick={onDiscuss}>
          Discuss
        </button>
        <button className="proactive-insight-dismiss" onClick={onDismiss}>
          &times;
        </button>
      </div>
    </div>
  )
}
