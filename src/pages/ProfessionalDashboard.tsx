import { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Card, Table, Badge, Button, Form, Alert, ListGroup } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import { getDeadlinesForUser, updateDeadline } from '../services/storage'
import { format, isPast, isToday, differenceInDays } from 'date-fns'
import type { DocumentDeadline, FamilyCase } from '../types/domain'
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGavel,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaEye,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFileAlt,
} from 'react-icons/fa'

type SortField = 'title' | 'caseId' | 'nextHearing' | 'deadline' | 'priority'
type SortDirection = 'asc' | 'desc'

function getPriorityColor(daysUntilDeadline: number): string {
  if (daysUntilDeadline < 0) return 'danger' // Red - Overdue
  if (daysUntilDeadline <= 7) return 'warning' // Yellow - Urgent
  return 'success' // Green - OK
}

function getPriorityClass(daysUntilDeadline: number): string {
  if (daysUntilDeadline < 0) return 'priority-high'
  if (daysUntilDeadline <= 7) return 'priority-medium'
  return 'priority-low'
}

function getNextDeadline(caseData: FamilyCase, deadlines: DocumentDeadline[]): DocumentDeadline | null {
  const caseDeadlines = deadlines.filter((d) => d.caseId === caseData.id && d.status === 'pending')
  if (caseDeadlines.length === 0) return null
  return caseDeadlines.sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime())[0]
}

