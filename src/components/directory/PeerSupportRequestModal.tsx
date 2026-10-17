import { useMemo } from 'react'
import { Modal, Alert } from 'react-bootstrap'
import type { FamilyCase, User } from '../../types/domain'
import { FaLock, FaShieldAlt } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'
import { usePeerSupportRequestForm } from '../../hooks/usePeerSupportRequestForm'
import { getPeerRequestRoleTheme } from '../../utils/peerSupportRequestUtils'
import PeerRequestModalHeader from './PeerRequestModalHeader'
import PeerRequestRecipientCard from './PeerRequestRecipientCard'
import PeerRequestCaseSelector from './PeerRequestCaseSelector'
import PeerRequestNoteField from './PeerRequestNoteField'
import PeerRequestModalFooter from './PeerRequestModalFooter'

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
  const {
    selectedCaseId,
    setSelectedCaseId,
    selectedCase,
    note,
    setNote,
    internalSubmitting,
    modalError,
    clearModalError,
    handleSend,
    handleAddPreset,
  } = usePeerSupportRequestForm({ show, cases, targetProfessional, onSendRequest })

  const proName = targetProfessional?.name || targetUserId || 'Legal Supporter'
  const proRole = targetProfessional?.role || 'Legal Supporter'
  const submitting = isSubmitting || internalSubmitting

  const roleTheme = useMemo(() => getPeerRequestRoleTheme(proRole), [proRole])

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
      <PeerRequestModalHeader title={t('peerDirectory.requestModalTitle')} proName={proName} />

      <Modal.Body className="px-4 py-3">
        {/* Error Alert */}
        {modalError && (
          <Alert variant="danger" dismissible onClose={clearModalError} className="mb-3 py-2 small shadow-sm">
            {modalError}
          </Alert>
        )}

        {/* 2. Recipient Profile Showcase Card */}
        {targetProfessional && (
          <PeerRequestRecipientCard professional={targetProfessional} roleLabel={proRole} roleTheme={roleTheme} />
        )}

        {cases.length === 0 ? (
          <Alert variant="warning" className="mb-0 d-flex align-items-center gap-2">
            <FaShieldAlt size={16} />
            <div>{t('peerDirectory.noCasesWarning')}</div>
          </Alert>
        ) : (
          <div>
            {/* 3. Case Selection Field */}
            <PeerRequestCaseSelector
              label={t('peerDirectory.selectCaseLabel')}
              proName={proName}
              cases={cases}
              selectedCaseId={selectedCaseId}
              selectedCase={selectedCase}
              onSelectCase={setSelectedCaseId}
            />

            {/* 4. Quick Suggestion Pills */}
            <PeerRequestNoteField
              label={t('peerDirectory.helpNeededLabel')}
              placeholder={t('peerDirectory.helpNeededPlaceholder')}
              note={note}
              onNoteChange={setNote}
              onAddPreset={handleAddPreset}
            />

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
      <PeerRequestModalFooter
        cancelLabel={t('common.cancel')}
        submitting={submitting}
        canSend={cases.length > 0}
        sendDisabled={!selectedCaseId || submitting}
        onCancel={onCancel}
        onSend={handleSend}
      />
    </Modal>
  )
}
