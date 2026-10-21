import React from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import { FaUser, FaHandsHelping, FaBriefcase, FaGavel, FaCheck } from 'react-icons/fa'
import type { UserRole } from '../../types/domain'
import { useTranslation } from '../../hooks/useTranslation'

interface RoleSelectorCardProps {
  selectedRole: UserRole
  onChange: (role: UserRole) => void
}

export const RoleSelectorCard: React.FC<RoleSelectorCardProps> = ({ selectedRole, onChange }) => {
  const { t } = useTranslation()

  const roleOptions: Array<{
    role: UserRole
    title: string
    subtitle: string
    icon: React.ReactNode
    badgeClass: string
  }> = [
    {
      role: 'LIP',
      title: t('roles.lip'),
      subtitle: 'Managing your own family court proceedings or representing yourself.',
      icon: <FaUser size={18} />,
      badgeClass: 'text-secondary',
    },
    {
      role: 'McKenzieFriend',
      title: t('roles.mckenzieFriend'),
      subtitle: 'Lay court supporter providing case advice, file organization & note-taking.',
      icon: <FaHandsHelping size={18} />,
      badgeClass: 'text-info',
    },
    {
      role: 'Solicitor',
      title: t('roles.solicitor'),
      subtitle: 'Regulated legal practitioner (SRA) providing formal representation & advice.',
      icon: <FaBriefcase size={18} />,
      badgeClass: 'text-primary',
    },
    {
      role: 'Barrister',
      title: t('roles.barrister'),
      subtitle: 'Regulated courtroom specialist (Bar Standards Board) for advocacy & opinions.',
      icon: <FaGavel size={18} />,
      badgeClass: 'text-dark',
    },
  ]

  return (
    <Card className="premium-card p-3 p-md-4 mb-4 border">
      <div className="mb-3">
        <h2 className="h5 fw-bold text-dark mb-1">{t('profile.roleTitle')}</h2>
        <p className="text-muted small mb-0">
          {t('profile.roleDesc')}
        </p>
      </div>

      <Row className="g-3">
        {roleOptions.map((opt) => {
          const isSelected = selectedRole === opt.role
          return (
            <Col xs={12} sm={6} key={opt.role}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onChange(opt.role)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onChange(opt.role)
                  }
                }}
                className={`p-3 rounded-3 h-100 position-relative transition-all border ${
                  isSelected
                    ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                    : 'border-slate-200 bg-white hover-border-primary'
                }`}
                style={{
                  cursor: 'pointer',
                  borderWidth: isSelected ? '2px' : '1px',
                  transition: 'all 0.18s ease-in-out',
                }}
              >
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div
                    className={`p-2 rounded-2 d-inline-flex align-items-center justify-content-center ${
                      isSelected ? 'bg-primary text-white' : 'bg-light text-muted'
                    }`}
                  >
                    {opt.icon}
                  </div>
                  {isSelected && (
                    <span className="badge bg-primary rounded-circle p-1 d-inline-flex align-items-center justify-content-center" style={{ width: 20, height: 20 }}>
                      <FaCheck size={10} />
                    </span>
                  )}
                </div>

                <div className="fw-bold text-dark mb-1">{opt.title}</div>
                <div className="text-muted small" style={{ fontSize: '0.815rem', lineHeight: '1.4' }}>
                  {opt.subtitle}
                </div>
              </div>
            </Col>
          )
        })}
      </Row>
    </Card>
  )
}

export default RoleSelectorCard
