import React, { useState } from 'react'
import { Card, Form, Row, Col, Badge, Button, InputGroup } from 'react-bootstrap'
import { FaBuilding, FaCertificate, FaClock, FaTags, FaTimes, FaPlus, FaBookOpen } from 'react-icons/fa'
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
          <h2 className="h5 fw-bold text-dark mb-1">{t('profile.professionalCredentialsTitle')}</h2>
          <p className="text-muted small mb-0">
            {t('profile.professionalCredentialsDesc')}
          </p>
        </div>
        <Badge bg="primary" className="px-2.5 py-1.5 fs-7">
          {role}
        </Badge>
      </div>

      <Row className="g-3">
        {/* Firm / Chambers */}
        <Col xs={12} md={6}>
          <Form.Group controlId="profile-firm">
            <Form.Label className="fw-semibold small text-dark d-flex align-items-center gap-1.5">
              <FaBuilding className="text-primary" size={13} />
              <span>{isBarrister ? 'Chambers Name' : t('profile.firmOrChambers')}</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={isBarrister ? 'e.g. St Philips Chambers' : t('profile.firmPlaceholder')}
              value={data.firm || ''}
              onChange={(e) => onChange({ firm: e.target.value })}
              className="py-2"
            />
          </Form.Group>
        </Col>

        {/* Registration Number */}
        <Col xs={12} md={6}>
          <Form.Group controlId="profile-registrationNumber">
            <Form.Label className="fw-semibold small text-dark d-flex align-items-center gap-1.5">
              <FaCertificate className="text-primary" size={13} />
              <span>
                {t('profile.registrationNumber')}
              </span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={t('profile.registrationNumberPlaceholder')}
              value={data.registrationNumber || ''}
              onChange={(e) => onChange({ registrationNumber: e.target.value })}
              className="py-2"
            />
          </Form.Group>
        </Col>

        {/* Years of Experience */}
        <Col xs={12} md={4}>
          <Form.Group controlId="profile-yearsExperience">
            <Form.Label className="fw-semibold small text-dark d-flex align-items-center gap-1.5">
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
            <Form.Label className="fw-semibold small text-dark d-flex align-items-center gap-1.5 mb-1.5">
              <FaTags className="text-primary" size={13} />
              <span>Areas of Specialism & Practice</span>
            </Form.Label>
            <p className="text-muted small mb-2">
              Select all practice areas you cover. These highlight your expertise in the Legal Directory and Case Team matchmaking.
            </p>

            {/* Preset tags pill list */}
            <div className="d-flex flex-wrap gap-1.5 mb-2.5">
              {PRESET_SPECIALISMS.map((spec) => {
                const isSelected = activeSpecialisms.includes(spec)
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => handleToggleSpecialism(spec)}
                    className={`btn btn-sm rounded-pill px-2.5 py-1 transition-all ${
                      isSelected
                        ? 'btn-primary'
                        : 'btn-outline-secondary bg-white text-secondary'
                    }`}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {spec}
                  </button>
                )
              })}
            </div>

            {/* Custom Tag Input */}
            <InputGroup className="mb-2" style={{ maxWidth: 440 }}>
              <Form.Control
                type="text"
                size="sm"
                placeholder="Add other custom specialism..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomTag()
                  }
                }}
              />
              <Button variant="outline-primary" size="sm" onClick={() => handleAddCustomTag()}>
                <FaPlus size={10} className="me-1" />
                Add
              </Button>
            </InputGroup>

            {/* Active Tags display */}
            {activeSpecialisms.length > 0 && (
              <div className="d-flex flex-wrap gap-1 mt-2 p-2 rounded-2 bg-light border">
                <span className="small text-muted me-1 align-self-center">Selected:</span>
                {activeSpecialisms.map((tag) => (
                  <Badge
                    key={tag}
                    bg="dark"
                    className="d-inline-flex align-items-center gap-1 px-2 py-1 fw-normal text-white"
                  >
                    <span>{tag}</span>
                    <FaTimes
                      role="button"
                      size={10}
                      className="ms-1 cursor-pointer text-white-50 hover-text-white"
                      onClick={() => handleRemoveTag(tag)}
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
              <span className="text-muted small">{(data.bio || '').length} characters</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Outline your background in Family Law, courtroom presence, approaches to dispute resolution, and any particular areas of experience (e.g. international matters, complex fact-findings)..."
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
