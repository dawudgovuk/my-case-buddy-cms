import { Button, Badge } from 'react-bootstrap'
import { FaUserShield, FaPlus, FaBriefcase, FaCalendarCheck, FaHandsHelping } from 'react-icons/fa'

export interface DashboardMetric {
  label: string
  value: number | string
  icon: React.ReactNode
  variant?: 'primary' | 'success' | 'info' | 'warning'
}

export interface DashboardHeaderProps {
  userName: string
  userRole?: string
  title?: string
  description?: string
  totalCases?: number
  upcomingHearingsCount?: number
  peerSupportCount?: number
  onFindSupporters?: () => void
  onNewCase?: () => void
  className?: string
}

export default function DashboardHeader({
  userName,
  userRole = 'Litigant in Person',
  title = 'My Cases Dashboard',
  description,
  totalCases = 0,
  upcomingHearingsCount = 0,
  peerSupportCount = 0,
  onFindSupporters,
  onNewCase,
  className = '',
}: DashboardHeaderProps) {
  const defaultDesc = `Welcome, ${userName}. Track your court case progression, manage deadlines, and connect with peer legal support.`

  return (
    <div className={`dashboard-header-card p-4 rounded-4 bg-white border shadow-sm mb-4 ${className}`}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="h3 fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.3px' }}>
              {title}
            </h1>
            <Badge bg="primary-subtle" className="text-primary border border-primary-subtle px-2 py-1 small">
              {userRole}
            </Badge>
          </div>
          <p className="text-muted mb-0 small" style={{ maxWidth: '640px', lineHeight: 1.5 }}>
            {description || defaultDesc}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="d-flex align-items-center gap-2 flex-wrap w-100 w-md-auto">
          {onFindSupporters && (
            <Button
              variant="outline-primary"
              className="d-flex align-items-center justify-content-center gap-2 fw-semibold px-3 py-2 rounded-3 shadow-none flex-fill flex-md-grow-0"
              onClick={onFindSupporters}
            >
              <FaUserShield size={14} />
              <span>Find Legal Supporters</span>
            </Button>
          )}

          {onNewCase && (
            <Button
              variant="primary"
              className="d-flex align-items-center justify-content-center gap-2 fw-semibold px-3 py-2 rounded-3 shadow-sm flex-fill flex-md-grow-0"
              onClick={onNewCase}
            >
              <FaPlus size={13} />
              <span>New Case</span>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Overview Metric Pills */}
      <div className="d-flex align-items-center gap-2 gap-sm-3 pt-3 border-top flex-wrap">
        <div className="stat-pill d-flex align-items-center gap-2 flex-fill flex-md-grow-0">
          <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary flex-shrink-0" style={{ width: 28, height: 28 }}>
            <FaBriefcase size={13} />
          </div>
          <div className="text-truncate">
            <span className="small text-muted me-1">Total Cases:</span>
            <span className="fw-bold text-dark">{totalCases}</span>
          </div>
        </div>

        <div className="stat-pill d-flex align-items-center gap-2 flex-fill flex-md-grow-0">
          <div className="d-flex align-items-center justify-content-center rounded-circle bg-info-subtle text-info flex-shrink-0" style={{ width: 28, height: 28 }}>
            <FaCalendarCheck size={13} />
          </div>
          <div className="text-truncate">
            <span className="small text-muted me-1">Hearings:</span>
            <span className="fw-bold text-dark">{upcomingHearingsCount}</span>
          </div>
        </div>

        <div className="stat-pill d-flex align-items-center gap-2 flex-fill flex-md-grow-0">
          <div className="d-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success flex-shrink-0" style={{ width: 28, height: 28 }}>
            <FaHandsHelping size={13} />
          </div>
          <div className="text-truncate">
            <span className="small text-muted me-1">Peer Support:</span>
            <span className="fw-bold text-dark">{peerSupportCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
