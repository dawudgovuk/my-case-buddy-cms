import type { ReactNode } from 'react'
import { Card, Button, Badge } from 'react-bootstrap'
import { FaEdit, FaUsers, FaChild } from 'react-icons/fa'
import type { PartiesByRole } from '../../utils/caseFormUtils'

export interface CasePartiesReviewCardProps {
  totalParties: number
  partiesByRole: PartiesByRole
  onEditParties: () => void
}

interface PartyGroupProps {
  heading: string
  className?: string
  isEmpty: boolean
  emptyText?: string
  children: ReactNode
}

function PartyGroup({ heading, className, isEmpty, emptyText, children }: PartyGroupProps) {
  return (
    <div className={className}>
      <div className="small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>
        {heading}
      </div>
      {!isEmpty ? (
        <div className="d-flex flex-wrap gap-1">{children}</div>
      ) : (
        <span className="text-muted small fst-italic">{emptyText}</span>
      )}
    </div>
  )
}

/**
 * Review card listing applicants, respondents, children and any other parties as badges.
 */
export default function CasePartiesReviewCard({
  totalParties,
  partiesByRole,
  onEditParties,
}: CasePartiesReviewCardProps) {
  const { applicants, respondents, children, otherParties } = partiesByRole

  return (
    <Card className="border shadow-sm bg-white rounded-3 h-100">
      <Card.Header className="bg-white border-bottom py-3 px-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <FaUsers className="text-primary" />
          <h6 className="fw-bold mb-0 text-dark">Parties & Children ({totalParties})</h6>
        </div>
        <Button
          variant="outline-primary"
          size="sm"
          className="py-0 px-2"
          style={{ fontSize: '0.78rem' }}
          onClick={onEditParties}
        >
          <FaEdit className="me-1" size={10} />
          Edit
        </Button>
      </Card.Header>
      <Card.Body className="p-3">
        <PartyGroup
          heading={`Applicants (${applicants.length})`}
          className="mb-3"
          isEmpty={applicants.length === 0}
          emptyText="None added"
        >
          {applicants.map((a) => (
            <Badge key={a.id} bg="primary" className="fw-normal p-2">
              {a.firstName} {a.lastName}
            </Badge>
          ))}
        </PartyGroup>

        <PartyGroup
          heading={`Respondents (${respondents.length})`}
          className="mb-3"
          isEmpty={respondents.length === 0}
          emptyText="None added"
        >
          {respondents.map((r) => (
            <Badge key={r.id} bg="secondary" className="fw-normal p-2">
              {r.firstName} {r.lastName}
            </Badge>
          ))}
        </PartyGroup>

        <PartyGroup
          heading={`Children Subject of Application (${children.length})`}
          className="mb-2"
          isEmpty={children.length === 0}
          emptyText="No children registered"
        >
          {children.map((c) => (
            <Badge key={c.id} bg="warning" text="dark" className="fw-normal p-2 d-inline-flex align-items-center gap-1">
              <FaChild size={11} />
              {c.firstName} {c.lastName}
            </Badge>
          ))}
        </PartyGroup>

        {otherParties.length > 0 && (
          <PartyGroup heading={`Other Parties (${otherParties.length})`} isEmpty={false}>
            {otherParties.map((o) => (
              <Badge key={o.id} bg="dark" className="fw-normal p-2">
                {o.role}: {o.firstName} {o.lastName}
              </Badge>
            ))}
          </PartyGroup>
        )}
      </Card.Body>
    </Card>
  )
}
