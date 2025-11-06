import { Box, Button, Divider, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const { user, users, login, ensureDemoUsers } = useAuthStore()
  const [userId, setUserId] = useState('')

  useEffect(() => {
    ensureDemoUsers()
  }, [ensureDemoUsers])

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    login(userId)
    navigate('/')
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Paper sx={{ p: 3, width: 420, maxWidth: '90%' }} component="form" onSubmit={onSubmit}>
        <Stack spacing={2}>
          <Typography variant="h5">MyCaseBuddy</Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in as a demo user. McKenzie Friends can see multiple assigned cases; Litigants in Person see only their own.
          </Typography>
          <TextField select label="Choose user" value={userId} onChange={(e) => setUserId(e.target.value)} required>
            {users.map(u => (
              <MenuItem key={u.id} value={u.id}>{u.name} — {u.role}</MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained" fullWidth>Sign in</Button>
          
          <Divider sx={{ my: 2 }}>Or</Divider>
          
          <Typography variant="body2" color="text.secondary" align="center">
            Need to register?
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="outlined" size="small" onClick={() => navigate('/register/LIP')} sx={{ flex: '1 1 45%' }}>
              Register as LIP
            </Button>
            <Button variant="outlined" size="small" onClick={() => navigate('/register/McKenzieFriend')} sx={{ flex: '1 1 45%' }}>
              Register as McKenzie Friend
            </Button>
            <Button variant="outlined" size="small" onClick={() => navigate('/register/Solicitor')} sx={{ flex: '1 1 45%' }}>
              Register as Solicitor
            </Button>
            <Button variant="outlined" size="small" onClick={() => navigate('/register/Barrister')} sx={{ flex: '1 1 45%' }}>
              Register as Barrister
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}


