import { useState, useMemo } from 'react'
import { Row, Col, Form, Badge } from 'react-bootstrap'
import CaseCard from '../case/CaseCard'
import CaseSteps from '../case/CaseSteps'
import CaseTimeline from '../case/CaseTimeline'
import NextHearingBanner from '../case/NextHearingBanner'
import { getStagesForCase } from '../../utils/caseStages'
import type { FamilyCase } from '../../types/domain'

const sampleCase: FamilyCase = {
  id: 'FC-23-00035',
  title: 'Domestic Abuse & Child Arrangements',
  court: 'Family Court',
  caseType: 'Private Law (Child Arrangements)',
  status: 'Open',
  parties: [
    { id: 'p1', role: 'Applicant', firstName: 'Emma', lastName: 'Watson' },
    { id: 'p2', role: 'Respondent', firstName: 'David', lastName: 'Watson' },
  ],
  hearings: [
    {
      id: 'h1',
      type: 'Fact-Finding',
      date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      time: '10:00 AM',
      location: 'Courtroom 2, Central Family Court',
      judge: 'District Judge Evans',
    },
  ],
  orders: [],
  documents: [],
  notes: [],
  seekingPeerSupport: true,
  startedAt: new Date().toISOString(),
  lastUpdatedAt: new Date().toISOString(),
}

export function CaseCardTimelinePreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical')
  const [status, setStatus] = useState<FamilyCase['status']>('Open')
  const [seeking, setSeeking] = useState(true)

  const activeCase = useMemo<FamilyCase>(
    () => ({ ...sampleCase, status, seekingPeerSupport: seeking }),
    [status, seeking]
  )

  return (
    <div>
      <Row className="g-2 mb-3 align-items-center bg-white p-2 rounded border">
        <Col xs={6} md={4}>
          <Form.Select size="sm" value={status} onChange={(e) => setStatus(e.target.value as FamilyCase['status'])}>
            <option value="Open">Status: Open</option>
            <option value="Stayed">Status: Stayed</option>
            <option value="Concluded">Status: Concluded</option>
          </Form.Select>
        </Col>
        <Col xs={6} md={4}>
          <Form.Select size="sm" value={layout} onChange={(e) => setLayout(e.target.value as 'vertical' | 'horizontal')}>
            <option value="vertical">Buttons: Vertical</option>
            <option value="horizontal">Buttons: Horizontal</option>
          </Form.Select>
        </Col>
        <Col xs={12} md={4}>
          <Badge bg="info" className="w-100 py-2">
            Timeline Integration Active
          </Badge>
        </Col>
      </Row>

      <div style={{ maxWidth: '440px', margin: '0 auto' }}>
        <CaseCard
          caseData={activeCase}
          buttonLayout={layout}
          showProgress
          progressComponent="timeline"
          showNextHearing
          onTogglePeerSupport={(id, cur) => {
            const next = !cur
            setSeeking(next)
            onFeedback(`Toggled peer support for ${id}: ${next}`)
          }}
          onViewDetails={(id) => onFeedback(`View Details for ${id}`)}
          onEdit={(id) => onFeedback(`Edit Case ${id}`)}
        />
      </div>
    </div>
  )
}

