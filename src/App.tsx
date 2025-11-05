import React from 'react'
import { AppBar, Box, Button, Container, Menu, MenuItem, Toolbar, Typography } from '@mui/material'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import CasesList from './pages/CasesList'
import CaseForm from './pages/CaseForm'
import CaseDetails from './pages/CaseDetails'
import Login from './pages/Login'
import { useAuthStore } from './store/authStore'

function Shell() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            MyCaseBuddy
          </Typography>
          {user && (
            <>
              <Button color="inherit" onClick={() => navigate('/')}>Cases</Button>
              <Button color="inherit" onClick={() => navigate('/cases/new')}>New Case</Button>
            </>
          )}
          {user ? (
            <>
              <Button color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} aria-controls={open ? 'user-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined}>
                {user.name} ({user.role})
              </Button>
              <Menu id="user-menu" anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => { setAnchorEl(null); logout(); navigate('/login') }}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3, flexGrow: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={user ? <CasesList /> : <Navigate to="/login" replace />} />
          <Route path="/cases/new" element={user ? <CaseForm /> : <Navigate to="/login" replace />} />
          <Route path="/cases/:caseId" element={user ? <CaseDetails /> : <Navigate to="/login" replace />} />
          <Route path="/cases/:caseId/edit" element={user ? <CaseForm /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Typography>Not found</Typography>} />
        </Routes>
      </Container>
      <Box component="footer" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
        <Typography variant="caption">For demonstration purposes only. Not legal advice or a court system.</Typography>
      </Box>
    </Box>
  )
}

export default function App() {
  return <Shell />
}
