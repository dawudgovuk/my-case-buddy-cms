import { FaCheck } from 'react-icons/fa'

export interface WelcomeStepsProps {
  /** Step labels, in order. */
  steps: readonly string[]
  /** Zero-based index of the step the user is on; earlier steps show as done. */
  currentIndex: number
}

/** Compact horizontal progress indicator for onboarding. */
export default function WelcomeSteps({ steps, currentIndex }: WelcomeStepsProps) {
  return (
    <ol className="welcome-steps" aria-label="Progress">
      {steps.map((label, i) => {
        const state = i < currentIndex ? 'is-done' : i === currentIndex ? 'is-current' : ''
        return (
          <li key={label} className={`welcome-step ${state}`} aria-current={i === currentIndex ? 'step' : undefined}>
            <span className="welcome-step-dot">{i < currentIndex ? <FaCheck size={12} aria-hidden /> : i + 1}</span>
            <span>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
