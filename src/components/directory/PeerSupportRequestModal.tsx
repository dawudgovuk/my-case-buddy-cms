import { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import type { FamilyCase } from '../../types/domain'
import { FaPaperPlane } from 'react-icons/fa'

export interface PeerSupportRequestModalProps {
  show: boolean
  targetUserId: string | null
  cases: FamilyCase[]
  onSendRequest: (caseId: string, note: string) => void
  onCancel: () => void
}

/**
 * Accessible modal dialog for litigants to request peer support on a specific case.
 */
export default function PeerSupportRequestModal({
  show,
  targetUserId,
  cases,
  onSendRequest,
  onCancel,
}: PeerSupportRequestModalProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('')
  const [note, setNote] = useState<string>('')

  useEffect(() => {
    if (show && cases.length > 0) {
      setSelectedCaseId(cases[0].id)
      setNote('')
    }
  }, [show, cases])

  function handleSend() {
    if (!selectedCaseId) return
    onSendRequest(selectedCaseId, note.trim())
  }

  return (
    <Modal show={show && Boolean(targetUserId)} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5">Request Peer Support on Case</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {cases.length === 0 ? (
          <Alert variant="warning">
            You do not have any active cases yet. Please create a case first to request peer support.
          </Alert>
        ) : (
          <div>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Select Your Case</Form.Label>
              <Form.Select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
              >
                {cases.map((c: FamilyCase) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.title} ({c.caseType})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">What help or advice do you need?</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="e.g. Need peer review of draft statement, help understanding court directions, bundle indexing..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Form.Group>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        {cases.length > 0 && (
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={!selectedCaseId}
            className="d-flex align-items-center gap-2"
          >
            <FaPaperPlane />
            <span>Send Request</span>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}
