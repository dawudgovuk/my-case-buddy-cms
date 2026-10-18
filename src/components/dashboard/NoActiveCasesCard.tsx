import { Card, Button } from 'react-bootstrap'
import { FaFolderPlus } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'

export interface NoActiveCasesCardProps {
  onCreateCase: () => void
}

/**
 * LIP dashboard empty state shown when the user owns no cases yet, prompting creation of the first case.
 */
export default function NoActiveCasesCard({ onCreateCase }: NoActiveCasesCardProps) {
  const { t } = useTranslation()

  return (
    <Card className="premium-card text-center p-5 border-0">
      <Card.Body className="py-5">
        <div
          className="d-flex align-items-center justify-content-center mx-auto rounded-circle bg-primary-subtle text-primary mb-3"
          style={{ width: 64, height: 64 }}
        >
          <FaFolderPlus size={28} />
        </div>
        <h3 className="mb-2 fw-bold text-dark">
          {t('lipDashboard.noActiveCasesTitle')}
        </h3>
        <p className="mb-4 text-muted" style={{ maxWidth: 440, margin: '0 auto' }}>
          {t('lipDashboard.noActiveCasesDesc')}
        </p>
        <Button
          className="btn-obsidian fw-semibold px-4 py-2 rounded-3 shadow-sm"
          size="lg"
          onClick={onCreateCase}
        >
          {t('lipDashboard.createFirstCaseBtn')}
        </Button>
      </Card.Body>
    </Card>
  )
}
