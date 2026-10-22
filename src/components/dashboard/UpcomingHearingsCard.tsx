import { Card, ListGroup, Badge } from 'react-bootstrap'
import { format, isToday } from 'date-fns'
import { FaCalendarAlt, FaCalendarCheck, FaGavel, FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import { ViewCaseButton } from '../common/CaseCardButtons'
import { useTranslation } from '../../hooks/useTranslation'

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
  const { t } = useTranslation()

  return (
    <Card className="shadow-sm border rounded-4 h-100 bg-white overflow-hidden">
      <div className="p-3 p-md-4 border-bottom d-flex align-items-center justify-content-between bg-white">
        <div className="d-flex align-items-center gap-2.5">
          <div className="p-2 rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center">
            <FaCalendarAlt size={16} />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark fs-6">{t('dashboard.upcomingHearings')}</h5>
            <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
              {hearings.length} {hearings.length === 1 ? t('common.listing') : t('common.listings')}
            </span>
          </div>
        </div>
        <Badge
          bg={hearings.length > 0 ? 'primary-subtle' : 'secondary-subtle'}
          className={`${hearings.length > 0 ? 'text-primary' : 'text-secondary'} px-2.5 py-1.5 rounded-pill`}
        >
          {hearings.length}
        </Badge>
      </div>

      <Card.Body className="p-3 p-md-4">
        {hearings.length === 0 ? (
          <div className="text-center py-4 px-2">
            <div
              className="p-3 rounded-circle bg-light text-muted d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '56px', height: '56px' }}
            >
              <FaCalendarCheck size={26} className="text-primary opacity-75" />
            </div>
            <h6 className="fw-bold text-dark mb-1">{t('dashboard.noUpcomingHearings')}</h6>
            <p className="text-muted small mb-0" style={{ maxWidth: '340px', margin: '0 auto', fontSize: '0.82rem', lineHeight: 1.5 }}>
              {t('dashboard.noUpcomingHearingsDesc')}
            </p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {hearings.slice(0, 10).map((item) => (
              <ListGroup.Item
                key={item.hearing.id}
                className="d-flex justify-content-between align-items-start px-0 py-3 border-bottom"
              >
                <div className="flex-grow-1 pe-3">
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <span className="fw-bold text-dark">{item.hearing.type}</span>
                    {isToday(new Date(item.hearing.date)) && (
                      <Badge bg="warning" text="dark" className="fw-semibold px-2 py-0.5 rounded-pill" style={{ fontSize: '0.7rem' }}>
                        {t('common.today')}
                      </Badge>
                    )}
                    <span className="text-muted small">• {item.caseTitle}</span>
                  </div>
                  <div className="small text-muted d-flex align-items-center gap-3 flex-wrap">
                    <span className="d-inline-flex align-items-center gap-1">
                      <FaClock size={11} className="text-secondary" />
                      {format(new Date(item.hearing.date), 'dd MMM yyyy')}
                      {item.hearing.time && ` (${item.hearing.time})`}
                    </span>
                    {item.hearing.location && (
                      <span className="d-inline-flex align-items-center gap-1">
                        <FaMapMarkerAlt size={11} className="text-secondary" />
                        {item.hearing.location}
                      </span>
                    )}
                    {item.hearing.judge && (
                      <span className="d-inline-flex align-items-center gap-1">
                        <FaGavel size={11} className="text-secondary" />
                        {item.hearing.judge}
                      </span>
                    )}
                  </div>
                </div>
                <ViewCaseButton
                  caseId={item.caseId}
                  variant="outline-primary"
                  size="sm"
                  label={t('common.view')}
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
