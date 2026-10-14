import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaGavel } from 'react-icons/fa'
import type { Hearing } from '../../types/domain'

export interface NextHearingBannerProps {
  hearing: Hearing
  className?: string
}

export default function NextHearingBanner({ hearing, className = '' }: NextHearingBannerProps) {
  return (
    <div
      className={`next-hearing-banner p-3 rounded-3 mb-3 d-flex flex-column justify-content-between ${className}`}
      style={{
        backgroundColor: '#fffdfa',
        border: '1px solid #fef3c7',
        borderLeft: '4px solid #f59e0b',
        height: '104px',
        boxSizing: 'border-box',
      }}
    >
      <div className="d-flex align-items-center justify-content-between gap-2 mb-2 flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
            style={{ width: 24, height: 24, backgroundColor: '#fef3c7', color: '#b45309' }}
          >
            <FaCalendarAlt size={11} />
          </div>
          <span
            className="small text-uppercase fw-bold"
            style={{ letterSpacing: '0.5px', fontSize: '0.72rem', color: '#92400e' }}
          >
            Next Court Hearing
          </span>
        </div>
        <span
          className="badge-soft-amber badge px-2 py-0.5 rounded-pill fw-semibold"
          style={{ fontSize: '0.72rem' }}
        >
          Scheduled
        </span>
      </div>

      <div className="fw-semibold text-dark fs-6 mb-2 d-flex align-items-center gap-2">
        <FaGavel size={12} className="text-secondary opacity-75 flex-shrink-0" />
        <span className="text-truncate">{hearing.type}</span>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-3 small text-secondary">
        <span className="d-flex align-items-center gap-1 fw-medium text-dark">
          <FaCalendarAlt size={11} className="text-muted" />
          <span>{hearing.date}</span>
        </span>

        {hearing.time && (
          <span className="d-flex align-items-center gap-1 text-secondary">
            <FaClock size={11} className="text-muted" />
            <span>{hearing.time}</span>
          </span>
        )}

        {hearing.location && (
          <span className="d-flex align-items-center gap-1 text-muted text-truncate" style={{ maxWidth: 220 }}>
            <FaMapMarkerAlt size={11} className="text-secondary opacity-75" />
            <span>{hearing.location}</span>
          </span>
        )}
      </div>
    </div>
  )
}

