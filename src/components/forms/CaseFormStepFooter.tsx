import type { ReactNode } from 'react'
import { Card, Button } from 'react-bootstrap'
import { FaArrowRight } from 'react-icons/fa'

export interface CaseFormStepFooterProps {
  /** Content of the secondary (back/cancel) button. */
  backContent: ReactNode
  backClassName?: string
  onBack: () => void
  /** Label of the primary (continue) button, rendered with a trailing arrow. */
  nextLabel: string
  nextDisabled?: boolean
  onNext: () => void
}

/**
 * Footer card for a case wizard step with a back/cancel action and a continue action.
 */
export default function CaseFormStepFooter({
  backContent,
  backClassName,
  onBack,
  nextLabel,
  nextDisabled,
  onNext,
}: CaseFormStepFooterProps) {
  return (
    <Card className="p-3 border shadow-sm bg-white rounded-3">
      <div className="d-flex flex-column-reverse flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2">
        <Button variant="outline-secondary" className={backClassName} onClick={onBack}>
          {backContent}
        </Button>
        <Button
          variant="primary"
          className="px-4 fw-semibold d-flex align-items-center justify-content-center gap-2"
          onClick={onNext}
          disabled={nextDisabled}
        >
          <span>{nextLabel}</span>
          <FaArrowRight size={12} />
        </Button>
      </div>
    </Card>
  )
}
