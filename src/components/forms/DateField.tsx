import type { ChangeEvent } from 'react'
import { Form } from 'react-bootstrap'

export interface DateFieldProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string, e: ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  disabled?: boolean
  min?: string
  max?: string
  helperText?: string
  error?: string
  className?: string
  size?: 'sm' | 'lg'
}

export default function DateField({
  id,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  min,
  max,
  helperText,
  error,
  className = '',
  size,
}: DateFieldProps) {
  const inputId = id || (label ? `date-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined)

  return (
    <Form.Group className={`mb-3 ${className}`} controlId={inputId}>
      {label && (
        <Form.Label className="fw-semibold small">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}

      <Form.Control
        id={inputId}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value, e as ChangeEvent<HTMLInputElement>)}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        isInvalid={Boolean(error)}
        size={size}
      />

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
