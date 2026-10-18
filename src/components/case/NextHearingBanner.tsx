import { FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import type { Hearing } from '../../types/domain'

export interface NextHearingBannerProps {
  hearing: Hearing
  className?: string
}

function parseDate(value: string): Date | null {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export default function NextHearingBanner({ hearing, className = '' }: NextHearingBannerProps) {
  const date = parseDate(hearing.date)
  return (
    <div className={`next-hearing-banner hearing-banner p-3 mb-3 ${className}`}>
      <div className="d-flex gap-3 align-items-center">
        <div className="hearing-date-chip" aria-hidden="true">
          <span className="hearing-date-chip-month">{date ? date.toLocaleString('en-GB', { month: 'short' }) : ''}</span>
          <span className="hearing-date-chip-day">{date ? date.getDate() : '–'}</span>
        </div>
        <div className="min-w-0 flex-grow-1">
          <div className="hearing-banner-label">Next court hearing</div>
          <div className="fw-bold text-dark text-truncate">{hearing.type}</div>
          <div className="d-flex flex-wrap align-items-center column-gap-3 row-gap-1 small text-secondary mt-1">
            <span className="fw-semibold text-dark">
              {date ? date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : hearing.date}
            </span>
            {hearing.time && (
              <span className="d-inline-flex align-items-center gap-1">
                <FaClock size={11} aria-hidden="true" /> {hearing.time}
              </span>
            )}
            {hearing.location && (
              <span className="d-inline-flex align-items-center gap-1 text-truncate" style={{ maxWidth: '100%' }}>
                <FaMapMarkerAlt size={11} aria-hidden="true" /> {hearing.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
