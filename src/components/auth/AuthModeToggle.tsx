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

  const renderItem = (target: AuthMode, icon: ReactNode, label: string) => {
    const isActive = mode === target
    return (
      <Nav.Item className="flex-fill text-center">
        <Nav.Link
          active={isActive}
          onClick={() => onChange(target)}
          className={`rounded-pill fw-semibold d-inline-flex align-items-center justify-content-center w-100 transition-all ${
            isActive
              ? 'bg-white text-primary shadow-xs'
              : 'text-secondary'
          }`}
          style={{
            fontSize: '0.84rem',
            padding: '0.45rem 0.85rem',
            border: isActive ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid transparent',
            cursor: 'pointer',
          }}
        >
          {icon}
          <span>{label}</span>
        </Nav.Link>
      </Nav.Item>
    )
  }

  return (
    <div className="d-flex justify-content-center mb-3">
      <Nav
        variant="pills"
        className="p-1 rounded-pill border"
        style={{ width: '100%', maxWidth: '320px', background: '#f1f5f9', borderColor: '#e2e8f0' }}
      >
        {renderItem('signin', <FaSignInAlt className="me-1.5" size={12} />, t('common.signIn'))}
        {renderItem('signup', <FaUserPlus className="me-1.5" size={12} />, 'Create Account')}
      </Nav>
    </div>
  )
}
