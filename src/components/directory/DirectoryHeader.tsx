import { FaUserCheck, FaSync } from 'react-icons/fa'
import { DIRECTORY_METRICS, type DirectoryCounts } from '../../utils/directoryUtils'

export interface DirectoryHeaderProps {
  title: string
  subtitle: string
  counts: DirectoryCounts
  isLoading: boolean
  onRefresh: () => void
}

/**
 * Executive hero header for the peer directory: status badges, refresh control,
 * title / subtitle and per-role metric cards.
 */
export default function DirectoryHeader({ title, subtitle, counts, isLoading, onRefresh }: DirectoryHeaderProps) {
  return (
    <div className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-1.5">
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill d-inline-flex align-items-center gap-1.5 small fw-semibold">
          <FaUserCheck size={11} />
          <span>VERIFIED LEGAL DIRECTORY</span>
        </span>
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill d-inline-flex align-items-center gap-1.5 small fw-semibold">
          <span
            className="rounded-circle bg-success"
            style={{ width: 6, height: 6, display: 'inline-block' }}
          />
          <span>{counts.all} Active Supporters</span>
        </span>
        {isLoading && (
          <span className="badge bg-light text-muted border px-2.5 py-1 rounded-pill d-inline-flex align-items-center gap-1.5 small">
            <span className="spinner-border spinner-border-sm" role="status" style={{ width: 10, height: 10 }} />
            <span>Syncing...</span>
          </span>
        )}
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary py-0.5 px-2.5 rounded-pill d-inline-flex align-items-center gap-1.5 small shadow-none"
          onClick={onRefresh}
          disabled={isLoading}
          style={{ fontSize: '0.8rem' }}
        >
          <FaSync size={10} className={isLoading ? 'fa-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em', fontSize: '1.75rem' }}>
        {title}
      </h2>
      <p className="text-secondary mb-3" style={{ maxWidth: 760, fontSize: '0.94rem' }}>
        {subtitle}
      </p>

      {/* Header Metric Cards */}
      <div className="d-flex align-items-center gap-2 flex-wrap">
        {DIRECTORY_METRICS.map(({ countKey, label, icon: Icon, iconClass, iconSize }) => (
          <div
            key={countKey}
            className="bg-white border rounded-3 px-3 py-1.5 d-inline-flex align-items-center gap-2 shadow-sm"
          >
            <Icon className={iconClass} size={iconSize} />
            <span className="small text-muted">{label}</span>
            <span className="fw-bold text-dark small">{counts[countKey]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
