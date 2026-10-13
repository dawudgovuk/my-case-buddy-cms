import { useState, useMemo } from 'react'
import { Container, Row, Col, Card, Button, Form, Modal, Alert } from 'react-bootstrap'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import { listUsers } from '../services/auth'
import type { FamilyCase } from '../types/domain'
import { FaHandshake, FaBalanceScale, FaPaperPlane } from 'react-icons/fa'
import PeerSupporterCard from '../components/directory/PeerSupporterCard'

export default function PeerDirectory() {
  const { user } = useAuthStore()
  const { cases, togglePeerSupport } = useCasesStore()

  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCaseId, setSelectedCaseId] = useState<string>('')
  const [requestNote, setRequestNote] = useState('')
  const [requestTargetUser, setRequestTargetUser] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Only legal professionals (Solicitor, Barrister, McKenzieFriend) who are verified
  const professionals = useMemo(() => {
    return listUsers().filter(
      (u) =>
        (u.role === 'Solicitor' || u.role === 'Barrister' || u.role === 'McKenzieFriend') &&
        Boolean(u.isVerified)
    )
  }, [])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return professionals.filter((p) => {
      const matchesRole = roleFilter === 'all' || p.role === roleFilter
      const matchesTerm =
        !term ||
        p.name.toLowerCase().includes(term) ||
        (p.firm && p.firm.toLowerCase().includes(term)) ||
        (p.registrationNumber && p.registrationNumber.toLowerCase().includes(term)) ||
        (p.bio && p.bio.toLowerCase().includes(term))
      return matchesRole && matchesTerm
    })
  }, [professionals, roleFilter, searchTerm])

  const myCases = useMemo(() => {
    if (!user) return []
    return cases.filter((c) => c.members?.some((m) => m.userId === user.id && m.role === 'Owner'))
  }, [cases, user])

  function handleOpenRequestModal(professionalId: string) {
    setRequestTargetUser(professionalId)
    setRequestNote('')
    if (myCases.length > 0) {
      setSelectedCaseId(myCases[0].id)
    }
    setSuccessMessage(null)
  }

  function handleSendRequest() {
    if (!selectedCaseId) return
    togglePeerSupport(selectedCaseId, true, requestNote.trim() || 'Peer support requested from legal directory')
    setSuccessMessage('Peer support request sent! The case has been flagged for peer review.')
    setRequestTargetUser(null)
  }

  return (
    <Container fluid className="py-2">
      <div className="mb-4">
        <h1>Find Experienced Legal People</h1>
        <p className="lead text-secondary">
          Connect with email-verified Solicitors, Barristers, and McKenzie Friends for peer-to-peer legal support and guidance.
        </p>
      </div>

      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)} className="mb-4">
          <FaHandshake className="me-2" />
          {successMessage}
        </Alert>
      )}

      <Card className="shadow-sm mb-4 border-0">
        <Card.Body className="p-3">
          <Row className="g-3 align-items-center">
            <Col xs={12} md={7}>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  placeholder="Search by legal professional name, firm, chambers, or registration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="lg"
                />
              </div>
            </Col>
            <Col xs={12} md={5}>
              <div className="d-flex gap-1 flex-wrap">
                <Button
                  variant={roleFilter === 'all' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setRoleFilter('all')}
                >
                  All ({professionals.length})
                </Button>
                <Button
                  variant={roleFilter === 'McKenzieFriend' ? 'success' : 'outline-success'}
                  size="sm"
                  onClick={() => setRoleFilter('McKenzieFriend')}
                >
                  McKenzie Friends
                </Button>
                <Button
                  variant={roleFilter === 'Solicitor' ? 'info' : 'outline-info'}
                  size="sm"
                  onClick={() => setRoleFilter('Solicitor')}
                >
                  Solicitors
                </Button>
                <Button
                  variant={roleFilter === 'Barrister' ? 'warning' : 'outline-warning'}
                  size="sm"
                  onClick={() => setRoleFilter('Barrister')}
                >
                  Barristers
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filtered.length === 0 ? (
        <Card className="text-center p-5 border-0 shadow-sm">
          <Card.Body>
            <FaBalanceScale size={48} className="text-muted mb-3" />
            <h5>No verified legal professionals found matching your filters.</h5>
            <p className="text-muted">Try adjusting your search criteria or role filter.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filtered.map((pro) => (
            <Col key={pro.id} xs={12} md={6} lg={4}>
              <PeerSupporterCard
                professional={pro}
                onRequestSupport={user?.role === 'LIP' ? handleOpenRequestModal : undefined}
                showRequestButton={user?.role === 'LIP'}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Peer Support Request Modal */}
      <Modal show={Boolean(requestTargetUser)} onHide={() => setRequestTargetUser(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5">Request Peer Support on Case</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {myCases.length === 0 ? (
            <Alert variant="warning">
              You do not have any active cases yet. Please create a case first to request peer support.
            </Alert>
          ) : (
            <div>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Select Your Case</Form.Label>
                <Form.Select value={selectedCaseId} onChange={(e) => setSelectedCaseId(e.target.value)}>
                  {myCases.map((c: FamilyCase) => (
                    <option key={c.id} value={c.id}>
                      {c.id} — {c.title} ({c.caseType})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">What help or advice do you need?</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="e.g. Need peer review of draft statement, help understanding court directions, bundle indexing..."
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRequestTargetUser(null)}>
            Cancel
          </Button>
          {myCases.length > 0 && (
            <Button variant="primary" onClick={handleSendRequest} className="d-flex align-items-center gap-2">
              <FaPaperPlane />
              <span>Send Request</span>
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
