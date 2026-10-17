import { Container, Spinner } from 'react-bootstrap'

/**
 * Centered spinner shown while an invitation is being loaded.
 */
export default function InviteLoadingState() {
  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-50 py-5">
      <div className="text-center p-4" role="status">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <div className="fw-semibold text-secondary">Opening your invitation…</div>
      </div>
    </Container>
  )
}
