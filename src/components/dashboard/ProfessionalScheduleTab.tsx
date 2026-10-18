import { Row, Col } from 'react-bootstrap'
import type { DocumentDeadline } from '../../types/domain'
import UpcomingHearingsCard, { type HearingItem } from './UpcomingHearingsCard'
import DeadlinesCard from './DeadlinesCard'

export interface ProfessionalScheduleTabProps {
  hearings: HearingItem[]
  deadlines: DocumentDeadline[]
  onToggleDeadline: (deadlineId: string, currentStatus: DocumentDeadline['status']) => void
}

/**
 * Professional dashboard schedule panel: upcoming hearings alongside document deadlines.
 */
export default function ProfessionalScheduleTab({ hearings, deadlines, onToggleDeadline }: ProfessionalScheduleTabProps) {
  return (
    <Row className="g-4">
      <Col xs={12} lg={6}>
        <UpcomingHearingsCard hearings={hearings} />
      </Col>
      <Col xs={12} lg={6}>
        <DeadlinesCard deadlines={deadlines} onToggleDeadline={onToggleDeadline} />
      </Col>
    </Row>
  )
}
