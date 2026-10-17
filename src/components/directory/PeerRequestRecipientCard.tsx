import { Badge } from 'react-bootstrap'
import { FaBuilding, FaIdCard, FaCheckCircle, FaShieldAlt } from 'react-icons/fa'
import type { User } from '../../types/domain'
import { getNameInitials, type PeerRequestRoleTheme } from '../../utils/peerSupportRequestUtils'

export interface PeerRequestRecipientCardProps {
  professional: Pick<User, 'name' | 'firm' | 'registrationNumber' | 'yearsExperience' | 'bio'>
  roleLabel: string
  roleTheme: PeerRequestRoleTheme
}

/**
 * Recipient profile showcase (avatar, role badge, credentials and bio) inside the request modal.
 */
export default function PeerRequestRecipientCard({ professional, roleLabel, roleTheme }: PeerRequestRecipientCardProps) {
  const RoleIcon = roleTheme.icon

  return (
    <div
      className="p-3 mb-3 rounded-3 border position-relative overflow-hidden shadow-xs"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderColor: '#e2e8f0',
      }}
    >
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3">
          {/* Gradient Avatar */}
          <div
            className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-xs flex-shrink-0 position-relative"
            style={{
              width: 48,
              height: 48,
              fontSize: '1.05rem',
              background: roleTheme.gradient,
            }}
          >
            {getNameInitials(professional.name)}
            <span
              className="position-absolute bottom-0 end-0 bg-white rounded-circle p-0.5 shadow-xs"
              style={{ transform: 'translate(15%, 15%)' }}
              title="Verified Identity"
            >
              <FaCheckCircle className="text-success" size={13} />
            </span>
          </div>

          <div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="fw-bold text-dark fs-6">{professional.name}</span>
              <Badge
                className="d-inline-flex align-items-center gap-1.5 px-2 py-0.5 rounded-pill fw-semibold"
                style={{
                  backgroundColor: roleTheme.bgSubtle,
                  color: roleTheme.borderSubtle ? undefined : '#2563eb',
                  border: `1px solid ${roleTheme.borderSubtle}`,
                }}
              >
                <RoleIcon size={12} />
                <span>{roleLabel}</span>
              </Badge>
            </div>

            {/* Firm & Credentials */}
            <div className="d-flex align-items-center gap-2 gap-sm-3 small text-muted mt-1 flex-wrap">
              {professional.firm && (
                <span className="d-inline-flex align-items-center gap-1.5">
                  <FaBuilding size={11} className="text-secondary" />
                  <span className="fw-medium text-dark">{professional.firm}</span>
                </span>
              )}
              {professional.registrationNumber && (
                <span className="d-inline-flex align-items-center gap-1.5">
                  <FaIdCard size={11} className="text-secondary" />
                  <code>{professional.registrationNumber}</code>
                </span>
              )}
              {professional.yearsExperience && (
                <span className="badge bg-light text-secondary border px-1.5 py-0.5 rounded-pill">
                  {professional.yearsExperience} yrs exp
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Verified Compliance Badge */}
        <div className="align-self-start align-self-sm-center">
          <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5 small fw-semibold">
            <FaShieldAlt size={11} />
            <span>Verified Legal Supporter</span>
          </span>
        </div>
      </div>

      {/* Supporter Bio or Specialisms */}
      {professional.bio && (
        <div
          className="mt-2.5 pt-2 border-top small text-secondary"
          style={{ fontSize: '0.82rem', lineHeight: '1.45' }}
        >
          <em>"{professional.bio}"</em>
        </div>
      )}
    </div>
  )
}
