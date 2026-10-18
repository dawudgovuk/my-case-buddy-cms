import { Form } from 'react-bootstrap'
import { useTranslation } from '../../hooks/useTranslation'
import type { UserRole } from '../../types/domain'
import { SIGNUP_ROLE_OPTIONS, isLegalProfessionalRole } from '../../utils/authConstants'

export interface SignupRoleFieldsProps {
  role: UserRole
  onRoleChange: (role: UserRole) => void
  firm: string
  onFirmChange: (value: string) => void
  registrationNumber: string
  onRegistrationNumberChange: (value: string) => void
  disabled?: boolean
}

/**
 * Sign-up role selector plus firm / registration number fields for solicitors and barristers.
 */
export default function SignupRoleFields({
  role,
  onRoleChange,
  firm,
  onFirmChange,
  registrationNumber,
  onRegistrationNumberChange,
  disabled,
}: SignupRoleFieldsProps) {
  const { t } = useTranslation()

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold small text-secondary">Family Court Role</Form.Label>
        <Form.Select
          value={role}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          disabled={disabled}
        >
          {SIGNUP_ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Form.Select>
      </Form.Group>

      {isLegalProfessionalRole(role) && (
        <div className="p-3 bg-light rounded-3 mb-3 border">
          <Form.Group className="mb-2">
            <Form.Label className="fw-semibold small text-secondary">
              {role === 'Solicitor' ? t('auth.firmLabel') : t('auth.chambersLabel')}
            </Form.Label>
            <Form.Control
              type="text"
              value={firm}
              onChange={(e) => onFirmChange(e.target.value)}
              placeholder={role === 'Solicitor' ? 'Jenkins & Co' : 'Doughty Street Chambers'}
              disabled={disabled}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label className="fw-semibold small text-secondary">
              {t('auth.registrationNumberLabel')}
            </Form.Label>
            <Form.Control
              type="text"
              value={registrationNumber}
              onChange={(e) => onRegistrationNumberChange(e.target.value)}
              placeholder="e.g. SRA-12345 or BSB-67890"
              disabled={disabled}
            />
          </Form.Group>
        </div>
      )}
    </>
  )
}
