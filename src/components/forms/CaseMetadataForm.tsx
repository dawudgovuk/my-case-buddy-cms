import { useState, useMemo } from 'react'
import { Row, Col, Alert } from 'react-bootstrap'
import type { CourtType, CaseType, CaseStatus } from '../../types/domain'
import TextInputField from './TextInputField'
import SelectField from './SelectField'
import DateField from './DateField'
import { FaGavel, FaFolder, FaIdCard, FaInfoCircle, FaCalendarCheck } from 'react-icons/fa'
import { formatCaseNumberInput, validateCaseNumber } from '../../utils/caseNumberUtils'
import { useCaseConfigStore } from '../../store/caseConfigStore'
import { useTranslation } from '../../hooks/useTranslation'

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

const CASE_STATUSES: CaseStatus[] = ['Open', 'Stayed', 'Concluded']

export default function CaseMetadataForm({
  values,
  onChange,
  disabled = false,
  childrenCount,
  className = '',
}: CaseMetadataFormProps) {
  const { courtJurisdictions, caseTypes } = useCaseConfigStore()
  const { t } = useTranslation()
  const [caseIdTouched, setCaseIdTouched] = useState(false)
  const validation = useMemo(() => validateCaseNumber(values.id), [values.id])
  const isAutoId = Boolean(values.id && (values.id.startsWith('CASE_') || values.id.startsWith('case_')))

  const courtOptions = useMemo(() => {
    const list = [...courtJurisdictions]
    if (values.court && !list.includes(values.court)) {
      list.unshift(values.court)
    }
    return list
  }, [courtJurisdictions, values.court])

  const caseTypeOptions = useMemo(() => {
    const list = [...caseTypes]
    if (values.caseType && !list.includes(values.caseType)) {
      list.unshift(values.caseType)
    }
    return list
  }, [caseTypes, values.caseType])

  const helperText = isAutoId
    ? 'Assigned bundle tracking reference. You can update this with your official 16-digit court case number once issued.'
    : validation.digitsCount > 0 && validation.digitsCount < 16
    ? `Entering 16-digit HMCTS case reference: ${validation.digitsCount}/16 digits`
    : t('caseForm.caseNumberHelp')

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
              <h6 className="fw-bold mb-0 text-dark">{t('caseDetails.metadataTitle')}</h6>
              <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                Primary proceeding name and court registry number
              </span>
            </div>
          </div>
        </div>

        <TextInputField
          label={t('caseForm.caseTitleLabel')}
          placeholder={t('caseForm.caseTitlePlaceholder')}
          value={values.title}
          onChange={(val) => onChange('title', val)}
          required
          disabled={disabled}
          icon={<FaFolder size={14} />}
          helperText="Descriptive title identifying your court matter"
          className="mb-3"
        />

        <TextInputField
          label={t('caseForm.caseNumberLabel')}
          placeholder={t('caseForm.caseNumberPlaceholder')}
          value={values.id || ''}
          onChange={(val) => {
            setCaseIdTouched(true)
            onChange('id', formatCaseNumberInput(val))
          }}
          onBlur={() => setCaseIdTouched(true)}
          error={caseIdTouched && !validation.isValid ? validation.error : undefined}
          maxLength={19}
          disabled={disabled}
          icon={<FaIdCard size={14} />}
          helperText={helperText}
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
              label={t('caseForm.courtJurisdictionLabel')}
              value={values.court}
              onChange={(val) => onChange('court', val as CourtType)}
              options={courtOptions}
              required
              disabled={disabled}
              helperText="Competent family court venue"
            />
          </Col>
          <Col md={6}>
            <SelectField
              label={t('caseForm.caseTypeLabel')}
              value={values.caseType}
              onChange={(val) => onChange('caseType', val as CaseType)}
              options={caseTypeOptions}
              required
              disabled={disabled}
              helperText="Procedural classification under Family Procedure Rules"
            />
          </Col>
        </Row>

        <Row className="g-3">
          <Col md={6}>
            <SelectField
              label={t('caseDetails.statusLabel')}
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
              label={t('caseForm.startedAtLabel')}
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
              label={t('caseForm.allocatedJudgeLabel')}
              placeholder={t('caseForm.allocatedJudgePlaceholder')}
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
                  <div className="fw-semibold small text-dark">{t('common.children')}</div>
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
