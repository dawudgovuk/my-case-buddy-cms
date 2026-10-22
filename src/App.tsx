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
import Welcome from './pages/Welcome'
import RequireVerified from './components/routing/RequireVerified'
import { getLandingRoute } from './utils/authConstants'
import { isComponentShowcaseEnabled } from './utils/featureFlags'
import PeerDirectory from './pages/PeerDirectory'
import ComponentShowcase from './pages/ComponentShowcase'
import Profile from './pages/Profile'
import AppHeader from './components/common/AppHeader'
import ToastContainer from './components/common/ToastContainer'
import GuidanceCatalog from './pages/guidance/GuidanceCatalog'
import GuidanceRoadmapView from './pages/guidance/GuidanceRoadmapView'
import GuidanceReferencesPage from './pages/guidance/GuidanceReferencesPage'
import { useCasesStore } from './store/casesStore'
import { useCaseConfigStore } from './store/caseConfigStore'
import { useTranslation } from './hooks/useTranslation'
import { FaLifeRing, FaExternalLinkAlt, FaCompass } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import heartLogo from './assets/heart-logo.png'

// Purge all legacy hardcoded demo personas and cases on module initialization
purgeLegacyDemoData()

function Shell() {
  const { user, initNeonAuth, isLoadingSession } = useAuthStore()
  const { isStrapiMode, syncWithStrapi } = useCasesStore()
  const { loadCaseConfig } = useCaseConfigStore()
  const { t, language } = useTranslation()
  const isLip = user?.role === 'LIP'

  useEffect(() => {
    void initNeonAuth()
    void loadCaseConfig(language)
    if (isStrapiMode) {
      void syncWithStrapi()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

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
      <ToastContainer />

      <Container as="main" id="main-content" fluid="xl" className="px-3 px-md-4 flex-grow-1 app-main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register/:role" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/peer-directory" element={<RequireVerified><PeerDirectory /></RequireVerified>} />
          <Route path="/invite/:token" element={<InviteAccept />} />
          <Route
            path="/dashboard"
            element={
              <RequireVerified>
                {isLip ? <LIPDashboard /> : <Navigate to="/professional-dashboard" replace />}
              </RequireVerified>
            }
          />
          <Route
            path="/professional-dashboard"
            element={
              <RequireVerified>
                {isLip ? <Navigate to="/dashboard" replace /> : <ProfessionalDashboard />}
              </RequireVerified>
            }
          />
          <Route
            path="/cases"
            element={
              <RequireVerified>
                {isLip ? <CasesList /> : <Navigate to="/professional-dashboard" replace />}
              </RequireVerified>
            }
          />
          <Route path="/" element={<Navigate to={getLandingRoute(user)} replace />} />
          <Route path="/cases/new" element={<RequireVerified><CaseForm /></RequireVerified>} />
          <Route path="/cases/:caseId" element={<RequireVerified><CaseDetails /></RequireVerified>} />
          <Route path="/cases/:caseId/edit" element={<RequireVerified><CaseForm /></RequireVerified>} />
          <Route path="/profile" element={<RequireVerified><Profile /></RequireVerified>} />
          <Route path="/guidance" element={<GuidanceCatalog />} />
          <Route path="/guidance/references" element={<GuidanceReferencesPage />} />
          <Route path="/guidance/:mapSlug" element={<GuidanceRoadmapView />} />
          {isComponentShowcaseEnabled() && (
            <Route path="/components" element={<ComponentShowcase />} />
          )}
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

      <footer className="app-footer">
        <Container fluid="xl" className="px-3 px-md-4 d-flex align-items-center justify-content-between gap-3 h-100">
          <div className="d-flex align-items-center gap-2 min-w-0">
            <img src={heartLogo} alt="" width={20} height={20} className="flex-shrink-0" />
            <span className="footer-brand me-1 flex-shrink-0" style={{ fontSize: '0.85rem' }}>My Case Buddy</span>
            <span className="text-muted d-none d-md-inline" style={{ fontSize: '0.75rem' }}>•</span>
            <p className="mb-0 text-muted small text-truncate d-none d-md-inline" style={{ maxWidth: '44rem', fontSize: '0.76rem' }}>
              {t('common.disclaimer')}
            </p>
          </div>
          <a
            href="https://support.mycourtbuddy.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-secondary btn-sm flex-shrink-0 d-inline-flex align-items-center gap-1.5 px-2.5 py-1"
            style={{ fontSize: '0.78rem', borderRadius: '8px' }}
          >
            <FaLifeRing size={12} className="text-primary" />
            <span className="d-none d-sm-inline">{t('common.supportKnowledgeBase')}</span>
            <span className="d-sm-none">Support</span>
            <FaExternalLinkAlt size={9} className="text-muted ms-0.5" />
          </a>
        </Container>
      </footer>
    </div>
  )
}

export default function App() {
  return <Shell />
}

