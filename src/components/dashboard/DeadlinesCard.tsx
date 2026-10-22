import { Card, Form, Badge } from 'react-bootstrap'
import { isPast, isToday, differenceInDays } from 'date-fns'
import { FaClock, FaClipboardCheck, FaExclamationTriangle } from 'react-icons/fa'
import type { DocumentDeadline } from '../../types/domain'
import { useTranslation } from '../../hooks/useTranslation'

interface DeadlinesCardProps {
  deadlines: DocumentDeadline[]
  onToggleDeadline: (deadlineId: string, currentStatus: DocumentDeadline['status']) => void
}

export default function DeadlinesCard({ deadlines, onToggleDeadline }: DeadlinesCardProps) {
  const { t } = useTranslation()
  const pendingDeadlines = deadlines.filter((d) => d.status === 'pending')
  const overdueDeadlines = pendingDeadlines.filter(
    (d) => isPast(new Date(d.deadlineDate)) && !isToday(new Date(d.deadlineDate))
  )
  const upcomingDeadlines = pendingDeadlines.filter(
    (d) => !isPast(new Date(d.deadlineDate)) || isToday(new Date(d.deadlineDate))
  )

  return (
    <Card className="shadow-sm border rounded-4 h-100 bg-white overflow-hidden">
      <div className="p-3 p-md-4 border-bottom d-flex align-items-center justify-content-between bg-white">
        <div className="d-flex align-items-center gap-2.5">
          <div className="p-2 rounded-3 bg-danger-subtle text-danger d-flex align-items-center justify-content-center">
            <FaClock size={16} />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark fs-6">{t('dashboard.submissionDeadlines')}</h5>
            <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
              {pendingDeadlines.length} {pendingDeadlines.length === 1 ? t('common.pending') : t('common.pendingPlural')}
            </span>
          </div>
        </div>
        <Badge
          bg={overdueDeadlines.length > 0 ? 'danger' : pendingDeadlines.length > 0 ? 'warning-subtle' : 'success-subtle'}
          className={`${
            overdueDeadlines.length > 0
              ? 'text-white'
              : pendingDeadlines.length > 0
              ? 'text-warning-emphasis'
              : 'text-success'
          } px-2.5 py-1.5 rounded-pill`}
        >
          {overdueDeadlines.length > 0
            ? `${overdueDeadlines.length} ${t('dashboard.overdue')}`
            : `${pendingDeadlines.length}`}
        </Badge>
      </div>

      <Card.Body className="p-3 p-md-4">
        {pendingDeadlines.length === 0 ? (
          <div className="text-center py-4 px-2">
            <div
              className="p-3 rounded-circle bg-light text-muted d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '56px', height: '56px' }}
            >
              <FaClipboardCheck size={26} className="text-success opacity-75" />
            </div>
            <h6 className="fw-bold text-dark mb-1">{t('dashboard.noPendingDeadlines')}</h6>
            <p className="text-muted small mb-0" style={{ maxWidth: '340px', margin: '0 auto', fontSize: '0.82rem', lineHeight: 1.5 }}>
              {t('dashboard.noPendingDeadlinesDesc')}
            </p>
          </div>
        ) : (
          <div>
            {overdueDeadlines.length > 0 && (
              <div className="mb-4">
                <div className="d-flex align-items-center gap-1.5 text-danger fw-bold small mb-2">
                  <FaExclamationTriangle size={12} />
                  <span>{t('dashboard.overdue')} ({overdueDeadlines.length})</span>
                </div>
                {overdueDeadlines.map((deadline) => {
                  const days = differenceInDays(new Date(), new Date(deadline.deadlineDate))
                  return (
                    <div
                      key={deadline.id}
                      className="mb-2 p-2.5 bg-danger-subtle bg-opacity-25 border-start border-danger border-3 rounded-3"
                    >
                      <Form.Check
                        type="checkbox"
                        id={`dl-${deadline.id}`}
                        checked={deadline.status === 'submitted'}
                        onChange={() => onToggleDeadline(deadline.id, deadline.status)}
                        label={
                          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                            <strong className="text-dark small">{deadline.title}</strong>
                            <Badge bg="danger" className="fw-semibold px-2 py-0.5 rounded-pill" style={{ fontSize: '0.7rem' }}>
                              {days} {t('dashboard.daysOverdue')}
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
                <h6 className="fw-bold mb-2 text-muted small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                  {t('dashboard.upcomingDeadlines')}
                </h6>
                {upcomingDeadlines.slice(0, 5).map((deadline) => {
                  const days = differenceInDays(new Date(deadline.deadlineDate), new Date())
                  return (
                    <div
                      key={deadline.id}
                      className="mb-2 p-2.5 bg-light rounded-3 border"
                    >
                      <Form.Check
                        type="checkbox"
                        id={`dl-${deadline.id}`}
                        checked={deadline.status === 'submitted'}
                        onChange={() => onToggleDeadline(deadline.id, deadline.status)}
                        label={
                          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                            <strong className="text-dark small">{deadline.title}</strong>
                            <Badge
                              bg={days <= 7 ? 'warning-subtle' : 'light'}
                              className={`${days <= 7 ? 'text-warning-emphasis border border-warning-subtle' : 'text-secondary border'} fw-semibold px-2 py-0.5 rounded-pill`}
                              style={{ fontSize: '0.7rem' }}
                            >
                              {t('dashboard.dueIn')} {days} {days === 1 ? t('dashboard.day') : t('dashboard.days')}
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
