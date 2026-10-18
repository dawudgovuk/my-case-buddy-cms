import { Card, Button } from 'react-bootstrap'

export interface NoMatchingCasesCardProps {
  onClearFilters: () => void
}

/**
 * Dashboard empty state shown when search/status filters exclude every case.
 */
export default function NoMatchingCasesCard({ onClearFilters }: NoMatchingCasesCardProps) {
  return (
    <Card className="premium-card text-center p-5 border-0">
      <Card.Body className="py-4">
        <h6 className="fw-bold text-dark">No matching cases found</h6>
        <p className="small text-muted mb-3">
          Try adjusting your search query or status filter to see your active court cases.
        </p>
        <Button
          variant="light"
          className="btn-soft border px-3 py-1.5 small fw-semibold"
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      </Card.Body>
    </Card>
  )
}
