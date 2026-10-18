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

type SortField = 'title' | 'caseId' | 'nextHearing' | 'deadline' | 'priority'
type SortDirection = 'asc' | 'desc'

interface AssignedCasesTabProps {
  cases: FamilyCase[]
  deadlines: DocumentDeadline[]
}

function getNextDeadline(caseData: FamilyCase, deadlines: DocumentDeadline[]): DocumentDeadline | null {
  const caseDeadlines = deadlines.filter((d) => d.caseId === caseData.id && d.status === 'pending')
  if (caseDeadlines.length === 0) return null
  return caseDeadlines.sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime())[0]
}

export default function AssignedCasesTab({ cases, deadlines }: AssignedCasesTabProps) {
  const navigate = useNavigate()
  const store = useCasesStore()
  const { user } = useAuthStore()

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
          <h5 className="text-secondary">No Assigned Cases</h5>
          <p className="text-muted small">
            You are not currently assigned to any cases as a representative or collaborator.
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
            <span>My Assigned Family Cases</span>
            <Badge bg="secondary" className="fs-6 px-2 py-1">
              {cases.length} Total
            </Badge>
          </h4>
          <p className="text-secondary small mb-0">
            Private court cases where you have been invited by a litigant as their McKenzie Friend, legal representative, or collaborator.
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
                placeholder="Search assigned cases by title, case ID, or court..."
                className="border-start-0"
              />
            </div>
          </Col>

          <Col md={6} className="d-flex justify-content-md-end align-items-center gap-2">
            <span className="small text-muted d-flex align-items-center gap-1">
              <FaFilter size={10} />
              <span>Status:</span>
            </span>
            <Form.Select
              size="sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '140px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Stayed">Stayed</option>
              <option value="Concluded">Concluded</option>
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
                  Case ID {renderSortIcon('caseId')}
                </th>
                <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                  Title {renderSortIcon('title')}
                </th>
                <th>Court / Type</th>
                <th>Status</th>
                <th onClick={() => handleSort('nextHearing')} style={{ cursor: 'pointer' }}>
                  Next Hearing {renderSortIcon('nextHearing')}
                </th>
                <th onClick={() => handleSort('deadline')} style={{ cursor: 'pointer' }}>
                  Next Deadline {renderSortIcon('deadline')}
                </th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    No assigned cases match your search criteria.
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
                      <td className="fw-bold text-primary">{c.caseNumber || c.id}</td>
                      <td>
                        <div className="fw-semibold text-dark">{c.title}</div>
                      </td>
                      <td className="small text-muted">
                        {c.court}
                        <br />
                        <span className="text-secondary">{c.caseType}</span>
                      </td>
                      <td>
                        <Badge
                          bg={c.status === 'Open' ? 'success' : c.status === 'Stayed' ? 'warning' : 'secondary'}
                          className="font-monospace"
                          style={{ fontSize: '0.7rem' }}
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="small">
                        {nextHearing ? (
                          <div>
                            {format(new Date(nextHearing.date), 'dd MMM yyyy')}
                            <Badge bg="info" className="ms-1 px-1">
                              {nextHearing.type}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted">None scheduled</span>
                        )}
                      </td>
                      <td className="small">
                        {nextDl ? (
                          <div>
                            {format(new Date(nextDl.deadlineDate), 'dd MMM yyyy')}
                            <Badge bg="warning" className="ms-1 px-1 text-dark">
                              {nextDl.title}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-muted">No deadlines</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-1 justify-content-end">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleOpenNoteModal(c)}
                            title="Quick Attendance Note"
                            className="d-inline-flex align-items-center gap-1 py-1 px-2"
                            style={{ fontSize: '0.78rem' }}
                          >
                            <FaStickyNote size={11} className="text-warning" />
                            <span>Note</span>
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/cases/${c.id}`)}
                            className="d-inline-flex align-items-center gap-1 py-1 px-2"
                            style={{ fontSize: '0.78rem' }}
                          >
                            <FaEye size={11} />
                            <span>View</span>
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
              <span>Record Contemporaneous Note</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3">
            <div className="small text-muted mb-2">
              Case: <strong>{targetCaseForNote.title}</strong> ({targetCaseForNote.id})
            </div>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold">Attendance Category</Form.Label>
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
              <Form.Label className="small fw-semibold">Note Author</Form.Label>
              <Form.Control
                size="sm"
                value={noteAuthor}
                onChange={(e) => setNoteAuthor(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold">Contemporaneous Note</Form.Label>
              <Form.Control
                size="sm"
                as="textarea"
                rows={4}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Log notes, client instructions, submissions made, or directions given..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-between py-2">
            <Button variant="outline-secondary" size="sm" onClick={() => setTargetCaseForNote(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAttendanceNote}
              disabled={!noteContent.trim()}
            >
              Save Note to Case
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  )
}
