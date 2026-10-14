import { useState } from 'react'
import PartyCard from '../case/PartyCard'
import HearingCard from '../case/HearingCard'
import DocumentCard from '../case/DocumentCard'
import OrderCard from '../case/OrderCard'
import CaseNoteCard from '../case/CaseNoteCard'
import CaseSummaryCard from '../case/CaseSummaryCard'
import InviteLinkCard from '../case/InviteLinkCard'
import CaseListItemCard from '../case/CaseListItemCard'
import PartyFormSection from '../case/PartyFormSection'
import type { Party, Hearing, DocumentRecord, OrderRecord, CaseNote, FamilyCase } from '../../types/domain'

export function PartyCardPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [parties, setParties] = useState<Party[]>([
    {
      id: 'pty-1',
      role: 'Applicant',
      firstName: 'Emily',
      lastName: 'Watson',
      dateOfBirth: '1988-04-12',
      address: '14 Elm Road, Bristol, BS8 4UG',
      contactEmail: 'emily.watson@example.com',
      contactPhone: '07700 900123',
      solicitorFirm: 'Bristol Family Law Associates',
    },
    {
      id: 'pty-2',
      role: 'Child',
      firstName: 'Oliver',
      lastName: 'Watson',
      dateOfBirth: '2018-09-21',
    },
  ])

  return (
    <div>
      <p className="small text-secondary mb-3">
        Interactive party cards supporting view mode and inline editing form with save/cancel/delete handlers.
      </p>
      {parties.map((party) => (
        <PartyCard
          key={party.id}
          party={party}
          onSave={(p) => {
            setParties((prev) => prev.map((item) => (item.id === p.id ? p : item)))
            onFeedback(`Saved party: ${p.firstName} ${p.lastName}`)
          }}
          onDelete={(id) => {
            setParties((prev) => prev.filter((item) => item.id !== id))
            onFeedback(`Deleted party: ${id}`)
          }}
        />
      ))}
    </div>
  )
}

export function HearingCardPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [hearings, setHearings] = useState<Hearing[]>([
    {
      id: 'hrg-1',
      type: 'Case Management',
      date: '2026-11-15',
      time: '10:30',
      location: 'Central Family Court, First Avenue House',
      judge: 'District Judge Henderson',
      notes: 'Parties to file and serve bundle by 4pm, 7 days prior.',
    },
    {
      id: 'hrg-2',
      type: 'Final',
      date: '2026-12-04',
      time: '14:00',
      location: 'East London Family Court',
      judge: 'Circuit Judge Richardson',
      notes: 'Full day fixture. Section 7 welfare officer in attendance.',
    },
  ])

  return (
    <div>
      <p className="small text-secondary mb-3">
        Hearing cards displaying court schedule, venue, judge, and procedural directions.
      </p>
      {hearings.map((h) => (
        <HearingCard
          key={h.id}
          hearing={h}
          courtLocations={['Central Family Court', 'East London Family Court', 'Manchester Civil Justice Centre']}
          onSave={(updated) => {
            setHearings((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
            onFeedback(`Saved hearing: ${updated.type} on ${updated.date}`)
          }}
          onDelete={(id) => {
            setHearings((prev) => prev.filter((item) => item.id !== id))
            onFeedback(`Deleted hearing: ${id}`)
          }}
        />
      ))}
    </div>
  )
}

export function DocumentCardPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [docs, setDocs] = useState<DocumentRecord[]>([
    {
      id: 'doc-1',
      title: 'Applicant First Witness Statement',
      type: 'Statement',
      uploadedAt: '2026-10-10T14:30:00Z',
      url: 'https://court-storage.justice.gov.uk/bundles/doc-1.pdf',
      notes: 'Exhibit EW1 attached: School attendance and medical reports.',
    },
    {
      id: 'doc-2',
      title: 'Form C100 Child Arrangements Application',
      type: 'Application',
      uploadedAt: '2026-09-01T09:00:00Z',
      url: 'https://court-storage.justice.gov.uk/bundles/c100.pdf',
    },
  ])

  return (
    <div>
      {docs.map((d) => (
        <DocumentCard
          key={d.id}
          document={d}
          onSave={(updated) => {
            setDocs((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
            onFeedback(`Saved document: ${updated.title}`)
          }}
          onDelete={(id) => {
            setDocs((prev) => prev.filter((item) => item.id !== id))
            onFeedback(`Deleted document: ${id}`)
          }}
        />
      ))}
    </div>
  )
}

export function OrderCardPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [orders, setOrders] = useState<OrderRecord[]>([
    {
      id: 'ord-1',
      type: 'Child Arrangements Order',
      dateMade: '2026-09-20',
      expiresOn: '2028-09-20',
      summary: 'Child to live with Applicant. Contact with Respondent every alternate weekend and half of school holidays.',
    },
    {
      id: 'ord-2',
      type: 'Prohibited Steps Order',
      dateMade: '2026-08-14',
      summary: 'Respondent prohibited from removing child from the jurisdiction of England and Wales without written consent.',
    },
  ])

  return (
    <div>
      {orders.map((o) => (
        <OrderCard
          key={o.id}
          order={o}
          onSave={(updated) => {
            setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
            onFeedback(`Saved order: ${updated.type}`)
          }}
          onDelete={(id) => {
            setOrders((prev) => prev.filter((item) => item.id !== id))
            onFeedback(`Deleted order: ${id}`)
          }}
        />
      ))}
    </div>
  )
}

export function CaseNoteCardPreview() {
  const sampleNote: CaseNote = {
    id: 'note-1',
    createdAt: new Date().toISOString(),
    author: 'Sarah Jenkins (Solicitor)',
    text: 'Client telephone attendance completed. Reviewed Cafcass Section 7 report. Recommendations are broadly supportive of proposed schedule.',
  }

  return <CaseNoteCard note={sampleNote} />
}

export function CaseSummaryCardPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const sampleCase: FamilyCase = {
    id: 'FC-24-00912',
    title: 'Child Arrangements Dispute (Watson v Watson)',
    court: 'Family Court',
    caseType: 'Private Law (Child Arrangements)',
    status: 'Open',
    startedAt: '2026-08-10',
    allocatedJudge: 'District Judge Evans',
    parties: [
      { id: 'p1', role: 'Applicant', firstName: 'Emily', lastName: 'Watson' },
      { id: 'p2', role: 'Respondent', firstName: 'James', lastName: 'Watson' },
      { id: 'p3', role: 'Child', firstName: 'Oliver', lastName: 'Watson' },
    ],
    hearings: [
      { id: 'h1', type: 'Directions', date: '2026-11-20' },
    ],
    orders: [
      { id: 'o1', type: 'Child Arrangements Order', dateMade: '2026-09-01', summary: 'Interim contact' },
    ],
    documents: [],
    notes: [],
    lastUpdatedAt: new Date().toISOString(),
  }

  return (
    <CaseSummaryCard
      caseData={sampleCase}
      onEdit={() => onFeedback('CaseSummaryCard: Edit clicked')}
      onBack={() => onFeedback('CaseSummaryCard: Back clicked')}
    />
  )
}

