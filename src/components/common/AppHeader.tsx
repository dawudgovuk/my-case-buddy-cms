import { useState } from 'react'
import { Navbar, Container, Nav, Dropdown, Badge } from 'react-bootstrap'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useTranslation } from '../../hooks/useTranslation'
import Logo from './Logo'
import LanguageSwitcher from './LanguageSwitcher'
import {
  FaHome,
  FaGavel,
  FaPlus,
  FaHandshake,
  FaPuzzlePiece,
  FaSignOutAlt,
  FaUserCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaLifeRing,
  FaExternalLinkAlt,
} from 'react-icons/fa'
import type { UserRole } from '../../types/domain'

export interface AppHeaderProps {
  className?: string
}

const roleBadgeVariant: Record<UserRole, 'secondary' | 'success' | 'primary' | 'warning'> = {
  LIP: 'secondary',
  McKenzieFriend: 'success',
  Solicitor: 'primary',
  Barrister: 'warning',
}

export default function AppHeader({ className = '' }: AppHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const handleLogout = () => {
    setExpanded(false)
    logout()
    navigate('/login')
  }

  const handleNavigate = (path: string) => {
    setExpanded(false)
    navigate(path)
  }

  const getHomeRoute = () => {
    if (!user) return '/login'
    return user.role === 'LIP' ? '/dashboard' : '/professional-dashboard'
  }

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <Navbar
      expand="xl"
      expanded={expanded}
      onToggle={(exp) => setExpanded(exp)}
      sticky="top"
      className={`app-navbar bg-white border-bottom shadow-sm ${className}`}
      style={{
        zIndex: 1030,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Container fluid className="px-lg-4">
        {/* Brand Logo */}
        <Navbar.Brand
          onClick={() => handleNavigate(getHomeRoute())}
          className="d-flex align-items-center py-1"
          style={{ cursor: 'pointer' }}
        >
          <Logo />
        </Navbar.Brand>

        {/* Responsive Mobile Toggle Button */}
        <Navbar.Toggle
          aria-controls="main-navbar-nav"
          className="border-0 shadow-none p-1"
          aria-label="Toggle navigation"
        />

        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="ms-auto align-items-stretch align-items-xl-center gap-1 my-2 my-xl-0">
            {user ? (
              <>
                {/* Dashboard Nav Link */}
                <Nav.Link
                  active={isActive(user.role === 'LIP' ? '/dashboard' : '/professional-dashboard')}
                  onClick={() => handleNavigate(user.role === 'LIP' ? '/dashboard' : '/professional-dashboard')}
                  className="px-3 py-2 fw-medium d-flex align-items-center gap-2 rounded"
                >
                  <FaHome size={15} />
                  <span>{t('common.dashboard')}</span>
                </Nav.Link>

                {/* Litigant in Person specific links */}
                {user.role === 'LIP' && (
                  <>
                    <Nav.Link
                      active={location.pathname === '/cases' || location.pathname === '/'}
                      onClick={() => handleNavigate('/cases')}
                      className="px-3 py-2 fw-medium d-flex align-items-center gap-2 rounded"
                    >
                      <FaGavel size={14} />
                      <span>{t('common.cases')}</span>
                    </Nav.Link>

                    <Nav.Link
                      active={isActive('/cases/new')}
                      onClick={() => handleNavigate('/cases/new')}
                      className="px-3 py-2 fw-medium d-flex align-items-center gap-2 rounded"
                    >
                      <FaPlus size={13} />
                      <span>{t('common.newCase')}</span>
                    </Nav.Link>

                    <Nav.Link
                      active={isActive('/peer-directory')}
                      onClick={() => handleNavigate('/peer-directory')}
                      className="px-3 py-2 fw-medium d-flex align-items-center gap-2 rounded"
                    >
                      <FaHandshake size={15} />
                      <span>{t('common.legalSupporters')}</span>
                    </Nav.Link>
                  </>
                )}

                {/* Professional user specific links */}
                {user.role !== 'LIP' && (
                  <Nav.Link
                    active={isActive('/peer-directory')}
                    onClick={() => handleNavigate('/peer-directory')}
                    className="px-3 py-2 fw-medium d-flex align-items-center gap-2 rounded"
                  >
                    <FaHandshake size={15} />
                    <span>{t('common.peerDirectory')}</span>
                  </Nav.Link>
                )}

                {/* Component Explorer link */}
                <Nav.Link
                  active={isActive('/components')}
                  onClick={() => handleNavigate('/components')}
                  className="px-3 py-2 fw-medium d-flex align-items-center gap-2 rounded"
                >
                  <FaPuzzlePiece size={14} className="text-primary" />
                  <span>{t('common.components')}</span>
                  <Badge bg="primary-subtle" className="text-primary border border-primary-subtle small ms-1 px-1">
                    {t('common.docs')}
                  </Badge>
                </Nav.Link>


                {/* Responsive Mobile / Desktop Controls (Language + User Profile) */}
                <div className="d-flex align-items-center justify-content-between gap-2 ms-xl-2 pt-2 pt-xl-0 border-top border-top-xl-0">

                  {/* Language Switcher */}
                  <LanguageSwitcher className="my-1 my-xl-0" />

                  {/* User Profile & Menu Dropdown */}
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="light"
                      id="user-profile-dropdown"
                      className="d-flex align-items-center gap-2 border bg-light py-1 px-2 rounded-pill shadow-none"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <FaUserCircle size={18} className="text-primary flex-shrink-0" />
                      <span className="fw-semibold text-dark text-truncate" style={{ maxWidth: '140px' }}>
                        {user.name}
                      </span>
                      <Badge
                        bg={roleBadgeVariant[user.role] || 'secondary'}
                        className={`px-2 py-1 small ${user.role === 'Barrister' ? 'text-dark' : ''}`}
                      >
                        {user.role}
                      </Badge>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="shadow border-0 py-2" style={{ minWidth: 240 }}>
                      <div className="px-3 py-2 border-bottom">
                        <div className="fw-bold text-dark">{user.name}</div>
                        <div className="small text-muted text-truncate">{user.email}</div>
                        <div className="mt-2 d-flex align-items-center gap-1">
                          {user.role !== 'LIP' && (
                            user.isVerified ? (
                              <Badge bg="success" className="px-2 py-1 d-inline-flex align-items-center gap-1">
                                <FaCheckCircle size={10} />
                                <span>{t('common.verified')}</span>
                              </Badge>
                            ) : (
                              <Badge bg="warning" className="text-dark px-2 py-1 d-inline-flex align-items-center gap-1">
                                <FaExclamationCircle size={10} />
                                <span>{t('common.unverified')}</span>
                              </Badge>
                            )
                          )}
                        </div>
                      </div>

                      <Dropdown.Item
                        onClick={() => handleNavigate(user.role === 'LIP' ? '/dashboard' : '/professional-dashboard')}
                        className="d-flex align-items-center gap-2 py-2"
                      >
                        <FaHome className="text-muted" />
                        <span>{t('common.myDashboard')}</span>
                      </Dropdown.Item>

                      <Dropdown.Item
                        href="https://support.mycourtbuddy.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setExpanded(false)}
                        className="d-flex align-items-center justify-content-between py-2 text-dark"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <FaLifeRing className="text-info" />
                          <span>{t('common.supportKnowledgeBase')}</span>
                        </div>
                        <FaExternalLinkAlt size={10} className="text-muted" />
                      </Dropdown.Item>

                      <Dropdown.Divider />

                      <Dropdown.Item
                        onClick={handleLogout}
                        className="d-flex align-items-center gap-2 py-2 text-danger"
                      >
                        <FaSignOutAlt />
                        <span>{t('common.signOut')}</span>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </>
            ) : (
              <>
                <Nav.Link
                  active={isActive('/components')}
                  onClick={() => handleNavigate('/components')}
                  className="px-3 py-2 fw-medium d-flex align-items-center gap-2 rounded"
                >
                  <FaPuzzlePiece size={14} className="text-primary" />
                  <span>{t('common.components')}</span>
                </Nav.Link>
                <Nav.Link
                  href="https://support.mycourtbuddy.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setExpanded(false)}
                  className="px-3 py-2 fw-medium d-flex align-items-center gap-2 rounded text-secondary"
                  title="MyCourtBuddy Support & Knowledge Base"
                >
                  <FaLifeRing size={14} className="text-info" />
                  <span>{t('common.support')}</span>
                  <FaExternalLinkAlt size={10} className="text-muted ms-1" />
                </Nav.Link>
                <div className="d-flex align-items-center gap-2 ms-xl-2 pt-2 pt-xl-0 border-top border-top-xl-0">
                  <LanguageSwitcher />
                  <Nav.Link
                    onClick={() => handleNavigate('/login')}
                    className="btn btn-outline-primary px-3 py-1 text-center flex-fill flex-xl-grow-0"
                  >
                    {t('common.signIn')}
                  </Nav.Link>
                </div>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
