import { useEffect, useMemo, useState } from 'react'
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import type { FamilyCase } from '../types/domain'
import { generateId } from '../services/storage'
import { useCasesStore } from '../store/casesStore'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const courts = ['Family Court', 'High Court Family Division'] as const
const types = [
  'Public Law (Care Proceedings)',
  'Private Law (Child Arrangements)',
  'Domestic Abuse (Non-Molestation)',
  'Financial Remedies',
  'Adoption',
  'Other',
] as const
const statuses = ['Open', 'Stayed', 'Concluded'] as const

export default function CaseForm() {
  const navigate = useNavigate()
  const { caseId } = useParams()
  const { getById, addOrUpdate } = useCasesStore()
  const { user } = useAuthStore()

  const existing = useMemo(() => (caseId ? getById(caseId) : undefined), [caseId, getById])

  const [form, setForm] = useState<FamilyCase>(() =>
    existing ?? {
      id: '',
      title: '',
      court: 'Family Court',
      caseType: 'Private Law (Child Arrangements)',
      status: 'Open',
      startedAt: new Date().toISOString().slice(0, 10),
      allocatedJudge: '',
      childrenInvolved: undefined,
      parties: [],
      hearings: [],
      orders: [],
      documents: [],
      notes: [],
      lastUpdatedAt: new Date().toISOString(),
    },
  )

  useEffect(() => {
    if (existing) setForm(existing)
  }, [existing])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedTitle = form.title.trim()
    const trimmedJudge = form.allocatedJudge?.trim() || undefined
    const id = existing?.id || form.id || generateId('CASE')
    const payload: FamilyCase = {
      ...form,
      id,
      title: trimmedTitle,
      allocatedJudge: trimmedJudge,
      startedAt: form.startedAt,
      members: existing?.members ?? (user ? [{ userId: user.id, role: 'Owner' }] : []),
    }
    addOrUpdate(payload)
    navigate(`/cases/${id}`)
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Typography variant="h5">{existing ? 'Edit Case' : 'Create New Case'}</Typography>
        <TextField
          label="Case title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <TextField
          label="Case number (auto if left blank)"
          value={form.id}
          onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
          placeholder="e.g., FC-23-001234"
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="court">Court</InputLabel>
            <Select labelId="court" label="Court" value={form.court} onChange={(e) => setForm((f) => ({ ...f, court: e.target.value as any }))}>
              {courts.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="caseType">Case Type</InputLabel>
            <Select labelId="caseType" label="Case Type" value={form.caseType} onChange={(e) => setForm((f) => ({ ...f, caseType: e.target.value as any }))}>
              {types.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="status">Status</InputLabel>
            <Select labelId="status" label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}>
              {statuses.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Started on"
            type="date"
            value={form.startedAt}
            onChange={(e) => setForm((f) => ({ ...f, startedAt: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Allocated judge"
            value={form.allocatedJudge || ''}
            onChange={(e) => setForm((f) => ({ ...f, allocatedJudge: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Children involved"
            type="number"
            value={form.childrenInvolved ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, childrenInvolved: e.target.value === '' ? undefined : Number(e.target.value) }))}
            fullWidth
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button type="submit" variant="contained">Save</Button>
          <Button variant="outlined" onClick={() => navigate(existing ? `/cases/${existing.id}` : '/')}>Cancel</Button>
        </Stack>
      </Stack>
    </Box>
  )
}


