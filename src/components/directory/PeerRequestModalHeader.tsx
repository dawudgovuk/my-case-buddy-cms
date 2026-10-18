import { Modal } from 'react-bootstrap'
import { FaPaperPlane } from 'react-icons/fa'

export interface PeerRequestModalHeaderProps {
  title: string
  proName: string
}

/**
 * Accent-bordered header for the peer support request modal.
 */
export default function PeerRequestModalHeader({ title, proName }: PeerRequestModalHeaderProps) {
  return (
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
              {title}
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
  )
}
