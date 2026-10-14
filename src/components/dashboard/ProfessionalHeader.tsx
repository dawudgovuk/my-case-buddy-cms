import { Badge, Button } from 'react-bootstrap'
import type { User } from '../../types/domain'
import {
  FaUserCheck,
  FaExclamationCircle,
  FaGavel,
  FaHandshake,
  FaCalendarAlt,
  FaClock,
  FaQuestionCircle,
  FaInfoCircle,
  FaLock,
  FaCheck,
} from 'react-icons/fa'

export interface ProfessionalHeaderProps {
  user: User
  assignedCasesCount: number
  peerSupportCasesCount: number
  upcomingHearingsCount: number
  pendingDeadlinesCount: number
  isGuideOpen: boolean
  onToggleGuide: () => void
  onOpenFaq: () => void
  onVerifyClick?: () => void
  onSelectTab?: (tab: 'peer' | 'assigned' | 'schedule') => void
}

export default function ProfessionalHeader({
  user,
  assignedCasesCount,
  peerSupportCasesCount,
  upcomingHearingsCount,
  pendingDeadlinesCount,
  isGuideOpen,
  onToggleGuide,
  onOpenFaq,
  onVerifyClick,
  onSelectTab,
}: ProfessionalHeaderProps) {
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'McKenzieFriend':
        return 'McKenzie Friend (Court Lay Supporter)'
      case 'Solicitor':
        return 'Family Law Solicitor'
      case 'Barrister':
        return 'Family Law Barrister'
      case 'LIP':
        return 'Litigant in Person'
      default:
        return role
    }
  }

  return (
    <div className="professional-header-card p-4 rounded-4 bg-white border shadow-sm mb-4">
      {/* Top Bar: Title, User, Badges, Header Actions */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <h1 className="h3 fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.3px' }}>
              Professional Dashboard
            </h1>
            <Badge bg="primary-subtle" className="text-primary border border-primary-subtle px-2 py-1 small">
              {getRoleDisplayName(user.role)}
            </Badge>
            {user.firm && (
              <span className="small text-muted fw-semibold">
                • {user.firm}
              </span>
            )}
          </div>
          <p className="text-muted mb-0 small" style={{ maxWidth: '680px', lineHeight: 1.5 }}>
            Welcome back, <strong className="text-dark">{user.name}</strong>. Manage your assigned family court cases,
            review court hearings and deadlines, and connect with litigants seeking experienced guidance.
          </p>
        </div>

        {/* Right side status badge and actions */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {user.isVerified ? (
            <Badge bg="success" className="px-3 py-2 fs-6 d-inline-flex align-items-center gap-2 rounded-3 shadow-xs">
              <FaUserCheck />
              <span>Verified Account</span>
            </Badge>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Badge
                bg="warning"
                text="dark"
                className="px-3 py-2 fs-6 d-inline-flex align-items-center gap-2 rounded-3 shadow-xs border border-warning-subtle"
              >
                <FaExclamationCircle className="text-warning-emphasis" />
                <span>Pending Email Verification</span>
              </Badge>
              {onVerifyClick && (
                <Button
                  variant="primary"
                  size="sm"
                  className="d-flex align-items-center gap-1 fw-semibold rounded-3 shadow-xs"
                  onClick={onVerifyClick}
                >
                  <FaCheck size={12} />
                  <span>Verify Now</span>
                </Button>
              )}
            </div>
          )}

          {/* Newcomer guides */}
          <Button
            variant={isGuideOpen ? 'primary' : 'outline-primary'}
            size="sm"
            className="d-flex align-items-center gap-1 rounded-3 px-3 py-2 fw-semibold shadow-none"
            onClick={onToggleGuide}
          >
            <FaInfoCircle size={13} />
            <span>{isGuideOpen ? 'Hide Quick Guide' : 'How It Works'}</span>
          </Button>

          <Button
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center gap-1 rounded-3 px-3 py-2 fw-semibold shadow-none"
            onClick={onOpenFaq}
          >
            <FaQuestionCircle size={13} />
            <span>Role & System FAQ</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="d-flex align-items-center gap-3 pt-3 border-top flex-wrap">
        <button
          type="button"
          onClick={() => onSelectTab?.('assigned')}
          className="stat-pill btn btn-link text-decoration-none p-2 px-3 text-start d-flex align-items-center gap-2"
        >
          <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary" style={{ width: 32, height: 32 }}>
            <FaGavel size={14} />
          </div>
          <div>
            <div className="small text-muted" style={{ lineHeight: 1.1 }}>Assigned Cases</div>
            <div className="fw-bold text-dark fs-6">{assignedCasesCount} Active</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab?.('peer')}
          className="stat-pill btn btn-link text-decoration-none p-2 px-3 text-start d-flex align-items-center gap-2"
        >
          <div className="d-flex align-items-center justify-content-center rounded-circle bg-info-subtle text-info" style={{ width: 32, height: 32 }}>
            <FaHandshake size={14} />
          </div>
          <div>
            <div className="small text-muted d-flex align-items-center gap-1" style={{ lineHeight: 1.1 }}>
              <span>Peer Requests</span>
              {!user.isVerified && <FaLock size={10} className="text-warning" />}
            </div>
            <div className="fw-bold text-dark fs-6">
              {user.isVerified ? `${peerSupportCasesCount} Available` : 'Locked (Verify)'}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab?.('schedule')}
          className="stat-pill btn btn-link text-decoration-none p-2 px-3 text-start d-flex align-items-center gap-2"
        >
          <div className="d-flex align-items-center justify-content-center rounded-circle bg-warning-subtle text-warning" style={{ width: 32, height: 32 }}>
            <FaCalendarAlt size={14} />
          </div>
          <div>
            <div className="small text-muted" style={{ lineHeight: 1.1 }}>Hearings Scheduled</div>
            <div className="fw-bold text-dark fs-6">{upcomingHearingsCount} Upcoming</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab?.('schedule')}
          className="stat-pill btn btn-link text-decoration-none p-2 px-3 text-start d-flex align-items-center gap-2"
        >
          <div className="d-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger" style={{ width: 32, height: 32 }}>
            <FaClock size={14} />
          </div>
          <div>
            <div className="small text-muted" style={{ lineHeight: 1.1 }}>Pending Deadlines</div>
            <div className="fw-bold text-dark fs-6">{pendingDeadlinesCount} Required</div>
          </div>
        </button>
      </div>
    </div>
  )
}
