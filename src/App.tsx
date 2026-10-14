import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Container, Spinner } from 'react-bootstrap'
import CasesList from './pages/CasesList'
import CaseForm from './pages/CaseForm'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Register from './pages/Register'
import InviteAccept from './pages/InviteAccept'
import LIPDashboard from './pages/LIPDashboard'
import ProfessionalDashboard from './pages/ProfessionalDashboard'
import CaseDetails from './pages/CaseDetails'
import VerifyEmail from './pages/VerifyEmail'
import PeerDirectory from './pages/PeerDirectory'
import ComponentShowcase from './pages/ComponentShowcase'
import AppHeader from './components/common/AppHeader'
import { useTranslation } from './hooks/useTranslation'
import { FaLifeRing, FaExternalLinkAlt } from 'react-icons/fa'

function Shell() {
  const { user, initNeonAuth, ensureDemoUsers, isLoadingSession } = useAuthStore()
  const { t } = useTranslation()

  useEffect(() => {
    ensureDemoUsers()
    initNeonAuth()
  }, [ensureDemoUsers, initNeonAuth])

  if (isLoadingSession) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center p-4">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <div className="text-dark fw-bold mb-1">My Case Buddy CMS</div>
          <div className="text-muted small">Loading session...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <AppHeader />

      <Container fluid="xl" className="py-3 py-md-4 px-2 px-sm-3 px-md-4 flex-grow-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register/:role" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/peer-directory" element={user ? <PeerDirectory /> : <Navigate to="/login" replace />} />
          <Route path="/invite/:token" element={<InviteAccept />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                user.role === 'LIP' ? (
                  <LIPDashboard />
                ) : (
                  <Navigate to="/professional-dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/professional-dashboard"
            element={
              user ? (
                user.role !== 'LIP' ? (
                  <ProfessionalDashboard />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/cases"
            element={
              user ? (
                user.role === 'LIP' ? (
                  <CasesList />
                ) : (
                  <Navigate to="/professional-dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/"
            element={
              user ? (
                user.role === 'LIP' ? (
                  <Navigate to="/cases" replace />
                ) : (
                  <Navigate to="/professional-dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/cases/new" element={user ? <CaseForm /> : <Navigate to="/login" replace />} />
          <Route path="/cases/:caseId" element={user ? <CaseDetails /> : <Navigate to="/login" replace />} />
          <Route path="/cases/:caseId/edit" element={user ? <CaseForm /> : <Navigate to="/login" replace />} />
          <Route path="/components" element={<ComponentShowcase />} />
          <Route path="*" element={<div className="text-center py-5 text-muted">{t('common.pageNotFound')}</div>} />
        </Routes>
      </Container>

      <footer className="bg-light py-4 mt-auto border-top">
        <Container className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-center text-md-start">
          <div>
            <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.875rem' }}>
              My Case Buddy CMS
            </div>
            <small className="text-muted d-block">{t('common.disclaimer')}</small>
          </div>
          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            <a
              href="https://support.mycourtbuddy.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2 rounded-pill px-3 py-1 shadow-xs"
              style={{ fontSize: '0.8rem' }}
            >
              <FaLifeRing size={12} className="text-primary" />
              <span>{t('common.supportKnowledgeBase')}</span>
              <FaExternalLinkAlt size={10} className="text-muted" />
            </a>
          </div>
        </Container>
      </footer>
    </div>
  )
}

export default function App() {
  return <Shell />
}

