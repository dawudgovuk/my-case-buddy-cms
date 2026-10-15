import { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap'
import type { FamilyCase, User } from '../../types/domain'
import { FaPaperPlane, FaBuilding, FaIdCard } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'

export interface PeerSupportRequestModalProps {
  show: boolean
  targetUserId: string | null
  targetProfessional?: User | null
  cases: FamilyCase[]
  isSubmitting?: boolean
  onSendRequest: (caseId: string, note: string, targetProfessional?: User | null) => Promise<void> | void
  onCancel: () => void
}

/**
 * Accessible modal dialog for litigants to request peer support on a specific case.
 */
export default function PeerSupportRequestModal({
  show,
  targetUserId,
  targetProfessional,
  cases,
  isSubmitting = false,
  onSendRequest,
  onCancel,
}: PeerSupportRequestModalProps) {
  const { t } = useTranslation()
  const [selectedCaseId, setSelectedCaseId] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [internalSubmitting, setInternalSubmitting] = useState<boolean>(false)
  const [modalError, setModalError] = useState<string | null>(null)

  useEffect(() => {
    if (show && cases.length > 0) {
      setSelectedCaseId(cases[0].documentId || cases[0].id)
      setNote('')
      setModalError(null)
    }
  }, [show, cases])

  async function handleSend() {
    if (!selectedCaseId) return
    setInternalSubmitting(true)
    setModalError(null)
    try {
      await onSendRequest(selectedCaseId, note.trim(), targetProfessional)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send peer support request'
      setModalError(msg)
    } finally {
      setInternalSubmitting(false)
    }
  }

  const proName = targetProfessional?.name || targetUserId || 'Legal Supporter'
  const proRole = targetProfessional?.role || 'Legal Supporter'
  const submitting = isSubmitting || internalSubmitting

  return (
    <Modal show={show && Boolean(targetUserId)} onHide={onCancel} centered>
      <Modal.Header closeButton className="border-bottom pb-3">
        <div>
          <Modal.Title className="h5 fw-bold mb-1">{t('peerDirectory.requestModalTitle')}</Modal.Title>
          <div className="text-muted small">
            Connect with {proName} for peer review and court guidance.
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className="py-3">
        {/* Recipient Profile Summary Card */}
        {targetProfessional && (
          <div className="p-3 mb-3 bg-light rounded-3 border d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                style={{ width: 40, height: 40, fontSize: '0.9rem' }}
              >
                {targetProfessional.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <div className="fw-bold text-dark">{targetProfessional.name}</div>
                <div className="d-flex align-items-center gap-2 small text-muted">
                  <Badge bg="primary-subtle" text="primary" className="border border-primary-subtle">
                    {proRole}
                  </Badge>
                  {targetProfessional.firm && (
                    <span className="d-inline-flex align-items-center gap-1">
                      <FaBuilding size={10} />
                      <span>{targetProfessional.firm}</span>
                    </span>
                  )}
                  {targetProfessional.registrationNumber && (
                    <span className="d-inline-flex align-items-center gap-1">
                      <FaIdCard size={10} />
                      <span>{targetProfessional.registrationNumber}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {modalError && (
          <Alert variant="danger" dismissible onClose={() => setModalError(null)} className="mb-3">
            {modalError}
          </Alert>
        )}

        {cases.length === 0 ? (
          <Alert variant="warning" className="mb-0">
            {t('peerDirectory.noCasesWarning')}
          </Alert>
        ) : (
          <div>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">{t('peerDirectory.selectCaseLabel')}</Form.Label>
              <Form.Select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="form-select-sm"
              >
                {cases.map((c: FamilyCase) => (
                  <option key={c.id} value={c.documentId || c.id}>
                    {c.id} — {c.title} ({c.caseType})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="fw-bold small">{t('peerDirectory.helpNeededLabel')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={t('peerDirectory.helpNeededPlaceholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="small"
              />
              <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                State what areas (e.g. statement review, bundle index, FHDRA guidance) you require lay support with.
              </Form.Text>
            </Form.Group>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-top pt-2">
        <Button variant="outline-secondary" size="sm" onClick={onCancel} disabled={submitting}>
          {t('common.cancel')}
        </Button>
        {cases.length > 0 && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!selectedCaseId || submitting}
            className="d-flex align-items-center gap-2 fw-semibold px-3"
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" />
                <span>Sending Request...</span>
              </>
            ) : (
              <>
                <FaPaperPlane size={11} />
                <span>{t('peerDirectory.sendRequestBtn')}</span>
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}
