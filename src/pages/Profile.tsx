import React, { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaSave,
  FaUndo,
  FaLock,
  FaShieldAlt,
  FaExclamationTriangle,
  FaHeart,
} from 'react-icons/fa'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from '../hooks/useTranslation'
import { ProfileHero } from '../components/profile/ProfileHero'
import { RoleSelectorCard } from '../components/profile/RoleSelectorCard'
import { ProfessionalCredentialsForm } from '../components/profile/ProfessionalCredentialsForm'
import type { User, UserRole } from '../types/domain'

export default function Profile() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()
  const { t } = useTranslation()

  // Form state initialized from current user
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<UserRole>('LIP')
  const [firm, setFirm] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [yearsExperience, setYearsExperience] = useState<number | undefined>(undefined)
  const [specialisms, setSpecialisms] = useState<string[]>([])
  const [bio, setBio] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Sync state whenever user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
      setRole(user.role || 'LIP')
      setFirm(user.firm || '')
      setRegistrationNumber(user.registrationNumber || '')
      setYearsExperience(user.yearsExperience)
      setSpecialisms(user.specialisms || [])
      setBio(user.bio || '')
    }
  }, [user])

  // Derive initials and safe display name
  const safeName = useMemo(() => name.trim() || user?.name || user?.email || 'User', [name, user])
  const userInitials = useMemo(() => {
    const parts = safeName.split(/[\s@._]+/).filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return (parts[0]?.[0] || 'U').toUpperCase()
  }, [safeName])

  // Detect whether form has unsaved modifications
  const isDirty = useMemo(() => {
    if (!user) return false
    return (
      name !== (user.name || '') ||
      phone !== (user.phone || '') ||
      role !== (user.role || 'LIP') ||
      firm !== (user.firm || '') ||
      registrationNumber !== (user.registrationNumber || '') ||
      yearsExperience !== user.yearsExperience ||
      bio !== (user.bio || '') ||
      JSON.stringify(specialisms) !== JSON.stringify(user.specialisms || [])
    )
  }, [user, name, phone, role, firm, registrationNumber, yearsExperience, bio, specialisms])

  // Reset form to active user data
  function handleReset() {
    if (!user) return
    setName(user.name || '')
    setPhone(user.phone || '')
    setRole(user.role || 'LIP')
    setFirm(user.firm || '')
    setRegistrationNumber(user.registrationNumber || '')
    setYearsExperience(user.yearsExperience)
    setSpecialisms(user.specialisms || [])
    setBio(user.bio || '')
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!name.trim()) {
      setErrorMessage(t('profile.nameRequired'))
      return
    }

    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const updates: Partial<User> = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      role,
      firm: role !== 'LIP' ? firm.trim() || undefined : undefined,
      registrationNumber: role !== 'LIP' ? registrationNumber.trim() || undefined : undefined,
      yearsExperience: role !== 'LIP' ? yearsExperience : undefined,
      specialisms: role !== 'LIP' ? specialisms : undefined,
      bio: bio.trim() || undefined,
    }

    const res = await updateProfile(updates)
    setIsSaving(false)

    if (res.success) {
      setSuccessMessage(t('profile.successAlert'))
    } else {
      setErrorMessage(res.error || t('profile.errorAlert'))
    }
  }

  const homeRoute = user?.role === 'LIP' ? '/dashboard' : '/professional-dashboard'

  if (!user) {
    return (
      <Container className="py-4">
        <Alert variant="warning">{t('profile.signInRequired')}</Alert>
      </Container>
    )
  }

  return (
    <Container className="py-3 py-md-4" style={{ maxWidth: 1040 }}>
      {/* Navigation Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <Button
          variant="link"
          className="text-decoration-none p-0 text-muted d-inline-flex align-items-center gap-1.5 fw-medium"
          onClick={() => navigate(homeRoute)}
        >
          <FaArrowLeft size={13} />
          <span>{t('profile.backToDashboard')}</span>
        </Button>
        <span className="badge bg-light text-muted border px-2.5 py-1.5 fs-8">
          {t('profile.badgeTitle')}
        </span>
      </div>

      {/* Hero Banner */}
      <ProfileHero user={{ ...user, name: safeName, role }} safeName={safeName} userInitials={userInitials} />

      {/* Feedback Alerts */}
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)} className="mb-4 shadow-sm border-0">
          <strong>{t('common.verified')}:</strong> {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="danger" dismissible onClose={() => setErrorMessage(null)} className="mb-4 shadow-sm border-0">
          <strong>{t('common.error')}:</strong> {errorMessage}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          {/* Left Column: Personal Identity & Contact */}
          <Col xs={12} lg={6}>
            <Card className="premium-card p-3 p-md-4 mb-4 border h-100">
              <h2 className="h5 fw-bold text-dark mb-1">{t('profile.personalInfoTitle')}</h2>
              <p className="text-muted small mb-3">
                {t('profile.personalInfoDesc')}
              </p>

              <Form.Group className="mb-3" controlId="profile-name">
                <Form.Label className="fw-semibold small text-dark d-flex align-items-center gap-1.5">
                  <FaUser className="text-primary" size={13} />
                  <span>{t('profile.fullName')}</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder={t('profile.fullNamePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="py-2"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="profile-email">
                <Form.Label className="fw-semibold small text-dark d-flex align-items-center justify-content-between">
                  <span className="d-flex align-items-center gap-1.5">
                    <FaEnvelope className="text-primary" size={13} />
                    <span>{t('profile.email')}</span>
                  </span>
                  <span className="badge bg-light text-muted border fs-8">
                    <FaLock size={9} className="me-1" />
                    {t('profile.authLoginBadge')}
                  </span>
                </Form.Label>
                <Form.Control type="email" disabled value={user.email} className="py-2 bg-light text-muted" />
              </Form.Group>

              <Form.Group className="mb-3" controlId="profile-phone">
                <Form.Label className="fw-semibold small text-dark d-flex align-items-center gap-1.5">
                  <FaPhone className="text-primary" size={13} />
                  <span>{t('profile.phone')}</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  placeholder={t('profile.phonePlaceholder')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="py-2"
                />
                <Form.Text className="text-muted small">
                  {t('profile.phoneHelp')}
                </Form.Text>
              </Form.Group>

              {role === 'LIP' && (
                <Form.Group className="mt-3" controlId="profile-lip-bio">
                  <Form.Label className="fw-semibold small text-dark mb-1">
                    {t('profile.bio')}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder={t('profile.bioPlaceholder')}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>
              )}
            </Card>
          </Col>

          {/* Right Column: Role Capacity & Professional Fields */}
          <Col xs={12} lg={6}>
            {/* Role Selection */}
            <RoleSelectorCard selectedRole={role} onChange={(newRole) => setRole(newRole)} />

            {/* If Professional role, display practice credentials form */}
            {role !== 'LIP' ? (
              <ProfessionalCredentialsForm
                role={role}
                data={{ firm, registrationNumber, yearsExperience, specialisms, bio }}
                onChange={(updates) => {
                  if (updates.firm !== undefined) setFirm(updates.firm)
                  if (updates.registrationNumber !== undefined) setRegistrationNumber(updates.registrationNumber)
                  if (updates.yearsExperience !== undefined) setYearsExperience(updates.yearsExperience)
                  if (updates.specialisms !== undefined) setSpecialisms(updates.specialisms)
                  if (updates.bio !== undefined) setBio(updates.bio)
                }}
              />
            ) : (
              <Card className="premium-card p-3 p-md-4 mb-4 border bg-light bg-opacity-50">
                <div className="d-flex align-items-start gap-2.5">
                  <div
                    className="p-2 rounded-2"
                    style={{ backgroundColor: 'var(--mcb-primary-soft)', color: 'var(--mcb-primary)' }}
                  >
                    <FaHeart size={18} />
                  </div>
                  <div>
                    <h3 className="h6 fw-bold text-dark mb-1">{t('caseTabs.legalHubMckenzie')}</h3>
                    <p className="text-muted small mb-2">
                      Under English Family Law and the <em>McKenzie v McKenzie</em> (1970) precedent, you have the right to have a McKenzie Friend accompany you to court hearings to take notes, organize files, and offer quiet support.
                    </p>
                    <p className="text-muted small mb-0">
                      You can explore the Peer Directory or generate invite links inside any case to securely add counsel or McKenzie Friends.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* FPR Confidentiality Notice */}
            <Card className="premium-card p-3 p-md-4 border">
              <div className="d-flex align-items-start gap-2.5">
                <FaShieldAlt className="text-success mt-1 flex-shrink-0" size={18} />
                <div>
                  <h3 className="h6 fw-bold text-dark mb-1">UK Family Court Confidentiality (FPR 12.73)</h3>
                  <p className="text-muted small mb-0">
                    All case details and profile interactions are encrypted and safeguarded. Communications regarding family proceedings remain private and protected under statutory confidentiality rules.
                  </p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Floating / Sticky Save Action Bar */}
        <div
          className="sticky-bottom mt-4 p-3 rounded-4 shadow-lg border bg-white d-flex align-items-center justify-content-between flex-wrap gap-2"
          style={{ zIndex: 1020, bottom: 20 }}
        >
          <div className="d-flex align-items-center gap-2">
            {isDirty ? (
              <span className="badge bg-warning text-dark px-2.5 py-1.5 d-inline-flex align-items-center gap-1.5 fs-7">
                <FaExclamationTriangle size={12} />
                <span>Unsaved modifications</span>
              </span>
            ) : (
              <span className="text-muted small">All changes saved and synchronized.</span>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button
              type="button"
              variant="outline-secondary"
              onClick={handleReset}
              disabled={!isDirty || isSaving}
              className="d-inline-flex align-items-center gap-1.5 px-3 py-2 btn-soft"
            >
              <FaUndo size={12} />
              <span>{t('profile.resetChanges')}</span>
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!isDirty || isSaving}
              className="d-inline-flex align-items-center gap-1.5 px-4 py-2 fw-semibold btn-obsidian"
            >
              {isSaving ? (
                <>
                  <Spinner size="sm" animation="border" />
                  <span>{t('profile.saving')}</span>
                </>
              ) : (
                <>
                  <FaSave size={13} />
                  <span>{t('profile.saveProfile')}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Form>
    </Container>
  )
}
