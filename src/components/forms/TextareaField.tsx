import type { ChangeEvent } from 'react'
import { Form } from 'react-bootstrap'

export interface TextareaFieldProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string, e: ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  rows?: number
  required?: boolean
  disabled?: boolean
  maxLength?: number
  helperText?: string
  error?: string
  className?: string
}

export default function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  rows = 3,
  required = false,
  disabled = false,
  maxLength,
  helperText,
  error,
  className = '',
}: TextareaFieldProps) {
  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined)

  return (
    <Form.Group className={`mb-3 ${className}`} controlId={textareaId}>
      {label && (
        <Form.Label className="fw-semibold small">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}

      <Form.Control
        id={textareaId}
        as="textarea"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value, e as ChangeEvent<HTMLTextAreaElement>)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        isInvalid={Boolean(error)}
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
