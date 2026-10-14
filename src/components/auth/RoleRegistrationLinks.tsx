import { Row, Col, Button } from 'react-bootstrap'
import type { UserRole } from '../../types/domain'

export interface RoleRegistrationLinksProps {
  onSelectRole: (role: UserRole) => void
}

interface RoleButtonConfig {
  role: UserRole
  label: string
  variant: 'outline-primary' | 'outline-success' | 'outline-info' | 'outline-warning'
}

const ROLE_BUTTONS: readonly RoleButtonConfig[] = [
  { role: 'LIP', label: 'Litigant in Person (LIP)', variant: 'outline-primary' },
  { role: 'McKenzieFriend', label: 'McKenzie Friend', variant: 'outline-success' },
  { role: 'Solicitor', label: 'Solicitor', variant: 'outline-info' },
  { role: 'Barrister', label: 'Barrister', variant: 'outline-warning' },
] as const

/**
 * Reusable role selection navigation buttons for user registration.
 */
export default function RoleRegistrationLinks({ onSelectRole }: RoleRegistrationLinksProps) {
  return (
    <div>
      <div className="text-center mb-3">
        <p className="text-muted small mb-0 fw-semibold">Need to register a new account?</p>
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
              {btn.label}
            </Button>
          </Col>
        ))}
      </Row>
    </div>
  )
}
