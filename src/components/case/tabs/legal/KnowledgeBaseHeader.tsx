import { Badge, Button } from 'react-bootstrap'
import { FaBook, FaExternalLinkAlt } from 'react-icons/fa'
import { KNOWLEDGE_BASE_SUPPORT_URL } from '../../../../utils/legalKnowledgeBase'

/**
 * Title banner for the Family Law Knowledge Base with a link to the support site.
 */
export default function KnowledgeBaseHeader() {
  return (
    <div className="p-3 rounded-3 bg-light border d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
      <div>
        <div className="d-flex align-items-center gap-2 mb-1">
          <Badge bg="warning" text="dark" className="px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1">
            <FaBook size={11} />
            <span>Official Knowledge Base</span>
          </Badge>
          <span className="small text-muted">support.mycourtbuddy.com</span>
        </div>
        <h5 className="fw-bold mb-0 text-dark">UK Family Court Legal Precedents & Guidance</h5>
        <p className="text-secondary small mb-0 mt-1">
          Verified statutory guidance, Practice Directions, and leading High Court / Court of Appeal authorities.
        </p>
      </div>
      <Button
        variant="outline-secondary"
        size="sm"
        href={KNOWLEDGE_BASE_SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill shadow-xs text-nowrap"
      >
        <FaExternalLinkAlt size={11} />
        <span>Browse Support Site</span>
      </Button>
    </div>
  )
}
