import { useState, useMemo } from 'react'
import { Card, Table, Badge, Button, Form, Row, Col, Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { format, differenceInDays } from 'date-fns'
import type { DocumentDeadline, FamilyCase } from '../../types/domain'
import { FaSort, FaSortUp, FaSortDown, FaEye, FaStickyNote, FaSearch, FaFilter } from 'react-icons/fa'
import { useCasesStore } from '../../store/casesStore'
import { useAuthStore } from '../../store/authStore'
import { withAppendedNote } from '../../utils/caseNotes'
import { toast } from '../../store/toastStore'
import { useTranslation } from '../../hooks/useTranslation'
import CaseStatusBadge from '../common/CaseStatusBadge'

type SortField = 'title' | 'caseId' | 'nextHearing' | 'deadline' | 'priority'
type SortDirection = 'asc' | 'desc'

interface AssignedCasesTabProps {
  cases: FamilyCase[]
  deadlines: DocumentDeadline[]
}

function getNextDeadline(caseData: FamilyCase, deadlines: DocumentDeadline[]): DocumentDeadline | null {
  const caseDeadlines = deadlines.filter(
    (d) => (d.caseId === caseData.id || (Boolean(caseData.caseNumber) && d.caseId === caseData.caseNumber)) && d.status === 'pending'
  )
  if (caseDeadlines.length === 0) return null
  return caseDeadlines.sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime())[0]
}

