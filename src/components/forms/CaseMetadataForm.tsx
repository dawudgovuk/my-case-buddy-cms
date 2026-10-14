import { Row, Col, Alert } from 'react-bootstrap'
import type { CourtType, CaseType, CaseStatus } from '../../types/domain'
import TextInputField from './TextInputField'
import SelectField from './SelectField'
import DateField from './DateField'
import { FaGavel, FaFolder, FaIdCard, FaInfoCircle, FaCalendarCheck } from 'react-icons/fa'

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
      {/* Group 1: Case Identification */}
      <div className="bg-white p-3 p-md-4 rounded-3 border shadow-sm mb-4">
        <div className="d-flex align-items-center justify-content-between pb-2 mb-3 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded bg-primary-subtle text-primary">
              <FaFolder size={14} />
            </div>
            <div>
              <h6 className="fw-bold mb-0 text-dark">Case Overview & Identification</h6>
              <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                Primary proceeding name and court registry number
              </span>
            </div>
          </div>
        </div>

        <TextInputField
          label="Case Title"
          placeholder="e.g. Application for Child Arrangements (Live With / Contact)"
          value={values.title}
          onChange={(val) => onChange('title', val)}
          required
          disabled={disabled}
          icon={<FaFolder size={14} />}
          helperText="Descriptive title identifying your court matter"
          className="mb-3"
        />

        <TextInputField
          label="Official Court Case Number (Optional)"
          placeholder="e.g. FC-23-001234 or leave blank for auto-generated ID"
          value={values.id || ''}
          onChange={(val) => onChange('id', val)}
          disabled={disabled}
          icon={<FaIdCard size={14} />}
          helperText="Assigned by the court office (leave empty if not yet issued)"
          className="mb-2"
        />

        {!values.id && (
          <Alert variant="info" className="py-2 px-3 mb-0 d-flex align-items-center gap-2 border-0 bg-info-subtle text-info-emphasis">
            <FaInfoCircle size={14} className="flex-shrink-0" />
            <span style={{ fontSize: '0.8rem' }}>
              <strong>Litigant Tip:</strong> If your application has not yet been stamped by the court, an automatic tracking ID will be generated for your digital bundle.
            </span>
          </Alert>
        )}
      </div>

      {/* Group 2: Jurisdiction & Legal Classification */}
      <div className="bg-white p-3 p-md-4 rounded-3 border shadow-sm mb-4">
        <div className="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
          <div className="p-2 rounded bg-primary-subtle text-primary">
            <FaGavel size={14} />
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-dark">Jurisdiction & Proceedings Details</h6>
            <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
              Family division, procedural track, and key milestone dates
            </span>
          </div>
        </div>

        <Row className="g-3 mb-3">
          <Col md={6}>
            <SelectField
              label="Court Jurisdiction"
              value={values.court}
              onChange={(val) => onChange('court', val as CourtType)}
              options={COURTS}
              required
              disabled={disabled}
              helperText="Competent family court venue"
            />
          </Col>
          <Col md={6}>
            <SelectField
              label="Case Type / Proceedings Track"
              value={values.caseType}
              onChange={(val) => onChange('caseType', val as CaseType)}
              options={CASE_TYPES}
              required
              disabled={disabled}
              helperText="Procedural classification under Family Procedure Rules"
            />
          </Col>
        </Row>

        <Row className="g-3">
          <Col md={6}>
            <SelectField
              label="Case Status"
              value={values.status}
              onChange={(val) => onChange('status', val as CaseStatus)}
              options={CASE_STATUSES}
              required
              disabled={disabled}
              helperText="Active, Stayed, or Concluded status"
            />
          </Col>
          <Col md={6}>
            <DateField
              label="Proceedings Started On"
              value={values.startedAt}
              onChange={(val) => onChange('startedAt', val)}
              required
              disabled={disabled}
              helperText="Application filing date or service date"
            />
          </Col>
        </Row>
      </div>

      {/* Group 3: Judicial Allocation & Bench */}
      <div className="bg-white p-3 p-md-4 rounded-3 border shadow-sm">
        <div className="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
          <div className="p-2 rounded bg-primary-subtle text-primary">
            <FaCalendarCheck size={14} />
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-dark">Judicial Bench Allocation</h6>
            <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
              Allocated judge, magistrates bench, or legal adviser
            </span>
          </div>
        </div>

        <Row className="g-3 align-items-center">
          <Col md={childrenCount !== undefined ? 8 : 12}>
            <TextInputField
              label="Allocated Presiding Judge (Optional)"
              placeholder="e.g. District Judge Henderson, Recorder Davies, or Bench 4"
              value={values.allocatedJudge || ''}
              onChange={(val) => onChange('allocatedJudge', val)}
              disabled={disabled}
              icon={<FaGavel size={14} />}
              helperText="Lead judge or magistrate allocated for case management"
              className="mb-0"
            />
          </Col>
          {childrenCount !== undefined && (
            <Col md={4}>
              <div className="p-3 bg-light rounded-3 border d-flex align-items-center gap-3">
                <div className="rounded-circle bg-warning-subtle text-warning-emphasis d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                  <strong>{childrenCount}</strong>
                </div>
                <div>
                  <div className="fw-semibold small text-dark">Children Linked</div>
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    {childrenCount === 1 ? '1 child involved' : `${childrenCount} children involved`}
                  </div>
                </div>
              </div>
            </Col>
          )}
        </Row>
      </div>
    </div>
  )
}
