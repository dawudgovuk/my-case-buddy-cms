import { Card } from 'react-bootstrap'
import { FaBalanceScale } from 'react-icons/fa'

export interface DirectoryEmptyStateProps {
  onClearFilters: () => void
}

/**
 * Empty state shown when no directory professionals match the current search / role filter.
 */
export default function DirectoryEmptyState({ onClearFilters }: DirectoryEmptyStateProps) {
  return (
    <Card className="premium-card text-center p-5 border-0 shadow-sm">
      <Card.Body className="py-4">
        <div
          className="d-flex align-items-center justify-content-center mx-auto rounded-circle bg-light text-muted mb-3"
          style={{ width: 64, height: 64 }}
        >
          <FaBalanceScale size={28} />
        </div>
        <h5 className="fw-bold text-dark mb-1">No legal professionals found</h5>
        <p className="text-muted small mb-3" style={{ maxWidth: 420, margin: '0 auto' }}>
          We could not find any verified professionals matching your current search query or role filter.
        </p>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm px-3 py-1.5 rounded-pill fw-semibold"
          onClick={onClearFilters}
        >
          Clear Filters
        </button>
      </Card.Body>
    </Card>
  )
}