export default function ProfessionalDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { cases } = useCasesStore()
  const [deadlines, setDeadlines] = useState<DocumentDeadline[]>([])
  const [sortField, setSortField] = useState<SortField>('priority')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [upcomingHearings, setUpcomingHearings] = useState<
    Array<{
      caseId: string
      caseTitle: string
      hearing: { id: string; type: string; date: string; time?: string; location?: string; judge?: string }
    }>
  >([])

  useEffect(() => {
    if (!user) return

    const userDeadlines = getDeadlinesForUser(user.id)
    setDeadlines(userDeadlines)

    const userCases = cases.filter((c) => c.members?.some((m) => m.userId === user.id))

    const hearings: Array<{
      caseId: string
      caseTitle: string
      hearing: { id: string; type: string; date: string; time?: string; location?: string; judge?: string }
    }> = []

    userCases.forEach((caseData) => {
      caseData.hearings.forEach((hearing) => {
        const hearingDate = new Date(hearing.date)
        if (hearingDate >= new Date()) {
          hearings.push({
            caseId: caseData.id,
            caseTitle: caseData.title,
            hearing: {
              id: hearing.id,
              type: hearing.type,
              date: hearing.date,
              time: hearing.time,
              location: hearing.location,
              judge: hearing.judge,
            },
          })
        }
      })
    })

    hearings.sort((a, b) => new Date(a.hearing.date).getTime() - new Date(b.hearing.date).getTime())
    setUpcomingHearings(hearings)
  }, [user, cases])

  const userCases = useMemo(() => {
    if (!user) return []
    return cases.filter((c) => c.members?.some((m) => m.userId === user.id))
  }, [user, cases])

  const sortedCases = useMemo(() => {
    const sorted = [...userCases]
    sorted.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'caseId':
          aValue = a.id.toLowerCase()
          bValue = b.id.toLowerCase()
          break
        case 'nextHearing': {
          const aHearing = a.hearings
            .filter((h) => new Date(h.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
          const bHearing = b.hearings
            .filter((h) => new Date(h.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
          aValue = aHearing ? new Date(aHearing.date).getTime() : Infinity
          bValue = bHearing ? new Date(bHearing.date).getTime() : Infinity
          break
        }
        case 'deadline': {
          const aDeadline = getNextDeadline(a, deadlines)
          const bDeadline = getNextDeadline(b, deadlines)
          aValue = aDeadline ? new Date(aDeadline.deadlineDate).getTime() : Infinity
          bValue = bDeadline ? new Date(bDeadline.deadlineDate).getTime() : Infinity
          break
        }
        case 'priority': {
          const aDeadline = getNextDeadline(a, deadlines)
          const bDeadline = getNextDeadline(b, deadlines)
          const aDays = aDeadline ? differenceInDays(new Date(aDeadline.deadlineDate), new Date()) : Infinity
          const bDays = bDeadline ? differenceInDays(new Date(bDeadline.deadlineDate), new Date()) : Infinity
          aValue = aDays
          bValue = bDays
          break
        }
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [userCases, sortField, sortDirection, deadlines])

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  function getSortIcon(field: SortField) {
    if (sortField !== field) return <FaSort className="ms-1 text-muted" />
    return sortDirection === 'asc' ? (
      <FaSortUp className="ms-1 text-primary" />
    ) : (
      <FaSortDown className="ms-1 text-primary" />
    )
  }

  function handleDeadlineToggle(deadlineId: string, currentStatus: DocumentDeadline['status']) {
    const newStatus = currentStatus === 'submitted' ? 'pending' : 'submitted'
    updateDeadline(deadlineId, {
      status: newStatus,
      submittedAt: newStatus === 'submitted' ? new Date().toISOString() : undefined,
    })
    setDeadlines((prev) =>
      prev.map((d) =>
        d.id === deadlineId
          ? { ...d, status: newStatus, submittedAt: newStatus === 'submitted' ? new Date().toISOString() : undefined }
          : d
      )
    )
  }

  const pendingDeadlines = deadlines.filter((d) => d.status === 'pending')
  const overdueDeadlines = pendingDeadlines.filter(
    (d) => isPast(new Date(d.deadlineDate)) && !isToday(new Date(d.deadlineDate))
  )
  const upcomingDeadlines = pendingDeadlines.filter((d) => !isPast(new Date(d.deadlineDate)) || isToday(new Date(d.deadlineDate)))

  if (!user) {
    return (
      <Container>
        <Alert variant="warning">Please log in</Alert>
      </Container>
    )
  }

  return (
    <Container fluid>
      <div className="mb-4">
        <h1 className="display-4 fw-bold mb-2">
          <FaGavel className="me-2" />
          Professional Dashboard
        </h1>
        <p className="lead" style={{ color: 'var(--airbnb-gray)' }}>
          Welcome, <span style={{ color: 'var(--airbnb-green)', fontWeight: 700 }}>{user.name}</span> ({user.role}). Manage your cases, hearings, and deadlines.
        </p>
      </div>

      <Row className="g-4 mb-4">
        <Col xs={12} lg={6}>
          <Card className="shadow-sm" style={{ background: 'var(--airbnb-light)', border: '1px solid var(--airbnb-border)' }}>
            <Card.Header className="text-white" style={{ background: 'var(--airbnb-coral)' }}>
              <h5 className="mb-0" style={{ color: 'var(--airbnb-light)' }}>
                <FaCalendarAlt className="me-2" />
                Upcoming Hearings
              </h5>
            </Card.Header>
            <Card.Body>
              {upcomingHearings.length === 0 ? (
                <Alert variant="info" className="mb-0" style={{ background: 'var(--airbnb-yellow)', color: 'var(--airbnb-dark)', fontWeight: 600 }}>
                  No upcoming hearings
                </Alert>
              ) : (
                <ListGroup variant="flush">
                  {upcomingHearings.slice(0, 10).map((item) => (
                    <ListGroup.Item key={item.hearing.id} className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="fw-bold mb-1">
                          {item.hearing.type}
                          {isToday(new Date(item.hearing.date)) && (
                            <Badge style={{ background: 'var(--airbnb-yellow)', color: 'var(--airbnb-dark)', fontWeight: 600, padding: '0.2em 0.7em' }} className="ms-2">
                              Today
                            </Badge>
                          )}
                        </div>
                        <div className="small text-muted mb-1">
                          <strong>{item.caseTitle}</strong> ({item.caseId})
                        </div>
                        <div className="small">
                          <FaCalendarAlt className="me-1" />
                          {format(new Date(item.hearing.date), 'PPP')}
                          {item.hearing.time && ` at ${item.hearing.time}`}
                        </div>
                        {item.hearing.location && (
                          <div className="small">
                            <FaMapMarkerAlt className="me-1" />
                            {item.hearing.location}
                          </div>
                        )}
                        {item.hearing.judge && (
                          <div className="small">
                            <FaGavel className="me-1" />
                            {item.hearing.judge}
                          </div>
                        )}
                      </div>
                      <Button variant="outline-primary" size="sm" style={{ fontWeight: 700, fontSize: '0.98rem' }} onClick={() => navigate(`/cases/${item.caseId}`)}>
                        <FaEye className="me-1" />
                        View
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={6}>
          <Card className="shadow-sm" style={{ background: 'var(--airbnb-light)'}}>
            <Card.Header className="text-white" style={{ background: 'var(--airbnb-coral)'}}>
              <h5 className="mb-0" style={{ color: 'var(--airbnb-light)' }}>
                <FaFileAlt className="me-2" />
                Document Submission Deadlines
              </h5>
            </Card.Header>
            <Card.Body>
              {pendingDeadlines.length === 0 ? (
                <Alert variant="success" className="mb-0" style={{ background: 'var(--airbnb-green)', color: 'var(--airbnb-light)', fontWeight: 600 }}>
                  <FaCheckCircle className="me-2" />
                  No pending deadlines
                </Alert>
              ) : (
                <div>
                  {overdueDeadlines.length > 0 && (
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2" style={{ color: 'var(--airbnb-coral)' }}>
                        <FaExclamationTriangle className="me-1" />
                        Overdue ({overdueDeadlines.length})
                      </h6>
                      {overdueDeadlines.map((deadline) => {
                        const days = differenceInDays(new Date(), new Date(deadline.deadlineDate))
                        return (
                          <div key={deadline.id} className="mb-2 p-2 priority-high rounded">
                            <Form.Check
                              type="checkbox"
                              checked={deadline.status === 'submitted'}
                              onChange={() => handleDeadlineToggle(deadline.id, deadline.status)}
                              label={
                                <div>
                                  <strong>{deadline.title}</strong>
                                  <Badge style={{ background: 'var(--airbnb-coral)', color: '#fff', fontWeight: 600, padding: '0.2em 0.7em' }} className="ms-2">
                                    {days} days overdue
                                  </Badge>
                                  <div className="small text-muted mt-1">
                                    Due: {format(new Date(deadline.deadlineDate), 'PPP')}
                                  </div>
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
                      <h6 className="fw-bold mb-2" style={{ color: 'var(--airbnb-dark)' }}>
                        <FaClock className="me-1" />
                        Upcoming ({upcomingDeadlines.length})
                      </h6>
                      {upcomingDeadlines.map((deadline) => {
                        const days = differenceInDays(new Date(deadline.deadlineDate), new Date())
                        const priorityColor = getPriorityColor(days)
                        const priorityClass = getPriorityClass(days)
                        return (
                          <div key={deadline.id} className={`mb-2 p-2 ${priorityClass} rounded`}>
                            <Form.Check
                              type="checkbox"
                              checked={deadline.status === 'submitted'}
                              onChange={() => handleDeadlineToggle(deadline.id, deadline.status)}
                              label={
                                <div>
                                  <strong>{deadline.title}</strong>
                                  {days <= 7 && (
                                    <Badge style={{ background: priorityColor === 'danger' ? 'var(--airbnb-coral)' : priorityColor === 'warning' ? 'var(--airbnb-yellow)' : 'var(--airbnb-green)', color: priorityColor === 'warning' ? 'var(--airbnb-dark)' : '#fff', fontWeight: 600, padding: '0.2em 0.7em' }} className="ms-2">
                                      {days <= 0 ? 'Due today' : `${days} days left`}
                                    </Badge>
                                  )}
                                  <div className="small text-muted mt-1">
                                    Due: {format(new Date(deadline.deadlineDate), 'PPP')}
                                  </div>
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
        </Col>
      </Row>

      <Card className="shadow-sm" style={{ background: 'var(--airbnb-light)' }}>
        <Card.Header className="text-white" style={{ background: 'var(--airbnb-coral)' }}>
          <h5 className="mb-0" style={{ color: 'var(--airbnb-light)' }}>
            <FaGavel className="me-2" />
            My Assigned Cases
          </h5>
        </Card.Header>
        <Card.Body>
          {sortedCases.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No cases assigned yet
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('caseId')}>
                      Case ID {getSortIcon('caseId')}
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('title')}>
                      Title {getSortIcon('title')}
                    </th>
                    <th>Court & Type</th>
                    <th>Status</th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('nextHearing')}>
                      Next Hearing {getSortIcon('nextHearing')}
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('deadline')}>
                      Next Deadline {getSortIcon('deadline')}
                    </th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('priority')}>
                      Priority {getSortIcon('priority')}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCases.map((caseData) => {
                    const nextHearing = caseData.hearings
                      .filter((h) => new Date(h.date) >= new Date())
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
                    const nextDeadline = getNextDeadline(caseData, deadlines)
                    const deadlineDays = nextDeadline
                      ? differenceInDays(new Date(nextDeadline.deadlineDate), new Date())
                      : Infinity
                    const priorityColor = getPriorityColor(deadlineDays)
                    const priorityClass = getPriorityClass(deadlineDays)

                    return (
                      <tr key={caseData.id} className={priorityClass}>
                        <td className="fw-bold">{caseData.id}</td>
                        <td>{caseData.title}</td>
                        <td>
                          <small>
                            {caseData.court}
                            <br />
                            {caseData.caseType}
                          </small>
                        </td>
                        <td>
                          <Badge
                            style={{
                              background: caseData.status === 'Open'
                                ? 'var(--airbnb-green)'
                                : caseData.status === 'Stayed'
                                  ? 'var(--airbnb-yellow)'
                                  : 'var(--airbnb-gray)',
                              color: caseData.status === 'Stayed' ? '#222' : '#fff',
                              fontWeight: 600,
                              fontSize: '0.95em',
                              padding: '0.3em 0.9em',
                            }}
                          >
                            {caseData.status}
                          </Badge>
                        </td>
                        <td>
                          {nextHearing ? (
                            <small>
                              <FaCalendarAlt className="me-1" />
                              {format(new Date(nextHearing.date), 'MMM d, yyyy')}
                              {nextHearing.time && <br />}
                              {nextHearing.time && <span className="text-muted">{nextHearing.time}</span>}
                            </small>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          {nextDeadline ? (
                            <small>
                              <FaFileAlt className="me-1" />
                              {format(new Date(nextDeadline.deadlineDate), 'MMM d, yyyy')}
                            </small>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          {nextDeadline ? (
                            <Badge style={{
                              background: priorityColor === 'danger' ? 'var(--airbnb-coral)' : priorityColor === 'warning' ? 'var(--airbnb-yellow)' : 'var(--airbnb-green)',
                              color: priorityColor === 'warning' ? 'var(--airbnb-dark)' : '#fff',
                              fontWeight: 600,
                              padding: '0.2em 0.7em',
                            }}>
                              {deadlineDays < 0
                                ? `${Math.abs(deadlineDays)} days overdue`
                                : deadlineDays <= 7
                                  ? `${deadlineDays} days left`
                                  : 'OK'}
                            </Badge>
                          ) : (
                            <Badge bg="secondary">No deadline</Badge>
                          )}
                        </td>
                        <td>
                          <Button variant="outline-primary" size="sm" onClick={() => navigate(`/cases/${caseData.id}`)}>
                            <FaEye className="me-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}
