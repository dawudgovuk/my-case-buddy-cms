import { Container, Card, Form, Button, Nav, Alert, Spinner } from 'react-bootstrap'
import { useEffect, useState, useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { FaSignInAlt, FaCheckCircle, FaUserTag, FaServer, FaLock } from 'react-icons/fa'
import { useTranslation } from '../hooks/useTranslation'
import { strapiLogin, checkStrapiHealth } from '../services/strapi'
import RoleRegistrationLinks from '../components/auth/RoleRegistrationLinks'

type LoginMode = 'demo' | 'strapi'

export default function Login() {
  const navigate = useNavigate()
  const { user, users, login, loginWithUser, ensureDemoUsers, verifyUserById } = useAuthStore()
  const { t } = useTranslation()
  const [loginMode, setLoginMode] = useState<LoginMode>('demo')

  // Demo user selection state
  const [userId, setUserId] = useState('')

  // Strapi credentials state
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [strapiOnline, setStrapiOnline] = useState<boolean | null>(null)

  useEffect(() => {
    ensureDemoUsers()
    checkStrapiHealth().then((res) => setStrapiOnline(res.ok)).catch(() => setStrapiOnline(false))
  }, [ensureDemoUsers])

  useEffect(() => {
    if (user) {
      navigate(user.role === 'LIP' ? '/cases' : '/professional-dashboard', { replace: true })
    }
  }, [user, navigate])

  // Partition users into verified professionals, LIPs, and unverified professionals
  const { verifiedPros, lips, unverifiedPros } = useMemo(() => {
    const verifiedPros = users.filter((u) => u.role !== 'LIP' && Boolean(u.isVerified))
    const lips = users.filter((u) => u.role === 'LIP')
    const unverifiedPros = users.filter((u) => u.role !== 'LIP' && !u.isVerified)
    return { verifiedPros, lips, unverifiedPros }
  }, [users])

  const selectedUser = useMemo(() => users.find((u) => u.id === userId), [users, userId])

  function onDemoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    const targetUser = users.find((u) => u.id === userId)
    login(userId)
    navigate(targetUser?.role === 'LIP' ? '/cases' : '/professional-dashboard', { replace: true })
  }

  async function onStrapiSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier.trim() || !password) return

    setIsSubmitting(true)
    setAuthError(null)

    try {
      const { user: strapiUser } = await strapiLogin(identifier.trim(), password)
      loginWithUser(strapiUser)
      navigate(strapiUser.role === 'LIP' ? '/cases' : '/professional-dashboard', { replace: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.'
      setAuthError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleVerifySelected(id: string) {
    verifyUserById(id)
  }

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-5">
      <Card className="shadow-lg border-0" style={{ maxWidth: '580px', width: '100%' }}>
        <Card.Header className="text-center py-4 bg-white border-bottom">
          <h1 className="h3 fw-bold mb-1">{t('common.appName')}</h1>
          <p className="text-muted mb-0">{t('auth.signInTitle')}</p>

          <Nav
            variant="pills"
            className="justify-content-center mt-3 gap-2"
            activeKey={loginMode}
            onSelect={(k) => {
              setLoginMode((k as LoginMode) || 'demo')
              setAuthError(null)
            }}
          >
            <Nav.Item>
              <Nav.Link eventKey="demo" className="d-flex align-items-center gap-1.5 py-1 px-3 small">
                <FaUserTag size={12} />
                <span>Demo Personas</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="strapi" className="d-flex align-items-center gap-1.5 py-1 px-3 small">
                <FaServer size={12} />
                <span>Strapi API Account</span>
                {strapiOnline !== null && (
                  <span
                    className={`rounded-circle ms-1 ${strapiOnline ? 'bg-success' : 'bg-secondary'}`}
                    style={{ width: 6, height: 6, display: 'inline-block' }}
                    title={strapiOnline ? 'Strapi Online' : 'Strapi Offline'}
                  />
                )}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>

        <Card.Body className="p-4">
          {authError && (
            <Alert variant="danger" className="py-2 px-3 small mb-3" dismissible onClose={() => setAuthError(null)}>
              {authError}
            </Alert>
          )}

          {loginMode === 'demo' ? (
            <Form onSubmit={onDemoSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">{t('auth.chooseUser')}</Form.Label>
                <Form.Select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  size="lg"
                  className="mb-2"
                >
                  <option value="">{t('auth.selectUserPrompt')}</option>

                  {/* Verified Legal Professionals */}
                  {verifiedPros.length > 0 && (
                    <optgroup label={`✓ ${t('auth.verifiedProfessionalsGroup')} (${verifiedPros.length})`}>
                      {verifiedPros.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.role} [✓ {t('common.verified')}]
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {/* Litigants in Person */}
                  {lips.length > 0 && (
                    <optgroup label={`${t('auth.lipsGroup')} (${lips.length})`}>
                      {lips.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} — LIP
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {/* Unverified Professionals */}
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

                {/* Instant Verification Banner for Selected Unverified User */}
                {selectedUser && !selectedUser.isVerified && selectedUser.role !== 'LIP' && (
                  <div className="alert alert-warning py-2 px-3 small d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3 rounded-3 border-warning-subtle">
                    <span>⚠️ {t('auth.accountUnverifiedAlert')}</span>
                    <Button
                      variant="warning"
                      size="sm"
                      className="fw-bold py-1 px-2 text-dark shadow-xs flex-shrink-0"
                      onClick={() => handleVerifySelected(selectedUser.id)}
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
                className="w-100 mb-3 d-flex align-items-center justify-content-center gap-2 shadow-xs"
              >
                <FaSignInAlt />
                <span>{t('common.signIn')}</span>
              </Button>
            </Form>
          ) : (
            <Form onSubmit={onStrapiSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Email or Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="name@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  size="lg"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your Strapi password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  size="lg"
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-100 mb-3 d-flex align-items-center justify-content-center gap-2 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" animation="border" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <FaLock />
                    <span>Sign In with Strapi</span>
                  </>
                )}
              </Button>
            </Form>
          )}

          <hr className="my-4" />

          {/* Extracted Reusable Role Registration Shortcuts */}
          <RoleRegistrationLinks onSelectRole={(role) => navigate(`/register/${role}`)} />
        </Card.Body>
      </Card>
    </Container>
  )
}
