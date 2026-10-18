import { useState } from 'react'
import { Card, Badge, Button, Form } from 'react-bootstrap'
import { FaFileContract, FaStickyNote, FaCopy, FaCheck } from 'react-icons/fa'
import { toast } from '../../../../store/toastStore'
import { buildDeclarationNoteText } from '../../../../utils/mckenzieToolkit'
import { ToolkitCardHeader, ToolkitSavedAlert } from './ToolkitCardParts'

export interface PracticeDirectionNoticeCardProps {
  /** Prefix for form control ids (from `useId`). */
  idPrefix: string
  mckenzieName: string
  onMckenzieNameChange: (name: string) => void
  /** Builds the current PD 27A declaration text. */
  getDeclarationText: () => string
  /** Persists a note into the case. */
  onSaveNote: (text: string) => void
}

/**
 * Module 1: FPR PD 27A court notice — editable supporter name, declaration preview,
 * copy-to-clipboard and record-in-notes actions.
 */
export default function PracticeDirectionNoticeCard({
  idPrefix,
  mckenzieName,
  onMckenzieNameChange,
  getDeclarationText,
  onSaveNote,
}: PracticeDirectionNoticeCardProps) {
  const [copiedNotice, setCopiedNotice] = useState(false)
  const [noticeSaved, setNoticeSaved] = useState(false)

  const handleCopyDeclaration = () => {
    navigator.clipboard.writeText(getDeclarationText())
    setCopiedNotice(true)
    toast.success('PD 27A Lay Supporter declaration copied to clipboard.', 'Declaration Copied')
    setTimeout(() => setCopiedNotice(false), 2500)
  }

  const handleSaveDeclarationToNotes = () => {
    onSaveNote(buildDeclarationNoteText(getDeclarationText()))
    setNoticeSaved(true)
    toast.success('PD 27A Declaration filed into case strategy notes.', 'Declaration Saved')
    setTimeout(() => setNoticeSaved(false), 3000)
  }

  return (
    <Card className="h-100 border shadow-xs rounded-3">
      <ToolkitCardHeader
        icon={FaFileContract}
        title="1. Practice Direction 27A Court Notice"
        badge={<Badge bg="light" text="secondary" className="border">Mandatory for Court</Badge>}
      />
      <Card.Body className="p-3 d-flex flex-column justify-content-between">
        <div>
          <p className="small text-secondary mb-3">
            Under FPR PD 27A, a lay supporter should submit a written declaration of understanding and confidentiality to the court clerk and judge prior to the hearing.
          </p>

          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold mb-1" htmlFor={`${idPrefix}-mckenzie-name`}>McKenzie Friend Name</Form.Label>
            <Form.Control
              id={`${idPrefix}-mckenzie-name`}
              size="sm"
              value={mckenzieName}
              onChange={(e) => onMckenzieNameChange(e.target.value)}
            />
          </Form.Group>

          <div className="p-2.5 rounded bg-light border small text-monospace font-monospace mb-3 overflow-auto" style={{ maxHeight: '140px', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
            {getDeclarationText()}
          </div>
        </div>

        {noticeSaved && <ToolkitSavedAlert>Declaration saved into Case Notes!</ToolkitSavedAlert>}

        <div className="d-flex gap-2">
          <Button
            variant="outline-success"
            size="sm"
            className="w-100 d-inline-flex align-items-center justify-content-center gap-1.5 rounded-pill"
            onClick={handleCopyDeclaration}
          >
            {copiedNotice ? <FaCheck size={11} /> : <FaCopy size={11} />}
            <span>{copiedNotice ? 'Copied Notice' : 'Copy Notice'}</span>
          </Button>
          <Button
            variant="success"
            size="sm"
            className="w-100 d-inline-flex align-items-center justify-content-center gap-1.5 rounded-pill"
            onClick={handleSaveDeclarationToNotes}
          >
            <FaStickyNote size={11} />
            <span>Record in Notes</span>
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}
