import React from 'react'
import { Card, Badge } from 'react-bootstrap'
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaShieldAlt,
  FaEnvelope,
  FaLock,
  FaBuilding,
  FaCertificate,
  FaGavel,
  FaBalanceScale,
} from 'react-icons/fa'
import type { User, UserRole } from '../../types/domain'
import { useTranslation } from '../../hooks/useTranslation'

interface ProfileHeroProps {
  user: User
  safeName: string
  userInitials: string
}

const roleBadgeVariant: Record<UserRole, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  LIP: {
    bg: 'secondary',
    text: 'white',
    label: 'Litigant in Person',
    icon: <FaBalanceScale size={12} />,
  },
  McKenzieFriend: {
    bg: 'success',
    text: 'white',
    label: 'McKenzie Friend',
    icon: <FaShieldAlt size={12} />,
  },
  Solicitor: {
    bg: 'primary',
    text: 'white',
    label: 'SRA Solicitor',
    icon: <FaGavel size={12} />,
  },
  Barrister: {
    bg: 'dark',
    text: 'white',
    label: 'BSB Barrister',
    icon: <FaGavel size={12} />,
  },
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({ user, safeName, userInitials }) => {
  const { t } = useTranslation()

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'LIP':
        return t('roles.lip')
      case 'McKenzieFriend':
        return t('roles.mckenzieFriend')
      case 'Solicitor':
        return t('roles.solicitor')
      case 'Barrister':
        return t('roles.barrister')
      default:
        return role
    }
  }

  const roleMeta = roleBadgeVariant[user.role] || roleBadgeVariant.LIP

  return (
    <Card className="profile-hero-card mb-4 p-3 p-md-4">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
        {/* User Identity Column */}
        <div className="d-flex align-items-center gap-3 min-w-0">
          <div className="position-relative flex-shrink-0">
            <div className="profile-avatar-circle" aria-hidden="true">
              {userInitials}
            </div>
            {user.isVerified && (
              <span
                className="position-absolute bottom-0 end-0 bg-success text-white rounded-circle d-flex align-items-center justify-content-center shadow-xs"
                style={{ width: 22, height: 22, border: '2px solid #ffffff' }}
                title="Verified Account"
              >
                <FaCheckCircle size={11} />
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
              <h1 className="h3 fw-bold text-dark mb-0 text-truncate" style={{ letterSpacing: '-0.02em' }}>
                {safeName}
              </h1>

              <Badge
                bg={roleMeta.bg}
                className="d-inline-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill fw-semibold shadow-xs"
                style={{ fontSize: '0.8rem' }}
              >
                {roleMeta.icon}
                <span>{getRoleLabel(user.role)}</span>
              </Badge>

              {user.isVerified ? (
                <Badge
                  bg="success-soft"
                  className="text-success border border-success-subtle d-inline-flex align-items-center gap-1 px-2 py-0.5 rounded-pill fw-semibold"
                  style={{ fontSize: '0.75rem', backgroundColor: 'var(--mcb-success-soft)' }}
                >
                  <FaCheckCircle size={10} />
                  <span>{t('common.verified')}</span>
                </Badge>
              ) : (
                <Badge
                  bg="warning-soft"
                  className="text-warning border border-warning-subtle d-inline-flex align-items-center gap-1 px-2 py-0.5 rounded-pill fw-semibold"
                  style={{ fontSize: '0.75rem', backgroundColor: 'var(--mcb-warning-soft)', color: 'var(--mcb-warning)' }}
                >
                  <FaExclamationCircle size={10} />
                  <span>{t('common.unverified')}</span>
                </Badge>
              )}
            </div>

            <div className="text-muted small d-flex align-items-center gap-2 flex-wrap">
              <span className="d-inline-flex align-items-center gap-1">
                <FaEnvelope size={11} className="text-primary" />
                <span className="text-dark fw-medium">{user.email}</span>
              </span>

              {user.firm && (
                <>
                  <span className="text-muted">•</span>
                  <span className="d-inline-flex align-items-center gap-1">
                    <FaBuilding size={11} className="text-secondary" />
                    <span>{user.firm}</span>
                  </span>
                </>
              )}

              {user.registrationNumber && (
                <>
                  <span className="text-muted">•</span>
                  <span className="d-inline-flex align-items-center gap-1">
                    <FaCertificate size={11} className="text-secondary" />
                    <span>Reg: {user.registrationNumber}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Context & Compliance Badges */}
        <div className="profile-hero-stats">
          <div className="profile-stat-box">
            <div className="text-muted fs-8 d-flex align-items-center gap-1 mb-0.5">
              <FaShieldAlt size={11} className="text-success" />
              <span>Court Confidentiality</span>
            </div>
            <div className="text-success small fw-bold">FPR 12.73 Protected</div>
          </div>

          <div className="profile-stat-box">
            <div className="text-muted fs-8 d-flex align-items-center gap-1 mb-0.5">
              <FaLock size={10} className="text-primary" />
              <span>Data Protection</span>
            </div>
            <div className="text-dark small fw-bold">Encrypted AES-256</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ProfileHero
