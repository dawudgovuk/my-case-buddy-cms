import React, { useState } from 'react'
import { Card, Form, Row, Col, Badge, Button, InputGroup } from 'react-bootstrap'
import {
  FaBuilding,
  FaCertificate,
  FaClock,
  FaTags,
  FaTimes,
  FaPlus,
  FaBookOpen,
  FaCheck,
  FaAward,
} from 'react-icons/fa'
import type { UserRole } from '../../types/domain'
import { useTranslation } from '../../hooks/useTranslation'

export interface ProfessionalData {
  firm?: string
  registrationNumber?: string
  yearsExperience?: number
  specialisms?: string[]
  bio?: string
}

interface ProfessionalCredentialsFormProps {
  role: UserRole
  data: ProfessionalData
  onChange: (updates: Partial<ProfessionalData>) => void
}

const PRESET_SPECIALISMS = [
  'Child Arrangements (Contact & Residence)',
  'Domestic Abuse & Non-Molestation',
  'Financial Remedies & Property',
  'Public Law (Care Proceedings)',
  'Prohibited Steps Orders',
  'Fact-Finding Hearings',
  'Emergency Injunctions',
  'Specific Issue Orders',
  'International Child Relocation',
]

export const ProfessionalCredentialsForm: React.FC<ProfessionalCredentialsFormProps> = ({
  role,
  data,
  onChange,
}) => {
  const { t } = useTranslation()
  const [customTag, setCustomTag] = useState('')
  const activeSpecialisms = data.specialisms || []

  const isBarrister = role === 'Barrister'
  const isSolicitor = role === 'Solicitor'

  function handleToggleSpecialism(item: string) {
    if (activeSpecialisms.includes(item)) {
      onChange({ specialisms: activeSpecialisms.filter((s) => s !== item) })
    } else {
      onChange({ specialisms: [...activeSpecialisms, item] })
    }
  }

  function handleAddCustomTag(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const trimmed = customTag.trim()
    if (!trimmed) return
    if (!activeSpecialisms.includes(trimmed)) {
      onChange({ specialisms: [...activeSpecialisms, trimmed] })
    }
    setCustomTag('')
  }

  function handleRemoveTag(tagToRemove: string) {
    onChange({ specialisms: activeSpecialisms.filter((s) => s !== tagToRemove) })
  }

  return (
    <Card className="premium-card p-3 p-md-4 mb-4 border">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h2 className="h5 fw-bold text-dark d-flex align-items-center gap-2 mb-1">
            <FaAward className="text-primary" size={16} />
            <span>{t('profile.professionalCredentialsTitle')}</span>
          </h2>
          <p className="text-muted small mb-0">
            {t('profile.professionalCredentialsDesc')}
          </p>
        </div>
        <Badge
          bg={isBarrister ? 'dark' : isSolicitor ? 'primary' : 'success'}
          className="px-3 py-1.5 rounded-pill fs-7 fw-semibold shadow-xs"
        >
          {role}
        </Badge>
      </div>

      <Row className="g-3">
        {/* Firm / Chambers */}
        <Col xs={12} md={6}>
          <Form.Group controlId="profile-firm">
            <Form.Label className="fw-semibold small text-dark d-flex align-items-center gap-1.5 mb-1.5">
              <FaBuilding className="text-primary" size={13} />
              <span>{isBarrister ? 'Chambers Name' : t('profile.firmOrChambers')}</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={isBarrister ? 'e.g. 4PB / St Philips Chambers' : t('profile.firmPlaceholder')}
              value={data.firm || ''}
              onChange={(e) => onChange({ firm: e.target.value })}
              className="py-2"
            />
          </Form.Group>
        </Col>

        {/* Registration Number */}
        <Col xs={12} md={6}>
          <Form.Group controlId="profile-registrationNumber">
            <Form.Label className="fw-semibold small text-dark d-flex align-items-center gap-1.5 mb-1.5">
              <FaCertificate className="text-primary" size={13} />
              <span>
                {isBarrister
                  ? 'Bar Standards Board (BSB) Number'
                  : isSolicitor
                  ? 'SRA Practising Roll ID'
                  : t('profile.registrationNumber')}
              </span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={
                isBarrister
                  ? 'e.g. BSB-123456'
                  : isSolicitor
                  ? 'e.g. SRA-654321'
                  : t('profile.registrationNumberPlaceholder')
              }
              value={data.registrationNumber || ''}
              onChange={(e) => onChange({ registrationNumber: e.target.value })}
              className="py-2"
            />
          </Form.Group>
        </Col>

        {/* Years of Experience */}
        <Col xs={12} md={6}>
          <Form.Group controlId="profile-yearsExperience">
            <Form.Label className="fw-semibold small text-dark d-flex align-items-center gap-1.5 mb-1.5">
              <FaClock className="text-primary" size={13} />
              <span>{t('profile.yearsExperience')}</span>
            </Form.Label>
            <Form.Control
              type="number"
              min={0}
              max={60}
              placeholder={t('profile.yearsExperiencePlaceholder')}
              value={data.yearsExperience !== undefined ? data.yearsExperience : ''}
              onChange={(e) => {
                const val = e.target.value
                onChange({ yearsExperience: val === '' ? undefined : Math.max(0, parseInt(val, 10) || 0) })
              }}
              className="py-2"
            />
          </Form.Group>
        </Col>

        {/* Areas of Specialism */}
        <Col xs={12}>
          <Form.Group>
            <Form.Label className="fw-semibold small text-dark d-flex align-items-center gap-1.5 mb-1">
              <FaTags className="text-primary" size={13} />
              <span>Areas of Specialism & Court Practice</span>
            </Form.Label>
            <p className="text-muted small mb-2.5">
              Select all practice areas you cover. These highlight your expertise in the Legal Directory and Case Team matchmaking.
            </p>

            {/* Preset tags pill list */}
            <div className="d-flex flex-wrap gap-1.5 mb-3">
              {PRESET_SPECIALISMS.map((spec) => {
                const isSelected = activeSpecialisms.includes(spec)
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => handleToggleSpecialism(spec)}
                    className={`btn btn-sm rounded-pill px-3 py-1.5 transition-all d-inline-flex align-items-center gap-1.5 ${
                      isSelected
                        ? 'btn-primary shadow-xs fw-semibold'
                        : 'btn-outline-secondary bg-white text-secondary'
                    }`}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    {isSelected ? <FaCheck size={10} /> : <FaPlus size={9} />}
                    <span>{spec}</span>
                  </button>
                )
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="d-flex align-items-center gap-2 mb-2">
              <InputGroup style={{ maxWidth: 440 }}>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="Add other custom practice area..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomTag()
                    }
                  }}
                  className="py-1.5"
                />
                <Button variant="outline-primary" size="sm" onClick={() => handleAddCustomTag()} className="px-3">
                  <FaPlus size={10} className="me-1" />
                  Add
                </Button>
              </InputGroup>
            </div>

            {/* Active Tags display */}
            {activeSpecialisms.length > 0 && (
              <div className="d-flex flex-wrap align-items-center gap-1.5 mt-2 p-2.5 rounded-3 bg-light border">
                <span className="small text-muted fw-semibold me-1">Selected Specialisms ({activeSpecialisms.length}):</span>
                {activeSpecialisms.map((tag) => (
                  <Badge
                    key={tag}
                    bg="dark"
                    className="d-inline-flex align-items-center gap-1 px-2.5 py-1 rounded-pill fw-medium text-white shadow-xs"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <span>{tag}</span>
                    <FaTimes
                      role="button"
                      size={10}
                      className="ms-1 cursor-pointer text-white-50 hover-text-white"
                      onClick={() => handleRemoveTag(tag)}
                      title="Remove specialism"
                    />
                  </Badge>
                ))}
              </div>
            )}
          </Form.Group>
        </Col>

        {/* Professional Bio */}
        <Col xs={12}>
          <Form.Group controlId="profile-bio">
            <Form.Label className="fw-semibold small text-dark d-flex align-items-center justify-content-between mb-1">
              <span className="d-flex align-items-center gap-1.5">
                <FaBookOpen className="text-primary" size={13} />
                <span>Professional Biography & Court Approach</span>
              </span>
              <span className="badge bg-light text-muted border">
                {(data.bio || '').length} characters
              </span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Outline your background in UK Family Law, courtroom presence, approaches to dispute resolution, and any particular areas of experience (e.g. complex fact-findings, international child matters, non-molestation orders)..."
              value={data.bio || ''}
              onChange={(e) => onChange({ bio: e.target.value })}
              className="py-2"
            />
            <Form.Text className="text-muted small">
              This overview will be visible to prospective litigants seeking peer or professional assistance in the directory.
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>
    </Card>
  )
}

export default ProfessionalCredentialsForm
