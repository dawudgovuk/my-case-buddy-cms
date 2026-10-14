import { Modal, Button } from 'react-bootstrap'
import { FaTrash, FaExclamationTriangle, FaTimes } from 'react-icons/fa'

export interface DeleteCaseModalProps {
  show: boolean
  caseId: string
  caseTitle: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteCaseModal({
  show,
  caseId,
  caseTitle,
  onConfirm,
  onCancel,
}: DeleteCaseModalProps) {
  return (
    <Modal show={show} onHide={onCancel} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center"
            style={{ width: 36, height: 36 }}
          >
            <FaExclamationTriangle size={18} />
          </div>
          <Modal.Title className="h5 fw-bold text-dark mb-0">Confirm Case Deletion</Modal.Title>
        </div>
      </Modal.Header>

      <Modal.Body className="py-3">
        <p className="text-secondary mb-2">
          Are you sure you want to delete this court case? All associated hearing records, parties, and uploaded bundles will be permanently removed.
        </p>

        <div className="p-3 bg-light rounded-3 border mb-2">
          <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.72rem' }}>
            Case to be Deleted:
          </div>
          <div className="fw-bold text-dark">{caseTitle || '(Untitled Case)'}</div>
          <div className="text-muted small font-monospace">Reference ID: {caseId}</div>
        </div>

        <div className="small text-danger fw-semibold">
          Warning: This action cannot be undone.
        </div>
      </Modal.Body>

      <Modal.Footer className="border-top-0 pt-0">
        <Button variant="outline-secondary" size="sm" onClick={onCancel} className="px-3">
          <FaTimes className="me-1" size={12} />
          Cancel
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} className="px-3 fw-semibold shadow-xs">
          <FaTrash className="me-1" size={12} />
          Delete Case
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
