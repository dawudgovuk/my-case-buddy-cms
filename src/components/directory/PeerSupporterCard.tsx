import { Card } from 'react-bootstrap'
import { useTranslation } from '../../hooks/useTranslation'
import type { UserRole, User } from '../../types/domain'
import {
  FaCheckCircle,
  FaBuilding,
  FaIdCard,
  FaHandshake,
  FaArrowRight,
  FaShieldAlt,
} from 'react-icons/fa'

export interface PeerSupporterCardProps {
  professional: Pick<User, 'id' | 'name' | 'role' | 'isVerified'> & {
    firm?: string
    registrationNumber?: string
    bio?: string
    specialisms?: string[]
    yearsExperience?: number
  }
  onRequestSupport?: (professionalId: string) => void
  showRequestButton?: boolean
  buttonLabel?: string
  className?: string
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return (name.slice(0, 2) || 'LP').toUpperCase()
}

interface RoleVisual {
  label: string
  avatarBg: string
  avatarColor: string
  avatarBorder: string
  badgeClass: string
  defaultTags: string[]
}

const roleVisuals: Record<UserRole, RoleVisual> = {
  McKenzieFriend: {
    label: 'McKenzie Friend',
    avatarBg: '#ecfdf5',
    avatarColor: '#047857',
    avatarBorder: '#a7f3d0',
    badgeClass: 'badge-soft-emerald',
    defaultTags: ['Case Notes', 'Lay Support', 'Statement Review'],
  },
  Solicitor: {
    label: 'Solicitor',
    avatarBg: '#eff6ff',
    avatarColor: '#1d4ed8',
    avatarBorder: '#bfdbfe',
    badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle',
    defaultTags: ['Legal Advice', 'Court Filing', 'Representation'],
  },
  Barrister: {
    label: 'Barrister',
    avatarBg: '#fffbeb',
    avatarColor: '#b45309',
    avatarBorder: '#fde68a',
    badgeClass: 'badge-soft-amber',
    defaultTags: ['Advocacy', 'Hearings', 'Legal Opinion'],
  },
  LIP: {
    label: 'Litigant in Person',
    avatarBg: '#f1f5f9',
    avatarColor: '#475569',
    avatarBorder: '#cbd5e1',
    badgeClass: 'badge-soft-slate',
    defaultTags: ['Self-Represented'],
  },
}

export default function PeerSupporterCard({
  professional,
  onRequestSupport,
  showRequestButton = true,
  buttonLabel,
  className = '',
}: PeerSupporterCardProps) {
  const { t } = useTranslation()
  const visual = roleVisuals[professional.role] || roleVisuals.McKenzieFriend
  const initials = getInitials(professional.name)
  const roleName =
    professional.role === 'McKenzieFriend'
      ? t.roles.mckenzieFriend
      : professional.role === 'Solicitor'
      ? t.roles.solicitor
      : professional.role === 'Barrister'
      ? t.roles.barrister
      : t.roles.lip
  const tags =
    professional.specialisms && professional.specialisms.length > 0
      ? professional.specialisms
      : visual.defaultTags

  return (
    <Card className={`supporter-card h-100 d-flex flex-column ${className}`}>
      <Card.Body className="p-4 d-flex flex-column h-100">
        {/* Top Header: Avatar + Info + Verified Badge */}
        <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center gap-3">
            {/* Avatar Squircle */}
            <div
              className="supporter-avatar"
              style={{
                backgroundColor: visual.avatarBg,
                color: visual.avatarColor,
                border: `1.5px solid ${visual.avatarBorder}`,
              }}
            >
              {initials}
            </div>

            {/* Name & Role Badge */}
            <div>
              <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: '1.05rem' }}>
                {professional.name}
              </h5>
              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                <span
                  className={`badge rounded-pill px-2.5 py-0.5 small fw-semibold ${visual.badgeClass}`}
                  style={{ fontSize: '0.72rem' }}
                >
                  {roleName}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          {professional.isVerified && (
            <span
              className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1 flex-shrink-0"
              style={{ fontSize: '0.72rem', fontWeight: 600 }}
              title="Identity & Email Verified"
            >
              <FaCheckCircle size={10} />
              <span>{t.common.verified}</span>
            </span>
          )}
        </div>

        {/* Firm / Professional Registration / FPR Compliance */}
        <div className="mb-2">
          {professional.firm ? (
            <div className="small text-muted d-flex align-items-center gap-1.5 mb-1 text-truncate">
              <FaBuilding size={11} className="text-secondary flex-shrink-0" />
              <span className="fw-medium text-dark text-truncate">{professional.firm}</span>
              {professional.registrationNumber && (
                <span className="badge bg-light text-secondary border px-1.5 py-0.5 ms-auto" style={{ fontSize: '0.68rem' }}>
                  Reg: {professional.registrationNumber}
                </span>
              )}
            </div>
          ) : professional.role === 'McKenzieFriend' ? (
            <div className="small text-muted d-flex align-items-center gap-1.5 mb-1">
              <FaShieldAlt size={11} className="text-success flex-shrink-0" />
              <span className="fw-medium text-secondary" style={{ fontSize: '0.76rem' }}>
                FPR Practice Direction 27A Compliant
              </span>
            </div>
          ) : professional.registrationNumber ? (
            <div className="small text-muted d-flex align-items-center gap-1.5 mb-1">
              <FaIdCard size={11} className="text-secondary flex-shrink-0" />
              <span style={{ fontSize: '0.76rem' }}>Registration: {professional.registrationNumber}</span>
            </div>
          ) : null}
        </div>

        {/* Bio / Guidance Scope (2-line clamp for equal heights) */}
        <p
          className="text-secondary small mb-3 flex-grow-1"
          style={{
            fontSize: '0.84rem',
            lineHeight: 1.5,
            minHeight: '38px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          title={professional.bio || 'Verified legal professional ready to provide peer-to-peer case guidance and document support.'}
        >
          {professional.bio ||
            'Verified legal professional ready to provide peer-to-peer case guidance, statement review, and lay representation.'}
        </p>

        {/* Competency / Focus Tags */}
        <div className="d-flex align-items-center gap-1.5 flex-wrap mb-3.5">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="badge bg-light text-secondary border px-2 py-1 rounded-2"
              style={{ fontSize: '0.7rem', fontWeight: 500 }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom Action Button */}
        {showRequestButton && onRequestSupport && (
          <div className="mt-auto pt-2 border-top">
            <button
              type="button"
              className="btn-supporter-request w-100"
              onClick={() => onRequestSupport(professional.id)}
            >
              <FaHandshake size={14} />
              <span>{buttonLabel || t.peerDirectory.requestSupportBtn}</span>
              <FaArrowRight size={10} className="opacity-75 ms-1" />
            </button>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
