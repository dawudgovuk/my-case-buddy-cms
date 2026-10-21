import { useState } from 'react'
import { Navbar, Container, Nav, Dropdown, Badge, Button } from 'react-bootstrap'
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
  FaCheckCircle,
  FaExclamationCircle,
  FaLifeRing,
  FaExternalLinkAlt,
  FaUserCog,
  FaCompass,
} from 'react-icons/fa'
import type { UserRole } from '../../types/domain'
import { WELCOME_ROUTE } from '../../utils/authConstants'
import { isComponentShowcaseEnabled } from '../../utils/featureFlags'

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

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'LIP':
        return t('roles.lip')
      case 'McKenzieFriend':
        return t('roles.mckenzieFriend')
      case 'Solicitor':
        return t('roles.solicitor')
      case 'Barrister':
        return t('roles.barrister')
      default:
        return role
    }
  }

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
    if (!user.isVerified) return WELCOME_ROUTE
    return user.role === 'LIP' ? '/dashboard' : '/professional-dashboard'
  }

  const isDashboardActive =
    location.pathname === '/dashboard' ||
    location.pathname === '/professional-dashboard' ||
    (location.pathname === '/' && Boolean(user?.isVerified))

  const isCasesActive =
    location.pathname.startsWith('/cases') && location.pathname !== '/cases/new'

  const isDirectoryActive =
    location.pathname.startsWith('/peer-directory')

  const isGuidanceActive =
    location.pathname.startsWith('/guidance')

  const showComponents = isComponentShowcaseEnabled()
  const isComponentsActive = location.pathname.startsWith('/components')

  const safeName = user?.name || user?.email?.split('@')[0] || 'User'
  const userInitials = (user?.name || user?.email || 'U')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Navbar
      expand="xl"
      expanded={expanded}
      onToggle={(exp) => setExpanded(exp)}
      fixed="top"
      className={`app-navbar ${className}`}
      style={{ zIndex: 1030, backdropFilter: 'blur(12px)' }}
    >
      <Container fluid="xl" className="px-3 px-md-4">
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
          <Nav className="ms-auto align-items-stretch align-items-xl-center flex-xl-nowrap gap-1 my-2 my-xl-0">
            {user ? (
              <>
                {/* App navigation is available once the email is verified */}
                {user.isVerified && (
                  <>
                    {/* Dashboard Nav Link */}
                    <Nav.Link
                      active={isDashboardActive}
                      onClick={() => handleNavigate(getHomeRoute())}
                      className="px-2 px-xxl-2.5 py-1.5 fw-medium d-flex align-items-center gap-1.5 rounded text-nowrap"
                    >
                      <FaHome size={14} />
                      <span>{t('common.dashboard')}</span>
                    </Nav.Link>

                    {/* Litigant in Person specific links */}
                    {user.role === 'LIP' && (
                      <>
                        <Nav.Link
                          active={isCasesActive}
                          onClick={() => handleNavigate('/cases')}
                          className="px-2 px-xxl-2.5 py-1.5 fw-medium d-flex align-items-center gap-1.5 rounded text-nowrap"
                        >
                          <FaGavel size={14} />
                          <span>{t('common.cases')}</span>
                        </Nav.Link>

                        <Nav.Link
                          active={isGuidanceActive}
                          onClick={() => handleNavigate('/guidance')}
                          className="px-2 px-xxl-2.5 py-1.5 fw-medium d-flex align-items-center gap-1.5 rounded text-nowrap"
                        >
                          <FaCompass size={14} />
                          <span>{t('common.roadmaps')}</span>
                        </Nav.Link>

                        <Nav.Link
                          active={isDirectoryActive}
                          onClick={() => handleNavigate('/peer-directory')}
                          className="px-2 px-xxl-2.5 py-1.5 fw-medium d-flex align-items-center gap-1.5 rounded text-nowrap"
                        >
                          <FaHandshake size={14} />
                          <span>{t('common.legalSupporters')}</span>
                        </Nav.Link>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleNavigate('/cases/new')}
                          className="d-none d-xl-inline-flex align-items-center gap-1 ms-xl-1 px-2.5 py-1 rounded-pill shadow-xs fw-semibold text-nowrap"
                          style={{ fontSize: '0.8125rem' }}
                        >
                          <FaPlus size={10} />
                          <span>{t('common.newCase')}</span>
                        </Button>
                        <Nav.Link
                          onClick={() => handleNavigate('/cases/new')}
                          className="d-xl-none px-3 py-2 fw-medium d-flex align-items-center gap-2 rounded text-primary fw-semibold"
                        >
                          <FaPlus size={13} />
                          <span>{t('common.newCase')}</span>
                        </Nav.Link>
                      </>
                    )}

                    {/* Professional user specific links */}
                    {user.role !== 'LIP' && (
                      <>
                        <Nav.Link
                          active={isCasesActive}
                          onClick={() => handleNavigate('/professional-dashboard')}
                          className="px-2 px-xxl-2.5 py-1.5 fw-medium d-flex align-items-center gap-1.5 rounded text-nowrap"
                        >
                          <FaGavel size={14} />
                          <span>{t('common.assignedCases')}</span>
                        </Nav.Link>

                        <Nav.Link
                          active={isGuidanceActive}
                          onClick={() => handleNavigate('/guidance')}
                          className="px-2 px-xxl-2.5 py-1.5 fw-medium d-flex align-items-center gap-1.5 rounded text-nowrap"
                        >
                          <FaCompass size={14} />
                          <span>{t('common.roadmaps')}</span>
                        </Nav.Link>

                        <Nav.Link
                          active={isDirectoryActive}
                          onClick={() => handleNavigate('/peer-directory')}
                          className="px-2 px-xxl-2.5 py-1.5 fw-medium d-flex align-items-center gap-1.5 rounded text-nowrap"
                        >
                          <FaHandshake size={14} />
                          <span>{t('common.peerDirectory')}</span>
                        </Nav.Link>
                      </>
                    )}

                    {/* Developer Components Page (Controlled via VITE_ENABLE_COMPONENT_SHOWCASE) */}
                    {showComponents && (
                      <Nav.Link
                        active={isComponentsActive}
                        onClick={() => handleNavigate('/components')}
                        className="px-2 px-xxl-2.5 py-1.5 fw-medium d-flex align-items-center gap-1 rounded text-nowrap"
                        title="Component Showcase (Development Mode)"
                      >
                        <FaPuzzlePiece size={13} className="text-warning" />
                        <span className="d-none d-xxl-inline">{t('common.components')}</span>
                        <span
                          className="badge bg-warning text-dark px-1.5 py-0.5 rounded fw-bold"
                          style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}
                        >
                          DEV
                        </span>
                      </Nav.Link>
                    )}
                  </>
                )}

                {/* Responsive Mobile / Desktop Controls (Language + User Profile) */}
                <div className="d-flex align-items-center justify-content-between gap-1.5 ms-xl-2 pt-2 pt-xl-0 border-top border-top-xl-0">
                  {/* Language Switcher */}
                  <LanguageSwitcher className="my-1 my-xl-0" />

                  {/* User Profile & Menu Dropdown */}
                  <Dropdown align="end">
                    <Dropdown.Toggle
                      variant="light"
                      id="user-profile-dropdown"
                      className="d-flex align-items-center gap-1.5 border bg-white py-1 ps-1 pe-2.5 rounded-pill shadow-none text-nowrap"
                      style={{ fontSize: '0.85rem', minHeight: 38 }}
                    >
                      <span
                        className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
                        style={{ width: 28, height: 28, background: 'var(--mcb-primary-soft)', color: 'var(--mcb-primary)', fontSize: '0.75rem' }}
                        aria-hidden="true"
                      >
                        {userInitials}
                      </span>
                      <span className="fw-semibold text-dark text-truncate" style={{ maxWidth: '105px' }}>
                        {safeName}
                      </span>
                      <Badge bg={roleBadgeVariant[user.role] || 'secondary'} className="d-none d-xxl-inline-flex">
                        {getRoleLabel(user.role)}
                      </Badge>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="shadow border-0 py-2" style={{ minWidth: 240 }}>
                      <div className="px-3 py-2 border-bottom">
                        <div className="fw-bold text-dark">{safeName}</div>
                        <div className="small text-muted text-truncate">{user.email}</div>
                        <div className="small mt-1">{getRoleLabel(user.role)}</div>
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
                        onClick={() => handleNavigate(getHomeRoute())}
                        className="d-flex align-items-center gap-2 py-2"
                      >
                        <FaHome className="text-muted" />
                        <span>{t('common.myDashboard')}</span>
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => handleNavigate('/profile')}
                        className="d-flex align-items-center gap-2 py-2"
                      >
                        <FaUserCog className="text-muted" />
                        <span>{t('common.myProfile')}</span>
                      </Dropdown.Item>

                      <Dropdown.Item
                        onClick={() => handleNavigate('/guidance')}
                        className="d-flex align-items-center gap-2 py-2"
                      >
                        <FaCompass className="text-muted" />
                        <span>{t('common.legalRoadmaps')}</span>
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

                      {showComponents && (
                        <>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            onClick={() => handleNavigate('/components')}
                            className="d-flex align-items-center gap-2 py-1.5 text-muted small"
                          >
                            <FaPuzzlePiece size={12} />
                            <span>{t('common.componentShowcase')}</span>
                          </Dropdown.Item>
                        </>
                      )}

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
                  active={isGuidanceActive}
                  onClick={() => handleNavigate('/guidance')}
                  className="px-2 px-xxl-2.5 py-1.5 fw-medium d-flex align-items-center gap-1.5 rounded text-secondary text-nowrap"
                  title="UK Family Court Procedural Roadmaps"
                >
                  <FaCompass size={14} className="text-primary" />
                  <span>{t('common.roadmaps')}</span>
                </Nav.Link>

                {showComponents && (
                  <Nav.Link
                    active={isComponentsActive}
                    onClick={() => handleNavigate('/components')}
                    className="px-2 px-xxl-2.5 py-1.5 fw-medium d-flex align-items-center gap-1 rounded text-secondary text-nowrap"
                    title="Component Showcase (Development Mode)"
                  >
                    <FaPuzzlePiece size={13} className="text-warning" />
                    <span>{t('common.components')}</span>
                    <span
                      className="badge bg-warning text-dark px-1.5 py-0.5 rounded fw-bold"
                      style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}
                    >
                      DEV
                    </span>
                  </Nav.Link>
                )}

                <Nav.Link
                  href="https://support.mycourtbuddy.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setExpanded(false)}
                  className="px-2 px-xxl-2.5 py-1.5 fw-medium d-flex align-items-center gap-1.5 rounded text-secondary text-nowrap"
                  title="MyCourtBuddy Support & Knowledge Base"
                >
                  <FaLifeRing size={14} className="text-info" />
                  <span>{t('common.support')}</span>
                  <FaExternalLinkAlt size={10} className="text-muted ms-0.5" />
                </Nav.Link>
                <div className="d-flex align-items-center gap-2 ms-xl-2 pt-2 pt-xl-0 border-top border-top-xl-0">
                  <LanguageSwitcher />
                  {location.pathname !== '/login' && (
                    <Nav.Link
                      onClick={() => handleNavigate('/login')}
                      className="btn btn-primary btn-sm px-3 text-center flex-fill flex-xl-grow-0 text-white"
                    >
                      {t('common.signIn')}
                    </Nav.Link>
                  )}
                </div>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
