import { useState, useMemo } from 'react'
import { Card, Table, Badge, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { format, differenceInDays } from 'date-fns'
import type { DocumentDeadline, FamilyCase } from '../../types/domain'
import { FaSort, FaSortUp, FaSortDown, FaEye } from 'react-icons/fa'

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
  const [sortField, setSortField] = useState<SortField>('priority')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const sortedCases = useMemo(() => {
    const sorted = [...cases]
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
  }, [cases, sortField, sortDirection, deadlines])

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
      <div className="mb-3">
        <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
          <span>My Assigned Family Cases</span>
          <Badge bg="secondary" className="fs-6 px-2 py-1">
            {cases.length} Active
          </Badge>
        </h4>
        <p className="text-secondary small mb-0">
          Private court cases where you have been invited by a litigant as their McKenzie Friend, legal representative, or collaborator.
        </p>
      </div>

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
              <th onClick={() => handleSort('nextHearing')} style={{ cursor: 'pointer' }}>
                Next Hearing {renderSortIcon('nextHearing')}
              </th>
              <th onClick={() => handleSort('deadline')} style={{ cursor: 'pointer' }}>
                Next Deadline {renderSortIcon('deadline')}
              </th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedCases.map((c) => {
              const nextHearing = c.hearings
                .filter((h) => new Date(h.date) >= new Date())
                .sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime())[0]
              const nextDl = getNextDeadline(c, deadlines)

              return (
                <tr key={c.id}>
                  <td className="fw-bold text-primary">{c.id}</td>
                  <td>{c.title}</td>
                  <td className="small text-muted">
                    {c.court}
                    <br />
                    <span className="text-secondary">{c.caseType}</span>
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
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate(`/cases/${c.id}`)}
                      className="d-inline-flex align-items-center gap-1"
                    >
                      <FaEye />
                      <span>View</span>
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
    </div>
  )
}
