import { Badge, Button } from 'react-bootstrap'
import { FaCopy, FaCheck, FaUserFriends } from 'react-icons/fa'
import { useState } from 'react'
import { toast } from '../../store/toastStore'

export interface InviteLinkCardProps {
  id: string
  role: string
  token: string
  createdAt: string
  usedAt?: string
  baseUrl?: string
  onCopy?: (url: string) => void
  className?: string
}

export default function InviteLinkCard({
  role,
  token,
  createdAt,
  usedAt,
  baseUrl = typeof window !== 'undefined' ? window.location.origin : '',
  onCopy,
  className = '',
}: InviteLinkCardProps) {
  const [copied, setCopied] = useState(false)
  const inviteUrl = `${baseUrl}/invite/${token}`

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      toast.success('Case invitation link copied to clipboard.', 'Link Copied')
      onCopy?.(inviteUrl)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const roleColors: Record<string, string> = {
    McKenzieFriend: 'success',
    Solicitor: 'primary',
    Barrister: 'warning',
  }

  return (
    <div
      className={`p-3 bg-light rounded mb-2 border d-flex flex-wrap align-items-center justify-content-between gap-2 ${className}`}
    >
      <div className="d-flex align-items-center gap-2 min-width-0">
        <Badge bg={roleColors[role] || 'info'} className="px-2 py-1">
          <FaUserFriends className="me-1" />
          {role}
        </Badge>
        <span className="small text-secondary">
          {usedAt ? (
            <Badge bg="secondary" className="me-2">
              Used
            </Badge>
          ) : (
            <Badge bg="success" className="me-2">
              Active
            </Badge>
          )}
          Created {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="d-flex align-items-center gap-2">
        <code className="small text-muted bg-white px-2 py-1 rounded border text-break">
          {inviteUrl}
        </code>
        {!usedAt && (
          <Button
            size="sm"
            variant={copied ? 'success' : 'outline-secondary'}
            onClick={handleCopy}
            className="d-flex align-items-center gap-1 flex-shrink-0"
          >
            {copied ? <FaCheck size={12} /> : <FaCopy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
