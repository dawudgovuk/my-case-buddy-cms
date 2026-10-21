import type { ReactNode } from 'react'
import { Row, Col } from 'react-bootstrap'
import { FaUser, FaHandsHelping, FaBriefcase, FaBalanceScale, FaChevronRight } from 'react-icons/fa'
import type { UserRole } from '../../types/domain'
import { useTranslation } from '../../hooks/useTranslation'

export interface RoleRegistrationLinksProps {
  onSelectRole: (role: UserRole) => void
}

interface RoleButtonConfig {
  role: UserRole
  labelKey: 'roles.lipFull' | 'roles.mckenzieFriend' | 'roles.solicitor' | 'roles.barrister'
  description: string
  icon: ReactNode
  tint: { bg: string; fg: string }
}

const ROLE_BUTTONS: readonly RoleButtonConfig[] = [
  { role: 'LIP', labelKey: 'roles.lipFull', description: 'I have a family court case', icon: <FaUser />, tint: { bg: 'var(--mcb-primary-soft)', fg: 'var(--mcb-primary)' } },
  { role: 'McKenzieFriend', labelKey: 'roles.mckenzieFriend', description: 'I support people in court', icon: <FaHandsHelping />, tint: { bg: 'var(--mcb-success-soft)', fg: 'var(--mcb-success)' } },
  { role: 'Solicitor', labelKey: 'roles.solicitor', description: 'Practising solicitor', icon: <FaBriefcase />, tint: { bg: 'var(--mcb-info-soft)', fg: 'var(--mcb-info)' } },
  { role: 'Barrister', labelKey: 'roles.barrister', description: 'Practising barrister', icon: <FaBalanceScale />, tint: { bg: 'var(--mcb-violet-soft)', fg: 'var(--mcb-violet)' } },
] as const

/**
 * Reusable role selection navigation buttons for user registration.
 */
export default function RoleRegistrationLinks({ onSelectRole }: RoleRegistrationLinksProps) {
  const { t } = useTranslation()

  return (
    <div className="pt-1">
      <div className="auth-divider text-uppercase tracking-wider mb-2" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
        {t('auth.needToRegister')}
      </div>
      <Row className="g-2">
        {ROLE_BUTTONS.map((btn) => (
          <Col key={btn.role} xs={6}>
            <button
              type="button"
              className="role-tile p-2 rounded-3 border d-flex align-items-center gap-2 w-100 text-start transition-all"
              onClick={() => onSelectRole(btn.role)}
              style={{
                background: '#ffffff',
                borderColor: '#e2e8f0',
                minHeight: '46px',
              }}
            >
              <span
                className="role-tile-icon rounded-2 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  background: btn.tint.bg,
                  color: btn.tint.fg,
                  width: '28px',
                  height: '28px',
                  fontSize: '0.85rem',
                }}
                aria-hidden="true"
              >
                {btn.icon}
              </span>
              <span className="flex-grow-1 min-w-0">
                <span className="d-block fw-semibold text-dark text-truncate" style={{ fontSize: '0.8rem', lineHeight: 1.2 }}>
                  {t(btn.labelKey)}
                </span>
                <span className="d-block text-muted text-truncate" style={{ fontSize: '0.68rem', lineHeight: 1.2 }}>
                  {btn.description}
                </span>
              </span>
              <FaChevronRight size={9} className="text-muted flex-shrink-0 opacity-50" aria-hidden="true" />
            </button>
          </Col>
        ))}
      </Row>
    </div>
  )
}
