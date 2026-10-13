import { Row, Col } from 'react-bootstrap'
import type { CourtType, CaseType, CaseStatus } from '../../types/domain'
import TextInputField from './TextInputField'
import SelectField from './SelectField'
import DateField from './DateField'
import { FaGavel, FaFolder, FaCalendarAlt, FaIdCard } from 'react-icons/fa'

export interface CaseMetadataFormValues {
  title: string
  id?: string
  court: CourtType
  caseType: CaseType
  status: CaseStatus
  startedAt: string
  allocatedJudge?: string
}

export interface CaseMetadataFormProps {
  values: CaseMetadataFormValues
  onChange: <K extends keyof CaseMetadataFormValues>(field: K, value: CaseMetadataFormValues[K]) => void
  disabled?: boolean
  childrenCount?: number
  className?: string
}

const COURTS: CourtType[] = ['Family Court', 'High Court Family Division']
const CASE_TYPES: CaseType[] = [
  'Public Law (Care Proceedings)',
  'Private Law (Child Arrangements)',
  'Domestic Abuse (Non-Molestation)',
  'Financial Remedies',
  'Adoption',
  'Other',
]
const CASE_STATUSES: CaseStatus[] = ['Open', 'Stayed', 'Concluded']

export default function CaseMetadataForm({
  values,
  onChange,
  disabled = false,
  childrenCount,
  className = '',
}: CaseMetadataFormProps) {
  return (
    <div className={className}>
      <TextInputField
        label="Case Title"
        placeholder="e.g. Application for Child Arrangements"
        value={values.title}
        onChange={(val) => onChange('title', val)}
        required
        disabled={disabled}
        icon={<FaFolder size={14} />}
        helperText="Brief descriptive title identifying the proceedings"
      />

      <TextInputField
        label="Case Number"
        placeholder="e.g. FC-23-001234 (auto-generated if left blank)"
        value={values.id || ''}
        onChange={(val) => onChange('id', val)}
        disabled={disabled}
        icon={<FaIdCard size={14} />}
        helperText="Official court reference or leave empty for auto ID"
      />

      <Row className="g-2">
        <Col md={6}>
          <SelectField
            label="Court Jurisdiction"
            value={values.court}
            onChange={(val) => onChange('court', val as CourtType)}
            options={COURTS}
            required
            disabled={disabled}
          />
        </Col>
        <Col md={6}>
          <SelectField
            label="Case Type"
            value={values.caseType}
            onChange={(val) => onChange('caseType', val as CaseType)}
            options={CASE_TYPES}
            required
            disabled={disabled}
          />
        </Col>
      </Row>

      <Row className="g-2">
        <Col md={6}>
          <SelectField
            label="Case Status"
            value={values.status}
            onChange={(val) => onChange('status', val as CaseStatus)}
            options={CASE_STATUSES}
            required
            disabled={disabled}
          />
        </Col>
        <Col md={6}>
          <DateField
            label="Started On"
            value={values.startedAt}
            onChange={(val) => onChange('startedAt', val)}
            required
            disabled={disabled}
          />
        </Col>
      </Row>

      <Row className="g-2 align-items-center">
        <Col md={8}>
          <TextInputField
            label="Allocated Presiding Judge"
            placeholder="e.g. District Judge Henderson"
            value={values.allocatedJudge || ''}
            onChange={(val) => onChange('allocatedJudge', val)}
            disabled={disabled}
            icon={<FaGavel size={14} />}
            helperText="Lead judge or magistrate allocated to the case"
          />
        </Col>
        {childrenCount !== undefined && (
          <Col md={4} className="mb-3">
            <div className="p-3 bg-light rounded border text-secondary small d-flex align-items-center gap-2">
              <FaCalendarAlt className="text-primary flex-shrink-0" />
              <span>
                <strong>Children Involved:</strong> {childrenCount}
              </span>
            </div>
          </Col>
        )}
      </Row>
    </div>
  )
}
