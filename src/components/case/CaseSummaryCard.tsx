import { Button, Badge } from 'react-bootstrap'
import type { FamilyCase } from '../../types/domain'
import CaseStatusBadge from '../common/CaseStatusBadge'
import { FaEdit, FaArrowLeft, FaUsers, FaChild, FaCalendarAlt, FaBalanceScale } from 'react-icons/fa'

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
  const nonChildrenCount =
    caseData.parties?.filter((p) => p.role !== 'Child' || (p.role === 'Child' && p.solicitorFirm)).length || 0
  const childrenCount = caseData.parties?.filter((p) => p.role === 'Child').length || 0
  const hearingsCount = caseData.hearings?.length || 0
  const ordersCount = caseData.orders?.length || 0

  return (
    <div className={`p-4 bg-white rounded shadow-sm border mb-3 ${className}`}>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div className="min-width-0">
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <h4 className="fw-bold mb-0 text-dark">
              {caseData.id} — {caseData.title}
            </h4>
            <CaseStatusBadge status={caseData.status} />
          </div>

          <div className="small text-secondary mb-3">
            <span className="fw-semibold text-dark">{caseData.court}</span> • {caseData.caseType} • Started{' '}
            {caseData.startedAt}
            {caseData.allocatedJudge && (
              <span className="ms-2">
                • <strong>Judge:</strong> {caseData.allocatedJudge}
              </span>
            )}
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <Badge bg="primary" className="fw-semibold px-3 py-2 d-inline-flex align-items-center gap-1">
              <FaUsers size={12} />
              <span>Parties: {nonChildrenCount}</span>
            </Badge>
            <Badge bg="info" className="fw-semibold px-3 py-2 d-inline-flex align-items-center gap-1">
              <FaChild size={12} />
              <span>Children: {childrenCount}</span>
            </Badge>
            <Badge bg="warning" className="text-dark fw-semibold px-3 py-2 d-inline-flex align-items-center gap-1">
              <FaCalendarAlt size={12} />
              <span>Hearings: {hearingsCount}</span>
            </Badge>
            {ordersCount > 0 && (
              <Badge bg="secondary" className="fw-semibold px-3 py-2 d-inline-flex align-items-center gap-1">
                <FaBalanceScale size={12} />
                <span>Orders: {ordersCount}</span>
              </Badge>
            )}
          </div>
        </div>

        {showActions && (
          <div className="d-flex gap-2 flex-shrink-0">
            {onEdit && (
              <Button
                variant="outline-primary"
                onClick={onEdit}
                className="d-flex align-items-center gap-1"
                size="sm"
              >
                <FaEdit size={12} />
                <span>Edit Case</span>
              </Button>
            )}
            {onBack && (
              <Button
                variant="outline-secondary"
                onClick={onBack}
                className="d-flex align-items-center gap-1"
                size="sm"
              >
                <FaArrowLeft size={12} />
                <span>Back to cases</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
