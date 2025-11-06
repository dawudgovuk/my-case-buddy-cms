import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { FaSignInAlt, FaUserPlus, FaHandshake, FaGavel, FaBalanceScale } from 'react-icons/fa'

export default function Login() {
  const navigate = useNavigate()
  const { user, users, login, ensureDemoUsers } = useAuthStore()
  const [userId, setUserId] = useState('')

  useEffect(() => {
    ensureDemoUsers()
  }, [ensureDemoUsers])

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    login(userId)
    navigate('/')
  }

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 py-5">
      <Card className="shadow-lg border-0" style={{ width: '100%', maxWidth: '600px' }}>
        <Card.Header className="bg-primary text-white text-center py-4">
          <h2 className="mb-0">
            <FaGavel className="me-2" />
            MyCase Buddy
          </h2>
          <p className="mb-0 mt-2 small">Sign in to manage your cases</p>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                <FaSignInAlt className="me-2" />
                Choose User
              </Form.Label>
              <Form.Select value={userId} onChange={(e) => setUserId(e.target.value)} required size="lg">
                <option value="">Select a user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.role}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="primary" size="lg" className="w-100 mb-3">
              <FaSignInAlt className="me-2" />
              Sign In
            </Button>
          </Form>

          <hr className="my-4" />

          <div className="text-center mb-3">
            <p className="text-muted mb-3">Need to register?</p>
          </div>
          <Row className="g-2">
            <Col xs={6} sm={6}>
              <Button
                variant="outline-primary"
                className="w-100"
                onClick={() => navigate('/register/LIP')}
                size="sm"
              >
                <FaUserPlus className="me-1" />
                LIP
              </Button>
            </Col>
            <Col xs={6} sm={6}>
              <Button
                variant="outline-success"
                className="w-100"
                onClick={() => navigate('/register/McKenzieFriend')}
                size="sm"
              >
                <FaHandshake className="me-1" />
                McKenzie Friend
              </Button>
            </Col>
            <Col xs={6} sm={6}>
              <Button
                variant="outline-info"
                className="w-100"
                onClick={() => navigate('/register/Solicitor')}
                size="sm"
              >
                <FaGavel className="me-1" />
                Solicitor
              </Button>
            </Col>
            <Col xs={6} sm={6}>
              <Button
                variant="outline-warning"
                className="w-100"
                onClick={() => navigate('/register/Barrister')}
                size="sm"
              >
                <FaBalanceScale className="me-1" />
                Barrister
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  )
}
