import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate, useParams } from 'react-router-dom'
import type { User, UserRole } from '../types/domain'
import { saveUsers, listUsers } from '../services/auth'
import { generateId } from '../services/storage'
import { USER_ROLES } from '../utils/caseConstants'
import RegistrationPendingCard from '../components/auth/RegistrationPendingCard'

function isValidRole(r: string | undefined): r is UserRole {
  return typeof r === 'string' && (USER_ROLES as readonly string[]).includes(r)
}

export default function Register() {
  const navigate = useNavigate()
  const { role } = useParams<{ role: string }>()
  const { login } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [firm, setFirm] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [error, setError] = useState('')

  const [registeredPendingVerification, setRegisteredPendingVerification] = useState<{
    email: string
    token: string
    name: string
  } | null>(null)

  if (!isValidRole(role)) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="danger">Invalid registration type</Alert>
      </Container>
    )
  }

  const userRole: UserRole = role

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required')
      return
    }

    const existingUsers = listUsers()
    if (existingUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      setError('An account with this email already exists')
      return
    }

    const isProfessional = userRole === 'Solicitor' || userRole === 'Barrister' || userRole === 'McKenzieFriend'
    const verificationToken = isProfessional ? generateId('verify') : undefined

    const newUser: User = {
      id: generateId('user'),
      name: name.trim(),
      email: email.trim(),
      role: userRole,
      isVerified: !isProfessional,
      ...(verificationToken && {
        verificationToken,
        verificationSentAt: new Date().toISOString(),
      }),
      ...(firm.trim() && { firm: firm.trim() }),
      ...(registrationNumber.trim() && { registrationNumber: registrationNumber.trim() }),
    }

    const updatedUsers: User[] = [...existingUsers, newUser]
    saveUsers(updatedUsers)
    useAuthStore.setState({ users: updatedUsers })

    if (isProfessional && verificationToken) {
      setRegisteredPendingVerification({
        email: newUser.email,
        token: verificationToken,
        name: newUser.name,
      })
    } else {
      login(newUser.id)
      navigate('/dashboard')
    }
  }

  if (registeredPendingVerification) {
    return (
      <RegistrationPendingCard
        name={registeredPendingVerification.name}
        email={registeredPendingVerification.email}
        token={registeredPendingVerification.token}
        role={userRole}
        onVerifyNow={(token) => navigate(`/verify-email/${token}`)}
        onReturnToLogin={() => navigate('/login')}
      />
    )
  }

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50">
      <Card className="shadow-lg border-0" style={{ width: '100%', maxWidth: '500px' }}>
        <Card.Header className="text-center">
          <h1>
            Register as {userRole}
          </h1>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Full Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                size="lg"
                placeholder="Enter your full name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="lg"
                placeholder="Enter your email"
              />
            </Form.Group>

            {(userRole === 'Solicitor' || userRole === 'Barrister') && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    {userRole === 'Solicitor' ? 'Firm' : 'Chambers'}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={firm}
                    onChange={(e) => setFirm(e.target.value)}
                    size="lg"
                    placeholder={userRole === 'Solicitor' ? 'Enter firm name' : 'Enter chambers name'}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Registration Number
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    size="lg"
                    placeholder="Your professional registration number"
                  />
                  <Form.Text className="text-muted">Your professional registration number</Form.Text>
                </Form.Group>
              </>
            )}

            <Row className="g-2">
              <Col>
                <Button type="submit" className="w-100" size="lg">
                  Register
                </Button>
              </Col>
              <Col>
                <Button variant="outline-secondary" size="lg" className="w-100" onClick={() => navigate('/login')}>
                  Back to Login
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}
