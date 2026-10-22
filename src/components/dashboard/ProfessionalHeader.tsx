import { Badge, Button, Row, Col } from 'react-bootstrap'
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
import { useTranslation } from '../../hooks/useTranslation'

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
  const { t } = useTranslation()

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'McKenzieFriend':
        return `${t('roles.mckenzieFriend')} (${t('roles.courtLaySupporter')})`
      case 'Solicitor':
        return `${t('roles.solicitor')}`
      case 'Barrister':
        return `${t('roles.barrister')}`
      case 'LIP':
        return t('roles.lipFull')
      default:
        return role
    }
  }

  return (
    <div className="professional-header-card p-3 p-md-4 rounded-4 bg-white border shadow-sm mb-4">
      {/* Top Bar: Title, User, Badges, Header Actions */}
      <div className="d-flex flex-column flex-xl-row justify-content-between align-items-start align-items-xl-center gap-3 mb-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <h1 className="h3 fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.3px' }}>
              {t('professional.dashboardTitle')}
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
            {t('professional.welcomeBack')} <strong className="text-dark">{user.name}</strong>. {t('professional.welcomeBackDesc')}
          </p>
        </div>

        {/* Right side status badge and actions */}
        <div className="d-flex align-items-center gap-2 flex-wrap w-100 w-xl-auto justify-content-start justify-content-xl-end">
          {user.isVerified ? (
            <Badge bg="success" className="px-3 py-2 fs-6 d-inline-flex align-items-center gap-2 rounded-3 shadow-xs">
              <FaUserCheck />
              <span>{t('professional.verifiedBadge')}</span>
            </Badge>
          ) : (
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Badge
                bg="warning"
                text="dark"
                className="px-3 py-2 fs-6 d-inline-flex align-items-center gap-2 rounded-3 shadow-xs border border-warning-subtle"
              >
                <FaExclamationCircle className="text-warning-emphasis" />
                <span>{t('professional.pendingVerificationBadge')}</span>
              </Badge>
              {onVerifyClick && (
                <Button
                  variant="primary"
                  size="sm"
                  className="d-flex align-items-center gap-1 fw-semibold rounded-3 shadow-xs"
                  onClick={onVerifyClick}
                >
                  <FaCheck size={12} />
                  <span>{t('professional.verifyNow')}</span>
                </Button>
              )}
            </div>
          )}

          {/* Newcomer guides */}
          <Button
            variant={isGuideOpen ? 'primary' : 'outline-primary'}
            size="sm"
            className="d-flex align-items-center gap-1 rounded-3 px-3 py-2 fw-semibold text-nowrap shadow-none flex-shrink-0"
            onClick={onToggleGuide}
          >
            <FaInfoCircle size={13} />
            <span>{isGuideOpen ? t('professional.hideGuideBtn') : t('professional.howItWorksBtn')}</span>
          </Button>

          <Button
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center gap-1 rounded-3 px-3 py-2 fw-semibold text-nowrap shadow-none flex-shrink-0"
            onClick={onOpenFaq}
          >
            <FaQuestionCircle size={13} />
            <span>{t('professional.roleAndFaqBtn')}</span>
          </Button>
        </div>
      </div>

      {/* Metrics Grid (2x2 on mobile, 4-in-a-row on md+) */}
      <Row className="g-2 pt-3 border-top">
        <Col xs={6} md={3}>
          <button
            type="button"
            onClick={() => onSelectTab?.('assigned')}
            className="stat-pill btn btn-link text-decoration-none p-2 px-3 text-start d-flex align-items-center gap-2 w-100 h-100"
          >
            <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary flex-shrink-0" style={{ width: 32, height: 32 }}>
              <FaGavel size={14} />
            </div>
            <div className="overflow-hidden">
              <div className="small text-muted text-truncate" style={{ lineHeight: 1.1 }}>{t('professional.assignedCasesStat')}</div>
              <div className="fw-bold text-dark fs-6 text-truncate">{assignedCasesCount} {t('professional.activeBadge')}</div>
            </div>
          </button>
        </Col>

        <Col xs={6} md={3}>
          <button
            type="button"
            onClick={() => onSelectTab?.('peer')}
            className="stat-pill btn btn-link text-decoration-none p-2 px-3 text-start d-flex align-items-center gap-2 w-100 h-100"
          >
            <div className="d-flex align-items-center justify-content-center rounded-circle bg-info-subtle text-info flex-shrink-0" style={{ width: 32, height: 32 }}>
              <FaHandshake size={14} />
            </div>
            <div className="overflow-hidden">
              <div className="small text-muted d-flex align-items-center gap-1 text-truncate" style={{ lineHeight: 1.1 }}>
                <span>{t('professional.peerRequestsStat')}</span>
                {!user.isVerified && <FaLock size={10} className="text-warning flex-shrink-0" />}
              </div>
              <div className="fw-bold text-dark fs-6 text-truncate">
                {user.isVerified ? `${peerSupportCasesCount} ${t('professional.availableBadge')}` : t('professional.lockedBadge')}
              </div>
            </div>
          </button>
        </Col>

        <Col xs={6} md={3}>
          <button
            type="button"
            onClick={() => onSelectTab?.('schedule')}
            className="stat-pill btn btn-link text-decoration-none p-2 px-3 text-start d-flex align-items-center gap-2 w-100 h-100"
          >
            <div className="d-flex align-items-center justify-content-center rounded-circle bg-warning-subtle text-warning flex-shrink-0" style={{ width: 32, height: 32 }}>
              <FaCalendarAlt size={14} />
            </div>
            <div className="overflow-hidden">
              <div className="small text-muted text-truncate" style={{ lineHeight: 1.1 }}>{t('professional.hearingsStat')}</div>
              <div className="fw-bold text-dark fs-6 text-truncate">{upcomingHearingsCount} {t('professional.upcomingBadge')}</div>
            </div>
          </button>
        </Col>

        <Col xs={6} md={3}>
          <button
            type="button"
            onClick={() => onSelectTab?.('schedule')}
            className="stat-pill btn btn-link text-decoration-none p-2 px-3 text-start d-flex align-items-center gap-2 w-100 h-100"
          >
            <div className="d-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger flex-shrink-0" style={{ width: 32, height: 32 }}>
              <FaClock size={14} />
            </div>
            <div className="overflow-hidden">
              <div className="small text-muted text-truncate" style={{ lineHeight: 1.1 }}>{t('professional.deadlinesStat')}</div>
              <div className="fw-bold text-dark fs-6 text-truncate">{pendingDeadlinesCount} {t('professional.requiredBadge')}</div>
            </div>
          </button>
        </Col>
      </Row>
    </div>
  )
}
