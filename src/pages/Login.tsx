import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
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
          <Button type="submit" variant="contained">Sign in</Button>
        </Stack>
      </Paper>
    </Box>
  )
}


