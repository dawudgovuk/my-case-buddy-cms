import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Container, Spinner } from 'react-bootstrap'
import CasesList from './pages/CasesList'
import CaseForm from './pages/CaseForm'
import { useAuthStore } from './store/authStore'
import { purgeLegacyDemoData } from './services/auth'
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
import { useCasesStore } from './store/casesStore'
import { useTranslation } from './hooks/useTranslation'
import { FaLifeRing, FaExternalLinkAlt, FaCompass } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import heartLogo from './assets/heart-logo.png'

// Purge all legacy hardcoded demo personas and cases on module initialization
purgeLegacyDemoData()

function Shell() {
  const { user, initNeonAuth, isLoadingSession } = useAuthStore()
  const { isStrapiMode, syncWithStrapi } = useCasesStore()
  const { t } = useTranslation()

  useEffect(() => {
    void initNeonAuth()
    if (isStrapiMode) {
      void syncWithStrapi()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoadingSession) {
    return (
      <div className="app-page-loader">
        <div className="text-center p-4" role="status" aria-live="polite">
          <img src={heartLogo} alt="" width={44} height={44} className="mb-3" />
          <div className="mb-3">
            <Spinner animation="border" variant="primary" size="sm" />
          </div>
          <div className="brand-wordmark mb-1">
            My Case <span>Buddy</span>
          </div>
          <div className="text-muted small">Opening your account…</div>
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AppHeader />

      <Container as="main" id="main-content" fluid="xl" className="py-4 py-md-5 px-3 px-md-4 flex-grow-1">
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
          <Route
            path="*"
            element={
              <div className="card not-found-card">
                <div className="auth-hero-icon mx-auto" style={{ background: 'var(--mcb-primary-soft)', borderColor: 'var(--mcb-primary-border)', color: 'var(--mcb-primary)' }}>
                  <FaCompass size={24} />
                </div>
                <h1 className="h3 mb-2">{t('common.pageNotFound')}</h1>
                <p className="text-muted mb-4">The link may be out of date, or the page may have moved.</p>
                <div>
                  <Link to="/" className="btn btn-primary">Go to my home page</Link>
                </div>
              </div>
            }
          />
        </Routes>
      </Container>

      <footer className="app-footer py-4 mt-auto">
        <Container fluid="xl" className="px-3 px-md-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-start gap-3">
            <img src={heartLogo} alt="" width={28} height={28} className="mt-1" />
            <div>
              <div className="footer-brand mb-1">My Case Buddy</div>
              <p className="mb-0" style={{ maxWidth: '38rem' }}>{t('common.disclaimer')}</p>
            </div>
          </div>
          <a
            href="https://support.mycourtbuddy.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-secondary btn-sm flex-shrink-0 align-self-start align-self-md-center"
          >
            <FaLifeRing size={13} className="text-primary" />
            <span>{t('common.supportKnowledgeBase')}</span>
            <FaExternalLinkAlt size={10} className="text-muted" />
          </a>
        </Container>
      </footer>
    </div>
  )
}

export default function App() {
  return <Shell />
}

