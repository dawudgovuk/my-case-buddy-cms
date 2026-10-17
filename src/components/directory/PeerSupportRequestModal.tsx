import { useState, useEffect, useMemo } from 'react'
import { Modal, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap'
import type { FamilyCase, User } from '../../types/domain'
import {
  FaPaperPlane,
  FaBuilding,
  FaIdCard,
  FaLock,
  FaCheckCircle,
  FaUserFriends,
  FaBriefcase,
  FaGavel,
  FaShieldAlt,
  FaCalendarAlt,
  FaFileAlt,
  FaMagic,
} from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'
import { toast } from '../../store/toastStore'

export interface PeerSupportRequestModalProps {
  show: boolean
  targetUserId: string | null
  targetProfessional?: User | null
  cases: FamilyCase[]
  isSubmitting?: boolean
  onSendRequest: (caseId: string, note: string, targetProfessional?: User | null) => Promise<void> | void
  onCancel: () => void
}

const PRESET_TOPICS = [
  { label: 'Position Statement Review', icon: '📑' },
  { label: 'FHDRA & Hearing Prep', icon: '⚖️' },
  { label: 'Court Bundle Indexing', icon: '📂' },
  { label: 'Moral & Lay Court Support', icon: '🤝' },
  { label: 'Cafcass Section 7 Advice', icon: '👨‍👩‍👧' },
  { label: 'Non-Molestation / Safety Order', icon: '🛡️' },
]

/**
 * Premium, FPR-compliant modal dialog for litigants to request peer support on a specific case.
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

  const selectedCase = useMemo(() => {
    if (!selectedCaseId) return cases[0] || null
    return (
      cases.find((c) => (c.documentId || c.id) === selectedCaseId) ||
      cases[0] ||
      null
    )
  }, [cases, selectedCaseId])

  async function handleSend() {
    if (!selectedCaseId) return
    setInternalSubmitting(true)
    setModalError(null)
    try {
      await onSendRequest(selectedCaseId, note.trim(), targetProfessional)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send peer support request'
      setModalError(msg)
      toast.error(msg, 'Request Failed')
    } finally {
      setInternalSubmitting(false)
    }
  }

  function handleAddPreset(presetLabel: string) {
    if (!note.trim()) {
      setNote(`I would appreciate peer support with: ${presetLabel}.\n\nDetails: `)
    } else if (!note.includes(presetLabel)) {
      setNote((prev) => `${prev.trim()}\n• Also requesting help with: ${presetLabel}`)
    }
  }

  const proName = targetProfessional?.name || targetUserId || 'Legal Supporter'
  const proRole = targetProfessional?.role || 'Legal Supporter'
  const submitting = isSubmitting || internalSubmitting

  const roleTheme = useMemo(() => {
    switch (proRole) {
      case 'Solicitor':
        return {
          gradient: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
          bgSubtle: 'rgba(37, 99, 235, 0.08)',
          borderSubtle: '#bfdbfe',
          textClass: 'text-primary',
          icon: <FaBriefcase size={12} />,
          tag: 'SRA Regulated Solicitor',
        }
      case 'Barrister':
        return {
          gradient: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
          bgSubtle: 'rgba(124, 58, 237, 0.08)',
          borderSubtle: '#ddd6fe',
          textClass: 'text-purple',
          icon: <FaGavel size={12} />,
          tag: 'BSB Registered Barrister KC',
        }
      case 'McKenzieFriend':
      default:
        return {
          gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          bgSubtle: 'rgba(16, 185, 129, 0.08)',
          borderSubtle: '#a7f3d0',
          textClass: 'text-success',
          icon: <FaUserFriends size={12} />,
          tag: 'FPR PD 27A McKenzie Friend',
        }
    }
  }, [proRole])

  return (
    <Modal
      show={show && Boolean(targetUserId)}
      onHide={onCancel}
      size="lg"
      centered
      backdrop="static"
      className="peer-support-request-modal"
    >
      {/* 1. Sleek Header with Accent Border */}
      <Modal.Header
        closeButton
        className="px-4 pt-3 pb-3 border-bottom"
        style={{
          borderTop: '4px solid #2563eb',
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0"
            style={{
              width: 44,
              height: 44,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            }}
          >
            <FaPaperPlane size={18} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <Modal.Title className="h5 fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
                {t('peerDirectory.requestModalTitle')}
              </Modal.Title>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5 rounded-pill small fw-semibold">
                Peer Collaboration
              </span>
            </div>
            <div className="text-secondary small mt-0.5">
              Connect with <strong>{proName}</strong> for confidential lay guidance and court preparation.
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="px-4 py-3">
        {/* Error Alert */}
        {modalError && (
          <Alert variant="danger" dismissible onClose={() => setModalError(null)} className="mb-3 py-2 small shadow-sm">
            {modalError}
          </Alert>
        )}

        {/* 2. Recipient Profile Showcase Card */}
        {targetProfessional && (
          <div
            className="p-3 mb-3 rounded-3 border position-relative overflow-hidden shadow-xs"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderColor: '#e2e8f0',
            }}
          >
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                {/* Gradient Avatar */}
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-xs flex-shrink-0 position-relative"
                  style={{
                    width: 48,
                    height: 48,
                    fontSize: '1.05rem',
                    background: roleTheme.gradient,
                  }}
                >
                  {targetProfessional.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                  <span
                    className="position-absolute bottom-0 end-0 bg-white rounded-circle p-0.5 shadow-xs"
                    style={{ transform: 'translate(15%, 15%)' }}
                    title="Verified Identity"
                  >
                    <FaCheckCircle className="text-success" size={13} />
                  </span>
                </div>

                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="fw-bold text-dark fs-6">{targetProfessional.name}</span>
                    <Badge
                      className="d-inline-flex align-items-center gap-1.5 px-2 py-0.5 rounded-pill fw-semibold"
                      style={{
                        backgroundColor: roleTheme.bgSubtle,
                        color: roleTheme.borderSubtle ? undefined : '#2563eb',
                        border: `1px solid ${roleTheme.borderSubtle}`,
                      }}
                    >
                      {roleTheme.icon}
                      <span>{proRole}</span>
                    </Badge>
                  </div>

                  {/* Firm & Credentials */}
                  <div className="d-flex align-items-center gap-2 gap-sm-3 small text-muted mt-1 flex-wrap">
                    {targetProfessional.firm && (
                      <span className="d-inline-flex align-items-center gap-1.5">
                        <FaBuilding size={11} className="text-secondary" />
                        <span className="fw-medium text-dark">{targetProfessional.firm}</span>
                      </span>
                    )}
                    {targetProfessional.registrationNumber && (
                      <span className="d-inline-flex align-items-center gap-1.5">
                        <FaIdCard size={11} className="text-secondary" />
                        <code>{targetProfessional.registrationNumber}</code>
                      </span>
                    )}
                    {targetProfessional.yearsExperience && (
                      <span className="badge bg-light text-secondary border px-1.5 py-0.5 rounded-pill">
                        {targetProfessional.yearsExperience} yrs exp
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Verified Compliance Badge */}
              <div className="align-self-start align-self-sm-center">
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5 small fw-semibold">
                  <FaShieldAlt size={11} />
                  <span>Verified Legal Supporter</span>
                </span>
              </div>
            </div>

            {/* Supporter Bio or Specialisms */}
            {targetProfessional.bio && (
              <div
                className="mt-2.5 pt-2 border-top small text-secondary"
                style={{ fontSize: '0.82rem', lineHeight: '1.45' }}
              >
                <em>"{targetProfessional.bio}"</em>
              </div>
            )}
          </div>
        )}

        {cases.length === 0 ? (
          <Alert variant="warning" className="mb-0 d-flex align-items-center gap-2">
            <FaShieldAlt size={16} />
            <div>{t('peerDirectory.noCasesWarning')}</div>
          </Alert>
        ) : (
          <div>
            {/* 3. Case Selection Field */}
            <Form.Group className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-1.5">
                <Form.Label className="fw-semibold text-dark small mb-0 d-inline-flex align-items-center gap-1.5">
                  <FaFileAlt size={12} className="text-primary" />
                  <span>{t('peerDirectory.selectCaseLabel')}</span>
                </Form.Label>
                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  Choose which case to share with {proName}
                </span>
              </div>

              <Form.Select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="form-select shadow-xs py-2 fw-medium text-dark"
                style={{ fontSize: '0.9rem', borderColor: '#cbd5e1' }}
              >
                {cases.map((c: FamilyCase) => {
                  const caseLabel = c.caseNumber
                    ? `${c.caseNumber} · ${c.title} (${c.court || 'Family Court'})`
                    : `${c.title} (${c.caseType || 'Family Court'})`
                  return (
                    <option key={c.id} value={c.documentId || c.id}>
                      {caseLabel}
                    </option>
                  )
                })}
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

            {/* 4. Quick Suggestion Pills */}
            <div className="mb-2">
              <div className="d-flex align-items-center justify-content-between mb-1.5">
                <Form.Label className="fw-semibold text-dark small mb-0 d-inline-flex align-items-center gap-1.5">
                  <span>{t('peerDirectory.helpNeededLabel')}</span>
                </Form.Label>
                <span className="d-inline-flex align-items-center gap-1 text-primary small fw-medium" style={{ fontSize: '0.75rem' }}>
                  <FaMagic size={10} />
                  <span>Click topic to insert</span>
                </span>
              </div>

              {/* Clickable Preset Pills */}
              <div className="d-flex align-items-center gap-1.5 flex-wrap mb-2">
                {PRESET_TOPICS.map((topic) => (
                  <button
                    key={topic.label}
                    type="button"
                    className="btn btn-sm btn-outline-secondary py-1 px-2 rounded-pill small d-inline-flex align-items-center gap-1 text-nowrap shadow-none"
                    style={{ fontSize: '0.76rem', borderColor: '#e2e8f0' }}
                    onClick={() => handleAddPreset(topic.label)}
                  >
                    <span>{topic.icon}</span>
                    <span>{topic.label}</span>
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={t('peerDirectory.helpNeededPlaceholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1000}
                className="shadow-xs"
                style={{
                  fontSize: '0.88rem',
                  borderColor: '#cbd5e1',
                  borderRadius: '8px',
                  lineHeight: '1.5',
                }}
              />

              <div className="d-flex align-items-center justify-content-between mt-1 text-muted" style={{ fontSize: '0.75rem' }}>
                <span>Be concise. You can share further position statements and court orders once accepted.</span>
                <span>{note.length} / 1000</span>
              </div>
            </div>

            {/* 5. Confidentiality & FPR 12.73 Notice */}
            <div
              className="p-2.5 rounded-3 border d-flex align-items-start gap-2 small text-muted"
              style={{
                backgroundColor: '#f8fafc',
                borderColor: '#e2e8f0',
                fontSize: '0.78rem',
                lineHeight: '1.45',
              }}
            >
              <FaLock className="text-primary mt-0.5 flex-shrink-0" size={12} />
              <div>
                <strong>Confidential under FPR 12.73 & Practice Direction 27A:</strong> Communications and case files shared with verified McKenzie Friends and legal supporters are strictly confidential and privileged for the sole purpose of assisting your proceedings.
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      {/* 6. Action Footer */}
      <Modal.Footer
        className="px-4 py-3 border-top d-flex align-items-center justify-content-between"
        style={{ background: '#f8fafc' }}
      >
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onCancel}
          disabled={submitting}
          className="px-3 rounded-pill fw-medium shadow-none"
        >
          {t('common.cancel')}
        </Button>

        {cases.length > 0 && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!selectedCaseId || submitting}
            className="d-flex align-items-center gap-2 fw-semibold px-4 py-2 rounded-pill shadow-xs"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              border: 'none',
            }}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" />
                <span>Sending & Notifying Supporter...</span>
              </>
            ) : (
              <>
                <FaPaperPlane size={11} />
                <span>Send Peer Support Request</span>
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}
