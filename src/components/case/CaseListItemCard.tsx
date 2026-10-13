import { Card, Badge } from 'react-bootstrap'
import type { FamilyCase } from '../../types/domain'
import CaseStatusBadge from '../common/CaseStatusBadge'
import { EditCaseButton, DeleteCaseButton } from '../common/CaseCardButtons'
import { FaChild, FaUsers, FaCalendarAlt } from 'react-icons/fa'

export interface CaseListItemCardProps {
  caseData: FamilyCase
  onViewCase?: (caseId: string) => void
  onDeleteCase?: (caseId: string) => void
  showActions?: boolean
  className?: string
}

export default function CaseListItemCard({
  caseData,
  onViewCase,
  onDeleteCase,
  showActions = true,
  className = '',
}: CaseListItemCardProps) {
  const childrenCount = caseData.parties?.filter((p) => p.role === 'Child').length || 0
  const partiesCount =
    caseData.parties?.filter((p) => p.role !== 'Child' || (p.role === 'Child' && p.solicitorFirm)).length || 0
  const hearingsCount = caseData.hearings?.length || 0

  return (
    <Card className={`mb-3 p-3 shadow-sm border bg-white d-flex flex-row align-items-center gap-3 ${className}`}>
      <div
        className="flex-grow-1 min-width-0"
        style={{ cursor: onViewCase ? 'pointer' : 'default' }}
        onClick={() => onViewCase?.(caseData.id)}
      >
        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
          <h6 className="fw-bold text-primary mb-0 text-truncate">
            {caseData.id} — {caseData.title}
          </h6>
          <CaseStatusBadge status={caseData.status} size="sm" />
        </div>

        <div className="small text-muted text-truncate mb-2">
          {caseData.court} • {caseData.caseType} • Judge: {caseData.allocatedJudge || 'Unassigned'}
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <Badge bg="primary" className="fw-semibold px-2 py-1 d-inline-flex align-items-center gap-1">
            <FaUsers size={10} />
            <span>Parties: {partiesCount}</span>
          </Badge>
          {childrenCount > 0 && (
            <Badge bg="info" className="fw-semibold px-2 py-1 d-inline-flex align-items-center gap-1">
              <FaChild size={10} />
              <span>
                {childrenCount} child{childrenCount === 1 ? '' : 'ren'}
              </span>
            </Badge>
          )}
          <Badge bg="warning" className="text-dark fw-semibold px-2 py-1 d-inline-flex align-items-center gap-1">
            <FaCalendarAlt size={10} />
            <span>Hearings: {hearingsCount}</span>
          </Badge>
        </div>
      </div>

      {showActions && (
        <div className="d-flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <EditCaseButton caseId={caseData.id} />
          {onDeleteCase && <DeleteCaseButton caseId={caseData.id} onDelete={() => onDeleteCase(caseData.id)} />}
        </div>
      )}
    </Card>
  )
}
