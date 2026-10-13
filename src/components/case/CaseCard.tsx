import type { ReactNode } from 'react'
import { Card, Badge, Alert } from 'react-bootstrap'
import type { FamilyCase } from '../../types/domain'
import { getStagesForCase, getCurrentStageIndex } from '../../utils/caseStages'
import CaseSteps from './CaseSteps'
import CaseTimeline from './CaseTimeline'
import { PeerSupportButton, ViewCaseButton, EditCaseButton, CaseCardActions } from '../common/CaseCardButtons'
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaChild } from 'react-icons/fa'

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
  className = 'mb-3',
}: CaseCardProps) {
  const stages = getStagesForCase(caseData)
  const currentStageIndex = getCurrentStageIndex(caseData)
  const nextHearing = caseData.hearings && caseData.hearings.length > 0 ? caseData.hearings[0] : null
  const isSeekingSupport = Boolean(caseData.seekingPeerSupport)

  const childrenCount = caseData.parties?.filter((p) => p.role === 'Child').length || 0
  const partiesCount =
    caseData.parties?.filter((p) => p.role !== 'Child' || (p.role === 'Child' && p.solicitorFirm)).length || 0

  return (
    <Card className={`shadow-sm border-0 ${className}`}>
      <Card.Body>
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <h5 className="fw-bold mb-0 text-dark">
                {caseData.id} — {caseData.title}
              </h5>
              <Badge bg={caseData.status === 'Open' ? 'success' : 'secondary'} className="px-2 py-1">
                {caseData.status}
              </Badge>
            </div>
            <div className="small text-muted">
              {caseData.court} • {caseData.caseType}
            </div>
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
                  {childrenCount} Child{childrenCount === 1 ? '' : 'ren'}
                </span>
              </Badge>
            )}
          </div>
        </div>

        {/* Next Hearing Alert */}
        {showNextHearing && nextHearing && (
          <Alert variant="info" className="py-2 px-3 mb-3 d-flex align-items-center gap-2">
            <FaCalendarAlt className="text-info flex-shrink-0" />
            <div className="small">
              <strong>Next Hearing:</strong> {nextHearing.type} on {nextHearing.date}
              {nextHearing.time ? ` at ${nextHearing.time}` : ''}
              {nextHearing.location && (
                <span className="ms-2">
                  <FaMapMarkerAlt className="me-1" />
                  {nextHearing.location}
                </span>
              )}
            </div>
          </Alert>
        )}

        {/* Progression Section */}
        {showProgress && (
          <div className="mb-3">
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

        {/* Action Buttons Section */}
        <div className="mt-3 pt-2 border-top">
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
