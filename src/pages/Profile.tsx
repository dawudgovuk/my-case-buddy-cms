import React, { useState, useEffect, useMemo } from 'react'
import { Container, Card, Form, Button, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap'
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
  FaCheckCircle,
  FaExternalLinkAlt,
  FaCopy,
  FaSignOutAlt,
  FaBalanceScale,
  FaCompass,
  FaHandshake,
  FaKey,
} from 'react-icons/fa'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'
import { useTranslation } from '../hooks/useTranslation'
import { ProfileHero } from '../components/profile/ProfileHero'
import { RoleSelectorCard } from '../components/profile/RoleSelectorCard'
import { ProfessionalCredentialsForm } from '../components/profile/ProfessionalCredentialsForm'
import type { User, UserRole } from '../types/domain'

type ProfileTab = 'personal' | 'role' | 'security'

export default function Profile() {
  const navigate = useNavigate()
  const { user, updateProfile, logout } = useAuthStore()
  const { t } = useTranslation()

  // Active sub-navigation tab
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal')

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
  const [copiedId, setCopiedId] = useState(false)

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
    toast.info('Form reverted to saved profile values.', 'Reverted')
  }

  function handleCopyAccountId() {
    if (!user?.id) return
    navigator.clipboard.writeText(user.id)
    setCopiedId(true)
    toast.info('Account ID copied to clipboard.', 'Copied')
    setTimeout(() => setCopiedId(false), 2500)
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!user) return
    if (!name.trim()) {
      setErrorMessage(t('profile.nameRequired'))
      setActiveTab('personal')
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
      <Container className="py-5">
        <Alert variant="warning" className="text-center shadow-xs">
          {t('profile.signInRequired')}
        </Alert>
      </Container>
    )
  }

  return (
    <div className="profile-page py-3 mx-auto" style={{ maxWidth: 1040 }}>
      {/* Top Header & Breadcrumb Bar */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <Button
          variant="link"
          className="text-decoration-none p-0 text-muted d-inline-flex align-items-center gap-1.5 fw-medium"
          onClick={() => navigate(homeRoute)}
        >
          <FaArrowLeft size={13} />
          <span>{t('profile.backToDashboard')}</span>
        </Button>

        <div className="d-flex align-items-center gap-2">
          {isDirty && (
            <div className="d-none d-md-flex align-items-center gap-2 me-1">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                className="d-inline-flex align-items-center gap-1 px-2.5 py-1"
                style={{ fontSize: '0.8125rem' }}
              >
                <FaUndo size={10} />
                <span>{t('profile.resetChanges')}</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSubmit()}
                disabled={isSaving}
                className="d-inline-flex align-items-center gap-1 px-3 py-1 shadow-xs fw-semibold"
                style={{ fontSize: '0.8125rem' }}
              >
                {isSaving ? <Spinner size="sm" animation="border" /> : <FaSave size={11} />}
                <span>{t('profile.saveProfile')}</span>
              </Button>
            </div>
          )}

          <span className="badge bg-light text-muted border px-2.5 py-1.5 fs-8 d-inline-flex align-items-center gap-1">
            <FaShieldAlt size={10} className="text-primary" />
            <span>{t('profile.badgeTitle')}</span>
          </span>
        </div>
      </div>

      {/* Redesigned Profile Hero Banner */}
      <ProfileHero user={{ ...user, name: safeName, role }} safeName={safeName} userInitials={userInitials} />

      {/* Alerts */}
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
          className="mb-4 shadow-xs border-0 d-flex align-items-center gap-2"
        >
          <FaCheckCircle className="text-success flex-shrink-0" size={16} />
          <div>{successMessage}</div>
        </Alert>
      )}
      {errorMessage && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setErrorMessage(null)}
          className="mb-4 shadow-xs border-0 d-flex align-items-center gap-2"
        >
          <FaExclamationTriangle className="text-danger flex-shrink-0" size={16} />
          <div>{errorMessage}</div>
        </Alert>
      )}

      {/* Segmented Tab Navigation */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="profile-nav-pills shadow-xs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'personal'}
            onClick={() => setActiveTab('personal')}
            className={`nav-link ${activeTab === 'personal' ? 'active' : ''}`}
          >
            <FaUser size={13} />
            <span>{t('profile.personalInfoTitle')}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'role'}
            onClick={() => setActiveTab('role')}
            className={`nav-link ${activeTab === 'role' ? 'active' : ''}`}
          >
            <FaBalanceScale size={13} />
            <span>{t('profile.roleTitle')}</span>
            {role !== 'LIP' && (
              <Badge bg="primary" className="ms-1 px-1.5 py-0.5 rounded-pill" style={{ fontSize: '0.68rem' }}>
                Pro
              </Badge>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'security'}
            onClick={() => setActiveTab('security')}
            className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
          >
            <FaShieldAlt size={13} />
            <span>Security & Compliance</span>
          </button>
        </div>

        {isDirty && (
          <span className="badge bg-warning text-dark px-2.5 py-1.5 d-inline-flex align-items-center gap-1.5 fs-8">
            <FaExclamationTriangle size={11} />
            <span>Unsaved modifications</span>
          </span>
        )}
      </div>

      <Form onSubmit={handleSubmit}>
        {/* Tab 1: Personal Details & Contact */}
        {activeTab === 'personal' && (
          <Card className="premium-card p-3 p-md-4 mb-4 border shadow-sm">
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <h2 className="h5 fw-bold text-dark d-flex align-items-center gap-2 mb-1">
                  <FaUser className="text-primary" size={16} />
                  <span>{t('profile.personalInfoTitle')}</span>
                </h2>
                <p className="text-muted small mb-0">
                  {t('profile.personalInfoDesc')}
                </p>
              </div>
            </div>

            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Group controlId="profile-name">
                  <Form.Label className="fw-semibold small text-dark d-flex align-items-center gap-1.5 mb-1.5">
                    <FaUser className="text-primary" size={13} />
                    <span>{t('profile.fullName')}</span>
                    <span className="text-danger">*</span>
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
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="profile-email">
                  <Form.Label className="fw-semibold small text-dark d-flex align-items-center justify-content-between mb-1.5">
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
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="profile-phone">
                  <Form.Label className="fw-semibold small text-dark d-flex align-items-center gap-1.5 mb-1.5">
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
              </Col>

              <Col xs={12} md={6}>
                <div className="p-3 rounded-3 bg-light border h-100 d-flex flex-column justify-content-center">
                  <div className="d-flex align-items-center gap-2 mb-1 text-dark fw-semibold small">
                    <FaShieldAlt className="text-success" size={14} />
                    <span>Contact Privacy under FPR 12.73</span>
                  </div>
                  <p className="text-muted small mb-0" style={{ fontSize: '0.8125rem' }}>
                    Phone and email details are never published publicly. They are exclusively used for critical court reminders and verified case team access.
                  </p>
                </div>
              </Col>

              {role === 'LIP' && (
                <Col xs={12}>
                  <Form.Group controlId="profile-lip-bio">
                    <Form.Label className="fw-semibold small text-dark d-flex align-items-center justify-content-between mb-1.5">
                      <span>{t('profile.bio')}</span>
                      <span className="badge bg-light text-muted border">{bio.length} characters</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder={t('profile.bioPlaceholder')}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="py-2"
                    />
                    <Form.Text className="text-muted small">
                      Optional context regarding your family court journey, which can assist lay supporters or McKenzie Friends assisting you.
                    </Form.Text>
                  </Form.Group>
                </Col>
              )}
            </Row>

            {/* In-Card Action Footer */}
            <div className="d-flex align-items-center justify-content-between mt-4 pt-3 border-top flex-wrap gap-2">
              <span className="text-muted small">
                {isDirty ? 'You have unsaved changes.' : 'Personal details are up to date.'}
              </span>
              <div className="d-flex align-items-center gap-2">
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleReset}
                  disabled={!isDirty || isSaving}
                  className="px-3 py-1.5"
                >
                  <FaUndo size={11} className="me-1" />
                  <span>{t('profile.resetChanges')}</span>
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!isDirty || isSaving}
                  className="px-4 py-1.5 shadow-xs fw-semibold"
                >
                  {isSaving ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-1" />
                      <span>{t('profile.saving')}</span>
                    </>
                  ) : (
                    <>
                      <FaSave size={12} className="me-1" />
                      <span>{t('profile.saveProfile')}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 2: Role & Practice Credentials */}
        {activeTab === 'role' && (
          <div>
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
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="p-2.5 rounded-3 flex-shrink-0"
                    style={{ backgroundColor: 'var(--mcb-primary-soft)', color: 'var(--mcb-primary)' }}
                  >
                    <FaHeart size={20} />
                  </div>
                  <div>
                    <h3 className="h6 fw-bold text-dark mb-1 d-flex align-items-center gap-1.5">
                      <span>{t('caseTabs.legalHubMckenzie')}</span>
                      <Badge bg="info" className="px-2 py-0.5 rounded-pill text-white" style={{ fontSize: '0.7rem' }}>
                        Lay Support
                      </Badge>
                    </h3>
                    <p className="text-muted small mb-2" style={{ lineHeight: '1.5' }}>
                      Under English Family Law and the <em>McKenzie v McKenzie</em> (1970) judgment, you have the statutory right to have a McKenzie Friend accompany you to court hearings. They can take notes, manage paperwork bundles, and offer quiet support without needing to be a qualified solicitor.
                    </p>
                    <p className="text-muted small mb-3" style={{ lineHeight: '1.5' }}>
                      You can explore the Peer Directory to connect with experienced supporters, or generate secure invite links inside any individual case.
                    </p>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/peer-directory')}
                        className="d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill shadow-xs"
                      >
                        <FaHandshake size={12} />
                        <span>Explore Peer Directory</span>
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => navigate('/guidance')}
                        className="d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill"
                      >
                        <FaCompass size={12} />
                        <span>Procedural Roadmaps</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* In-Card Action Footer */}
            <Card className="premium-card p-3 border shadow-sm mb-4">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <span className="text-muted small">
                  {isDirty ? 'Role changes pending save.' : 'Role and credentials saved.'}
                </span>
                <div className="d-flex align-items-center gap-2">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleReset}
                    disabled={!isDirty || isSaving}
                    className="px-3 py-1.5"
                  >
                    <FaUndo size={11} className="me-1" />
                    <span>{t('profile.resetChanges')}</span>
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!isDirty || isSaving}
                    className="px-4 py-1.5 shadow-xs fw-semibold"
                  >
                    {isSaving ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-1" />
                        <span>{t('profile.saving')}</span>
                      </>
                    ) : (
                      <>
                        <FaSave size={12} className="me-1" />
                        <span>{t('profile.saveProfile')}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 3: Security & Statutory Privacy */}
        {activeTab === 'security' && (
          <Row className="g-4 mb-4">
            <Col xs={12} md={7}>
              {/* FPR Confidentiality Card */}
              <Card className="premium-card p-3 p-md-4 border shadow-sm h-100">
                <div className="d-flex align-items-start gap-3 mb-3">
                  <div className="p-2.5 rounded-3 bg-success-soft text-success flex-shrink-0" style={{ backgroundColor: 'var(--mcb-success-soft)' }}>
                    <FaShieldAlt size={22} />
                  </div>
                  <div>
                    <h3 className="h6 fw-bold text-dark mb-1">
                      UK Family Court Confidentiality (FPR 12.73)
                    </h3>
                    <p className="text-muted small mb-0">
                      Statutory protection for family court records, child welfare hearings, and sensitive communication.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-3 bg-light border mb-3">
                  <h4 className="fw-bold text-dark small mb-1">What does FPR 12.73 mean for your case?</h4>
                  <p className="text-muted small mb-2" style={{ fontSize: '0.8125rem', lineHeight: '1.45' }}>
                    Proceedings concerning children and private family matters are heard in private. Under Family Procedure Rule 12.73, all court documents, notes taken by McKenzie Friends, and evidence stored in My Case Buddy are legally privileged and protected from disclosure.
                  </p>
                  <div className="d-flex align-items-center gap-1.5 text-success small fw-semibold">
                    <FaCheckCircle size={12} />
                    <span>Compliance Active: Encrypted at rest & in transit</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <a
                    href="https://www.justice.gov.uk/courts/procedure-rules/family/parts/part_12"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill"
                    style={{ fontSize: '0.8125rem' }}
                  >
                    <span>Read FPR 12.73 Official Rules</span>
                    <FaExternalLinkAlt size={10} className="text-muted" />
                  </a>
                </div>
              </Card>
            </Col>

            <Col xs={12} md={5}>
              {/* Account Credentials & Session */}
              <Card className="premium-card p-3 p-md-4 border shadow-sm h-100 d-flex flex-column">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FaKey className="text-primary" size={16} />
                  <h3 className="h6 fw-bold text-dark mb-0">Identity & Access</h3>
                </div>

                <div className="mb-3">
                  <div className="text-muted small mb-1 fw-semibold">Platform Account ID</div>
                  <div className="d-flex align-items-center gap-2 p-2 bg-light rounded-2 border">
                    <code className="text-dark small text-truncate flex-grow-1">{user.id}</code>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={handleCopyAccountId}
                      className="p-0 text-muted d-inline-flex align-items-center gap-1 text-decoration-none"
                      title="Copy Account ID"
                    >
                      <FaCopy size={12} />
                      <span style={{ fontSize: '0.75rem' }}>{copiedId ? 'Copied' : 'Copy'}</span>
                    </Button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-muted small mb-1 fw-semibold">Email Verification Status</div>
                  <div className="d-flex align-items-center justify-content-between p-2 bg-light rounded-2 border">
                    <span className="small text-dark text-truncate">{user.email}</span>
                    {user.isVerified ? (
                      <Badge bg="success" className="px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1">
                        <FaCheckCircle size={10} />
                        <span>Verified</span>
                      </Badge>
                    ) : (
                      <Badge bg="warning" className="text-dark px-2 py-1 rounded-pill">
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-3 border-top">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      logout()
                      navigate('/login')
                    }}
                    className="w-100 d-inline-flex align-items-center justify-content-center gap-2 py-2"
                  >
                    <FaSignOutAlt size={12} />
                    <span>Sign Out of Current Session</span>
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* Floating Save Action Bar — Positioned safely above the fixed footer */}
        {isDirty && (
          <div className="profile-floating-save" role="region" aria-label="Unsaved profile changes">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning text-dark px-2 py-1 rounded-circle d-inline-flex align-items-center justify-content-center">
                <FaExclamationTriangle size={11} />
              </span>
              <span className="fw-semibold text-dark small">Unsaved profile modifications</span>
            </div>

            <div className="d-flex align-items-center gap-2 ms-auto">
              <Button
                type="button"
                variant="outline-secondary"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                className="px-3 py-1 rounded-pill"
                style={{ fontSize: '0.8125rem' }}
              >
                <FaUndo size={11} className="me-1" />
                <span>{t('profile.resetChanges')}</span>
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSaving}
                className="px-3.5 py-1 rounded-pill shadow-xs fw-semibold"
                style={{ fontSize: '0.8125rem' }}
              >
                {isSaving ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-1" />
                    <span>{t('profile.saving')}</span>
                  </>
                ) : (
                  <>
                    <FaSave size={11} className="me-1" />
                    <span>{t('profile.saveProfile')}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Form>
    </div>
  )
}
