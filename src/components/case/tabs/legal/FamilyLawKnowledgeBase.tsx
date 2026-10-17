import { Row, Col, Alert, Accordion } from 'react-bootstrap'
import { FaBalanceScale, FaCheck, FaVideo, FaExclamationCircle, FaClipboardList } from 'react-icons/fa'
import type { FamilyCase } from '../../../../types/domain'
import { useCitationActions } from '../../../../hooks/useCitationActions'
import {
  APPEAL_GROUNDS,
  APPEAL_WARNING,
  KEY_CASE_AUTHORITIES,
  KNOWLEDGE_BASE_DEFAULT_OPEN_KEYS,
  VIDEO_CALL_INTRO,
  VIDEO_CALL_TIPS,
  WELFARE_CHECKLIST,
  WELFARE_CHECKLIST_INTRO,
} from '../../../../utils/legalKnowledgeBase'
import KnowledgeBaseHeader from './KnowledgeBaseHeader'
import KnowledgeBaseSection from './KnowledgeBaseSection'
import AlienatingBehavioursPanel from './AlienatingBehavioursPanel'
import AuthorityCard from './AuthorityCard'
import LabelledPointText from './RichTextContent'

export interface FamilyLawKnowledgeBaseProps {
  caseData: FamilyCase
}

export default function FamilyLawKnowledgeBase({ caseData }: FamilyLawKnowledgeBaseProps) {
  const { copiedId, addedNoteSuccess, copyToClipboard, insertCitationToNotes } = useCitationActions(caseData)

  return (
    <div className="d-flex flex-column gap-3">
      {/* Knowledge Base Header */}
      <KnowledgeBaseHeader />

      {addedNoteSuccess && (
        <Alert variant="success" className="py-2 px-3 small d-flex align-items-center gap-2 mb-0 shadow-xs">
          <FaCheck className="text-success" />
          <span>{addedNoteSuccess}</span>
        </Alert>
      )}

      {/* Accordion Sections for Key Precedents */}
      <Accordion defaultActiveKey={KNOWLEDGE_BASE_DEFAULT_OPEN_KEYS} alwaysOpen>
        {/* 1. Alienating Behaviours - 3 Necessary Elements */}
        <KnowledgeBaseSection
          eventKey="0"
          icon={FaBalanceScale}
          iconClassName="bg-warning-subtle text-warning-emphasis"
          title="Alienating Behaviours — The Three Necessary Elements"
          badge={{ label: 'Re C [2023] EWHC 345 (Fam)', bg: 'danger-subtle', text: 'danger', className: 'border border-danger-subtle ms-2' }}
        >
          <AlienatingBehavioursPanel copiedId={copiedId} onCopy={copyToClipboard} onCite={insertCitationToNotes} />
        </KnowledgeBaseSection>

        {/* 2. Key Children Case Law */}
        <KnowledgeBaseSection
          eventKey="1"
          icon={FaBalanceScale}
          iconClassName="bg-primary-subtle text-primary"
          title="Key Children Case Law & Binding Precedents"
          badge={{ label: '5 Authorities', bg: 'primary-subtle', text: 'primary', className: 'border border-primary-subtle ms-2' }}
        >
          <Row className="g-2.5">
            {KEY_CASE_AUTHORITIES.map((authority) => (
              <Col key={authority.id} md={authority.colMd}>
                <AuthorityCard authority={authority} onCite={insertCitationToNotes} />
              </Col>
            ))}
          </Row>
        </KnowledgeBaseSection>

        {/* 3. Children Act 1989 Section 1(3) Welfare Checklist */}
        <KnowledgeBaseSection
          eventKey="2"
          icon={FaClipboardList}
          iconClassName="bg-info-subtle text-info"
          title="Children Act 1989 Section 1(3) — Statutory Welfare Checklist"
        >
          <p className="small text-secondary mb-3">{WELFARE_CHECKLIST_INTRO}</p>
          <Row className="g-2 small">
            {WELFARE_CHECKLIST.map((item) => (
              <Col key={item.label} md={6}>
                <div className="p-2 border rounded bg-light">
                  <LabelledPointText point={item} />
                </div>
              </Col>
            ))}
          </Row>
        </KnowledgeBaseSection>

        {/* 4. Grounds for Appeal */}
        <KnowledgeBaseSection
          eventKey="3"
          icon={FaExclamationCircle}
          iconClassName="bg-danger-subtle text-danger"
          title="Grounds for Appeal & Permission Requirements"
          badge={{ label: 'Form N161', bg: 'secondary', className: 'ms-2' }}
        >
          <Alert variant="warning" className="small py-2 px-3 mb-3 border">
            {APPEAL_WARNING}
          </Alert>
          <h6 className="fw-bold small text-dark mb-2">Valid Grounds for Appeal:</h6>
          <ul className="small text-secondary d-flex flex-column gap-1.5 mb-3">
            {APPEAL_GROUNDS.map((ground) => (
              <li key={ground.label}><LabelledPointText point={ground} /></li>
            ))}
          </ul>
          <div className="p-2.5 bg-light rounded border small">
            <strong>Permission to Appeal & Strict 21-Day Deadline:</strong> Permission is required either from the first-instance judge or the appeal court (CPR Part 52 / FPR Part 30). Form N161 Appellant's Notice must ordinarily be filed within <strong>21 days</strong> of the order date.
          </div>
        </KnowledgeBaseSection>

        {/* 5. Hints and Tips for Video Calls */}
        <KnowledgeBaseSection
          eventKey="4"
          icon={FaVideo}
          iconClassName="bg-success-subtle text-success"
          title="Practical Guidance: Video Calls with Children"
          spaced={false}
          bodyClassName="bg-white small text-secondary"
        >
          <p className="mb-2">{VIDEO_CALL_INTRO}</p>
          <ul className="d-flex flex-column gap-1.5 mb-0">
            {VIDEO_CALL_TIPS.map((tip) => (
              <li key={tip.label}><LabelledPointText point={tip} /></li>
            ))}
          </ul>
        </KnowledgeBaseSection>
      </Accordion>
    </div>
  )
}
