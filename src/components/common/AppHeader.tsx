import { Navbar, Container, Nav, Dropdown, Badge } from 'react-bootstrap'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Logo from './Logo'
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

  const handleLogout = () => {
    logout()
    navigate('/login')
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
      expand="lg"
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
          onClick={() => navigate(getHomeRoute())}
          className="d-flex align-items-center py-1"
          style={{ cursor: 'pointer' }}
        >
          <Logo />
        </Navbar.Brand>

        {/* Responsive Mobile Toggle Button */}
        <Navbar.Toggle aria-controls="main-navbar-nav" className="border-0 shadow-none p-1" />

        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="ms-auto align-items-center gap-1 my-2 my-lg-0">
            {user ? (
              <>
                {/* Dashboard Nav Link */}
                <Nav.Link
                  active={isActive(user.role === 'LIP' ? '/dashboard' : '/professional-dashboard')}
                  onClick={() => navigate(user.role === 'LIP' ? '/dashboard' : '/professional-dashboard')}
                  className="px-3 py-2 fw-medium d-flex align-items-center gap-1 rounded"
                >
                  <FaHome size={15} />
                  <span>Dashboard</span>
                </Nav.Link>

                {/* Litigant in Person specific links */}
                {user.role === 'LIP' && (
                  <>
                    <Nav.Link
                      active={location.pathname === '/'}
                      onClick={() => navigate('/')}
                      className="px-3 py-2 fw-medium d-flex align-items-center gap-1 rounded"
                    >
                      <FaGavel size={14} />
                      <span>Cases</span>
                    </Nav.Link>

                    <Nav.Link
                      active={isActive('/cases/new')}
                      onClick={() => navigate('/cases/new')}
                      className="px-3 py-2 fw-medium d-flex align-items-center gap-1 rounded"
                    >
                      <FaPlus size={13} />
                      <span>New Case</span>
                    </Nav.Link>

                    <Nav.Link
                      active={isActive('/peer-directory')}
                      onClick={() => navigate('/peer-directory')}
                      className="px-3 py-2 fw-medium d-flex align-items-center gap-1 rounded"
                    >
                      <FaHandshake size={15} />
                      <span>Legal Supporters</span>
                    </Nav.Link>
                  </>
                )}

                {/* Professional user specific links */}
                {user.role !== 'LIP' && (
                  <Nav.Link
                    active={isActive('/peer-directory')}
                    onClick={() => navigate('/peer-directory')}
                    className="px-3 py-2 fw-medium d-flex align-items-center gap-1 rounded"
                  >
                    <FaHandshake size={15} />
                    <span>Peer Directory</span>
                  </Nav.Link>
                )}

                {/* Component Explorer link */}
                <Nav.Link
                  active={isActive('/components')}
                  onClick={() => navigate('/components')}
                  className="px-3 py-2 fw-medium d-flex align-items-center gap-1 rounded"
                >
                  <FaPuzzlePiece size={14} className="text-primary" />
                  <span>Components</span>
                  <Badge bg="primary-subtle" className="text-primary border border-primary-subtle small ms-1 px-1">
                    Docs
                  </Badge>
                </Nav.Link>

                {/* User Profile & Menu Dropdown */}
                <Dropdown align="end" className="ms-lg-2">
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
                              <span>Verified Professional</span>
                            </Badge>
                          ) : (
                            <Badge bg="warning" className="text-dark px-2 py-1 d-inline-flex align-items-center gap-1">
                              <FaExclamationCircle size={10} />
                              <span>Email Unverified</span>
                            </Badge>
                          )
                        )}
                      </div>
                    </div>

                    <Dropdown.Item
                      onClick={() => navigate(user.role === 'LIP' ? '/dashboard' : '/professional-dashboard')}
                      className="d-flex align-items-center gap-2 py-2"
                    >
                      <FaHome className="text-muted" />
                      <span>My Dashboard</span>
                    </Dropdown.Item>

                    <Dropdown.Divider />

                    <Dropdown.Item
                      onClick={handleLogout}
                      className="d-flex align-items-center gap-2 py-2 text-danger"
                    >
                      <FaSignOutAlt />
                      <span>Sign Out</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link
                  active={isActive('/components')}
                  onClick={() => navigate('/components')}
                  className="px-3 py-2 fw-medium d-flex align-items-center gap-1 rounded"
                >
                  <FaPuzzlePiece size={14} className="text-primary" />
                  <span>Components</span>
                </Nav.Link>
                <Nav.Link
                  onClick={() => navigate('/login')}
                  className="btn btn-outline-primary ms-lg-2 px-3 py-1"
                >
                  Sign In
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
