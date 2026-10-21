import { Badge, Button, InputGroup, Form } from 'react-bootstrap'
import { FaCopy, FaCheck, FaUserFriends, FaTrashAlt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa'
import { useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { toast } from '../../store/toastStore'

export interface InviteLinkCardProps {
  id: string
  role: string
  token: string
  createdAt: string
  expiresAt?: string
  usedAt?: string
  baseUrl?: string
  onCopy?: (url: string) => void
  onRevoke?: (tokenOrId: string) => void
  className?: string
}

export default function InviteLinkCard({
  id,
  role,
  token,
  createdAt,
  expiresAt,
  usedAt,
  baseUrl = typeof window !== 'undefined' ? window.location.origin : '',
  onCopy,
  onRevoke,
  className = '',
}: InviteLinkCardProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const inviteUrl = `${baseUrl}/invite/${token}`

  const isExpired = Boolean(expiresAt && new Date(expiresAt) < new Date())
  const isUsed = Boolean(usedAt)
  const isActive = !isUsed && !isExpired

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      toast.success('Case invitation link copied to clipboard.', 'Link Copied')
      onCopy?.(inviteUrl)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const roleLabel =
    role === 'McKenzieFriend'
      ? t.roles.mckenzieFriend
      : role === 'Solicitor'
      ? t.roles.solicitor
      : role === 'Barrister'
      ? t.roles.barrister
      : role

  const roleColors: Record<string, string> = {
    McKenzieFriend: 'success',
    Solicitor: 'primary',
    Barrister: 'warning',
  }

  const formattedCreated = new Date(createdAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div
      className={`p-3 bg-light rounded-3 mb-2 border ${
        isUsed ? 'opacity-75' : ''
      } ${className}`}
    >
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Badge bg={roleColors[role] || 'info'} className="px-2 py-1 text-white fw-semibold">
            <FaUserFriends className="me-1" />
            {roleLabel}
          </Badge>

          {isUsed ? (
            <Badge bg="secondary" className="px-2 py-1 d-inline-flex align-items-center gap-1">
              <FaCheckCircle size={11} />
              <span>{t.caseTabs.usedInvitesTab}</span>
            </Badge>
          ) : isExpired ? (
            <Badge bg="danger" className="px-2 py-1 d-inline-flex align-items-center gap-1">
              <FaTimesCircle size={11} />
              <span>{t.inviteAccept.hasExpired}</span>
            </Badge>
          ) : (
            <Badge bg="success" className="px-2 py-1 d-inline-flex align-items-center gap-1">
              <FaCheck size={10} />
              <span>{t.caseTabs.activeInvitesTab}</span>
            </Badge>
          )}

          <span className="small text-muted d-inline-flex align-items-center gap-1">
            <FaClock size={11} />
            <span>{t.common.started} {formattedCreated}</span>
          </span>
        </div>

        {onRevoke && isActive && (
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => onRevoke(token || id)}
            className="d-flex align-items-center gap-1 py-1 px-2 border-0"
            title="Revoke this invite link"
          >
            <FaTrashAlt size={11} />
            <span className="small">{t.caseTabs.revokeInvite}</span>
          </Button>
        )}
      </div>

      <div className="d-flex align-items-center gap-2">
        <InputGroup size="sm">
          <Form.Control
            readOnly
            value={inviteUrl}
            className="bg-white text-muted small font-monospace"
            style={{ fontSize: '0.82rem' }}
          />
          {!isUsed && (
            <Button
              variant={copied ? 'success' : 'primary'}
              onClick={handleCopy}
              className="d-flex align-items-center gap-1"
            >
              {copied ? <FaCheck size={12} /> : <FaCopy size={12} />}
              <span>{copied ? t.caseTabs.copied : t.caseTabs.copyLink}</span>
            </Button>
          )}
        </InputGroup>
      </div>
    </div>
  )
}
