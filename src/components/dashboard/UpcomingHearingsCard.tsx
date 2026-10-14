import { Card, ListGroup, Badge, Alert } from 'react-bootstrap'
import { format, isToday } from 'date-fns'
import { ViewCaseButton } from '../common/CaseCardButtons'

export interface HearingItem {
  caseId: string
  caseTitle: string
  hearing: {
    id: string
    type: string
    date: string
    time?: string
    location?: string
    judge?: string
  }
}

interface UpcomingHearingsCardProps {
  hearings: HearingItem[]
}

export default function UpcomingHearingsCard({ hearings }: UpcomingHearingsCardProps) {
  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Header className="text-white bg-primary">
        <h5 className="mb-0">Upcoming Hearings</h5>
      </Card.Header>
      <Card.Body>
        {hearings.length === 0 ? (
          <Alert variant="warning" className="mb-0 fw-semibold">
            No upcoming hearings
          </Alert>
        ) : (
          <ListGroup variant="flush">
            {hearings.slice(0, 10).map((item) => (
              <ListGroup.Item
                key={item.hearing.id}
                className="d-flex justify-content-between align-items-start px-0 py-2 border-bottom"
              >
                <div className="flex-grow-1">
                  <div className="fw-bold mb-1">
                    {item.hearing.type}
                    {isToday(new Date(item.hearing.date)) && (
                      <Badge bg="warning" className="ms-2 fw-semibold px-2 py-1 text-dark">
                        Today
                      </Badge>
                    )}
                  </div>
                  <div className="small text-muted">
                    {format(new Date(item.hearing.date), 'PPP')}
                    {item.hearing.time && ` at ${item.hearing.time}`}
                  </div>
                  {item.hearing.location && <div className="small text-secondary">{item.hearing.location}</div>}
                  {item.hearing.judge && <div className="small text-secondary">Judge: {item.hearing.judge}</div>}
                </div>
                <ViewCaseButton
                  caseId={item.caseId}
                  variant="outline-primary"
                  size="sm"
                  label="View"
                  fullWidth={false}
                />
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  )
}
