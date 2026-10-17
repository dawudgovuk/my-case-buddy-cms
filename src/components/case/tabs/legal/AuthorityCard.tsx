import { Card, Badge, Button } from 'react-bootstrap'
import { FaQuoteRight } from 'react-icons/fa'
import type { CaseAuthority, NoteCitation } from '../../../../utils/legalKnowledgeBase'

export interface AuthorityCardProps {
  authority: CaseAuthority
  onCite: (citation: NoteCitation) => void
}

/**
 * Compact card for a leading case authority with a "Cite in Notes" action.
 */
export default function AuthorityCard({ authority, onCite }: AuthorityCardProps) {
  return (
    <Card className={authority.fullHeight ? 'h-100 border p-2.5 rounded-3 bg-light shadow-2xs' : 'border p-2.5 rounded-3 bg-light shadow-2xs'}>
      <div className="d-flex justify-content-between align-items-start mb-1">
        <span className="fw-bold text-dark small">{authority.heading}</span>
        <Badge bg={authority.badgeBg} text={authority.badgeText} style={{ fontSize: '0.65rem' }}>
          {authority.badgeLabel}
        </Badge>
      </div>
      <p className="small text-secondary mb-2">{authority.summary}</p>
      <Button
        variant="link"
        size="sm"
        className="p-0 text-decoration-none text-primary small d-inline-flex align-items-center gap-1 align-self-start"
        onClick={() => onCite(authority.citation)}
      >
        <FaQuoteRight size={10} /> <span>Cite in Notes</span>
      </Button>
    </Card>
  )
}
