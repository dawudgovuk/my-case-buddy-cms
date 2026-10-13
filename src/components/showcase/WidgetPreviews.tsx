import { useState } from 'react'
import { Row, Col, Form } from 'react-bootstrap'
import TabNav, { type TabItem } from '../common/TabNav'
import Logo from '../common/Logo'
import UpcomingHearingsCard, { type HearingItem } from '../dashboard/UpcomingHearingsCard'
import DeadlinesCard from '../dashboard/DeadlinesCard'
import type { DocumentDeadline } from '../../types/domain'
import { FaGavel, FaHandsHelping, FaCheckCircle } from 'react-icons/fa'

const sampleHearings: HearingItem[] = [
  {
    caseId: 'FC-23-00035',
    caseTitle: 'Child Arrangements Dispute',
    hearing: {
      id: 'h-1',
      type: 'First Hearing (FHDRA)',
      date: new Date().toISOString(),
      time: '10:00 AM',
      location: 'Central Family Court, Room 3',
      judge: 'District Judge Evans',
    },
  },
  {
    caseId: 'FC-24-00129',
    caseTitle: 'Non-Molestation Order Hearing',
    hearing: {
      id: 'h-2',
      type: 'Directions Hearing',
      date: new Date(Date.now() + 86400000 * 4).toISOString(),
      time: '02:00 PM',
      location: 'East London Family Court',
      judge: 'Recorder Davies',
    },
  },
]

const sampleDeadlines: DocumentDeadline[] = [
  {
    id: 'd-1',
    caseId: 'FC-23-00035',
    title: 'Submit Form C1A Safeguarding Statement',
    deadlineDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'pending',
  },
  {
    id: 'd-2',
    caseId: 'FC-24-00129',
    title: 'Exchange Witness Statements & Exhibits',
    deadlineDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: 'pending',
  },
]

export function TabNavPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [activeTab, setActiveTab] = useState('cases')
  const [variant, setVariant] = useState<'tabs' | 'pills' | 'underline'>('tabs')

  const items: TabItem<string>[] = [
    { key: 'cases', label: 'All Cases', count: 12, badgeVariant: 'primary', icon: <FaGavel /> },
    { key: 'reviews', label: 'Peer Reviews', count: 4, badgeVariant: 'warning', icon: <FaHandsHelping /> },
    { key: 'archive', label: 'Archive', count: 28, badgeVariant: 'secondary', icon: <FaCheckCircle /> },
  ]

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="small text-secondary">
          Active Tab: <strong className="text-primary">{activeTab}</strong>
        </span>
        <Form.Select
          size="sm"
          style={{ width: 'auto' }}
          value={variant}
          onChange={(e) => setVariant(e.target.value as 'tabs' | 'pills' | 'underline')}
        >
          <option value="tabs">Tabs Variant</option>
          <option value="pills">Pills Variant</option>
          <option value="underline">Underline Variant</option>
        </Form.Select>
      </div>
      <TabNav
        items={items}
        activeKey={activeTab}
        onSelect={(k) => {
          setActiveTab(k)
          onFeedback(`Tab clicked: ${k}`)
        }}
        variant={variant}
      />
    </div>
  )
}

export function LogoPreview() {
  return (
    <Row className="g-3">
      <Col xs={12} sm={6}>
        <div className="p-4 bg-white rounded border text-center">
          <div className="small text-muted mb-2">On Light Background</div>
          <Logo />
        </div>
      </Col>
      <Col xs={12} sm={6}>
        <div className="p-4 bg-dark text-white rounded border text-center">
          <div className="small text-light-50 mb-2">On Dark Background</div>
          <Logo />
        </div>
      </Col>
    </Row>
  )
}

export function UpcomingHearingsPreview() {
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <UpcomingHearingsCard hearings={sampleHearings} />
    </div>
  )
}

export function DeadlinesPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [deadlines, setDeadlines] = useState<DocumentDeadline[]>(sampleDeadlines)

  const handleToggle = (id: string, cur: DocumentDeadline['status']) => {
    const next = cur === 'submitted' ? 'pending' : 'submitted'
    setDeadlines((prev) => prev.map((d) => (d.id === id ? { ...d, status: next } : d)))
    onFeedback(`Deadline ${id} status toggled to "${next}"`)
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <DeadlinesCard deadlines={deadlines} onToggleDeadline={handleToggle} />
    </div>
  )
}
