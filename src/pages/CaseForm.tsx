import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import type { FamilyCase, Party } from '../types/domain'
import { generateId } from '../services/storage'
import { useCasesStore } from '../store/casesStore'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import CaseMetadataForm, { type CaseMetadataFormValues } from '../components/forms/CaseMetadataForm'
import PartyFormSection from '../components/case/PartyFormSection'

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
      currentStage: 'application',
    }
  )

  useEffect(() => {
    if (existing) setForm(existing)
  }, [existing])

  function handleMetadataChange<K extends keyof CaseMetadataFormValues>(
    field: K,
    value: CaseMetadataFormValues[K]
  ) {
    setForm((f) => ({
      ...f,
      [field]: value,
    }))
  }

  function handleAddParty(newParty: Party) {
    setForm((f) => ({
      ...f,
      parties: [...f.parties, newParty],
    }))
  }

  function handleRemoveParty(partyId: string) {
    setForm((f) => ({
      ...f,
      parties: f.parties.filter((p) => p.id !== partyId),
    }))
  }

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
      currentStage: existing?.currentStage || 'application',
    }
    addOrUpdate(payload)
    navigate(`/cases/${id}`)
  }

  const childrenCount = form.parties.filter((p) => p.role === 'Child').length

  return (
    <Card className="p-4 mx-auto shadow-sm border-0 bg-white" style={{ maxWidth: '900px' }}>
      <Form onSubmit={handleSubmit}>
        <div className="border-bottom pb-3 mb-4">
          <h3 className="fw-bold text-dark mb-1">{existing ? 'Edit Case' : 'Create New Case'}</h3>
          <p className="text-secondary small mb-0">
            Fill in the case metadata and register parties or children to start tracking proceedings.
          </p>
        </div>

        {/* Extracted Reusable Case Metadata Form Inputs */}
        <CaseMetadataForm
          values={{
            title: form.title,
            id: form.id,
            court: form.court,
            caseType: form.caseType,
            status: form.status,
            startedAt: form.startedAt,
            allocatedJudge: form.allocatedJudge,
          }}
          onChange={handleMetadataChange}
          childrenCount={childrenCount}
          className="mb-4"
        />

        {/* Modular Parties Section */}
        <PartyFormSection
          parties={form.parties}
          onAddParty={handleAddParty}
          onRemoveParty={handleRemoveParty}
          isChildSection={false}
        />

        {/* Modular Children Section */}
        <PartyFormSection
          parties={form.parties}
          onAddParty={handleAddParty}
          onRemoveParty={handleRemoveParty}
          isChildSection={true}
        />

        <div className="d-flex gap-2 mt-4 pt-2 border-top">
          <Button type="submit" variant="primary" className="px-4">
            {existing ? 'Save Changes' : 'Create Case'}
          </Button>
          <Button
            variant="outline-secondary"
            className="px-4"
            onClick={() => navigate(existing ? `/cases/${existing.id}` : '/')}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </Card>
  )
}