export default function AssignedCasesTab({ cases, deadlines }: AssignedCasesTabProps) {
  const navigate = useNavigate()
  const store = useCasesStore()
  const { user } = useAuthStore()
  const { t } = useTranslation()

  const [sortField, setSortField] = useState<SortField>('priority')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Quick Attendance Note modal state
  const [targetCaseForNote, setTargetCaseForNote] = useState<FamilyCase | null>(null)
  const [noteCategory, setNoteCategory] = useState('Hearing Attendance')
  const [noteAuthor, setNoteAuthor] = useState(user?.name || 'Legal Supporter')
  const [noteContent, setNoteContent] = useState('')

  // Filter cases by search and status
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.caseNumber && c.caseNumber.toLowerCase().includes(q)) ||
        c.court.toLowerCase().includes(q) ||
        c.caseType.toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [cases, searchQuery, statusFilter])

  const sortedCases = useMemo(() => {
    const sorted = [...filteredCases]
    sorted.sort((a, b) => {
      let aVal: string | number = 0
      let bVal: string | number = 0

      switch (sortField) {
        case 'title':
          aVal = a.title.toLowerCase()
          bVal = b.title.toLowerCase()
          break
        case 'caseId':
          aVal = a.id.toLowerCase()
          bVal = b.id.toLowerCase()
          break
        case 'nextHearing': {
          const aH = a.hearings
            .filter((h) => new Date(h.date) >= new Date())
            .sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime())[0]
          const bH = b.hearings
            .filter((h) => new Date(h.date) >= new Date())
            .sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime())[0]
          aVal = aH ? new Date(aH.date).getTime() : Infinity
          bVal = bH ? new Date(bH.date).getTime() : Infinity
          break
        }
        case 'deadline': {
          const aD = getNextDeadline(a, deadlines)
          const bD = getNextDeadline(b, deadlines)
          aVal = aD ? new Date(aD.deadlineDate).getTime() : Infinity
          bVal = bD ? new Date(bD.deadlineDate).getTime() : Infinity
          break
        }
        case 'priority': {
          const aD = getNextDeadline(a, deadlines)
          const bD = getNextDeadline(b, deadlines)
          aVal = aD ? differenceInDays(new Date(aD.deadlineDate), new Date()) : Infinity
          bVal = bD ? differenceInDays(new Date(bD.deadlineDate), new Date()) : Infinity
          break
        }
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredCases, sortField, sortDirection, deadlines])

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  function renderSortIcon(field: SortField) {
    if (sortField !== field) return <FaSort className="ms-1 text-muted" />
    return sortDirection === 'asc' ? (
      <FaSortUp className="ms-1 text-primary" />
    ) : (
      <FaSortDown className="ms-1 text-primary" />
    )
  }

  const handleOpenNoteModal = (caseData: FamilyCase) => {
    setTargetCaseForNote(caseData)
    setNoteAuthor(user?.name || 'Legal Supporter')
    setNoteCategory('Hearing Attendance')
    setNoteContent('')
  }

  const handleSaveAttendanceNote = () => {
    if (!targetCaseForNote || !noteContent.trim()) return
    const formattedNote = `[${noteCategory}] ${noteContent.trim()}`
    const updated = withAppendedNote(targetCaseForNote, noteAuthor, formattedNote)
    store.addOrUpdate(updated)
    toast.success(`Contemporaneous note saved to case "${targetCaseForNote.title}".`, 'Note Saved')
    setTargetCaseForNote(null)
    setNoteContent('')
  }

  if (cases.length === 0) {
    return (
      <Card className="shadow-sm border-0 p-4 text-center">
        <Card.Body>
          <h5 className="text-secondary">{t('professional.noAssignedCases')}</h5>
          <p className="text-muted small">
            {t('professional.noAssignedCasesDesc')}
          </p>
        </Card.Body>
      </Card>
    )
  }

  return (
    <div className="my-2">
      <div className="mb-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <span>{t('professional.myAssignedCases')}</span>
            <Badge bg="secondary" className="fs-6 px-2 py-1">
              {cases.length} {t('common.total')}
            </Badge>
          </h4>
          <p className="text-secondary small mb-0">
            {t('professional.myAssignedCasesDesc')}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border shadow-none bg-light p-2 mb-3">
        <Row className="g-2 align-items-center">
          <Col md={6}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white border-end-0">
                <FaSearch size={11} className="text-muted" />
              </span>
              <Form.Control
                size="sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('professional.searchAssignedPlaceholder')}
                className="border-start-0"
              />
            </div>
          </Col>

          <Col md={6} className="d-flex justify-content-md-end align-items-center gap-2">
            <span className="small text-muted d-flex align-items-center gap-1">
              <FaFilter size={10} />
              <span>{t('professional.statusFilterLabel')}</span>
            </span>
            <Form.Select
              size="sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '140px' }}
            >
              <option value="ALL">{t('professional.allStatuses')}</option>
              <option value="Open">{t('common.open')}</option>
              <option value="Stayed">{t('common.stayed')}</option>
              <option value="Concluded">{t('common.concluded')}</option>
            </Form.Select>
          </Col>
        </Row>
      </Card>

      <Card className="shadow-sm border rounded-4 overflow-hidden">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th onClick={() => handleSort('caseId')} style={{ cursor: 'pointer' }}>
                  {t('common.caseNumber')} {renderSortIcon('caseId')}
                </th>
                <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                  {t('common.title')} {renderSortIcon('title')}
                </th>
                <th>{t('dashboard.courtAndTrack')}</th>
                <th>{t('dashboard.status')}</th>
                <th onClick={() => handleSort('nextHearing')} style={{ cursor: 'pointer' }}>
                  {t('dashboard.nextListing')} {renderSortIcon('nextHearing')}
                </th>
                <th onClick={() => handleSort('deadline')} style={{ cursor: 'pointer' }}>
                  {t('dashboard.deadlines')} {renderSortIcon('deadline')}
                </th>
                <th className="text-end">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    {t('professional.noAssignedMatchingFilter')}
                  </td>
                </tr>
              ) : (
                sortedCases.map((c) => {
                  const nextHearing = c.hearings
                    .filter((h) => new Date(h.date) >= new Date())
                    .sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime())[0]
                  const nextDl = getNextDeadline(c, deadlines)

                  return (
                    <tr key={c.id}>
                      <td>
                        <span className="badge bg-light text-primary border font-monospace px-2.5 py-1.5 rounded-2 d-inline-flex align-items-center" style={{ fontSize: '0.8rem' }}>
                          {c.caseNumber || c.id}
                        </span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{c.title}</div>
                      </td>
                      <td className="small text-muted">
                        <div className="fw-medium text-dark">{c.court}</div>
                        <span className="text-secondary">{c.caseType}</span>
                      </td>
                      <td>
                        <CaseStatusBadge status={c.status} />
                      </td>
                      <td className="small">
                        {nextHearing ? (
                          <div>
                            <span className="fw-medium text-dark">{format(new Date(nextHearing.date), 'dd MMM yyyy')}</span>
                            <Badge bg="info-subtle" className="text-info border border-info-subtle ms-1 px-1.5 py-0.5 rounded-pill">
                              {nextHearing.type}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted fst-italic">{t('professional.noneScheduled')}</span>
                        )}
                      </td>
                      <td className="small">
                        {nextDl ? (
                          <div>
                            <span className="fw-medium text-dark">{format(new Date(nextDl.deadlineDate), 'dd MMM yyyy')}</span>
                            <Badge bg="warning-subtle" className="text-warning-emphasis border border-warning-subtle ms-1 px-1.5 py-0.5 rounded-pill">
                              {nextDl.title}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted fst-italic">{t('professional.noDeadlines')}</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-1.5 justify-content-end align-items-center">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleOpenNoteModal(c)}
                            title={t('professional.quickAttendanceNote')}
                            className="d-inline-flex align-items-center gap-1.5 py-1 px-2.5 rounded-2"
                            style={{ fontSize: '0.78rem' }}
                          >
                            <FaStickyNote size={12} className="text-warning" />
                            <span>{t('common.quickNote')}</span>
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/cases/${c.id}`)}
                            className="d-inline-flex align-items-center gap-1.5 py-1 px-2.5 rounded-2 shadow-xs"
                            style={{ fontSize: '0.78rem' }}
                          >
                            <FaEye size={12} />
                            <span>{t('common.view')}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Quick Attendance Note Modal */}
      {targetCaseForNote && (
        <Modal show={true} onHide={() => setTargetCaseForNote(null)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
              <FaStickyNote className="text-warning" />
              <span>{t('professional.recordContemporaneousNote')}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3">
            <div className="small text-muted mb-2">
              Case: <strong>{targetCaseForNote.title}</strong> ({targetCaseForNote.id})
            </div>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold">{t('professional.attendanceCategory')}</Form.Label>
              <Form.Select
                size="sm"
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value)}
              >
                <option value="Hearing Attendance">Hearing Attendance</option>
                <option value="Telephone Attendance">Telephone Attendance (Client / Opponent)</option>
                <option value="Client Conference">Client Strategy Conference</option>
                <option value="Drafting / Bundle Review">Drafting & Document Review</option>
                <option value="CAFCASS Consultation">CAFCASS / Local Authority Consultation</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold">{t('professional.noteAuthor')}</Form.Label>
              <Form.Control
                size="sm"
                value={noteAuthor}
                onChange={(e) => setNoteAuthor(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold">{t('caseTabs.noteContent')}</Form.Label>
              <Form.Control
                size="sm"
                as="textarea"
                rows={4}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={t('professional.noteContentPlaceholder')}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-between py-2">
            <Button variant="outline-secondary" size="sm" onClick={() => setTargetCaseForNote(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAttendanceNote}
              disabled={!noteContent.trim()}
            >
              {t('professional.saveNoteToCase')}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  )
}
