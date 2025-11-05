import { useMemo, useState } from 'react'
import { useCasesStore } from '../store/casesStore'
import { Box, Button, Chip, IconButton, Paper, Stack, TextField, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { useAuthStore } from '../store/authStore'

export default function CasesList() {
  const { cases, remove } = useCasesStore()
  const { user } = useAuthStore()
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    const visible = user ? cases.filter(c => {
      const members = c.members || []
      return members.some(m => m.userId === user.id)
    }) : []
    if (!term) return visible
    return visible.filter((c) =>
      [c.id, c.title, c.caseType, c.status, c.allocatedJudge]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    )
  }, [cases, q, user])

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Cases</Typography>
        <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to="/cases/new">
          New Case
        </Button>
      </Stack>
      <TextField
        label="Search cases"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Case number, title, judge, status..."
      />

      <Stack spacing={1}>
        {filtered.length === 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography>No cases found. Create your first case.</Typography>
          </Paper>
        )}

        {filtered.map((c) => (
          <Paper key={c.id} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flexGrow: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => navigate(`/cases/${c.id}`)}>
              <Typography variant="subtitle1" noWrap>{c.id} — {c.title}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {c.court} • {c.caseType} • Judge: {c.allocatedJudge || 'Unassigned'}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip size="small" label={c.status} color={c.status === 'Open' ? 'success' : c.status === 'Concluded' ? 'default' : 'warning'} />
                {typeof c.childrenInvolved === 'number' && (
                  <Chip size="small" label={`${c.childrenInvolved} child${c.childrenInvolved === 1 ? '' : 'ren'}`} />
                )}
                <Chip size="small" label={`Parties: ${c.parties.length}`} />
                <Chip size="small" label={`Hearings: ${c.hearings.length}`} />
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => navigate(`/cases/${c.id}/edit`)}>Edit</Button>
              <IconButton color="error" onClick={() => remove(c.id)} aria-label={`Delete case ${c.id}`}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  )
}


