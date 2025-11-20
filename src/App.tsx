import React, { useState, useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap'
import { FaUser, FaSignOutAlt, FaHome, FaPlus, FaGavel } from 'react-icons/fa'
import CasesList from './pages/CasesList'
import CaseForm from './pages/CaseForm'
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import InviteAccept from './pages/InviteAccept';
import LIPDashboard from './pages/LIPDashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import CaseDetails from './pages/CaseDetails';
import Logo from './components/Logo';

function Shell() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const [hideNav, setHideNav] = useState(false)
  const lastScrollY = useRef(0)
  const parallaxRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
      if (window.scrollY > lastScrollY.current && window.scrollY > 80) {
        setHideNav(true)
      } else {
        setHideNav(false)
      }
      lastScrollY.current = window.scrollY
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="d-flex flex-column min-vh-100">
      <div ref={parallaxRef} className="parallax-hero">
        <Navbar
          expand="lg"
          className={`parallax-navbar shadow-sm${scrolled ? ' parallax-navbar-solid' : ''}${hideNav ? ' parallax-navbar-hide' : ''}`}
          fixed="top"
        >
          <Container>
            <Navbar.Brand
              onClick={() => navigate(user ? (user.role === 'LIP' ? '/dashboard' : '/professional-dashboard') : '/login')}
              style={{ cursor: 'pointer' }}
            >
              <Logo />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto align-items-center">
                {user ? (
                  <>
                    <Nav.Link onClick={() => navigate(user.role === 'LIP' ? '/dashboard' : '/professional-dashboard')}>
                      <FaHome className="me-1" />
                      Dashboard
                    </Nav.Link>
                    {user.role === 'LIP' && (
                      <>
                        <Nav.Link onClick={() => navigate('/')}> 
                          <FaGavel className="me-1" />
                          Cases
                        </Nav.Link>
                        <Nav.Link onClick={() => navigate('/cases/new')}>
                          <FaPlus className="me-1" />
                          New Case
                        </Nav.Link>
                      </>
                    )}
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="link" className="text-decoration-none d-flex align-items-center">
                        <FaUser className="me-1" />
                        {user.name} ({user.role})
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={handleLogout}>
                          <FaSignOutAlt className="me-2" />
                          Logout
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </>
                ) : (
                  <Nav.Link onClick={() => navigate('/login')}>Login</Nav.Link>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <div className="parallax-hero-bg" />
      </div>

      <Container className="py-4 flex-grow-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register/:role" element={<Register />} />
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
          <Route path="*" element={<div className="text-center py-5">Page not found</div>} />
        </Routes>
      </Container>

      <footer className="bg-light text-center py-3 mt-auto">
        <small className="text-muted">For demonstration purposes only. Not legal advice or a court system.</small>
      </footer>
    </div>
  )
}

export default function App() {
  return <Shell />
}
