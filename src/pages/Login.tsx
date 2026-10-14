import { Container, Card, Form, Button } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { FaSignInAlt } from 'react-icons/fa'
import RoleRegistrationLinks from '../components/auth/RoleRegistrationLinks'

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
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-5">
      <Card className="shadow-lg border-0" style={{ maxWidth: '540px', width: '100%' }}>
        <Card.Header className="text-center py-4">
          <h1>MyCase Buddy</h1>
          <p className="mb-0 mt-2">Sign in to manage your cases and peer support</p>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Choose User</Form.Label>
              <Form.Select value={userId} onChange={(e) => setUserId(e.target.value)} required size="lg">
                <option value="">Select a user...</option>
                {users.map((u) => {
                  const verifiedStatus =
                    u.role === 'LIP'
                      ? ''
                      : u.isVerified
                      ? ' [✓ Verified]'
                      : ' [⚠️ Unverified - Needs Email Link]'
                  return (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.role}
                      {verifiedStatus}
                    </option>
                  )
                })}
              </Form.Select>
            </Form.Group>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
            >
              <FaSignInAlt />
              <span>Sign In</span>
            </Button>
          </Form>

          <hr className="my-4" />

          {/* Extracted Reusable Role Registration Shortcuts */}
          <RoleRegistrationLinks onSelectRole={(role) => navigate(`/register/${role}`)} />
        </Card.Body>
      </Card>
    </Container>
  )
}
