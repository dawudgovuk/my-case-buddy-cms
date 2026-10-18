import React from 'react'
import { Card, Badge } from 'react-bootstrap'
import { FaCheckCircle, FaExclamationCircle, FaShieldAlt, FaIdBadge } from 'react-icons/fa'
import type { User, UserRole } from '../../types/domain'

interface ProfileHeroProps {
  user: User
  safeName: string
  userInitials: string
}

const roleBadgeVariant: Record<UserRole, string> = {
  LIP: 'secondary',
  McKenzieFriend: 'info',
  Solicitor: 'primary',
  Barrister: 'dark',
}

const roleDisplayLabel: Record<UserRole, string> = {
  LIP: 'Litigant in Person',
  McKenzieFriend: 'McKenzie Friend',
  Solicitor: 'Solicitor',
  Barrister: 'Barrister (Counsel)',
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({ user, safeName, userInitials }) => {
  return (
    <Card className="border-0 shadow-sm mb-4 overflow-hidden" style={{ borderRadius: 16 }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e1b4b 100%)',
          padding: '2rem 1.5rem 1.5rem',
          color: '#ffffff',
        }}
      >
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0 shadow-sm"
              style={{
                width: 72,
                height: 72,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: '1.75rem',
                border: '3px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              {userInitials}
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                <h1 className="h3 fw-bold text-white mb-0">{safeName}</h1>
                <Badge bg={roleBadgeVariant[user.role] || 'secondary'} className="px-2.5 py-1.5 fs-7">
                  {roleDisplayLabel[user.role] || user.role}
                </Badge>
                {user.role !== 'LIP' && (
                  user.isVerified ? (
                    <Badge bg="success" className="px-2.5 py-1.5 fs-7 d-inline-flex align-items-center gap-1">
                      <FaCheckCircle size={11} />
                      <span>Verified Practitioner</span>
                    </Badge>
                  ) : (
                    <Badge bg="warning" className="text-dark px-2.5 py-1.5 fs-7 d-inline-flex align-items-center gap-1">
                      <FaExclamationCircle size={11} />
                      <span>Verification Pending</span>
                    </Badge>
                  )
                )}
              </div>
              <div className="text-white-50 small mb-2 d-flex align-items-center gap-2 flex-wrap">
                <span>{user.email}</span>
                {user.firm && (
                  <>
                    <span>•</span>
                    <span className="text-light">{user.firm}</span>
                  </>
                )}
                {user.registrationNumber && (
                  <>
                    <span>•</span>
                    <span className="text-light">Reg: {user.registrationNumber}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div
              className="px-3 py-2 rounded-3 text-start"
              style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
            >
              <div className="text-white-50 fs-8 d-flex align-items-center gap-1">
                <FaIdBadge size={11} />
                <span>Account ID</span>
              </div>
              <div className="fw-mono text-white small text-truncate" style={{ maxWidth: 120 }}>
                {user.id}
              </div>
            </div>
            <div
              className="px-3 py-2 rounded-3 text-start"
              style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
            >
              <div className="text-white-50 fs-8 d-flex align-items-center gap-1">
                <FaShieldAlt size={11} />
                <span>FPR Privacy</span>
              </div>
              <div className="text-success small fw-semibold">Protected</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ProfileHero
