import { Row, Col } from 'react-bootstrap'
import type { FamilyCase } from '../../types/domain'
import CaseCard from '../case/CaseCard'

export interface DashboardCaseGridProps {
  cases: FamilyCase[]
  onTogglePeerSupport: (caseId: string, currentSeeking: boolean) => void
  onViewCase: (caseId: string) => void
  onEditCase: (caseId: string) => void
}

/**
 * Responsive grid of case cards (with collapsed timeline) for the dashboard grid view.
 */
export default function DashboardCaseGrid({
  cases,
  onTogglePeerSupport,
  onViewCase,
  onEditCase,
}: DashboardCaseGridProps) {
  return (
    <Row className="g-4">
      {cases.map((caseData) => (
        <Col key={caseData.id} xs={12} md={6} lg={4} className="d-flex">
          <CaseCard
            caseData={caseData}
            buttonLayout="vertical"
            progressComponent="timeline"
            timelineDefaultExpanded={false}
            onTogglePeerSupport={onTogglePeerSupport}
            onViewDetails={onViewCase}
            onEdit={onEditCase}
          />
        </Col>
      ))}
    </Row>
  )
}
