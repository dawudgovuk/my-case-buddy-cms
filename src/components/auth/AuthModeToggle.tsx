import type { ReactNode } from 'react'
import { Nav } from 'react-bootstrap'
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'
import type { AuthMode } from '../../utils/authConstants'

export interface AuthModeToggleProps {
  mode: AuthMode
  onChange: (mode: AuthMode) => void
}

/**
 * Pill toggle switching the Login card between "Sign In" and "Create Account".
 */
export default function AuthModeToggle({ mode, onChange }: AuthModeToggleProps) {
  const { t } = useTranslation()

  const renderItem = (target: AuthMode, icon: ReactNode, label: string) => (
    <Nav.Item className="flex-fill text-center">
      <Nav.Link
        active={mode === target}
        onClick={() => onChange(target)}
        className={`rounded-pill fw-semibold d-inline-flex align-items-center justify-content-center ${
          mode === target ? 'bg-white text-primary shadow-sm' : 'text-secondary'
        }`}
        style={{ fontSize: '0.875rem', minHeight: 38 }}
      >
        {icon}
        <span>{label}</span>
      </Nav.Link>
    </Nav.Item>
  )

  return (
    <div className="d-flex justify-content-center mb-4">
      <Nav variant="pills" className="p-1 rounded-pill border" style={{ width: '100%', maxWidth: '340px', background: '#eef1f6' }}>
        {renderItem('signin', <FaSignInAlt className="me-1" />, t('common.signIn'))}
        {renderItem('signup', <FaUserPlus className="me-1" />, 'Create Account')}
      </Nav>
    </div>
  )
}
