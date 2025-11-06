import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate, useParams } from 'react-router-dom'
import type { UserRole } from '../types/domain'
import { saveUsers, listUsers } from '../services/auth'
import { generateId } from '../services/storage'

export default function Register() {
  const navigate = useNavigate()
  const { role } = useParams<{ role: string }>()
  const { users, login } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [firm, setFirm] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [error, setError] = useState('')

  const userRole = role as UserRole | undefined

  if (!userRole || !['McKenzieFriend', 'Solicitor', 'Barrister'].includes(userRole)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Typography>Invalid registration type</Typography>
      </Box>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required')
      return
    }

    // Check if email already exists
    const existingUsers = listUsers()
    if (existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('An account with this email already exists')
      return
    }

    // Create new user
    const newUser = {
      id: generateId('user'),
      name: name.trim(),
      email: email.trim(),
      role: userRole,
      ...(firm.trim() && { firm: firm.trim() }),
      ...(registrationNumber.trim() && { registrationNumber: registrationNumber.trim() }),
    }

    const updatedUsers = [...existingUsers, newUser]
    saveUsers(updatedUsers)
    useAuthStore.setState({ users: updatedUsers })
    
    // Auto-login
    login(newUser.id)
    navigate('/dashboard')
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Paper sx={{ p: 3, width: 500, maxWidth: '90%' }} component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Typography variant="h5">Register as {userRole}</Typography>
          <Typography variant="body2" color="text.secondary">
            Create your account to start managing cases
          </Typography>
          
          {error && (
            <Typography color="error" variant="body2">{error}</Typography>
          )}

          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />

          {(userRole === 'Solicitor' || userRole === 'Barrister') && (
            <>
              <TextField
                label="Firm/Chambers"
                value={firm}
                onChange={(e) => setFirm(e.target.value)}
                fullWidth
              />

              <TextField
                label="Registration Number"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                fullWidth
                helperText="Your professional registration number"
              />
            </>
          )}

          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" fullWidth>
              Register
            </Button>
            <Button variant="outlined" onClick={() => navigate('/login')} fullWidth>
              Back to Login
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}
