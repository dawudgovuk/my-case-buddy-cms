import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getInviteByToken, updateInvite, getCase } from '../services/storage'
import { useCasesStore } from '../store/casesStore'
import type { CaseInvite } from '../types/domain'

export default function InviteAccept() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const { user } = useAuthStore()
  const { getById, addOrUpdate } = useCasesStore()
  const [invite, setInvite] = useState<CaseInvite | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link')
      setLoading(false)
      return
    }

    const foundInvite = getInviteByToken(token)
    if (!foundInvite) {
      setError('Invite link not found or has expired')
      setLoading(false)
      return
    }

    if (foundInvite.usedAt) {
      setError('This invite link has already been used')
      setLoading(false)
      return
    }

    if (foundInvite.expiresAt && new Date(foundInvite.expiresAt) < new Date()) {
      setError('This invite link has expired')
      setLoading(false)
      return
    }

    setInvite(foundInvite)
    setLoading(false)
  }, [token])

  function handleAccept() {
    if (!invite || !user) return

    // Check if user role matches invite role
    if (user.role !== invite.role) {
      setError(`This invite is for ${invite.role} role, but you are registered as ${user.role}`)
      return
    }

    // Get the case
    const caseData = getCase(invite.caseId)
    if (!caseData) {
      setError('Case not found')
      return
    }

    // Check if user is already a member
    if (caseData.members?.some(m => m.userId === user.id)) {
      setError('You are already a member of this case')
      return
    }

    // Add user as a member
    const updatedCase = {
      ...caseData,
      members: [
        ...(caseData.members || []),
        {
          userId: user.id,
          role: invite.role as any,
          invitedAt: new Date().toISOString(),
          invitedBy: invite.createdBy,
        },
      ],
    }

    addOrUpdate(updatedCase)

    // Mark invite as used
    updateInvite(invite.id, {
      usedAt: new Date().toISOString(),
      usedBy: user.id,
    })

    // Navigate to case
    navigate(`/cases/${invite.caseId}`)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Card sx={{ p: 3, maxWidth: 500 }}>
          <Stack spacing={2}>
            <Typography variant="h6" color="error">Error</Typography>
            <Typography>{error}</Typography>
            <Button variant="contained" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </Stack>
        </Card>
      </Box>
    )
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Card sx={{ p: 3, maxWidth: 500 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Please Log In</Typography>
            <Typography>
              You need to be logged in to accept this invite. If you don't have an account, please register first.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={() => navigate(`/register/${invite?.role}`)}>
                Register as {invite?.role}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/login')}>
                Login
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Box>
    )
  }

  const caseData = invite ? getCase(invite.caseId) : null

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Card sx={{ p: 3, maxWidth: 500 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Case Invitation</Typography>
          <Typography>
            You have been invited to join a case as a <strong>{invite?.role}</strong>.
          </Typography>
          {caseData && (
            <Box>
              <Typography variant="subtitle2">Case Details:</Typography>
              <Typography variant="body2">{caseData.id} — {caseData.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {caseData.court} • {caseData.caseType}
              </Typography>
            </Box>
          )}
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleAccept} fullWidth>
              Accept Invitation
            </Button>
            <Button variant="outlined" onClick={() => navigate('/dashboard')} fullWidth>
              Decline
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Box>
  )
}
