import { Form } from 'react-bootstrap'
import { useTranslation } from '../../hooks/useTranslation'

export interface ProfessionalDetailsFieldsProps {
  role: 'Solicitor' | 'Barrister'
  firm: string
  onFirmChange: (value: string) => void
  registrationNumber: string
  onRegistrationNumberChange: (value: string) => void
  disabled?: boolean
}

/**
 * Firm / chambers and regulator registration number inputs for legal professionals.
 */
export default function ProfessionalDetailsFields({
  role,
  firm,
  onFirmChange,
  registrationNumber,
  onRegistrationNumberChange,
  disabled,
}: ProfessionalDetailsFieldsProps) {
  const { t } = useTranslation()
  const isSolicitor = role === 'Solicitor'

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold small text-secondary">
          {isSolicitor ? t('auth.firmLabel') : t('auth.chambersLabel')}
        </Form.Label>
        <Form.Control
          type="text"
          value={firm}
          onChange={(e) => onFirmChange(e.target.value)}
          size="lg"
          placeholder={isSolicitor ? t('auth.firmPlaceholder') : t('auth.chambersPlaceholder')}
          disabled={disabled}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold small text-secondary">
          {t('auth.registrationNumberLabel')}
        </Form.Label>
        <Form.Control
          type="text"
          value={registrationNumber}
          onChange={(e) => onRegistrationNumberChange(e.target.value)}
          size="lg"
          placeholder={t('auth.registrationNumberPlaceholder')}
          disabled={disabled}
        />
      </Form.Group>
    </>
  )
}
