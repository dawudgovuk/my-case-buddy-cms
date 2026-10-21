import { useState } from 'react'
import { Card, Row, Col } from 'react-bootstrap'
import TextInputField from '../forms/TextInputField'
import SelectField from '../forms/SelectField'
import DateField from '../forms/DateField'
import TextareaField from '../forms/TextareaField'
import CaseMetadataForm, { type CaseMetadataFormValues } from '../forms/CaseMetadataForm'
import { FaUser, FaLock } from 'react-icons/fa'

export function CaseMetadataFormPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [values, setValues] = useState<CaseMetadataFormValues>({
    title: 'Application for Child Arrangements and Prohibited Steps',
    id: '1792 1487 9533 6269',
    court: 'Family Court',
    caseType: 'Private Law (Child Arrangements)',
    status: 'Open',
    startedAt: new Date().toISOString().slice(0, 10),
    allocatedJudge: 'District Judge Henderson',
  })

  return (
    <Card className="p-4 shadow-sm border bg-white">
      <div className="mb-3 pb-2 border-bottom">
        <h6 className="fw-bold mb-1 text-primary">Case Creation & Edition Form Fields</h6>
        <p className="small text-muted mb-0">
          Composite form input block extracted directly from <code>/cases/new</code>.
        </p>
      </div>

      <CaseMetadataForm
        values={values}
        onChange={(field, val) => {
          setValues((prev) => ({ ...prev, [field]: val }))
          onFeedback(`Updated ${String(field)}: ${String(val)}`)
        }}
        childrenCount={2}
      />
    </Card>
  )
}

export function FormInputsSuitePreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [textVal, setTextVal] = useState('John Watson')
  const [selectVal, setSelectVal] = useState('Private Law (Child Arrangements)')
  const [dateVal, setDateVal] = useState(new Date().toISOString().slice(0, 10))
  const [textareaVal, setTextareaVal] = useState('Client requested urgent assistance regarding hearing directions.')

  return (
    <div className="d-flex flex-column gap-3">
      <Row className="g-3">
        <Col md={6}>
          <TextInputField
            label="Applicant Full Name"
            placeholder="e.g. John Watson"
            value={textVal}
            onChange={(val) => {
              setTextVal(val)
              onFeedback(`TextInput: ${val}`)
            }}
            required
            icon={<FaUser size={13} />}
            helperText="Full legal name as recorded on court papers"
          />
        </Col>

        <Col md={6}>
          <TextInputField
            label="Secure Access Token (Password Field)"
            type="password"
            placeholder="Enter token"
            value="secret12345"
            onChange={() => {}}
            icon={<FaLock size={13} />}
            helperText="Masked credential input field"
          />
        </Col>

        <Col md={6}>
          <SelectField
            label="Case Type Dropdown"
            value={selectVal}
            onChange={(val) => {
              setSelectVal(val)
              onFeedback(`SelectField: ${val}`)
            }}
            options={[
              'Private Law (Child Arrangements)',
              'Public Law (Care Proceedings)',
              'Domestic Abuse (Non-Molestation)',
              'Financial Remedies',
            ]}
            required
            helperText="Procedural classification"
          />
        </Col>

        <Col md={6}>
          <DateField
            label="Hearing / Filing Date"
            value={dateVal}
            onChange={(val) => {
              setDateVal(val)
              onFeedback(`DateField: ${val}`)
            }}
            required
            helperText="ISO date format"
          />
        </Col>

        <Col xs={12}>
          <TextareaField
            label="Court Attendance Notes"
            rows={3}
            placeholder="Type detailed note here..."
            value={textareaVal}
            onChange={(val) => {
              setTextareaVal(val)
              onFeedback('Textarea updated')
            }}
            helperText="Multi-line formatted notes field"
          />
        </Col>
      </Row>
    </div>
  )
}
