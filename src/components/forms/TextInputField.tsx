import type { ReactNode, ChangeEvent } from 'react'
import { Form, InputGroup } from 'react-bootstrap'

export interface TextInputFieldProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string, e: ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  type?: 'text' | 'email' | 'tel' | 'url' | 'password' | 'number'
  helperText?: string
  error?: string
  icon?: ReactNode
  className?: string
  size?: 'sm' | 'lg'
  maxLength?: number
}

export default function TextInputField({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder = '',
  required = false,
  disabled = false,
  type = 'text',
  helperText,
  error,
  icon,
  className = '',
  size,
  maxLength,
}: TextInputFieldProps) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined)

  const control = (
    <Form.Control
      id={inputId}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value, e as ChangeEvent<HTMLInputElement>)}
      onBlur={onBlur}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      isInvalid={Boolean(error)}
      size={size}
      maxLength={maxLength}
    />
  )

  return (
    <Form.Group className={`mb-3 ${className}`} controlId={inputId}>
      {label && (
        <Form.Label className="fw-semibold small">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}

      {icon ? (
        <InputGroup size={size}>
          <InputGroup.Text className="bg-light text-muted">{icon}</InputGroup.Text>
          {control}
        </InputGroup>
      ) : (
        control
      )}

      {error ? (
        <Form.Control.Feedback type="invalid" className="d-block small">
          {error}
        </Form.Control.Feedback>
      ) : helperText ? (
        <Form.Text className="text-muted small">{helperText}</Form.Text>
      ) : null}
    </Form.Group>
  )
}
