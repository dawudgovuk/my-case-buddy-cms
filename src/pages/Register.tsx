import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate, useParams } from 'react-router-dom'
import type { UserRole } from '../types/domain'
import { saveUsers, listUsers } from '../services/auth'
import { generateId } from '../services/storage'
import { FaUserPlus, FaArrowLeft, FaBuilding, FaIdCard } from 'react-icons/fa'

export default function Register() {
  const navigate = useNavigate()
  const { role } = useParams<{ role: string }>()
  const { users, login } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [firm, setFirm] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [error, setError] = useState('')

  const userRole = role as UserRole | undefined

  if (!userRole || !['LIP', 'McKenzieFriend', 'Solicitor', 'Barrister'].includes(userRole)) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="danger">Invalid registration type</Alert>
      </Container>
    )
  }

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

    const newUser = {
      id: generateId('user'),
      name: name.trim(),
      email: email.trim(),
      role: userRole,
      ...(firm.trim() && { firm: firm.trim() }),
      ...(registrationNumber.trim() && { registrationNumber: registrationNumber.trim() }),
    }

    const updatedUsers = [...existingUsers, newUser]
    saveUsers(updatedUsers)
    useAuthStore.setState({ users: updatedUsers })

    login(newUser.id)
    navigate('/dashboard')
  }

  const roleColors: Record<string, string> = {
    LIP: 'primary',
    McKenzieFriend: 'success',
    Solicitor: 'info',
    Barrister: 'warning',
  }

  const bgColor = roleColors[userRole] || 'primary'

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 py-5">
      <Card className="shadow-lg border-0" style={{ width: '100%', maxWidth: '500px' }}>
        <Card.Header className={`bg-${bgColor} text-white text-center py-4`}>
          <h3 className="mb-0">
            <FaUserPlus className="me-2" />
            Register as {userRole}
          </h3>
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
                    <FaBuilding className="me-2" />
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
                    <FaIdCard className="me-2" />
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
                <Button type="submit" variant={bgColor as any} size="lg" className="w-100">
                  <FaUserPlus className="me-2" />
                  Register
                </Button>
              </Col>
              <Col>
                <Button variant="outline-secondary" size="lg" className="w-100" onClick={() => navigate('/login')}>
                  <FaArrowLeft className="me-2" />
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
