import { useMemo, useState } from 'react'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import { useCasesStore } from '../store/casesStore'
import { Box, Button, Chip, Divider, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import type { FamilyCase, Party, Hearing, DocumentRecord, OrderRecord } from '../types/domain'
import { generateId } from '../services/storage'

function PartiesTab({ caseId }: { caseId: string }) {
  const store = useCasesStore()
  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase
  const [role, setRole] = useState<Party['role']>('Applicant')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [solicitorFirm, setSolicitorFirm] = useState('')

  function addParty() {
    if (!firstName.trim() || !lastName.trim()) return
    const updated: FamilyCase = {
      ...current,
      parties: [
        ...current.parties,
        {
          id: generateId('PTY'),
          role,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          solicitorFirm: solicitorFirm.trim() || undefined,
        },
      ],
    }
    store.addOrUpdate(updated)
    setFirstName(''); setLastName(''); setSolicitorFirm('')
  }
  return (
    <Stack spacing={1}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Add party</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value as Party['role'])} fullWidth>
            {['Applicant','Respondent','Child','Guardian','Intervener'].map(r => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </TextField>
          <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
          <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
          <TextField label="Solicitor firm" value={solicitorFirm} onChange={(e) => setSolicitorFirm(e.target.value)} fullWidth />
          <Button variant="contained" onClick={addParty} disabled={!firstName || !lastName}>Add</Button>
        </Stack>
      </Paper>
      {fc.parties.length === 0 && <Typography color="text.secondary">No parties recorded.</Typography>}
      {fc.parties.map((p) => (
        <Paper key={p.id} sx={{ p: 2 }}>
          <Typography fontWeight={600}>{p.role}: {p.firstName} {p.lastName}</Typography>
          <Typography variant="body2" color="text.secondary">{p.solicitorFirm ? `Solicitor: ${p.solicitorFirm}` : 'No solicitor'}</Typography>
        </Paper>
      ))}
    </Stack>
  )
}

function HearingsTab({ caseId }: { caseId: string }) {
  const store = useCasesStore()
  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase
  const [type, setType] = useState<Hearing['type']>('Case Management')
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [time, setTime] = useState<string>('10:00')
  const [location, setLocation] = useState<string>('')
  const [judge, setJudge] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  function addHearing() {
    if (!date) return
    const updated: FamilyCase = {
      ...current,
      hearings: [
        ...current.hearings,
        { id: generateId('HRG'), type, date, time: time || undefined, location: location || undefined, judge: judge || undefined, notes: notes || undefined },
      ],
    }
    store.addOrUpdate(updated)
    setLocation(''); setJudge(''); setNotes('')
  }
  return (
    <Stack spacing={1}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Schedule hearing</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value as Hearing['type'])} fullWidth>
            {['Case Management','Directions','Fact-Finding','Final','Other'].map(t => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
          <TextField type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
          <TextField type="time" label="Time" value={time} onChange={(e) => setTime(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
          <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} fullWidth />
          <TextField label="Judge" value={judge} onChange={(e) => setJudge(e.target.value)} fullWidth />
          <Button variant="contained" onClick={addHearing} disabled={!date}>Add</Button>
        </Stack>
        <TextField sx={{ mt: 2 }} multiline minRows={2} label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth />
      </Paper>
      {fc.hearings.length === 0 && <Typography color="text.secondary">No hearings scheduled.</Typography>}
      {fc.hearings.map((h) => (
        <Paper key={h.id} sx={{ p: 2 }}>
          <Typography fontWeight={600}>{h.type} — {h.date}{h.time ? ` ${h.time}` : ''}</Typography>
          <Typography variant="body2" color="text.secondary">{h.location || 'Location TBC'}{h.judge ? ` • Judge: ${h.judge}` : ''}</Typography>
          {h.notes && <Typography variant="body2" sx={{ mt: 1 }}>{h.notes}</Typography>}
        </Paper>
      ))}
    </Stack>
  )
}

function DocumentsTab({ caseId }: { caseId: string }) {
  const store = useCasesStore()
  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase
  const [title, setTitle] = useState('')
  const [type, setType] = useState<DocumentRecord['type']>('Application')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')

  function addDocument() {
    if (!title.trim()) return
    const updated: FamilyCase = {
      ...current,
      documents: [
        ...current.documents,
        { id: generateId('DOC'), title: title.trim(), type, uploadedAt: new Date().toISOString(), url: url.trim() || '#', notes: notes.trim() || undefined },
      ],
    }
    store.addOrUpdate(updated)
    setTitle(''); setUrl(''); setNotes('')
  }
  return (
    <Stack spacing={1}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Add document (URL)</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
          <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value as DocumentRecord['type'])} fullWidth>
            {['Application','Statement','Medical','Expert Report','Bundle','Order','Other'].map(t => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
          <TextField label="URL" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." fullWidth />
          <Button variant="contained" onClick={addDocument} disabled={!title}>Add</Button>
        </Stack>
        <TextField sx={{ mt: 2 }} multiline minRows={2} label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth />
      </Paper>
      {fc.documents.length === 0 && <Typography color="text.secondary">No documents uploaded.</Typography>}
      {fc.documents.map((d) => (
        <Paper key={d.id} sx={{ p: 2 }}>
          <Typography fontWeight={600}>{d.title}</Typography>
          <Typography variant="body2" color="text.secondary">{d.type} • Uploaded {new Date(d.uploadedAt).toLocaleString()}</Typography>
        </Paper>
      ))}
    </Stack>
  )
}

function OrdersTab({ caseId }: { caseId: string }) {
  const store = useCasesStore()
  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase
  const [type, setType] = useState<OrderRecord['type']>('Child Arrangements Order')
  const [dateMade, setDateMade] = useState<string>(new Date().toISOString().slice(0,10))
  const [summary, setSummary] = useState<string>('')
  const [expiresOn, setExpiresOn] = useState<string>('')

  function addOrder() {
    if (!dateMade || !summary.trim()) return
    const updated: FamilyCase = {
      ...current,
      orders: [
        ...current.orders,
        { id: generateId('ORD'), type, dateMade, summary: summary.trim(), expiresOn: expiresOn || undefined },
      ],
    }
    store.addOrUpdate(updated)
    setSummary(''); setExpiresOn('')
  }
  return (
    <Stack spacing={1}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Record order</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value as OrderRecord['type'])} fullWidth>
            {['Child Arrangements Order','Care Order','Supervision Order','Non-Molestation Order','Prohibited Steps Order','Specific Issue Order','Financial Remedies Order','Other'].map(t => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
          <TextField type="date" label="Date made" value={dateMade} onChange={(e) => setDateMade(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
          <TextField type="date" label="Expires on (optional)" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
          <Button variant="contained" onClick={addOrder} disabled={!summary || !dateMade}>Add</Button>
        </Stack>
        <TextField sx={{ mt: 2 }} multiline minRows={2} label="Summary" value={summary} onChange={(e) => setSummary(e.target.value)} fullWidth />
      </Paper>
      {fc.orders.length === 0 && <Typography color="text.secondary">No orders recorded.</Typography>}
      {fc.orders.map((o) => (
        <Paper key={o.id} sx={{ p: 2 }}>
          <Typography fontWeight={600}>{o.type} — {o.dateMade}</Typography>
          <Typography variant="body2" color="text.secondary">{o.summary}</Typography>
        </Paper>
      ))}
    </Stack>
  )
}

function NotesTab({ caseId }: { caseId: string }) {
  const store = useCasesStore()
  const fc = store.getById(caseId)
  if (!fc) return null
  const current = fc as FamilyCase
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')

  function addNote() {
    if (!text.trim()) return
    const updated: FamilyCase = {
      ...current,
      notes: [
        ...current.notes,
        { id: generateId('NOTE'), createdAt: new Date().toISOString(), author: author.trim() || 'User', text: text.trim() },
      ],
    }
    store.addOrUpdate(updated)
    setText('')
  }
  return (
    <Stack spacing={1}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Add note</Typography>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Author (optional)" value={author} onChange={(e) => setAuthor(e.target.value)} fullWidth />
          </Stack>
          <TextField multiline minRows={3} label="Note" value={text} onChange={(e) => setText(e.target.value)} fullWidth />
          <Button variant="contained" onClick={addNote} disabled={!text.trim()}>Add</Button>
        </Stack>
      </Paper>
      {fc.notes.length === 0 && <Typography color="text.secondary">No notes yet.</Typography>}
      {fc.notes.map((n) => (
        <Paper key={n.id} sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">{new Date(n.createdAt).toLocaleString()} — {n.author}</Typography>
          <Typography sx={{ mt: 0.5 }}>{n.text}</Typography>
        </Paper>
      ))}
    </Stack>
  )
}

export default function CaseDetails() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const { getById } = useCasesStore()
  const fc = useMemo(() => (caseId ? getById(caseId) : undefined), [caseId, getById])
  const [tab, setTab] = useState(0)

  if (!caseId || !fc) return <Typography>Case not found.</Typography>

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5">{fc.id} — {fc.title}</Typography>
          <Typography variant="body2" color="text.secondary">{fc.court} • {fc.caseType} • Started {fc.startedAt}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip size="small" label={fc.status} />
            <Chip size="small" label={`Parties: ${fc.parties.length}`} />
            <Chip size="small" label={`Hearings: ${fc.hearings.length}`} />
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate(`/cases/${fc.id}/edit`)}>Edit</Button>
          <Button component={RouterLink} to="/" variant="text">Back to cases</Button>
        </Stack>
      </Stack>
      <Divider />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
        <Tab label="Parties" />
        <Tab label="Hearings" />
        <Tab label="Documents" />
        <Tab label="Orders" />
        <Tab label="Notes" />
      </Tabs>

      {tab === 0 && <PartiesTab caseId={fc.id} />}
      {tab === 1 && <HearingsTab caseId={fc.id} />}
      {tab === 2 && <DocumentsTab caseId={fc.id} />}
      {tab === 3 && <OrdersTab caseId={fc.id} />}
      {tab === 4 && <NotesTab caseId={fc.id} />}
    </Stack>
  )
}


