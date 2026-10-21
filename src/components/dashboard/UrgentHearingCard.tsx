import { useState } from 'react'
import { Card, Badge, Button, Row, Col, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaVideo,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowRight,
  FaClipboardCheck,
} from 'react-icons/fa'
import { differenceInDays, parseISO } from 'date-fns'
import type { FamilyCase, Hearing } from '../../types/domain'
import { displayDate } from '../../utils/displayDate'
import { useTranslation } from '../../hooks/useTranslation'

export interface UrgentHearingCardProps {
  cases: FamilyCase[]
}

interface UpcomingHearingItem {
  hearing: Hearing
  caseData: FamilyCase
  daysAway: number
}

export default function UrgentHearingCard({ cases }: UrgentHearingCardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({})

  const readinessItems = [
    { id: 'cafcass', label: t('dashboard.readinessCafcass') },
    { id: 'statement', label: t('dashboard.readinessStatement') },
    { id: 'bundle', label: t('dashboard.readinessBundle') },
    { id: 'remote', label: t('dashboard.readinessRemote') },
  ]

  // Find all hearings in the future, sorted by date ascending
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingHearings: UpcomingHearingItem[] = []
  for (const c of cases) {
    for (const h of c.hearings || []) {
      if (!h.date) continue
      try {
        const hearingDate = parseISO(h.date)
        const diff = differenceInDays(hearingDate, today)
        if (diff >= 0) {
          upcomingHearings.push({
            hearing: h,
            caseData: c,
            daysAway: diff,
          })
        }
      } catch {
        // Skip invalid date
      }
    }
  }

  upcomingHearings.sort((a, b) => a.daysAway - b.daysAway)
  const nextHearingItem = upcomingHearings[0]

  if (!nextHearingItem) {
    return null
  }

  const { hearing, caseData, daysAway } = nextHearingItem
  const isUrgent = daysAway <= 7
  const isVeryUrgent = daysAway <= 2

  const toggleItem = (id: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const getCountdownLabel = (days: number) => {
    if (days === 0) return t('dashboard.todayCountdown')
    if (days === 1) return t('dashboard.tomorrowCountdown')
    return t('dashboard.inDaysCountdown', { days })
  }

  return (
    <Card
      className={`mb-4 border-2 shadow-sm rounded-3 overflow-hidden ${
        isVeryUrgent
          ? 'border-danger bg-danger-subtle'
          : isUrgent
          ? 'border-warning bg-warning-subtle'
          : 'border-primary-subtle bg-white'
      }`}
    >
      <div className="p-3 p-md-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            <span
              className={`p-2 rounded-circle text-white ${
                isVeryUrgent ? 'bg-danger' : isUrgent ? 'bg-warning text-dark' : 'bg-primary'
              }`}
            >
              {isUrgent ? <FaExclamationCircle size={18} /> : <FaCalendarAlt size={18} />}
            </span>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h6 className="fw-bold mb-0 text-dark">
                  {t('dashboard.urgentHearingTitle')}: {hearing.type}
                </h6>
                <Badge
                  bg={isVeryUrgent ? 'danger' : isUrgent ? 'warning' : 'primary'}
                  className="font-monospace text-uppercase"
                >
                  {getCountdownLabel(daysAway)}
                </Badge>
              </div>
              <div className="small text-secondary">
                {t('casesList.caseToBeDeleted')} <strong>{caseData.title}</strong> {caseData.caseNumber ? `(${caseData.caseNumber})` : ''}
              </div>
            </div>
          </div>

          <Button
            variant={isVeryUrgent ? 'danger' : 'primary'}
            size="sm"
            onClick={() => navigate(`/cases/${caseData.id}`)}
            className="d-flex align-items-center gap-1.5 shadow-xs"
          >
            <span>{t('dashboard.openCaseAndLegalHub')}</span>
            <FaArrowRight size={11} />
          </Button>
        </div>

        {/* Hearing logistics details */}
        <div className="bg-white p-3 rounded-2 border mb-3">
          <Row className="g-2 text-secondary small align-items-center">
            <Col sm={6} md={3}>
              <div className="d-flex align-items-center gap-1.5 text-dark fw-medium">
                <FaCalendarAlt className="text-primary" />
                <span>{displayDate(hearing.date)}</span>
                {hearing.time && <span className="text-muted">at {hearing.time}</span>}
              </div>
            </Col>

            <Col sm={6} md={4}>
              <div className="d-flex align-items-center gap-1.5">
                <FaMapMarkerAlt className="text-danger" />
                <span>{hearing.location || 'Location to be confirmed by court'}</span>
              </div>
            </Col>

            <Col sm={6} md={3}>
              {hearing.remoteLink ? (
                <a
                  href={hearing.remoteLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary text-decoration-none d-inline-flex align-items-center gap-1 fw-medium"
                >
                  <FaVideo size={12} />
                  <span>{t('dashboard.joinRemoteVideo')}</span>
                </a>
              ) : (
                <span>{t('dashboard.formatInPerson')}</span>
              )}
            </Col>

            <Col sm={6} md={2} className="text-md-end">
              {hearing.judge && (
                <span className="badge bg-light text-dark border">
                  {t('dashboard.judgeLabel')} {hearing.judge}
                </span>
              )}
            </Col>
          </Row>
        </div>

        {/* Litigant Hearing Readiness Checklist */}
        <div className="border-top pt-2 mt-2">
          <div className="d-flex align-items-center gap-1.5 mb-2 small fw-bold text-dark">
            <FaClipboardCheck className="text-success" size={14} />
            <span>{t('dashboard.readinessChecklist')}:</span>
          </div>

          <Row className="g-2">
            {readinessItems.map((item) => {
              const isDone = Boolean(completedItems[item.id])
              return (
                <Col key={item.id} md={6}>
                  <div
                    className={`d-flex align-items-center gap-2 p-2 rounded border small cursor-pointer transition-all ${
                      isDone ? 'bg-success-subtle border-success-subtle text-success-emphasis' : 'bg-white'
                    }`}
                    onClick={() => toggleItem(item.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Form.Check
                      type="checkbox"
                      id={`check-${item.id}`}
                      checked={isDone}
                      onChange={() => toggleItem(item.id)}
                      className="m-0"
                    />
                    <span className={isDone ? 'text-decoration-line-through' : 'fw-medium text-dark'}>
                      {item.label}
                    </span>
                    {isDone && <FaCheckCircle className="ms-auto text-success flex-shrink-0" size={12} />}
                  </div>
                </Col>
              )
            })}
          </Row>
        </div>
      </div>
    </Card>
  )
}
