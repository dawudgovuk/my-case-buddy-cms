import { useState, useMemo, useEffect } from 'react'
import { Container, Row, Col, Card, Alert } from 'react-bootstrap'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import { useTranslation } from '../hooks/useTranslation'
import { listUsers } from '../services/auth'
import { fetchStrapiProfessionals } from '../services/strapi'
import type { User } from '../types/domain'
import {
  FaHandshake,
  FaBalanceScale,
  FaSearch,
  FaTimes,
  FaUserCheck,
  FaUsers,
  FaGavel,
  FaSync,
} from 'react-icons/fa'
import PeerSupporterCard from '../components/directory/PeerSupporterCard'
import PeerSupportRequestModal from '../components/directory/PeerSupportRequestModal'
import { isUserCaseMember } from '../utils/caseMembership'

export default function PeerDirectory() {
  const { user } = useAuthStore()
  const { cases, requestPeerSupport, isStrapiMode, syncWithStrapi } = useCasesStore()
  const { t } = useTranslation()

  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [requestTargetUser, setRequestTargetUser] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [strapiPros, setStrapiPros] = useState<User[]>([])
  const [isLoadingPros, setIsLoadingPros] = useState<boolean>(false)

  function loadProfessionals() {
    setIsLoadingPros(true)
    fetchStrapiProfessionals()
      .then((pros) => {
        setStrapiPros(pros || [])
      })
      .catch((err) => {
        console.warn('Could not fetch Strapi professionals:', err)
        setStrapiPros([])
      })
      .finally(() => {
        setIsLoadingPros(false)
      })
  }

  useEffect(() => {
    loadProfessionals()
  }, [])

  useEffect(() => {
    if (isStrapiMode && cases.length === 0) {
      void syncWithStrapi()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStrapiMode])

  // Legal professionals (Solicitor, Barrister, McKenzieFriend) from Strapi or local store
  const professionals = useMemo(() => {
    if (isStrapiMode) {
      return strapiPros
    }
    return listUsers().filter(
      (u) =>
        (u.role === 'Solicitor' || u.role === 'Barrister' || u.role === 'McKenzieFriend') &&
        Boolean(u.isVerified)
    )
  }, [isStrapiMode, strapiPros])

  // Dynamic counts for filter chips
  const counts = useMemo(() => {
    return {
      all: professionals.length,
      mckenzie: professionals.filter((p) => p.role === 'McKenzieFriend').length,
      solicitors: professionals.filter((p) => p.role === 'Solicitor').length,
      barristers: professionals.filter((p) => p.role === 'Barrister').length,
    }
  }, [professionals])

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

  const targetProfessional = useMemo(() => {
    if (!requestTargetUser) return null
    return professionals.find((p) => p.id === requestTargetUser) || null
  }, [requestTargetUser, professionals])

  const myCases = useMemo(() => {
    if (!user) return []
    const owned = cases.filter((c) => isUserCaseMember(c, user))
    return owned.length > 0 ? owned : cases
  }, [cases, user])

  function handleOpenRequestModal(professionalId: string) {
    setRequestTargetUser(professionalId)
    setSuccessMessage(null)
  }

  async function handleSendRequest(caseId: string, note: string) {
    if (!targetProfessional) return
    try {
      await requestPeerSupport(caseId, targetProfessional, note)
      setSuccessMessage(
        `Support request sent to ${targetProfessional.name} (${targetProfessional.role}). We've added an audit entry to your case timeline.`
      )
      setRequestTargetUser(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send peer support request'
      throw new Error(msg)
    }
  }

  function handleClearFilters() {
    setSearchTerm('')
    setRoleFilter('all')
  }

  return (
    <Container fluid className="px-lg-4 py-3" style={{ maxWidth: '1360px', margin: '0 auto' }}>
      {/* 1. Executive Hero Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-1.5">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill d-inline-flex align-items-center gap-1.5 small fw-semibold">
            <FaUserCheck size={11} />
            <span>VERIFIED LEGAL DIRECTORY</span>
          </span>
          <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill d-inline-flex align-items-center gap-1.5 small fw-semibold">
            <span
              className="rounded-circle bg-success"
              style={{ width: 6, height: 6, display: 'inline-block' }}
            />
            <span>{counts.all} Active Supporters</span>
          </span>
          {isLoadingPros && (
            <span className="badge bg-light text-muted border px-2.5 py-1 rounded-pill d-inline-flex align-items-center gap-1.5 small">
              <span className="spinner-border spinner-border-sm" role="status" style={{ width: 10, height: 10 }} />
              <span>Syncing...</span>
            </span>
          )}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary py-0.5 px-2.5 rounded-pill d-inline-flex align-items-center gap-1.5 small shadow-none"
            onClick={loadProfessionals}
            disabled={isLoadingPros}
            style={{ fontSize: '0.8rem' }}
          >
            <FaSync size={10} className={isLoadingPros ? 'fa-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em', fontSize: '1.75rem' }}>
          {t('peerDirectory.title')}
        </h2>
        <p className="text-secondary mb-3" style={{ maxWidth: 760, fontSize: '0.94rem' }}>
          {t('peerDirectory.subtitle')}
        </p>

        {/* Header Metric Cards */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="bg-white border rounded-3 px-3 py-1.5 d-inline-flex align-items-center gap-2 shadow-sm">
            <FaUsers className="text-primary" size={13} />
            <span className="small text-muted">All Verified:</span>
            <span className="fw-bold text-dark small">{counts.all}</span>
          </div>
          <div className="bg-white border rounded-3 px-3 py-1.5 d-inline-flex align-items-center gap-2 shadow-sm">
            <FaHandshake className="text-success" size={13} />
            <span className="small text-muted">McKenzie Friends:</span>
            <span className="fw-bold text-dark small">{counts.mckenzie}</span>
          </div>
          <div className="bg-white border rounded-3 px-3 py-1.5 d-inline-flex align-items-center gap-2 shadow-sm">
            <FaGavel className="text-primary" size={12} />
            <span className="small text-muted">Solicitors:</span>
            <span className="fw-bold text-dark small">{counts.solicitors}</span>
          </div>
          <div className="bg-white border rounded-3 px-3 py-1.5 d-inline-flex align-items-center gap-2 shadow-sm">
            <FaBalanceScale className="text-warning" size={13} />
            <span className="small text-muted">Barristers:</span>
            <span className="fw-bold text-dark small">{counts.barristers}</span>
          </div>
        </div>
      </div>

      {/* Success Alert Banner */}
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
          className="mb-4 shadow-sm border-0 d-flex align-items-center gap-2"
        >
          <FaHandshake size={18} className="text-success flex-shrink-0" />
          <span>{successMessage}</span>
        </Alert>
      )}

      {/* 2. Elevated Search & Filter Bar */}
      <div className="premium-card p-3 mb-4 border-0 shadow-sm">
        <Row className="g-3 align-items-center">
          {/* Search Input with Icon */}
          <Col xs={12} lg={5}>
            <div className="position-relative">
              <FaSearch
                size={13}
                className="position-absolute text-muted"
                style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder={t('peerDirectory.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control search-with-icon"
                aria-label={t('peerDirectory.searchPlaceholder')}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-sm text-muted position-absolute p-0 border-0"
                  style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <FaTimes size={12} />
                </button>
              )}
            </div>
          </Col>

          {/* Role Filter Chips */}
          <Col xs={12} lg={7}>
            <div className="d-flex align-items-center gap-1.5 justify-content-start justify-content-lg-end flex-wrap">
              {/* All Filter */}
              <button
                type="button"
                className={`filter-chip-btn ${roleFilter === 'all' ? 'active' : ''}`}
                onClick={() => setRoleFilter('all')}
              >
                <span>All Roles</span>
                <span className="chip-count">{counts.all}</span>
              </button>

              {/* McKenzie Friends Filter */}
              <button
                type="button"
                className={`filter-chip-btn ${roleFilter === 'McKenzieFriend' ? 'active active-emerald' : ''}`}
                onClick={() => setRoleFilter('McKenzieFriend')}
              >
                <span
                  className="chip-dot"
                  style={{ backgroundColor: '#10b981' }}
                />
                <span>McKenzie Friends</span>
                <span className="chip-count">{counts.mckenzie}</span>
              </button>

              {/* Solicitors Filter */}
              <button
                type="button"
                className={`filter-chip-btn ${roleFilter === 'Solicitor' ? 'active' : ''}`}
                onClick={() => setRoleFilter('Solicitor')}
              >
                <span
                  className="chip-dot"
                  style={{ backgroundColor: '#2563eb' }}
                />
                <span>Solicitors</span>
                <span className="chip-count">{counts.solicitors}</span>
              </button>

              {/* Barristers Filter */}
              <button
                type="button"
                className={`filter-chip-btn ${roleFilter === 'Barrister' ? 'active' : ''}`}
                onClick={() => setRoleFilter('Barrister')}
              >
                <span
                  className="chip-dot"
                  style={{ backgroundColor: '#f59e0b' }}
                />
                <span>Barristers</span>
                <span className="chip-count">{counts.barristers}</span>
              </button>
            </div>
          </Col>
        </Row>
      </div>

      {/* 3. Grid of Cards or Empty State */}
      {filtered.length === 0 ? (
        <Card className="premium-card text-center p-5 border-0 shadow-sm">
          <Card.Body className="py-4">
            <div
              className="d-flex align-items-center justify-content-center mx-auto rounded-circle bg-light text-muted mb-3"
              style={{ width: 64, height: 64 }}
            >
              <FaBalanceScale size={28} />
            </div>
            <h5 className="fw-bold text-dark mb-1">No legal professionals found</h5>
            <p className="text-muted small mb-3" style={{ maxWidth: 420, margin: '0 auto' }}>
              We could not find any verified professionals matching your current search query or role filter.
            </p>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-3 py-1.5 rounded-pill fw-semibold"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filtered.map((pro) => (
            <Col key={pro.id} xs={12} md={6} lg={4} className="d-flex">
              <PeerSupporterCard
                professional={pro}
                onRequestSupport={user ? handleOpenRequestModal : undefined}
                showRequestButton={Boolean(user && user.id !== pro.id)}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* 4. Peer Support Request Modal */}
      <PeerSupportRequestModal
        show={Boolean(requestTargetUser)}
        targetUserId={requestTargetUser}
        targetProfessional={targetProfessional}
        cases={myCases}
        onSendRequest={handleSendRequest}
        onCancel={() => setRequestTargetUser(null)}
      />
    </Container>
  )
}
