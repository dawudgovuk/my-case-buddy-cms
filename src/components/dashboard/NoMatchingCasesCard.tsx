import { Card, Button } from 'react-bootstrap'
import { useTranslation } from '../../hooks/useTranslation'

export interface NoMatchingCasesCardProps {
  onClearFilters: () => void
}

/**
 * Dashboard empty state shown when search/status filters exclude every case.
 */
export default function NoMatchingCasesCard({ onClearFilters }: NoMatchingCasesCardProps) {
  const { t } = useTranslation()

  return (
    <Card className="premium-card text-center p-5 border-0">
      <Card.Body className="py-4">
        <h6 className="fw-bold text-dark">{t('dashboard.noCasesMatch')}</h6>
        <p className="small text-muted mb-3">
          {t('dashboard.noActiveCasesSubtext')}
        </p>
        <Button
          variant="light"
          className="btn-soft border px-3 py-1.5 small fw-semibold"
          onClick={onClearFilters}
        >
          {t('dashboard.clearFilters')}
        </Button>
      </Card.Body>
    </Card>
  )
}
