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
    <div>
      <div className="auth-divider">{t('auth.needToRegister')}</div>
      <Row className="g-2">
        {ROLE_BUTTONS.map((btn) => (
          <Col key={btn.role} xs={12} sm={6}>
            <button type="button" className="role-tile" onClick={() => onSelectRole(btn.role)}>
              <span className="role-tile-icon" style={{ background: btn.tint.bg, color: btn.tint.fg }} aria-hidden="true">
                {btn.icon}
              </span>
              <span className="flex-grow-1 min-w-0">
                <span className="role-tile-title">{t(btn.labelKey)}</span>
                <span className="role-tile-text">{btn.description}</span>
              </span>
              <FaChevronRight size={11} className="text-muted flex-shrink-0" aria-hidden="true" />
            </button>
          </Col>
        ))}
      </Row>
    </div>
  )
}
