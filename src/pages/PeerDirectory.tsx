import { useState, useMemo } from 'react'
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import { useTranslation } from '../hooks/useTranslation'
import { listUsers } from '../services/auth'
import { FaHandshake, FaBalanceScale } from 'react-icons/fa'
import PeerSupporterCard from '../components/directory/PeerSupporterCard'
import PeerSupportRequestModal from '../components/directory/PeerSupportRequestModal'

export default function PeerDirectory() {
  const { user } = useAuthStore()
  const { cases, togglePeerSupport } = useCasesStore()
  const { t } = useTranslation()

  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
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
    setSuccessMessage(null)
  }

  function handleSendRequest(caseId: string, note: string) {
    togglePeerSupport(caseId, true, note || 'Peer support requested from legal directory')
    setSuccessMessage(t('peerDirectory.requestSentSuccess'))
    setRequestTargetUser(null)
  }

  return (
    <Container fluid className="py-2">
      <div className="mb-4">
        <h1>{t('peerDirectory.title')}</h1>
        <p className="lead text-secondary">
          {t('peerDirectory.subtitle')}
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
            <Col xs={12} lg={6}>
              <div className="position-relative">
                <Form.Control
                  type="text"
                  placeholder={t('peerDirectory.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="sm"
                  className="py-2"
                />
              </div>
            </Col>
            <Col xs={12} lg={6}>
              <div className="filter-scroll-wrapper d-flex gap-1 py-1 justify-content-start justify-content-lg-end">
                <Button
                  variant={roleFilter === 'all' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  className="rounded-pill flex-shrink-0"
                  onClick={() => setRoleFilter('all')}
                >
                  {t('peerDirectory.allFilter', { count: professionals.length })}
                </Button>
                <Button
                  variant={roleFilter === 'McKenzieFriend' ? 'success' : 'outline-secondary'}
                  size="sm"
                  className="rounded-pill flex-shrink-0"
                  onClick={() => setRoleFilter('McKenzieFriend')}
                >
                  {t('peerDirectory.mckenzieFriendsFilter')}
                </Button>
                <Button
                  variant={roleFilter === 'Solicitor' ? 'info' : 'outline-secondary'}
                  size="sm"
                  className="rounded-pill flex-shrink-0"
                  onClick={() => setRoleFilter('Solicitor')}
                >
                  {t('peerDirectory.solicitorsFilter')}
                </Button>
                <Button
                  variant={roleFilter === 'Barrister' ? 'warning' : 'outline-secondary'}
                  size="sm"
                  className="rounded-pill flex-shrink-0 text-dark"
                  onClick={() => setRoleFilter('Barrister')}
                >
                  {t('peerDirectory.barristersFilter')}
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
            <h5>{t('peerDirectory.noProsFound')}</h5>
            <p className="text-muted">{t('peerDirectory.noProsFound')}</p>
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

      {/* Reusable Peer Support Request Modal */}
      <PeerSupportRequestModal
        show={Boolean(requestTargetUser)}
        targetUserId={requestTargetUser}
        cases={myCases}
        onSendRequest={handleSendRequest}
        onCancel={() => setRequestTargetUser(null)}
      />
    </Container>
  )
}