export function CaseCardStepsPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical')
  const [status, setStatus] = useState<FamilyCase['status']>('Open')
  const [seeking, setSeeking] = useState(false)

  const activeCase = useMemo<FamilyCase>(
    () => ({ ...sampleCase, status, seekingPeerSupport: seeking }),
    [status, seeking]
  )

  return (
    <div>
      <Row className="g-2 mb-3 align-items-center bg-white p-2 rounded border">
        <Col xs={6} md={4}>
          <Form.Select size="sm" value={status} onChange={(e) => setStatus(e.target.value as FamilyCase['status'])}>
            <option value="Open">Status: Open</option>
            <option value="Stayed">Status: Stayed</option>
            <option value="Concluded">Status: Concluded</option>
          </Form.Select>
        </Col>
        <Col xs={6} md={4}>
          <Form.Select size="sm" value={layout} onChange={(e) => setLayout(e.target.value as 'vertical' | 'horizontal')}>
            <option value="vertical">Buttons: Vertical</option>
            <option value="horizontal">Buttons: Horizontal</option>
          </Form.Select>
        </Col>
        <Col xs={12} md={4}>
          <Badge bg="secondary" className="w-100 py-2">
            Original Stepper Active
          </Badge>
        </Col>
      </Row>

      <div style={{ maxWidth: '440px', margin: '0 auto' }}>
        <CaseCard
          caseData={activeCase}
          buttonLayout={layout}
          showProgress
          progressComponent="steps"
          showNextHearing
          onTogglePeerSupport={(id, cur) => {
            const next = !cur
            setSeeking(next)
            onFeedback(`Toggled peer support for ${id}: ${next}`)
          }}
          onViewDetails={(id) => onFeedback(`View Details for ${id}`)}
          onEdit={(id) => onFeedback(`Edit Case ${id}`)}
        />
      </div>
    </div>
  )
}

export function CaseStepsPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [index, setIndex] = useState(2)
  const stages = useMemo(() => getStagesForCase(sampleCase), [])

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3 bg-white p-2 rounded border">
        <span className="small">
          Current Stage: <Badge bg="primary">{stages[index]?.name ?? 'Concluded'}</Badge>
        </span>
        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted">Step {index} of {stages.length}</span>
          <Form.Range
            min={0}
            max={stages.length}
            value={index}
            onChange={(e) => {
              const val = Number(e.target.value)
              setIndex(val)
              onFeedback(`Moved to stage: ${stages[val]?.name ?? 'Concluded'}`)
            }}
            style={{ width: '130px' }}
          />
        </div>
      </div>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <CaseSteps stages={stages} currentStageIndex={index} />
      </div>
    </div>
  )
}

export function CaseTimelinePreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [index, setIndex] = useState(2)
  const [showProgress, setShowProgress] = useState(true)
  const [collapsible, setCollapsible] = useState(true)
  const [compact, setCompact] = useState(false)
  const stages = useMemo(() => getStagesForCase(sampleCase), [])

  return (
    <div>
      <Row className="g-2 mb-3 align-items-center bg-white p-2 rounded border">
        <Col xs={12} sm={4}>
          <div className="d-flex align-items-center justify-content-between">
            <span className="small text-muted">Step {index + 1} of {stages.length}</span>
            <Form.Range
              min={0}
              max={stages.length}
              value={index}
              onChange={(e) => {
                const val = Number(e.target.value)
                setIndex(val)
                onFeedback(`Timeline step changed to: ${stages[val]?.name ?? 'All Completed'}`)
              }}
              style={{ width: '110px' }}
            />
          </div>
        </Col>
        <Col xs={4} sm={2}>
          <Form.Check
            type="checkbox"
            id="tl-progress"
            label="Progress"
            checked={showProgress}
            onChange={(e) => setShowProgress(e.target.checked)}
            className="small"
          />
        </Col>
        <Col xs={4} sm={3}>
          <Form.Check
            type="checkbox"
            id="tl-collapse"
            label="Collapsible"
            checked={collapsible}
            onChange={(e) => setCollapsible(e.target.checked)}
            className="small"
          />
        </Col>
        <Col xs={4} sm={3}>
          <Form.Check
            type="checkbox"
            id="tl-compact"
            label="Compact"
            checked={compact}
            onChange={(e) => setCompact(e.target.checked)}
            className="small"
          />
        </Col>
      </Row>

      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <CaseTimeline
          stages={stages}
          currentStageIndex={index}
          showProgressBar={showProgress}
          collapsible={collapsible}
          compact={compact}
          interactive
          onStageClick={(stage, idx) =>
            onFeedback(`Clicked stage: "${stage.name}" (index ${idx})`)
          }
        />
      </div>
    </div>
  )
}

export function NextHearingBannerPreview() {
  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      <NextHearingBanner
        hearing={{
          id: 'h-preview',
          type: 'Fact-Finding',
          date: '2026-07-02',
          time: '13:00 PM',
          location: 'Courtroom 1, Central Family Court',
        }}
      />
    </div>
  )
}

