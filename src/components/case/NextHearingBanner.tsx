import { Badge } from 'react-bootstrap'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaGavel } from 'react-icons/fa'
import type { Hearing } from '../../types/domain'

export interface NextHearingBannerProps {
  hearing: Hearing
  className?: string
}

export default function NextHearingBanner({ hearing, className = '' }: NextHearingBannerProps) {
  return (
    <div
      className={`next-hearing-banner p-3 rounded-3 border-start border-4 border-primary bg-light shadow-xs mb-3 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.8) 0%, rgba(240, 253, 250, 0.8) 100%)',
        borderColor: '#0d6efd',
      }}
    >
      <div className="d-flex align-items-center justify-content-between gap-2 mb-2 flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white flex-shrink-0"
            style={{ width: 24, height: 24, fontSize: '0.75rem' }}
          >
            <FaCalendarAlt size={12} />
          </div>
          <span className="small text-uppercase fw-bold text-primary" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>
            Next Court Hearing
          </span>
        </div>
        <Badge bg="primary" className="fw-semibold px-2 py-1 small">
          Scheduled
        </Badge>
      </div>

      <div className="fw-bold text-dark fs-6 mb-2 d-flex align-items-center gap-2">
        <FaGavel size={13} className="text-primary flex-shrink-0" />
        <span>{hearing.type}</span>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-3 small text-secondary">
        <span className="d-flex align-items-center gap-1 fw-medium text-dark">
          <FaCalendarAlt size={12} className="text-muted" />
          <span>{hearing.date}</span>
        </span>

        {hearing.time && (
          <span className="d-flex align-items-center gap-1 fw-medium text-dark">
            <FaClock size={12} className="text-muted" />
            <span>{hearing.time}</span>
          </span>
        )}

        {hearing.location && (
          <span className="d-flex align-items-center gap-1 text-muted">
            <FaMapMarkerAlt size={12} className="text-danger opacity-75" />
            <span>{hearing.location}</span>
          </span>
        )}
      </div>
    </div>
  )
}
