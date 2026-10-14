import { Button } from 'react-bootstrap'
import type { FamilyCase } from '../../types/domain'
import CaseStatusBadge from '../common/CaseStatusBadge'
import {
  FaEdit,
  FaArrowLeft,
  FaUsers,
  FaChild,
  FaCalendarAlt,
  FaBalanceScale,
  FaHandshake,
} from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'

export interface CaseSummaryCardProps {
  caseData: FamilyCase
  onEdit?: () => void
  onBack?: () => void
  showActions?: boolean
  className?: string
}

export default function CaseSummaryCard({
  caseData,
  onEdit,
  onBack,
  showActions = true,
  className = '',
}: CaseSummaryCardProps) {
  const { t } = useTranslation()

  const nonChildrenCount =
    caseData.parties?.filter((p) => p.role !== 'Child' || (p.role === 'Child' && p.solicitorFirm)).length || 0
  const childrenCount = caseData.parties?.filter((p) => p.role === 'Child').length || 0
  const hearingsCount = caseData.hearings?.length || 0
  const ordersCount = caseData.orders?.length || 0

  return (
    <div className={`mb-3 ${className}`}>
      {/* Sleek Breadcrumb Back Navigation */}
      {onBack && (
        <div className="mb-2">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-link p-0 text-decoration-none text-secondary d-inline-flex align-items-center gap-2 small fw-medium"
            style={{ fontSize: '0.85rem' }}
          >
            <FaArrowLeft size={11} className="text-primary" />
            <span>{t('common.back')} to {t('common.cases')}</span>
          </button>
        </div>
      )}

      {/* Main Executive Summary Card */}
      <div className="p-3 p-md-4 bg-white rounded-3 shadow-sm border">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
          <div className="overflow-hidden flex-grow-1">
            {/* Badges / Identifiers Row */}
            <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
              <span className="badge bg-light text-muted border font-monospace px-2 py-1" style={{ fontSize: '0.75rem' }}>
                {caseData.id}
              </span>
              <CaseStatusBadge status={caseData.status} />
              {caseData.seekingPeerSupport && (
                <span
                  className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1 py-1 px-2"
                  style={{ fontSize: '0.72rem' }}
                >
                  <FaHandshake size={10} />
                  <span>{t('lipDashboard.peerSupportBadge')}</span>
                </span>
              )}
            </div>

            {/* Case Title */}
            <h2 className="fw-bold text-dark mb-2" style={{ fontSize: '1.35rem', letterSpacing: '-0.3px' }}>
              {caseData.title || '(Untitled Case)'}
            </h2>

            {/* Metadata Chips / Row */}
            <div
              className="text-secondary small d-flex flex-wrap align-items-center"
              style={{ fontSize: '0.85rem', columnGap: '10px', rowGap: '4px' }}
            >
              <span className="fw-semibold text-dark">{caseData.court}</span>
              <span className="text-muted">•</span>
              <span>{caseData.caseType}</span>
              {caseData.allocatedJudge && (
                <>
                  <span className="text-muted">•</span>
                  <span>
                    Judge: <strong className="text-dark">{caseData.allocatedJudge}</strong>
                  </span>
                </>
              )}
              {caseData.startedAt && (
                <>
                  <span className="text-muted">•</span>
                  <span className="text-muted">Started: {caseData.startedAt}</span>
                </>
              )}
            </div>
          </div>

          {/* Action CTAs: cleanly aligned on the right without overflow */}
          {showActions && onEdit && (
            <div className="d-flex align-items-center gap-2 flex-shrink-0 align-self-start pt-1">
              <Button
                variant="outline-primary"
                onClick={onEdit}
                className="fw-semibold px-3 py-2 d-inline-flex align-items-center gap-2 shadow-xs rounded-3 text-nowrap"
                size="sm"
                style={{ fontSize: '0.85rem' }}
              >
                <FaEdit size={12} />
                <span>{t('caseForm.editTitle')}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Soft Divider */}
        <hr className="my-3 text-secondary-subtle" style={{ opacity: 0.15 }} />

        {/* Metric Stat Pills */}
        <div className="d-flex flex-wrap align-items-center gap-2 gap-sm-3">
          <div className="stat-pill d-inline-flex align-items-center gap-2 py-1 px-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-primary-subtle text-primary"
              style={{ width: 24, height: 24 }}
            >
              <FaUsers size={11} />
            </div>
            <span className="small text-secondary" style={{ fontSize: '0.8rem' }}>
              Parties: <strong className="text-dark">{nonChildrenCount}</strong>
            </span>
          </div>

          {childrenCount > 0 ? (
            <div className="stat-pill d-inline-flex align-items-center gap-2 py-1 px-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-warning-subtle text-warning-emphasis"
                style={{ width: 24, height: 24 }}
              >
                <FaChild size={11} />
              </div>
              <span className="small text-secondary" style={{ fontSize: '0.8rem' }}>
                Children: <strong className="text-dark">{childrenCount}</strong>
              </span>
            </div>
          ) : (
            <div className="stat-pill d-inline-flex align-items-center gap-2 py-1 px-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-light text-muted border"
                style={{ width: 24, height: 24 }}
              >
                <FaChild size={11} />
              </div>
              <span className="small text-muted" style={{ fontSize: '0.8rem' }}>
                Children: 0
              </span>
            </div>
          )}

          <div className="stat-pill d-inline-flex align-items-center gap-2 py-1 px-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-info-subtle text-info"
              style={{ width: 24, height: 24 }}
            >
              <FaCalendarAlt size={11} />
            </div>
            <span className="small text-secondary" style={{ fontSize: '0.8rem' }}>
              Hearings: <strong className="text-dark">{hearingsCount}</strong>
            </span>
          </div>

          {ordersCount > 0 && (
            <div className="stat-pill d-inline-flex align-items-center gap-2 py-1 px-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-success-subtle text-success"
                style={{ width: 24, height: 24 }}
              >
                <FaBalanceScale size={11} />
              </div>
              <span className="small text-secondary" style={{ fontSize: '0.8rem' }}>
                Orders: <strong className="text-dark">{ordersCount}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