export function InviteLinkCardPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  return (
    <div>
      <InviteLinkCard
        id="inv-1"
        role="McKenzieFriend"
        token="inv_mck_882910"
        createdAt={new Date(Date.now() - 86400000 * 2).toISOString()}
        baseUrl="http://localhost:5173"
        onCopy={(url) => onFeedback(`Copied invite: ${url}`)}
      />
      <InviteLinkCard
        id="inv-2"
        role="Solicitor"
        token="inv_sol_441209"
        createdAt={new Date(Date.now() - 86400000 * 10).toISOString()}
        usedAt={new Date(Date.now() - 86400000 * 9).toISOString()}
        baseUrl="http://localhost:5173"
        onCopy={(url) => onFeedback(`Copied invite: ${url}`)}
      />
    </div>
  )
}

export function CaseListItemCardPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const sampleCase: FamilyCase = {
    id: 'FC-23-00035',
    title: 'Application for Contact and Prohibited Steps',
    court: 'Family Court',
    caseType: 'Private Law (Child Arrangements)',
    status: 'Open',
    startedAt: '2026-01-15',
    allocatedJudge: 'District Judge Henderson',
    parties: [
      { id: 'p1', role: 'Applicant', firstName: 'Sarah', lastName: 'Miller' },
      { id: 'p2', role: 'Child', firstName: 'Leo', lastName: 'Miller' },
    ],
    hearings: [{ id: 'h1', type: 'Case Management', date: '2026-11-01' }],
    orders: [],
    documents: [],
    notes: [],
    lastUpdatedAt: new Date().toISOString(),
  }

  return (
    <CaseListItemCard
      caseData={sampleCase}
      onViewCase={(id) => onFeedback(`Viewed case from row: ${id}`)}
      onDeleteCase={(id) => onFeedback(`Delete requested from row: ${id}`)}
    />
  )
}

export function PartyFormSectionPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [parties, setParties] = useState<Party[]>([
    { id: 'p1', role: 'Applicant', firstName: 'John', lastName: 'Doe' },
  ])

  return (
    <PartyFormSection
      parties={parties}
      onAddParty={(newP) => {
        setParties((prev) => [...prev, newP])
        onFeedback(`Added ${newP.role}: ${newP.firstName} ${newP.lastName}`)
      }}
      onRemoveParty={(id) => {
        setParties((prev) => prev.filter((p) => p.id !== id))
        onFeedback(`Removed party: ${id}`)
      }}
      isChildSection={false}
    />
  )
}
