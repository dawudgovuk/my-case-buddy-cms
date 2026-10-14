import type { ChangeEvent } from 'react'
import { Form } from 'react-bootstrap'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectFieldProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string, e: ChangeEvent<HTMLSelectElement>) => void
  options: (string | SelectOption)[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  helperText?: string
  error?: string
  className?: string
  size?: 'sm' | 'lg'
}

export default function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  helperText,
  error,
  className = '',
  size,
}: SelectFieldProps) {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined)

  return (
    <Form.Group className={`mb-3 ${className}`} controlId={selectId}>
      {label && (
        <Form.Label className="fw-semibold small">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}

      <Form.Select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value, e)}
        disabled={disabled}
        isInvalid={Boolean(error)}
        size={size}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const optValue = typeof opt === 'string' ? opt : opt.value
          const optLabel = typeof opt === 'string' ? opt : opt.label
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          )
        })}
      </Form.Select>

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
