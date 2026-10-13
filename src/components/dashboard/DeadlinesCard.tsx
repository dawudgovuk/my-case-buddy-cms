import { Card, Form, Badge, Alert } from 'react-bootstrap'
import { isPast, isToday, differenceInDays } from 'date-fns'
import type { DocumentDeadline } from '../../types/domain'

interface DeadlinesCardProps {
  deadlines: DocumentDeadline[]
  onToggleDeadline: (deadlineId: string, currentStatus: DocumentDeadline['status']) => void
}

export default function DeadlinesCard({ deadlines, onToggleDeadline }: DeadlinesCardProps) {
  const pendingDeadlines = deadlines.filter((d) => d.status === 'pending')
  const overdueDeadlines = pendingDeadlines.filter(
    (d) => isPast(new Date(d.deadlineDate)) && !isToday(new Date(d.deadlineDate))
  )
  const upcomingDeadlines = pendingDeadlines.filter(
    (d) => !isPast(new Date(d.deadlineDate)) || isToday(new Date(d.deadlineDate))
  )

  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Header className="text-white bg-primary">
        <h5 className="mb-0">Document Submission Deadlines</h5>
      </Card.Header>
      <Card.Body>
        {pendingDeadlines.length === 0 ? (
          <Alert variant="success" className="mb-0 fw-semibold">
            No pending deadlines
          </Alert>
        ) : (
          <div>
            {overdueDeadlines.length > 0 && (
              <div className="mb-3">
                <h6 className="fw-bold mb-2 text-danger">Overdue ({overdueDeadlines.length})</h6>
                {overdueDeadlines.map((deadline) => {
                  const days = differenceInDays(new Date(), new Date(deadline.deadlineDate))
                  return (
                    <div key={deadline.id} className="mb-2 p-2 bg-light border-start border-danger border-3 rounded">
                      <Form.Check
                        type="checkbox"
                        checked={deadline.status === 'submitted'}
                        onChange={() => onToggleDeadline(deadline.id, deadline.status)}
                        label={
                          <div>
                            <strong>{deadline.title}</strong>
                            <Badge bg="danger" className="ms-2 fw-semibold px-2 py-1">
                              {days} days overdue
                            </Badge>
                          </div>
                        }
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {upcomingDeadlines.length > 0 && (
              <div>
                <h6 className="fw-bold mb-2 text-secondary">Upcoming Deadlines</h6>
                {upcomingDeadlines.slice(0, 5).map((deadline) => {
                  const days = differenceInDays(new Date(deadline.deadlineDate), new Date())
                  return (
                    <div key={deadline.id} className="mb-2 p-2 bg-light rounded border">
                      <Form.Check
                        type="checkbox"
                        checked={deadline.status === 'submitted'}
                        onChange={() => onToggleDeadline(deadline.id, deadline.status)}
                        label={
                          <div>
                            <strong>{deadline.title}</strong>
                            <Badge bg={days <= 7 ? 'warning' : 'info'} className="ms-2 fw-semibold px-2 py-1 text-dark">
                              Due in {days} day{days === 1 ? '' : 's'}
                            </Badge>
                          </div>
                        }
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
