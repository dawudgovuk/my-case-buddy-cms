import { Card, Badge } from 'react-bootstrap'
import type { CaseNote } from '../../types/domain'
import { FaUserCircle, FaClock } from 'react-icons/fa'

export interface CaseNoteCardProps {
  note: CaseNote
  className?: string
}

export default function CaseNoteCard({ note, className = '' }: CaseNoteCardProps) {
  const formattedDate = new Date(note.createdAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card className={`mb-2 p-3 shadow-sm border bg-white ${className}`}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center gap-2">
          <FaUserCircle className="text-primary" size={18} />
          <span className="fw-bold text-dark small">{note.author}</span>
        </div>
        <Badge bg="light" className="text-secondary fw-normal d-flex align-items-center gap-1 border">
          <FaClock size={10} />
          <span>{formattedDate}</span>
        </Badge>
      </div>
      <p className="small text-secondary mb-0" style={{ whiteSpace: 'pre-wrap' }}>
        {note.text}
      </p>
    </Card>
  )
}
