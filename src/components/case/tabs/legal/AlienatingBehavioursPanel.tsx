import { Button } from 'react-bootstrap'
import { FaCheck, FaCopy, FaQuoteRight } from 'react-icons/fa'
import {
  ALIENATION_COPY_ID,
  ALIENATION_COPY_TEXT,
  ALIENATION_ELEMENTS,
  ALIENATION_INTRO,
  ALIENATION_NOTE_CITATION,
  ALIENATION_SOURCES,
  type NoteCitation,
} from '../../../../utils/legalKnowledgeBase'
import LabelledPointText, { RichTextContent } from './RichTextContent'

export interface AlienatingBehavioursPanelProps {
  copiedId: string | null
  onCopy: (text: string, id: string) => void
  onCite: (citation: NoteCitation) => void
}

/**
 * Body of the "Alienating Behaviours" section: Re C [2023] three-element test
 * with copy-citation and insert-into-notes actions.
 */
export default function AlienatingBehavioursPanel({ copiedId, onCopy, onCite }: AlienatingBehavioursPanelProps) {
  const copied = copiedId === ALIENATION_COPY_ID
  return (
    <>
      <p className="small text-secondary mb-3">
        <RichTextContent text={ALIENATION_INTRO} />
      </p>
      <div className="p-3 bg-light rounded-3 border mb-3">
        <h6 className="fw-bold small text-dark mb-2">A court must be satisfied of three cumulative elements:</h6>
        <ol className="small text-dark mb-0 ps-3 d-flex flex-column gap-2">
          {ALIENATION_ELEMENTS.map((element) => (
            <li key={element.label}>
              <LabelledPointText point={element} />
            </li>
          ))}
        </ol>
      </div>

      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center pt-1 border-top">
        <span className="small text-muted fst-italic">{ALIENATION_SOURCES}</span>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            className="d-inline-flex align-items-center gap-1.5 rounded-pill"
            onClick={() => onCopy(ALIENATION_COPY_TEXT, ALIENATION_COPY_ID)}
          >
            {copied ? <FaCheck size={11} className="text-success" /> : <FaCopy size={11} />}
            <span>{copied ? 'Copied' : 'Copy Citation'}</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="d-inline-flex align-items-center gap-1.5 rounded-pill"
            onClick={() => onCite(ALIENATION_NOTE_CITATION)}
          >
            <FaQuoteRight size={11} />
            <span>Insert in Case Notes</span>
          </Button>
        </div>
      </div>
    </>
  )
}
