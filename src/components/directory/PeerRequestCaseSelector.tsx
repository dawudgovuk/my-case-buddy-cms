import { Form } from 'react-bootstrap'
import { FaFileAlt, FaCalendarAlt } from 'react-icons/fa'
import type { FamilyCase } from '../../types/domain'
import { formatCaseOptionLabel, getCaseSelectionKey } from '../../utils/peerSupportRequestUtils'

export interface PeerRequestCaseSelectorProps {
  label: string
  proName: string
  cases: FamilyCase[]
  selectedCaseId: string
  selectedCase: FamilyCase | null
  onSelectCase: (caseId: string) => void
}

/**
 * Case dropdown with a snapshot of the selected case for the peer support request modal.
 */
export default function PeerRequestCaseSelector({
  label,
  proName,
  cases,
  selectedCaseId,
  selectedCase,
  onSelectCase,
}: PeerRequestCaseSelectorProps) {
  return (
    <Form.Group className="mb-3">
      <div className="d-flex align-items-center justify-content-between mb-1.5">
        <Form.Label className="fw-semibold text-dark small mb-0 d-inline-flex align-items-center gap-1.5">
          <FaFileAlt size={12} className="text-primary" />
          <span>{label}</span>
        </Form.Label>
        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
          Choose which case to share with {proName}
        </span>
      </div>

      <Form.Select
        value={selectedCaseId}
        onChange={(e) => onSelectCase(e.target.value)}
        className="form-select shadow-xs py-2 fw-medium text-dark"
        style={{ fontSize: '0.9rem', borderColor: '#cbd5e1' }}
      >
        {cases.map((c: FamilyCase) => (
          <option key={c.id} value={getCaseSelectionKey(c)}>
            {formatCaseOptionLabel(c)}
          </option>
        ))}
      </Form.Select>

      {/* Selected Case Snapshot Card */}
      {selectedCase && (
        <div
          className="mt-2 p-2.5 rounded-3 bg-light border d-flex align-items-center justify-content-between flex-wrap gap-2 small"
          style={{ fontSize: '0.8rem' }}
        >
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="badge bg-primary text-white px-2 py-0.5 rounded-pill fw-semibold">
              {selectedCase.caseNumber || 'Case'}
            </span>
            <span className="fw-bold text-dark">{selectedCase.title}</span>
            <span className="text-muted">&bull;</span>
            <span className="text-secondary">{selectedCase.court || 'Family Court'}</span>
            {selectedCase.currentStage && (
              <>
                <span className="text-muted">&bull;</span>
                <span className="text-primary fw-medium">{selectedCase.currentStage}</span>
              </>
            )}
          </div>
          <div className="text-muted d-flex align-items-center gap-1.5">
            <FaCalendarAlt size={10} />
            <span>Started: {selectedCase.startedAt || 'Active'}</span>
          </div>
        </div>
      )}
    </Form.Group>
  )
}
