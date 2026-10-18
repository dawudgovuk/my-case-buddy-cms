import { useState } from 'react'
import { Button } from 'react-bootstrap'
import CaseOverviewTab from '../case/tabs/CaseOverviewTab'
import CaseMetadataOverview from '../case/CaseMetadataOverview'
import PeerSupportRequestModal from '../directory/PeerSupportRequestModal'
import WelcomeVerifyCard from '../auth/WelcomeVerifyCard'
import RoleRegistrationLinks from '../auth/RoleRegistrationLinks'
import LanguageSwitcher from '../common/LanguageSwitcher'
import { StrapiSyncModal } from '../strapi/StrapiSyncModal'
import type { FamilyCase } from '../../types/domain'

const SAMPLE_CASE: FamilyCase = {
  id: 'FC-2026-0042',
  title: 'Child Arrangements Dispute (Evans vs Evans)',
  court: 'Family Court',
  caseType: 'Private Law (Child Arrangements)',
  status: 'Open',
  startedAt: '2026-03-01',
  allocatedJudge: 'DJ Henderson',
  parties: [
    {
      id: 'pty-1',
      role: 'Applicant',
      firstName: 'Sarah',
      lastName: 'Evans',
      dateOfBirth: '1989-05-14',
      address: '12 Victoria Road, Bristol',
      contactEmail: 'sarah.evans@example.com',
      contactPhone: '07700 900111',
    },
    {
      id: 'pty-2',
      role: 'Respondent',
      firstName: 'David',
      lastName: 'Evans',
      dateOfBirth: '1987-11-20',
      address: '45 Park Avenue, Bath',
      contactEmail: 'david.evans@example.com',
    },
    {
      id: 'pty-3',
      role: 'Child',
      firstName: 'Chloe',
      lastName: 'Evans',
      dateOfBirth: '2019-08-15',
    },
  ],
  hearings: [
    {
      id: 'hrg-1',
      type: 'Directions',
      date: '2026-11-20',
      time: '10:00',
      location: 'Bristol Civil and Family Justice Centre',
      judge: 'DJ Henderson',
    },
  ],
  orders: [
    {
      id: 'ord-1',
      type: 'Child Arrangements Order',
      dateMade: '2026-04-10',
      summary: 'Interim contact schedule every alternate weekend.',
    },
  ],
  documents: [
    {
      id: 'doc-1',
      title: 'C100 Initial Application',
      type: 'Application',
      uploadedAt: '2026-03-01',
      url: '#',
    },
  ],
  notes: [
    {
      id: 'note-1',
      author: 'Sarah Evans',
      createdAt: '2026-03-05T09:00:00Z',
      text: 'CAFCASS telephone interview scheduled for next Thursday.',
    },
  ],
  lastUpdatedAt: '2026-04-10T12:00:00Z',
  currentStage: 'directions',
}

export function CaseMetadataOverviewPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  return (
    <div className="p-3 bg-white rounded border">
      <CaseMetadataOverview caseData={SAMPLE_CASE} />
      <div className="mt-3 pt-3 border-top d-flex gap-2">
        <Button size="sm" variant="outline-primary" onClick={() => onFeedback('Metadata overview inspected')}>
          Acknowledge Metadata
        </Button>
      </div>
    </div>
  )
}

export function CaseOverviewTabPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  return (
    <div className="p-3 bg-white rounded border">
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <span className="badge bg-primary">Procedural Timeline & Overview</span>
        <Button size="sm" variant="outline-secondary" onClick={() => onFeedback('Simulated stage progress refresh')}>
          Refresh Progression
        </Button>
      </div>
      <CaseOverviewTab caseData={SAMPLE_CASE} />
    </div>
  )
}

export function PeerSupportRequestModalPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="p-3 bg-white rounded border">
      <p className="small text-muted mb-3">
        Interactive modal enabling Litigants in Person to link active cases and submit request notes to verified supporters.
      </p>
      <Button variant="primary" onClick={() => setIsOpen(true)}>
        Open Peer Support Request Modal
      </Button>

      <PeerSupportRequestModal
        show={isOpen}
        targetUserId="usr-pro-1"
        cases={[SAMPLE_CASE]}
        onSendRequest={(caseId, note) => {
          setIsOpen(false)
          onFeedback(`Sent peer support request for case ${caseId}: "${note}"`)
        }}
        onCancel={() => setIsOpen(false)}
      />
    </div>
  )
}

export function RegistrationPendingCardPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  return (
    <WelcomeVerifyCard
      name="Arthur Pendelton"
      email="arthur.pendelton@support.co.uk"
      token="simulated-token-mckenzie-456"
      role="McKenzieFriend"
      onCheckVerified={() => onFeedback('Checked verification status')}
      onSendEmail={() => onFeedback('Verification email resent')}
      onUseDifferentAccount={() => onFeedback('Signed out to use a different account')}
      onOpenVerificationLink={(token) => onFeedback(`Opened verification link with token: ${token}`)}
    />
  )
}

export function RoleRegistrationLinksPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  return (
    <div className="p-4 bg-white rounded border" style={{ maxWidth: 480 }}>
      <RoleRegistrationLinks onSelectRole={(role) => onFeedback(`Selected registration role: ${role}`)} />
    </div>
  )
}

export function LanguageSwitcherPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  return (
    <div className="p-4 bg-white rounded border d-flex flex-column align-items-start gap-3">
      <p className="small text-muted mb-0">
        Interactive language switcher supporting English (UK), Welsh (Cymraeg), Spanish (Español), and Polish (Polski).
      </p>
      <div onClick={() => onFeedback('Language switcher clicked')}>
        <LanguageSwitcher size="sm" showLabel={true} />
      </div>
    </div>
  )
}

export function StrapiSyncModalPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [show, setShow] = useState(false)
  return (
    <div className="p-4 bg-white rounded border d-flex flex-column align-items-start gap-3">
      <p className="small text-muted mb-0">
        Interactive modal for managing Strapi REST backend connection, Neon PostgreSQL status, and 1-click database migration.
      </p>
      <Button
        variant="primary"
        onClick={() => {
          setShow(true)
          onFeedback('Opened Strapi Sync Modal preview')
        }}
      >
        Open Strapi Sync Modal
      </Button>
      <StrapiSyncModal show={show} onHide={() => setShow(false)} />
    </div>
  )
}

