import { Row, Col, Button } from 'react-bootstrap'
import type { UserRole } from '../../types/domain'
import { useTranslation } from '../../hooks/useTranslation'

export interface RoleRegistrationLinksProps {
  onSelectRole: (role: UserRole) => void
}

interface RoleButtonConfig {
  role: UserRole
  labelKey: 'roles.lipFull' | 'roles.mckenzieFriend' | 'roles.solicitor' | 'roles.barrister'
  variant: 'outline-primary' | 'outline-success' | 'outline-info' | 'outline-warning'
}

const ROLE_BUTTONS: readonly RoleButtonConfig[] = [
  { role: 'LIP', labelKey: 'roles.lipFull', variant: 'outline-primary' },
  { role: 'McKenzieFriend', labelKey: 'roles.mckenzieFriend', variant: 'outline-success' },
  { role: 'Solicitor', labelKey: 'roles.solicitor', variant: 'outline-info' },
  { role: 'Barrister', labelKey: 'roles.barrister', variant: 'outline-warning' },
] as const

/**
 * Reusable role selection navigation buttons for user registration.
 */
export default function RoleRegistrationLinks({ onSelectRole }: RoleRegistrationLinksProps) {
  const { t } = useTranslation()

  return (
    <div>
      <div className="text-center mb-3">
        <p className="text-muted small mb-0 fw-semibold">{t('auth.needToRegister')}</p>
      </div>
      <Row className="g-2">
        {ROLE_BUTTONS.map((btn) => (
          <Col key={btn.role} xs={6}>
            <Button
              variant={btn.variant}
              className="w-100 py-2 small fw-semibold"
              onClick={() => onSelectRole(btn.role)}
              size="sm"
            >
              {t(btn.labelKey)}
            </Button>
          </Col>
        ))}
      </Row>
    </div>
  )
}
