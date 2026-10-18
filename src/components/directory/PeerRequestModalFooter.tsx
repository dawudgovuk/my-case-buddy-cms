import { Modal, Button, Spinner } from 'react-bootstrap'
import { FaPaperPlane } from 'react-icons/fa'

export interface PeerRequestModalFooterProps {
  cancelLabel: string
  submitting: boolean
  /** Whether the send button is shown (only when the user has cases to share). */
  canSend: boolean
  sendDisabled: boolean
  onCancel: () => void
  onSend: () => void
}

/**
 * Cancel / send action footer for the peer support request modal.
 */
export default function PeerRequestModalFooter({
  cancelLabel,
  submitting,
  canSend,
  sendDisabled,
  onCancel,
  onSend,
}: PeerRequestModalFooterProps) {
  return (
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
        {cancelLabel}
      </Button>

      {canSend && (
        <Button
          variant="primary"
          size="sm"
          onClick={onSend}
          disabled={sendDisabled}
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
  )
}
