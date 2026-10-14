import type { ReactNode } from 'react'
import { Card, Badge } from 'react-bootstrap'
import type { FamilyCase } from '../../types/domain'
import { getStagesForCase, getCurrentStageIndex } from '../../utils/caseStages'
import CaseSteps from './CaseSteps'
import CaseTimeline from './CaseTimeline'
import NextHearingBanner from './NextHearingBanner'
import { PeerSupportButton, ViewCaseButton, EditCaseButton, CaseCardActions } from '../common/CaseCardButtons'
import { FaUsers, FaChild, FaGavel } from 'react-icons/fa'

export interface CaseCardProps {
  caseData: FamilyCase
  onTogglePeerSupport?: (caseId: string, currentStatus: boolean) => void
  onViewDetails?: (caseId: string) => void
  onEdit?: (caseId: string) => void
  actions?: ReactNode
  buttonLayout?: 'vertical' | 'horizontal'
  showProgress?: boolean
  showNextHearing?: boolean
  progressComponent?: 'steps' | 'timeline'
  className?: string
}

export default function CaseCard({
  caseData,
  onTogglePeerSupport,
  onViewDetails,
  onEdit,
  actions,
  buttonLayout = 'vertical',
  showProgress = true,
  showNextHearing = true,
  progressComponent = 'steps',
  className = '',
}: CaseCardProps) {
  const stages = getStagesForCase(caseData)
  const currentStageIndex = getCurrentStageIndex(caseData)
  const nextHearing = caseData.hearings && caseData.hearings.length > 0 ? caseData.hearings[0] : null
  const isSeekingSupport = Boolean(caseData.seekingPeerSupport)

  const childrenCount = caseData.parties?.filter((p) => p.role === 'Child').length || 0
  const partiesCount =
    caseData.parties?.filter((p) => p.role !== 'Child' || (p.role === 'Child' && p.solicitorFirm)).length || 0

  return (
    <Card className={`premium-card h-100 d-flex flex-column border-0 ${className}`}>
      <Card.Body className="d-flex flex-column h-100 p-4">
        {/* Case Header: ID, Status, Title, Court */}
        <div className="mb-3">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-2 flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-light text-dark border font-monospace px-2 py-1 small">
                {caseData.id}
              </span>
              <Badge
                bg={caseData.status === 'Open' ? 'success' : 'secondary'}
                className="px-2 py-1 fw-semibold small"
              >
                {caseData.status}
              </Badge>
            </div>

            <div className="d-flex gap-1 flex-wrap">
              <Badge bg="primary-subtle" className="text-primary border border-primary-subtle fw-semibold px-2 py-1 d-inline-flex align-items-center gap-1">
                <FaUsers size={10} />
                <span>Parties: {partiesCount}</span>
              </Badge>
              {childrenCount > 0 && (
                <Badge bg="info-subtle" className="text-info border border-info-subtle fw-semibold px-2 py-1 d-inline-flex align-items-center gap-1">
                  <FaChild size={10} />
                  <span>
                    {childrenCount} Child{childrenCount === 1 ? '' : 'ren'}
                  </span>
                </Badge>
              )}
            </div>
          </div>

          <h5 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.2px' }}>
            {caseData.title}
          </h5>

          <div className="small text-muted d-flex align-items-center gap-2">
            <FaGavel size={11} className="text-secondary flex-shrink-0" />
            <span>{caseData.court}</span>
            <span>•</span>
            <span>{caseData.caseType}</span>
          </div>
        </div>

        {/* Next Hearing Alert Banner */}
        {showNextHearing && nextHearing && (
          <NextHearingBanner hearing={nextHearing} className="mb-3" />
        )}

        {/* Progression Stepper Section */}
        {showProgress && (
          <div className="flex-grow-1 mb-3">
            {progressComponent === 'timeline' ? (
              <CaseTimeline
                stages={stages}
                currentStageIndex={currentStageIndex}
                compact={true}
                collapsible={true}
                defaultExpanded={false}
              />
            ) : (
              <CaseSteps stages={stages} currentStageIndex={currentStageIndex} />
            )}
          </div>
        )}

        {/* Action Buttons Section (Sticky to Bottom) */}
        <div className="mt-auto pt-3 border-top">
          {actions ? (
            actions
          ) : (
            <CaseCardActions layout={buttonLayout}>
              {onTogglePeerSupport && (
                <PeerSupportButton
                  isSeekingPeerSupport={isSeekingSupport}
                  onToggle={() => onTogglePeerSupport(caseData.id, isSeekingSupport)}
                  fullWidth={buttonLayout === 'vertical'}
                />
              )}
              {onViewDetails && (
                <ViewCaseButton
                  caseId={caseData.id}
                  onView={() => onViewDetails(caseData.id)}
                  fullWidth={buttonLayout === 'vertical'}
                />
              )}
              {onEdit && (
                <EditCaseButton
                  caseId={caseData.id}
                  onEdit={() => onEdit(caseData.id)}
                  fullWidth={buttonLayout === 'vertical'}
                />
              )}
            </CaseCardActions>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}
