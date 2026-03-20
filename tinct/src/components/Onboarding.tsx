import { useState } from 'react'

interface OnboardingProps {
  onComplete: (objective: string) => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [objective, setObjective] = useState('')

  const handleStart = () => {
    onComplete(objective.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleStart()
    }
  }

  return (
    <div className="onboarding">
      <div className="onboarding-card">
        <h1 className="onboarding-heading">Welcome to Tinct</h1>

        <div className="onboarding-features">
          <p className="onboarding-intro">
            A reading companion for deep engagement with literary classics.
          </p>

          <ul className="onboarding-list">
            <li>
              <strong>Multiple versions</strong> — read in the original, modern English, a kids' edition, or Danish. Switch anytime.
            </li>
            <li>
              <strong>Split-pane view</strong> — compare two versions side by side, paragraph by paragraph, like No Fear Shakespeare.
            </li>
            <li>
              <strong>AI companion</strong> — highlight any passage to get context, explanation, and connections. Or just ask a question.
            </li>
            <li>
              <strong>Highlights & notes</strong> — mark passages in five colors, take notes, and build a reading journal as you go.
            </li>
          </ul>
        </div>

        <div className="onboarding-objective">
          <label className="onboarding-label" htmlFor="reading-objective">
            What's your reading angle?
          </label>
          <p className="onboarding-sublabel">
            Optional — helps the AI connect ideas to what interests you most.
          </p>
          <textarea
            id="reading-objective"
            className="onboarding-input"
            value={objective}
            onChange={e => setObjective(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='e.g. "Leadership and decision-making", "Mythology and religion", "How ancient themes echo in modern life"'
            rows={3}
          />
        </div>

        <button className="onboarding-start" onClick={handleStart}>
          Start reading
        </button>
      </div>
    </div>
  )
}
