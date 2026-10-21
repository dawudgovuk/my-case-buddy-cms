import { Button } from 'react-bootstrap'
import { FaUserShield, FaPlus, FaBriefcase, FaCalendarCheck, FaHandsHelping } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'

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
  userRole,
  title,
  description,
  totalCases = 0,
  upcomingHearingsCount = 0,
  peerSupportCount = 0,
  onFindSupporters,
  onNewCase,
  className = '',
}: DashboardHeaderProps) {
  const { t } = useTranslation()
  const effectiveRole = userRole || t('lipDashboard.userRoleLabel')
  const effectiveTitle = title || t('lipDashboard.title')
  const defaultDesc = t('dashboard.headerWelcome', { name: userName })

  return (
    <div
      className={`dashboard-header-card p-4 p-md-4 rounded-4 bg-white border mb-4 ${className}`}
      style={{
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03), 0 12px 32px -8px rgba(15, 23, 42, 0.05)',
        borderColor: '#e2e8f0',
        background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
      }}
    >
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1.5 flex-wrap">
            <h1
              className="h3 fw-bold mb-0 text-dark"
              style={{ letterSpacing: '-0.4px', fontWeight: 700 }}
            >
              {effectiveTitle}
            </h1>
            <span
              className="badge badge-soft-slate px-2.5 py-1 rounded-pill fw-semibold small"
              style={{ fontSize: '0.74rem' }}
            >
              ● {effectiveRole}
            </span>
          </div>
          <p
            className="text-muted mb-0 small"
            style={{ maxWidth: '640px', lineHeight: 1.55, fontSize: '0.875rem' }}
          >
            {description || defaultDesc}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="d-flex align-items-center gap-2 flex-wrap w-100 w-md-auto">
          {onFindSupporters && (
            <Button
              variant="light"
              className="btn-soft d-flex align-items-center justify-content-center gap-2 px-3 py-2 rounded-3 border shadow-none flex-fill flex-md-grow-0"
              style={{ fontSize: '0.85rem' }}
              onClick={onFindSupporters}
            >
              <FaUserShield size={14} className="text-secondary opacity-75" />
              <span>{t('dashboard.findSupporters')}</span>
            </Button>
          )}

          {onNewCase && (
            <Button
              className="btn-obsidian d-flex align-items-center justify-content-center gap-2 px-3.5 py-2 rounded-3 shadow-sm flex-fill flex-md-grow-0"
              style={{ fontSize: '0.85rem' }}
              onClick={onNewCase}
            >
              <FaPlus size={11} />
              <span>{t('dashboard.newCase')}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Overview Metric Chips */}
      <div className="d-flex align-items-center gap-2 gap-sm-3 pt-3 border-top flex-wrap">
        <div className="stat-pill d-flex align-items-center gap-2.5 flex-fill flex-md-grow-0">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
            style={{ width: 28, height: 28, backgroundColor: '#f1f5f9', color: '#334155' }}
          >
            <FaBriefcase size={12} />
          </div>
          <div className="text-truncate">
            <span className="small text-muted me-1.5" style={{ fontSize: '0.78rem' }}>{t('dashboard.totalCases')}</span>
            <span className="fw-bold text-dark fs-6" style={{ fontSize: '0.9rem' }}>{totalCases}</span>
          </div>
        </div>

        <div className="stat-pill d-flex align-items-center gap-2.5 flex-fill flex-md-grow-0">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
            style={{ width: 28, height: 28, backgroundColor: '#fef3c7', color: '#b45309' }}
          >
            <FaCalendarCheck size={12} />
          </div>
          <div className="text-truncate">
            <span className="small text-muted me-1.5" style={{ fontSize: '0.78rem' }}>{t('dashboard.hearings')}</span>
            <span className="fw-bold text-dark fs-6" style={{ fontSize: '0.9rem' }}>{upcomingHearingsCount}</span>
          </div>
        </div>

        <div className="stat-pill d-flex align-items-center gap-2.5 flex-fill flex-md-grow-0">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
            style={{ width: 28, height: 28, backgroundColor: '#ecfdf5', color: '#047857' }}
          >
            <FaHandsHelping size={12} />
          </div>
          <div className="text-truncate">
            <span className="small text-muted me-1.5" style={{ fontSize: '0.78rem' }}>{t('dashboard.peerSupport')}</span>
            <span className="fw-bold text-dark fs-6" style={{ fontSize: '0.9rem' }}>{peerSupportCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

