import { Badge, Button } from 'react-bootstrap'
import type { FamilyCase } from '../../types/domain'
import { useTranslation } from '../../hooks/useTranslation'
import {
  FaFolder,
  FaBalanceScale,
  FaChild,
  FaUsers,
  FaCalendarAlt,
  FaArrowRight,
  FaEdit,
  FaTrash,
  FaHandshake,
  FaCalendarCheck,
} from 'react-icons/fa'

export interface CaseListItemCardProps {
  caseData: FamilyCase
  onViewCase?: (caseId: string) => void
  onEditCase?: (caseId: string) => void
  onDeleteCase?: (caseId: string) => void
  showActions?: boolean
  className?: string
}

export default function CaseListItemCard({
  caseData,
  onViewCase,
  onEditCase,
  onDeleteCase,
  showActions = true,
  className = '',
}: CaseListItemCardProps) {
  const { t } = useTranslation()
  const childrenCount = caseData.parties?.filter((p) => p.role === 'Child').length || 0
  const partiesCount =
    caseData.parties?.filter((p) => p.role !== 'Child' || (p.role === 'Child' && p.solicitorFirm)).length || 0
  const hearingsCount = caseData.hearings?.length || 0
  const nextHearing = caseData.hearings && caseData.hearings.length > 0 ? caseData.hearings[0] : null

  // Status styling colors
  const isOpen = caseData.status === 'Open'
  const isStayed = caseData.status === 'Stayed'

  const statusBadgeBg = isOpen ? 'bg-success-subtle text-success border-success-subtle' : isStayed ? 'bg-warning-subtle text-warning-emphasis border-warning-subtle' : 'bg-secondary-subtle text-secondary border-secondary-subtle'
  const iconBoxBg = isOpen ? '#f0fdf4' : isStayed ? '#fffbeb' : '#f8fafc'
  const iconBoxColor = isOpen ? '#16a34a' : isStayed ? '#d97706' : '#64748b'

  return (
    <div
      className={`case-row-item p-3 mb-3 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 ${className}`}
      style={{ cursor: onViewCase ? 'pointer' : 'default' }}
      onClick={() => onViewCase?.(caseData.id)}
    >
      {/* Left Icon + Core Information */}
      <div className="d-flex align-items-start gap-3 flex-grow-1 min-width-0">
        {/* Soft Icon Avatar */}
        <div
          className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 mt-1 mt-sm-0"
          style={{
            width: 44,
            height: 44,
            backgroundColor: iconBoxBg,
            color: iconBoxColor,
            border: `1px solid ${isOpen ? '#dcfce7' : isStayed ? '#fef3c7' : '#e2e8f0'}`,
          }}
        >
          {caseData.caseType.includes('Child') ? <FaFolder size={20} /> : <FaBalanceScale size={20} />}
        </div>

        {/* Content Details */}
        <div className="overflow-hidden flex-grow-1">
          {/* Row 1: Title, Reference, Status Pill */}
          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
            <h6 className="fw-bold text-dark mb-0 case-title-link text-truncate" style={{ fontSize: '1.025rem' }}>
              {caseData.title || '(Untitled Case)'}
            </h6>

            <span className={`badge border rounded-pill px-2 py-1 font-monospace ${statusBadgeBg}`} style={{ fontSize: '0.72rem' }}>
              ● {caseData.status}
            </span>

            <span className="badge bg-light text-muted border font-monospace px-2 py-0" style={{ fontSize: '0.72rem' }}>
              {caseData.id}
            </span>

            {caseData.seekingPeerSupport && (
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1 py-1 px-2" style={{ fontSize: '0.7rem' }}>
                <FaHandshake size={10} />
                <span>{t('lipDashboard.peerSupportBadge')}</span>
              </span>
            )}
          </div>

          {/* Row 2: Secondary Metadata (Flows smoothly across desktop, wraps on mobile) */}
          <div className="text-secondary small mb-2 d-flex flex-wrap align-items-center" style={{ fontSize: '0.825rem', columnGap: '8px', rowGap: '2px' }}>
            <span className="fw-medium text-dark">{caseData.court}</span>
            <span className="text-muted">•</span>
            <span>{caseData.caseType}</span>
            <span className="text-muted">•</span>
            <span>Judge: {caseData.allocatedJudge || 'Unassigned'}</span>
            {caseData.startedAt && (
              <>
                <span className="text-muted">•</span>
                <span className="text-muted">Started: {caseData.startedAt}</span>
              </>
            )}
          </div>

          {/* Row 3: Stat Badges + Next Hearing Pill */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Badge bg="light" className="text-dark border fw-normal px-2 py-1 d-inline-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
              <FaUsers size={11} className="text-primary" />
              <span>{partiesCount} {partiesCount === 1 ? 'Party' : 'Parties'}</span>
            </Badge>

            {childrenCount > 0 && (
              <Badge bg="warning-subtle" className="text-warning-emphasis border border-warning-subtle fw-normal px-2 py-1 d-inline-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                <FaChild size={11} />
                <span>
                  {childrenCount} child{childrenCount === 1 ? '' : 'ren'}
                </span>
              </Badge>
            )}

            <Badge bg="light" className="text-dark border fw-normal px-2 py-1 d-inline-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
              <FaCalendarAlt size={11} className="text-secondary" />
              <span>{hearingsCount} {hearingsCount === 1 ? 'Hearing' : 'Hearings'}</span>
            </Badge>

            {nextHearing && (
              <span className="badge bg-amber-subtle text-dark border border-warning-subtle d-inline-flex align-items-center gap-1 py-1 px-2" style={{ backgroundColor: '#fffbeb', fontSize: '0.75rem' }}>
                <FaCalendarCheck size={11} className="text-warning" />
                <span>
                  Next: <strong>{nextHearing.date}</strong> ({nextHearing.type})
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Primary CTA & Action Buttons */}
      {showActions && (
        <div
          className="d-flex align-items-center gap-2 flex-shrink-0 align-self-end align-self-sm-center pt-2 pt-sm-0"
          onClick={(e) => e.stopPropagation()}
        >
          {onViewCase && (
            <Button
              variant="primary"
              size="sm"
              className="fw-semibold px-3 py-1 d-inline-flex align-items-center gap-2 shadow-xs rounded-3 text-nowrap"
              onClick={() => onViewCase(caseData.id)}
              style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', fontSize: '0.825rem' }}
            >
              <span>{t('casesList.openCase')}</span>
              <FaArrowRight size={11} />
            </Button>
          )}

          <div className="d-flex align-items-center gap-1">
            {onEditCase && (
              <button
                type="button"
                className="action-btn-subtle"
                onClick={() => onEditCase(caseData.id)}
                title={t('common.edit')}
                aria-label={t('common.edit')}
              >
                <FaEdit size={12} />
              </button>
            )}

            {onDeleteCase && (
              <button
                type="button"
                className="action-btn-subtle action-btn-danger"
                onClick={() => onDeleteCase(caseData.id)}
                title={t('common.delete')}
                aria-label={t('common.delete')}
              >
                <FaTrash size={12} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
