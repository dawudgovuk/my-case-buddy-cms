import { Navigate, Route, Routes } from 'react-router-dom'
import { Container } from 'react-bootstrap'
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

function Shell() {
  const { user } = useAuthStore()

  return (
    <div className="d-flex flex-column min-vh-100">
      <AppHeader />

      <Container className="py-4 flex-grow-1">
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
            path="/"
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
          <Route path="/cases/new" element={user ? <CaseForm /> : <Navigate to="/login" replace />} />
          <Route path="/cases/:caseId" element={user ? <CaseDetails /> : <Navigate to="/login" replace />} />
          <Route path="/cases/:caseId/edit" element={user ? <CaseForm /> : <Navigate to="/login" replace />} />
          <Route path="/components" element={<ComponentShowcase />} />
          <Route path="*" element={<div className="text-center py-5">Page not found</div>} />
        </Routes>
      </Container>

      <footer className="bg-light text-center py-3 mt-auto border-top">
        <small className="text-muted">For demonstration purposes only. Not legal advice or a court system.</small>
      </footer>
    </div>
  )
}

export default function App() {
  return <Shell />
}

