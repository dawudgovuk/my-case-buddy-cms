import { Container, Card, Form, Button, Alert, Nav, Spinner } from 'react-bootstrap'
import { useEffect, useState, useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import {
  FaSignInAlt,
  FaUserPlus,
  FaLock,
  FaEnvelope,
  FaUser,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaBolt,
  FaShieldAlt,
} from 'react-icons/fa'
import { useTranslation } from '../hooks/useTranslation'
import type { UserRole } from '../types/domain'
import RoleRegistrationLinks from '../components/auth/RoleRegistrationLinks'

export default function Login() {
  const navigate = useNavigate()
  const { user, users, login, loginWithNeon, registerWithNeon, ensureDemoUsers, verifyUserById } = useAuthStore()
  const { t } = useTranslation()

  // Form mode: 'signin' | 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('LIP')
  const [firm, setFirm] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Dev switcher state
  const [showDevSwitcher, setShowDevSwitcher] = useState(false)
  const [devUserId, setDevUserId] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    ensureDemoUsers()
  }, [ensureDemoUsers])

  useEffect(() => {
    if (user) {
      navigate(user.role === 'LIP' ? '/cases' : '/professional-dashboard', { replace: true })
    }
  }, [user, navigate])

  // Partition users for dev switcher
  const { verifiedPros, lips, unverifiedPros } = useMemo(() => {
    const verifiedPros = users.filter((u) => u.role !== 'LIP' && Boolean(u.isVerified))
    const lips = users.filter((u) => u.role === 'LIP')
    const unverifiedPros = users.filter((u) => u.role !== 'LIP' && !u.isVerified)
    return { verifiedPros, lips, unverifiedPros }
  }, [users])

  const selectedDevUser = useMemo(() => users.find((u) => u.id === devUserId), [users, devUserId])

  // Neon Managed Better Auth submit
  async function handleNeonSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (mode === 'signin') {
        const result = await loginWithNeon(email, password)
        if (!result.success) {
          setError(result.error || 'Authentication failed. Please check your credentials.')
          setLoading(false)
          return
        }

        setSuccessMsg('Signed in successfully!')
        const authedUser = result.user
        navigate(authedUser?.role === 'LIP' ? '/cases' : '/professional-dashboard', { replace: true })
      } else {
        if (!name.trim()) {
          setError('Please enter your full name')
          setLoading(false)
          return
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters')
          setLoading(false)
          return
        }

        const result = await registerWithNeon({
          name: name.trim(),
          email: email.trim(),
          password,
          role: selectedRole,
          firm: firm.trim() || undefined,
          registrationNumber: registrationNumber.trim() || undefined,
        })

        if (!result.success) {
          setError(result.error || 'Registration failed. Please try a different email.')
          setLoading(false)
          return
        }

        setSuccessMsg('Account created successfully!')
        const authedUser = result.user
        navigate(authedUser?.role === 'LIP' ? '/cases' : '/professional-dashboard', { replace: true })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Fast Dev Switcher submit
  function handleDevSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!devUserId) return
    const targetUser = users.find((u) => u.id === devUserId)
    login(devUserId)
    navigate(targetUser?.role === 'LIP' ? '/cases' : '/professional-dashboard', { replace: true })
  }

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-4 py-md-5">
      <Card className="shadow-lg border-0 overflow-hidden" style={{ maxWidth: '540px', width: '100%', borderRadius: '16px' }}>
        {/* Header */}
        <Card.Header className="text-center py-4 bg-white border-bottom position-relative">
          <h1 className="h4 fw-bold mb-1 text-dark">{t('common.appName')}</h1>
          <p className="text-muted small mb-0">
            {mode === 'signin' ? t('auth.signInTitle') : 'Create an account to manage your cases and peer support'}
          </p>

          {/* Mode Switcher Tabs */}
          <Nav variant="pills" className="nav-fill mt-3 bg-light p-1 rounded-pill border">
            <Nav.Item>
              <Nav.Link
                active={mode === 'signin'}
                onClick={() => {
                  setMode('signin')
                  setError(null)
                }}
                className={`rounded-pill py-2 fw-semibold ${mode === 'signin' ? 'bg-primary text-white shadow-xs' : 'text-secondary'}`}
                style={{ fontSize: '0.875rem' }}
              >
                <FaSignInAlt className="me-1" />
                <span>{t('common.signIn')}</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={mode === 'signup'}
                onClick={() => {
                  setMode('signup')
                  setError(null)
                }}
                className={`rounded-pill py-2 fw-semibold ${mode === 'signup' ? 'bg-primary text-white shadow-xs' : 'text-secondary'}`}
                style={{ fontSize: '0.875rem' }}
              >
                <FaUserPlus className="me-1" />
                <span>Create Account</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>

        <Card.Body className="p-4">
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} className="py-2 px-3 small rounded-3">
              {error}
            </Alert>
          )}

          {successMsg && (
            <Alert variant="success" className="py-2 px-3 small rounded-3">
              {successMsg}
            </Alert>
          )}

          <Form onSubmit={handleNeonSubmit}>
            {/* Full Name for Sign Up */}
            {mode === 'signup' && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">{t('auth.fullNameLabel')}</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-white text-muted">
                    <FaUser size={14} />
                  </span>
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rachel Adams"
                    required
                    disabled={loading}
                  />
                </div>
              </Form.Group>
            )}

            {/* Email Field */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small text-secondary">{t('auth.emailLabel')}</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-white text-muted">
                  <FaEnvelope size={14} />
                </span>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </Form.Group>

            {/* Password Field */}
            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label className="fw-semibold small text-secondary">Password</Form.Label>
                {mode === 'signup' && (
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Min 8 characters
                  </small>
                )}
              </div>
              <div className="input-group">
                <span className="input-group-text bg-white text-muted">
                  <FaLock size={14} />
                </span>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
                <Button
                  variant="outline-secondary"
                  className="border-start-0 bg-white text-muted"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </Button>
              </div>
            </Form.Group>

            {/* Additional Fields for Sign Up */}
            {mode === 'signup' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">Family Court Role</Form.Label>
                  <Form.Select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    disabled={loading}
                  >
                    <option value="LIP">Litigant in Person (LIP)</option>
                    <option value="McKenzieFriend">McKenzie Friend</option>
                    <option value="Solicitor">Solicitor</option>
                    <option value="Barrister">Barrister</option>
                  </Form.Select>
                </Form.Group>

                {(selectedRole === 'Solicitor' || selectedRole === 'Barrister') && (
                  <div className="p-3 bg-light rounded-3 mb-3 border">
                    <Form.Group className="mb-2">
                      <Form.Label className="fw-semibold small text-secondary">
                        {selectedRole === 'Solicitor' ? t('auth.firmLabel') : t('auth.chambersLabel')}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={firm}
                        onChange={(e) => setFirm(e.target.value)}
                        placeholder={selectedRole === 'Solicitor' ? 'Jenkins & Co' : 'Doughty Street Chambers'}
                        disabled={loading}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label className="fw-semibold small text-secondary">{t('auth.registrationNumberLabel')}</Form.Label>
                      <Form.Control
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="e.g. SRA-12345 or BSB-67890"
                        disabled={loading}
                      />
                    </Form.Group>
                  </div>
                )}
              </>
            )}

            {/* Primary Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-100 mb-3 d-flex align-items-center justify-content-center gap-2 shadow-xs fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" />
                  <span>{mode === 'signin' ? 'Signing in...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  {mode === 'signin' ? <FaSignInAlt /> : <FaUserPlus />}
                  <span>{mode === 'signin' ? t('common.signIn') : 'Create Account'}</span>
                </>
              )}
            </Button>
          </Form>

          {/* Mode Switch Prompt */}
          <div className="text-center mb-3">
            <span className="text-muted small">
              {mode === 'signin' ? "Don't have an account? " : 'Already registered? '}
            </span>
            <Button
              variant="link"
              className="p-0 small fw-bold text-decoration-none"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin')
                setError(null)
              }}
            >
              {mode === 'signin' ? 'Create an account' : 'Sign in'}
            </Button>
          </div>

          <hr className="my-3" />

          {/* Collapsible Fast Dev Switcher */}
          <div className="text-center">
            <Button
              variant="outline-light"
              size="sm"
              className="text-secondary border-0 small py-1 px-2 d-inline-flex align-items-center gap-1"
              onClick={() => setShowDevSwitcher(!showDevSwitcher)}
            >
              <FaBolt className="text-warning" size={12} />
              <span>{showDevSwitcher ? 'Hide Quick Dev Switcher' : 'Quick Dev Switcher (Demo Personas)'}</span>
            </Button>
          </div>

          {showDevSwitcher && (
            <div className="mt-3 p-3 bg-light rounded-3 border">
              <div className="d-flex align-items-center gap-1 text-muted small fw-semibold mb-2">
                <FaShieldAlt size={12} />
                <span>Instant Demo Persona Switcher</span>
              </div>

              <Form onSubmit={handleDevSubmit}>
                <Form.Select
                  value={devUserId}
                  onChange={(e) => setDevUserId(e.target.value)}
                  size="sm"
                  className="mb-2"
                >
                  <option value="">{t('auth.selectUserPrompt')}</option>
                  {verifiedPros.length > 0 && (
                    <optgroup label={`✓ Verified Legal Professionals (${verifiedPros.length})`}>
                      {verifiedPros.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.role}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {lips.length > 0 && (
                    <optgroup label={`Litigants in Person (${lips.length})`}>
                      {lips.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} — LIP
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {unverifiedPros.length > 0 && (
                    <optgroup label={`⚠️ Unverified Professionals (${unverifiedPros.length})`}>
                      {unverifiedPros.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.role} (Unverified)
                        </option>
                      ))}
                    </optgroup>
                  )}
                </Form.Select>

                {selectedDevUser && !selectedDevUser.isVerified && selectedDevUser.role !== 'LIP' && (
                  <div className="alert alert-warning py-1 px-2 small d-flex justify-content-between align-items-center mb-2">
                    <span>Account unverified</span>
                    <Button
                      variant="warning"
                      size="sm"
                      className="py-0 px-2 small text-dark"
                      onClick={() => verifyUserById(selectedDevUser.id)}
                    >
                      <FaCheckCircle className="me-1" size={10} /> Verify
                    </Button>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="outline-dark"
                  size="sm"
                  className="w-100"
                  disabled={!devUserId}
                >
                  Switch to Demo User
                </Button>
              </Form>
            </div>
          )}

          {/* Reusable Role Registration Shortcuts */}
          <div className="mt-3">
            <RoleRegistrationLinks onSelectRole={(role) => navigate(`/register/${role}`)} />
          </div>
        </Card.Body>
      </Card>
    </Container>
  )
}
