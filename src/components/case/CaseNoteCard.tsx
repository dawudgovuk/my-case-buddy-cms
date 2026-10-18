import { Card, Badge } from 'react-bootstrap'
import type { CaseNote } from '../../types/domain'
import { FaUserCircle, FaClock, FaTag } from 'react-icons/fa'

export interface CaseNoteCardProps {
  note: CaseNote
  className?: string
}

function getCategoryBadge(category?: string, text?: string): { label: string; bg: string; text?: string } | null {
  // Check explicit category first
  let cat = category
  if (!cat && text && text.startsWith('[')) {
    const match = text.match(/^\[(.*?)\]/)
    if (match) {
      cat = match[1]
    }
  }

  if (!cat) return null

  switch (cat) {
    case 'Hearing Attendance':
      return { label: 'Hearing Attendance', bg: 'warning', text: 'dark' }
    case 'Telephone Attendance':
      return { label: 'Telephone Attendance', bg: 'info', text: 'white' }
    case 'Client Conference':
      return { label: 'Client Conference', bg: 'primary', text: 'white' }
    case 'CAFCASS Consultation':
      return { label: 'CAFCASS Meeting', bg: 'success', text: 'white' }
    case 'Legal Strategy':
      return { label: 'Legal Strategy', bg: 'dark', text: 'white' }
    case 'Drafting / Bundle Review':
    case 'Drafting Review':
      return { label: 'Drafting Review', bg: 'secondary', text: 'white' }
    default:
      return { label: cat, bg: 'light', text: 'dark' }
  }
}

export default function CaseNoteCard({ note, className = '' }: CaseNoteCardProps) {
  const formattedDate = new Date(note.createdAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const catBadge = getCategoryBadge(note.category, note.text)

  // Clean note text if it starts with [Category]
  let cleanText = note.text
  if (catBadge && cleanText.startsWith(`[${catBadge.label}]`)) {
    cleanText = cleanText.replace(`[${catBadge.label}]`, '').trim()
  }

  return (
    <Card className={`mb-2 p-3 shadow-sm border bg-white ${className}`}>
      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <FaUserCircle className="text-primary" size={18} />
          <span className="fw-bold text-dark small">{note.author}</span>
          {catBadge && (
            <Badge
              bg={catBadge.bg}
              text={catBadge.text}
              className="font-monospace d-inline-flex align-items-center gap-1 border"
              style={{ fontSize: '0.68rem' }}
            >
              <FaTag size={8} />
              <span>{catBadge.label}</span>
            </Badge>
          )}
        </div>
        <Badge bg="light" className="text-secondary fw-normal d-flex align-items-center gap-1 border">
          <FaClock size={10} />
          <span>{formattedDate}</span>
        </Badge>
      </div>
      <p className="small text-secondary mb-0" style={{ whiteSpace: 'pre-wrap' }}>
        {cleanText}
      </p>
    </Card>
  )
}
