import { Card, Button } from 'react-bootstrap'
import { FaFolderPlus, FaSearchMinus, FaTimes } from 'react-icons/fa'

export interface EmptyCasesStateProps {
  isFiltered: boolean
  searchTerm?: string
  onReset?: () => void
  onNewCase?: () => void
  className?: string
}

export default function EmptyCasesState({
  isFiltered,
  searchTerm,
  onReset,
  onNewCase,
  className = '',
}: EmptyCasesStateProps) {
  if (isFiltered) {
    return (
      <Card className={`border shadow-sm bg-white text-center p-5 rounded-3 ${className}`}>
        <div
          className="mx-auto rounded-circle bg-light text-secondary d-flex align-items-center justify-content-center mb-3"
          style={{ width: 56, height: 56 }}
        >
          <FaSearchMinus size={24} />
        </div>
        <h5 className="fw-bold text-dark mb-1">No Matching Cases Found</h5>
        <p className="text-muted small mb-3" style={{ maxWidth: 420, margin: '0 auto' }}>
          {searchTerm
            ? `No proceedings match your search for "${searchTerm}" under the selected filters.`
            : 'No proceedings match the currently selected filter options.'}
        </p>
        {onReset && (
          <div>
            <Button variant="outline-primary" size="sm" onClick={onReset} className="px-3">
              <FaTimes className="me-1" size={11} />
              Reset All Filters
            </Button>
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card className={`border shadow-sm bg-white text-center p-5 rounded-3 ${className}`}>
      <div
        className="mx-auto rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center mb-3"
        style={{ width: 64, height: 64 }}
      >
        <FaFolderPlus size={28} />
      </div>
      <h4 className="fw-bold text-dark mb-1">No Cases Registered Yet</h4>
      <p className="text-muted small mb-4" style={{ maxWidth: 460, margin: '0 auto' }}>
        Start tracking your family court proceedings, listing parties and children, managing hearing directions, and sharing access with legal supporters.
      </p>
      {onNewCase && (
        <div>
          <Button
            variant="primary"
            size="lg"
            className="fw-semibold px-4 py-2 rounded-3 shadow-sm"
            onClick={onNewCase}
          >
            <FaFolderPlus className="me-2" size={16} />
            Create Your First Case
          </Button>
        </div>
      )}
    </Card>
  )
}
