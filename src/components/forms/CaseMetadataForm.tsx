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

  const courtSelectOptions = useMemo(() => {
    const list = [...courtJurisdictions]
    if (values.court && !list.includes(values.court)) {
      list.unshift(values.court)
    }
    return list.map((c) => {
      let label = c
      if (c === 'Family Court') label = t('caseForm.courtFamilyCourt')
      else if (c === 'High Court Family Division') label = t('caseForm.courtHighCourt')
      return { value: c, label }
    })
  }, [courtJurisdictions, values.court, t])

  const caseTypeSelectOptions = useMemo(() => {
    const list = [...caseTypes]
    if (values.caseType && !list.includes(values.caseType)) {
      list.unshift(values.caseType)
    }
    return list.map((ct) => {
      let label = ct
      if (ct === 'Public Law (Care Proceedings)') label = t('caseForm.caseTypePublicLaw')
      else if (ct === 'Private Law (Child Arrangements)') label = t('caseForm.caseTypePrivateLaw')
      else if (ct === 'Domestic Abuse (Non-Molestation)') label = t('caseForm.caseTypeDomesticAbuse')
      else if (ct === 'Financial Remedies') label = t('caseForm.caseTypeFinancialRemedies')
      else if (ct === 'Adoption') label = t('caseForm.caseTypeAdoption')
      else if (ct === 'Other') label = t('caseForm.caseTypeOther')
      return { value: ct, label }
    })
  }, [caseTypes, values.caseType, t])

  const statusSelectOptions = useMemo(() => {
    return CASE_STATUSES.map((st) => {
      let label: string = st
      if (st === 'Open') label = t('caseForm.statusOpen')
      else if (st === 'Stayed') label = t('caseForm.statusStayed')
      else if (st === 'Concluded') label = t('caseForm.statusConcluded')
      return { value: st, label }
    })
  }, [t])

  const helperText = isAutoId
    ? t('caseForm.litigantTipNotice')
    : validation.digitsCount > 0 && validation.digitsCount < 16
    ? `${t('caseForm.caseNumberLabel')}: ${validation.digitsCount}/16`
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
                {t('caseForm.caseSubtitle')}
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
          helperText={t('caseForm.caseTitleHelper')}
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
              <strong>{t('caseForm.litigantTipLabel')}:</strong> {t('caseForm.litigantTipNotice')}
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
            <h6 className="fw-bold mb-0 text-dark">{t('caseForm.jurisdictionSectionTitle')}</h6>
            <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
              {t('caseForm.jurisdictionSectionSubtitle')}
            </span>
          </div>
        </div>

        <Row className="g-3 mb-3">
          <Col md={6}>
            <SelectField
              label={t('caseForm.courtJurisdictionLabel')}
              value={values.court}
              onChange={(val) => onChange('court', val as CourtType)}
              options={courtSelectOptions}
              required
              disabled={disabled}
              helperText={t('caseForm.courtVenueHelper')}
            />
          </Col>
          <Col md={6}>
            <SelectField
              label={t('caseForm.caseTypeLabel')}
              value={values.caseType}
              onChange={(val) => onChange('caseType', val as CaseType)}
              options={caseTypeSelectOptions}
              required
              disabled={disabled}
              helperText={t('caseForm.caseTypeHelper')}
            />
          </Col>
        </Row>

        <Row className="g-3">
          <Col md={6}>
            <SelectField
              label={t('caseDetails.statusLabel')}
              value={values.status}
              onChange={(val) => onChange('status', val as CaseStatus)}
              options={statusSelectOptions}
              required
              disabled={disabled}
              helperText={t('caseForm.statusHelper')}
            />
          </Col>
          <Col md={6}>
            <DateField
              label={t('caseForm.startedAtLabel')}
              value={values.startedAt}
              onChange={(val) => onChange('startedAt', val)}
              required
              disabled={disabled}
              helperText={t('caseForm.filingDateHelper')}
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
            <h6 className="fw-bold mb-0 text-dark">{t('caseForm.benchSectionTitle')}</h6>
            <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
              {t('caseForm.benchSectionSubtitle')}
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
              helperText={t('caseForm.leadJudgeHelper')}
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
                    {childrenCount === 1
                      ? t('caseForm.childCountSingle')
                      : t('caseForm.childCountPlural').replace('{count}', String(childrenCount))}
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
