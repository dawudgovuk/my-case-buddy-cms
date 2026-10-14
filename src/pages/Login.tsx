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
  FaUserTag,
  FaShieldAlt,
} from 'react-icons/fa'
import { useTranslation } from '../hooks/useTranslation'
import type { UserRole } from '../types/domain'
import RoleRegistrationLinks from '../components/auth/RoleRegistrationLinks'
import RegistrationPendingCard from '../components/auth/RegistrationPendingCard'

type ActiveTab = 'auth' | 'demo'

export default function Login() {
  const navigate = useNavigate()
  const {
    user,
    users,
    login,
    loginWithNeon,
    registerWithNeon,
    ensureDemoUsers,
    verifyUserById,
  } = useAuthStore()
  const { t } = useTranslation()

  // Primary tab: Better Auth vs Demo Personas
  const [activeTab, setActiveTab] = useState<ActiveTab>('auth')

  // Better Auth mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('LIP')
  const [firm, setFirm] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Demo personas state
  const [demoUserId, setDemoUserId] = useState('')

  // Email verification pending state
  const [registeredPendingVerification, setRegisteredPendingVerification] = useState<{
    email: string
    token: string
    name: string
    role: UserRole
  } | null>(null)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    ensureDemoUsers()
  }, [ensureDemoUsers])

  useEffect(() => {
    if (user && !registeredPendingVerification) {
      navigate(user.role === 'LIP' ? '/cases' : '/professional-dashboard', { replace: true })
    }
  }, [user, navigate, registeredPendingVerification])

  // Partition users for demo personas tab
  const { verifiedPros, lips, unverifiedPros } = useMemo(() => {
    const verifiedPros = users.filter((u) => u.role !== 'LIP' && Boolean(u.isVerified))
    const lips = users.filter((u) => u.role === 'LIP')
    const unverifiedPros = users.filter((u) => u.role !== 'LIP' && !u.isVerified)
    return { verifiedPros, lips, unverifiedPros }
  }, [users])

  const selectedDemoUser = useMemo(() => users.find((u) => u.id === demoUserId), [users, demoUserId])

  // Neon Managed Better Auth submit
  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      if (authMode === 'signin') {
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

        if (!result.success || !result.user) {
          setError(result.error || 'Registration failed. Please try a different email.')
          setLoading(false)
          return
        }

        const isProfessional = selectedRole !== 'LIP'
        if (isProfessional && result.user.verificationToken) {
          setRegisteredPendingVerification({
            email: result.user.email,
            token: result.user.verificationToken,
            name: result.user.name,
            role: selectedRole,
          })
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

  // Demo Persona 1-click submit
  function handleDemoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!demoUserId) return
    const targetUser = users.find((u) => u.id === demoUserId)
    login(demoUserId)
    navigate(targetUser?.role === 'LIP' ? '/cases' : '/professional-dashboard', { replace: true })
  }

  if (registeredPendingVerification) {
    return (
      <RegistrationPendingCard
        name={registeredPendingVerification.name}
        email={registeredPendingVerification.email}
        token={registeredPendingVerification.token}
        role={registeredPendingVerification.role}
        onVerifyNow={(token) => navigate(`/verify-email/${token}`)}
        onReturnToLogin={() => {
          setRegisteredPendingVerification(null)
          setAuthMode('signin')
        }}
      />
    )
  }

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-4 py-md-5">
      <Card
        className="shadow-lg border-0 overflow-hidden"
        style={{ maxWidth: '540px', width: '100%', borderRadius: '16px' }}
      >
        {/* Header */}
        <Card.Header className="text-center py-4 bg-white border-bottom position-relative">
          <h1 className="h4 fw-bold mb-1 text-dark">{t('common.appName')}</h1>
          <p className="text-muted small mb-0">
            {activeTab === 'auth'
              ? authMode === 'signin'
                ? t('auth.signInTitle')
                : 'Create an account to manage your cases and peer support'
              : 'Development Sandbox: Switch between pre-configured personas'}
          </p>

          {/* Primary Tabs: Better Auth vs Demo Personas */}
          <Nav variant="pills" className="justify-content-center mt-3 gap-2">
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'auth'}
                onClick={() => {
                  setActiveTab('auth')
                  setError(null)
                  setSuccessMsg(null)
                }}
                className={`d-flex align-items-center gap-1.5 py-1.5 px-3 rounded-pill fw-semibold small ${
                  activeTab === 'auth' ? 'bg-primary text-white shadow-xs' : 'bg-light text-secondary border'
                }`}
              >
                <FaLock size={12} />
                <span>Better Auth</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === 'demo'}
                onClick={() => {
                  setActiveTab('demo')
                  setError(null)
                  setSuccessMsg(null)
                }}
                className={`d-flex align-items-center gap-1.5 py-1.5 px-3 rounded-pill fw-semibold small ${
                  activeTab === 'demo' ? 'bg-primary text-white shadow-xs' : 'bg-light text-secondary border'
                }`}
              >
                <FaUserTag size={12} />
                <span>Demo Personas</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>

        <Card.Body className="p-4">
          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError(null)}
              className="py-2 px-3 small rounded-3 mb-3"
            >
              {error}
            </Alert>
          )}

          {successMsg && (
            <Alert
              variant="success"
              dismissible
              onClose={() => setSuccessMsg(null)}
              className="py-2 px-3 small rounded-3 mb-3"
            >
              {successMsg}
            </Alert>
          )}

          {/* TAB 1: Better Auth (Sign In / Create Account) */}
          {activeTab === 'auth' && (
            <>
              {/* Sub-toggle: Sign In vs Create Account */}
              <div className="d-flex justify-content-center mb-4">
                <Nav variant="pills" className="bg-light p-1 rounded-pill border" style={{ width: '100%', maxWidth: '320px' }}>
                  <Nav.Item className="flex-fill text-center">
                    <Nav.Link
                      active={authMode === 'signin'}
                      onClick={() => {
                        setAuthMode('signin')
                        setError(null)
                        setSuccessMsg(null)
                      }}
                      className={`rounded-pill py-1.5 fw-semibold ${
                        authMode === 'signin' ? 'bg-white text-primary shadow-xs' : 'text-secondary'
                      }`}
                      style={{ fontSize: '0.8125rem' }}
                    >
                      <FaSignInAlt className="me-1" />
                      <span>{t('common.signIn')}</span>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="flex-fill text-center">
                    <Nav.Link
                      active={authMode === 'signup'}
                      onClick={() => {
                        setAuthMode('signup')
                        setError(null)
                        setSuccessMsg(null)
                      }}
                      className={`rounded-pill py-1.5 fw-semibold ${
                        authMode === 'signup' ? 'bg-white text-primary shadow-xs' : 'text-secondary'
                      }`}
                      style={{ fontSize: '0.8125rem' }}
                    >
                      <FaUserPlus className="me-1" />
                      <span>Create Account</span>
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </div>

              <Form onSubmit={handleAuthSubmit}>
                {/* Full Name (Sign Up only) */}
                {authMode === 'signup' && (
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small text-secondary">Full Name</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted">
                        <FaUser size={14} />
                      </span>
                      <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        required
                        size="lg"
                        disabled={loading}
                      />
                    </div>
                  </Form.Group>
                )}

                {/* Email Address */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">Email Address</Form.Label>
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
                      size="lg"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Label className="fw-semibold small text-secondary">Password</Form.Label>
                    {authMode === 'signup' && (
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
                      size="lg"
                      disabled={loading}
                      autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
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
                {authMode === 'signup' && (
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
                          <Form.Label className="fw-semibold small text-secondary">
                            {t('auth.registrationNumberLabel')}
                          </Form.Label>
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
                      <span>{authMode === 'signin' ? 'Signing in...' : 'Creating Account...'}</span>
                    </>
                  ) : (
                    <>
                      {authMode === 'signin' ? <FaSignInAlt /> : <FaUserPlus />}
                      <span>{authMode === 'signin' ? t('common.signIn') : 'Create Account'}</span>
                    </>
                  )}
                </Button>
              </Form>

              {/* Mode Switch Prompt */}
              <div className="text-center mb-2">
                <span className="text-muted small">
                  {authMode === 'signin' ? "Don't have an account? " : 'Already registered? '}
                </span>
                <Button
                  variant="link"
                  className="p-0 small fw-bold text-decoration-none"
                  onClick={() => {
                    setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
                    setError(null)
                    setSuccessMsg(null)
                  }}
                >
                  {authMode === 'signin' ? 'Create an account' : 'Sign in'}
                </Button>
              </div>
            </>
          )}

          {/* TAB 2: Demo Personas (Development Purpose) */}
          {activeTab === 'demo' && (
            <Form onSubmit={handleDemoSubmit}>
              <div className="p-3 bg-light rounded-3 border mb-3">
                <div className="d-flex align-items-center gap-2 text-primary small fw-semibold mb-2">
                  <FaShieldAlt size={14} />
                  <span>Quick Persona Switcher</span>
                </div>
                <p className="text-muted small mb-3" style={{ fontSize: '0.8rem' }}>
                  Pick any pre-configured persona below to simulate their exact access rights and perspective.
                </p>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-secondary">{t('auth.chooseUser')}</Form.Label>
                  <Form.Select
                    value={demoUserId}
                    onChange={(e) => setDemoUserId(e.target.value)}
                    required
                    size="lg"
                    className="mb-2"
                  >
                    <option value="">{t('auth.selectUserPrompt')}</option>
                    {verifiedPros.length > 0 && (
                      <optgroup label={`✓ ${t('auth.verifiedProfessionalsGroup')} (${verifiedPros.length})`}>
                        {verifiedPros.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} — {u.role} [✓ {t('common.verified')}]
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {lips.length > 0 && (
                      <optgroup label={`${t('auth.lipsGroup')} (${lips.length})`}>
                        {lips.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} — LIP
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {unverifiedPros.length > 0 && (
                      <optgroup label={`⚠️ ${t('auth.unverifiedProfessionalsGroup')} (${unverifiedPros.length})`}>
                        {unverifiedPros.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} — {u.role} [⚠️ {t('common.unverified')}]
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </Form.Select>

                  {/* Instant Verification Banner if unverified pro selected */}
                  {selectedDemoUser && !selectedDemoUser.isVerified && selectedDemoUser.role !== 'LIP' && (
                    <div className="alert alert-warning py-2 px-3 small d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-2 rounded-3 border-warning-subtle">
                      <span>⚠️ {t('auth.accountUnverifiedAlert')}</span>
                      <Button
                        variant="warning"
                        size="sm"
                        className="fw-bold py-1 px-2 text-dark shadow-xs flex-shrink-0"
                        onClick={() => verifyUserById(selectedDemoUser.id)}
                      >
                        <FaCheckCircle className="me-1" />
                        {t('auth.verifySelectedBtn')}
                      </Button>
                    </div>
                  )}
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 d-flex align-items-center justify-content-center gap-2 shadow-xs fw-semibold"
                  disabled={!demoUserId}
                >
                  <FaSignInAlt />
                  <span>Sign In as Demo Persona</span>
                </Button>
              </div>
            </Form>
          )}

          <hr className="my-3" />

          {/* Reusable Role Registration Shortcuts */}
          <RoleRegistrationLinks onSelectRole={(role) => navigate(`/register/${role}`)} />
        </Card.Body>
      </Card>
    </Container>
  )
}
