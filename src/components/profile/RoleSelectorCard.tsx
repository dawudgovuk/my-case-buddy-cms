import React from 'react'
import { Card, Row, Col, Badge } from 'react-bootstrap'
import {
  FaUser,
  FaHandsHelping,
  FaBriefcase,
  FaGavel,
  FaCheck,
  FaBalanceScale,
  FaInfoCircle,
} from 'react-icons/fa'
import type { UserRole } from '../../types/domain'
import { useTranslation } from '../../hooks/useTranslation'

interface RoleSelectorCardProps {
  selectedRole: UserRole
  onChange: (role: UserRole) => void
}

interface RoleOptionConfig {
  role: UserRole
  title: string
  tag: string
  subtitle: string
  icon: React.ReactNode
  accentColor: string
  bgSoft: string
  borderSoft: string
}

export const RoleSelectorCard: React.FC<RoleSelectorCardProps> = ({ selectedRole, onChange }) => {
  const { t } = useTranslation()

  const roleOptions: RoleOptionConfig[] = [
    {
      role: 'LIP',
      title: t('roles.lip'),
      tag: 'Self-Representation',
      subtitle: 'Managing your own family court proceedings, drafting statements, and self-advocacy.',
      icon: <FaUser size={18} />,
      accentColor: '#2b4acb',
      bgSoft: 'var(--mcb-primary-soft)',
      borderSoft: 'var(--mcb-primary-border)',
    },
    {
      role: 'McKenzieFriend',
      title: t('roles.mckenzieFriend'),
      tag: 'Lay Court Supporter',
      subtitle: 'Experienced court companion offering quiet advice, file organization, and note-taking.',
      icon: <FaHandsHelping size={18} />,
      accentColor: '#0e7a55',
      bgSoft: 'var(--mcb-success-soft)',
      borderSoft: 'var(--mcb-success-border)',
    },
    {
      role: 'Solicitor',
      title: t('roles.solicitor'),
      tag: 'SRA Regulated',
      subtitle: 'Practicing solicitor providing formal legal representation, court applications, and advice.',
      icon: <FaBriefcase size={18} />,
      accentColor: '#1e3a8a',
      bgSoft: '#eff6ff',
      borderSoft: '#bfdbfe',
    },
    {
      role: 'Barrister',
      title: t('roles.barrister'),
      tag: 'BSB Regulated',
      subtitle: 'Courtroom advocacy specialist and legal counsel instructed for hearings and legal opinions.',
      icon: <FaGavel size={18} />,
      accentColor: '#5b3fc4',
      bgSoft: 'var(--mcb-violet-soft)',
      borderSoft: '#d8b4fe',
    },
  ]

  return (
    <Card className="premium-card p-3 p-md-4 mb-4 border">
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h2 className="h5 fw-bold text-dark d-flex align-items-center gap-2 mb-1">
            <FaBalanceScale className="text-primary" size={16} />
            <span>{t('profile.roleTitle')}</span>
          </h2>
          <p className="text-muted small mb-0">
            {t('profile.roleDesc')}
          </p>
        </div>
        <div className="d-flex align-items-center gap-1.5 text-muted small bg-light px-2.5 py-1 rounded-pill border">
          <FaInfoCircle size={12} className="text-primary" />
          <span>Select your court capacity</span>
        </div>
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
                className="p-3 rounded-3 h-100 position-relative transition-all border d-flex flex-column"
                style={{
                  cursor: 'pointer',
                  backgroundColor: isSelected ? opt.bgSoft : '#ffffff',
                  borderColor: isSelected ? opt.accentColor : 'var(--mcb-border)',
                  borderWidth: isSelected ? '2px' : '1px',
                  boxShadow: isSelected
                    ? `0 6px 18px -4px rgba(15, 23, 42, 0.12), 0 0 0 1px ${opt.borderSoft}`
                    : 'var(--mcb-shadow-xs)',
                  transform: isSelected ? 'translateY(-1px)' : 'none',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div
                    className="p-2 rounded-2 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      backgroundColor: isSelected ? opt.accentColor : 'var(--mcb-surface-2)',
                      color: isSelected ? '#ffffff' : 'var(--mcb-text-2)',
                      transition: 'all 0.18s ease-in-out',
                    }}
                  >
                    {opt.icon}
                  </div>

                  <div className="d-flex align-items-center gap-1">
                    <Badge
                      bg="light"
                      className="text-muted border px-2 py-0.5 rounded-pill"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {opt.tag}
                    </Badge>
                    {isSelected && (
                      <span
                        className="rounded-circle d-inline-flex align-items-center justify-content-center text-white"
                        style={{
                          width: 22,
                          height: 22,
                          backgroundColor: opt.accentColor,
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        <FaCheck size={11} />
                      </span>
                    )}
                  </div>
                </div>

                <div className="fw-bold text-dark mb-1 d-flex align-items-center justify-content-between">
                  <span>{opt.title}</span>
                </div>

                <div className="text-muted small flex-grow-1" style={{ fontSize: '0.8125rem', lineHeight: '1.45' }}>
                  {opt.subtitle}
                </div>

                {isSelected && (
                  <div
                    className="mt-2 pt-2 border-top small fw-semibold d-flex align-items-center gap-1"
                    style={{ color: opt.accentColor, fontSize: '0.75rem' }}
                  >
                    <FaCheck size={9} />
                    <span>Active Selected Role</span>
                  </div>
                )}
              </div>
            </Col>
          )
        })}
      </Row>

      <div className="mt-3 p-2.5 rounded-3 bg-light border d-flex align-items-center gap-2 text-muted small">
        <FaInfoCircle size={14} className="text-primary flex-shrink-0" />
        <span style={{ fontSize: '0.8125rem' }}>
          {t('profile.roleSwitchWarning')}
        </span>
      </div>
    </Card>
  )
}

export default RoleSelectorCard
