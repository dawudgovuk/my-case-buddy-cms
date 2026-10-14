import { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import type { FamilyCase } from '../../types/domain'
import { FaPaperPlane } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'

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
  const { t } = useTranslation()
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
        <Modal.Title className="h5">{t('peerDirectory.requestModalTitle')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {cases.length === 0 ? (
          <Alert variant="warning">
            {t('peerDirectory.noCasesWarning')}
          </Alert>
        ) : (
          <div>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">{t('peerDirectory.selectCaseLabel')}</Form.Label>
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
              <Form.Label className="fw-bold">{t('peerDirectory.helpNeededLabel')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={t('peerDirectory.helpNeededPlaceholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Form.Group>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        {cases.length > 0 && (
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={!selectedCaseId}
            className="d-flex align-items-center gap-2"
          >
            <FaPaperPlane />
            <span>{t('peerDirectory.sendRequestBtn')}</span>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}
