import type { ReactNode } from 'react'
import { Form } from 'react-bootstrap'

export interface IconInputFieldProps {
  label: string
  icon: ReactNode
  type: 'text' | 'email'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  autoComplete?: string
}

/**
 * Required large text input with a leading icon addon and a small secondary label.
 */
export default function IconInputField({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete,
}: IconInputFieldProps) {
  return (
    <Form.Group className="mb-3">
      <Form.Label className="fw-semibold small text-secondary">{label}</Form.Label>
      <div className="input-group">
        <span className="input-group-text bg-white text-muted">{icon}</span>
        <Form.Control
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          size="lg"
          disabled={disabled}
          autoComplete={autoComplete}
        />
      </div>
    </Form.Group>
  )
}
