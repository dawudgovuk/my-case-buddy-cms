import { Form, Button } from 'react-bootstrap'
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'

export interface PasswordFieldProps {
  value: string
  onChange: (value: string) => void
  /** Whether the password is currently shown as plain text. */
  showPassword: boolean
  /** Toggle plain-text visibility. */
  onToggleShow: () => void
  disabled?: boolean
  autoComplete: 'current-password' | 'new-password'
  /** Show the "Min 8 characters" hint next to the label. */
  showLengthHint?: boolean
  /** Add an aria-label to the show/hide toggle button. */
  labelToggle?: boolean
}

/**
 * Password input with lock icon and a show/hide visibility toggle.
 */
export default function PasswordField({
  value,
  onChange,
  showPassword,
  onToggleShow,
  disabled,
  autoComplete,
  showLengthHint = false,
  labelToggle = false,
}: PasswordFieldProps) {
  return (
    <Form.Group className="mb-3">
      <div className="d-flex justify-content-between align-items-center">
        <Form.Label className="fw-semibold small text-secondary">Password</Form.Label>
        {showLengthHint && (
          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
            Min 8 characters
          </small>
        )}
      </div>
      <div className="input-group">
        <span className="input-group-text bg-white text-muted">
          <FaLock size={14} />
        </span>
        <Form.Control
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          required
          size="lg"
          disabled={disabled}
          autoComplete={autoComplete}
        />
        <Button
          variant="outline-secondary"
          className="border-start-0 bg-white text-muted"
          type="button"
          onClick={onToggleShow}
          aria-label={labelToggle ? (showPassword ? 'Hide password' : 'Show password') : undefined}
        >
          {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
        </Button>
      </div>
    </Form.Group>
  )
}
