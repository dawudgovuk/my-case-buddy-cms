import { useState } from 'react'
import { Card, Badge, Button, Row, Col, Alert, Accordion } from 'react-bootstrap'
import {
  FaBook,
  FaBalanceScale,
  FaExternalLinkAlt,
  FaCopy,
  FaCheck,
  FaQuoteRight,
  FaVideo,
  FaExclamationCircle,
  FaClipboardList,
} from 'react-icons/fa'
import type { FamilyCase } from '../../../../types/domain'
import { useCasesStore } from '../../../../store/casesStore'
import { useAuthStore } from '../../../../store/authStore'
import { generateId } from '../../../../services/storage'

export interface FamilyLawKnowledgeBaseProps {
  caseData: FamilyCase
}

export default function FamilyLawKnowledgeBase({ caseData }: FamilyLawKnowledgeBaseProps) {
  const store = useCasesStore()
  const { user } = useAuthStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [addedNoteSuccess, setAddedNoteSuccess] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const insertCitationToNotes = (citationTitle: string, citationContent: string) => {
    const noteText = `[Legal Citation / Authority Reference]\nTitle: ${citationTitle}\n\n${citationContent}\n\nCase: ${caseData.title || caseData.id} | Inserted by: ${user?.name || 'Supporter'}`
    const updated: FamilyCase = {
      ...caseData,
      notes: [
        ...caseData.notes,
        {
          id: generateId('NOTE'),
          createdAt: new Date().toISOString(),
          author: user?.name || 'Legal Supporter',
          text: noteText,
        },
      ],
    }
    store.addOrUpdate(updated)
    setAddedNoteSuccess(`Citation "${citationTitle}" added directly to case notes!`)
    setTimeout(() => setAddedNoteSuccess(null), 3500)
  }

  return (
    <div className="d-flex flex-column gap-3">
      {/* Knowledge Base Header */}
      <div className="p-3 rounded-3 bg-light border d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Badge bg="warning" text="dark" className="px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1">
              <FaBook size={11} />
              <span>Official Knowledge Base</span>
            </Badge>
            <span className="small text-muted">support.mycourtbuddy.com</span>
          </div>
          <h5 className="fw-bold mb-0 text-dark">UK Family Court Legal Precedents & Guidance</h5>
          <p className="text-secondary small mb-0 mt-1">
            Verified statutory guidance, Practice Directions, and leading High Court / Court of Appeal authorities.
          </p>
        </div>
        <Button
          variant="outline-secondary"
          size="sm"
          href="https://support.mycourtbuddy.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill shadow-xs text-nowrap"
        >
          <FaExternalLinkAlt size={11} />
          <span>Browse Support Site</span>
        </Button>
      </div>

      {addedNoteSuccess && (
        <Alert variant="success" className="py-2 px-3 small d-flex align-items-center gap-2 mb-0 shadow-xs">
          <FaCheck className="text-success" />
          <span>{addedNoteSuccess}</span>
        </Alert>
      )}

      {/* Accordion Sections for Key Precedents */}
      <Accordion defaultActiveKey={['0', '1']} alwaysOpen>
        {/* 1. Alienating Behaviours - 3 Necessary Elements */}
        <Accordion.Item eventKey="0" className="border rounded-3 mb-2 overflow-hidden shadow-xs">
          <Accordion.Header>
            <div className="d-flex align-items-center gap-2">
              <span className="p-1.5 rounded bg-warning-subtle text-warning-emphasis">
                <FaBalanceScale size={14} />
              </span>
              <span className="fw-bold text-dark">
                Alienating Behaviours — The Three Necessary Elements
              </span>
              <Badge bg="danger-subtle" text="danger" className="border border-danger-subtle ms-2">
                Re C [2023] EWHC 345 (Fam)
              </Badge>
            </div>
          </Accordion.Header>
          <Accordion.Body className="bg-white">
            <p className="small text-secondary mb-3">
              In <em>Re C ('Parental Alienation; Instruction of Expert) [2023] EWHC 345 (Fam) para 103</em>, Sir Andrew McFarlane (President of the Family Division) adopted the definition that parental alienation is not a diagnosable syndrome, but a process of manipulation of children through alienating behaviours.
            </p>
            <div className="p-3 bg-light rounded-3 border mb-3">
              <h6 className="fw-bold small text-dark mb-2">A court must be satisfied of three cumulative elements:</h6>
              <ol className="small text-dark mb-0 ps-3 d-flex flex-column gap-2">
                <li>
                  <strong>Reluctance or Refusal:</strong> The child is reluctant, resisting or refusing to engage in a relationship with a parent or carer.
                </li>
                <li>
                  <strong>Not Consequent on Parent's Actions:</strong> The reluctance, resistance or refusal is <em>not</em> consequent on the actions of that parent towards the child or other parent (which would be justified rejection), nor caused by natural alignment, affinity, or attachment.
                </li>
                <li>
                  <strong>Direct/Indirect Impacting Behaviours:</strong> The other parent has engaged in behaviours that have directly or indirectly impacted on the child, leading to the child's reluctance or refusal.
                </li>
              </ol>
            </div>

            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center pt-1 border-top">
              <span className="small text-muted fst-italic">
                Sources: Family Justice Council Guidance (2024) & Ben Hine, Jennifer Herman (UWL 2024).
              </span>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1.5 rounded-pill"
                  onClick={() =>
                    copyToClipboard(
                      `Re C ('Parental Alienation; Instruction of Expert) [2023] EWHC 345 (Fam) para 103: Alienating behaviours require establishing: (1) Child reluctance/refusal; (2) Not justified by applicant's behaviour or natural alignment; (3) Behaviours by respondent parent directly/indirectly causing the reluctance.`,
                      'rec-cite'
                    )
                  }
                >
                  {copiedId === 'rec-cite' ? <FaCheck size={11} className="text-success" /> : <FaCopy size={11} />}
                  <span>{copiedId === 'rec-cite' ? 'Copied' : 'Copy Citation'}</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="d-inline-flex align-items-center gap-1.5 rounded-pill"
                  onClick={() =>
                    insertCitationToNotes(
                      'Alienating Behaviours 3-Element Test (Re C [2023])',
                      `Under Re C [2023] EWHC 345 (Fam) para 103, three criteria must be satisfied to establish alienating behaviours: 1. Child refusal; 2. Not justified rejection; 3. Caused by other parent's behaviours. Allegations must be evaluated against this threshold.`
                    )
                  }
                >
                  <FaQuoteRight size={11} />
                  <span>Insert in Case Notes</span>
                </Button>
              </div>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* 2. Key Children Case Law */}
        <Accordion.Item eventKey="1" className="border rounded-3 mb-2 overflow-hidden shadow-xs">
          <Accordion.Header>
            <div className="d-flex align-items-center gap-2">
              <span className="p-1.5 rounded bg-primary-subtle text-primary">
                <FaBalanceScale size={14} />
              </span>
              <span className="fw-bold text-dark">Key Children Case Law & Binding Precedents</span>
              <Badge bg="primary-subtle" text="primary" className="border border-primary-subtle ms-2">
                5 Authorities
              </Badge>
            </div>
          </Accordion.Header>
          <Accordion.Body className="bg-white">
            <Row className="g-2.5">
              <Col md={6}>
                <Card className="h-100 border p-2.5 rounded-3 bg-light shadow-2xs">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className="fw-bold text-dark small">1. Re H (Children's Wishes) [2018] EWCA Civ 1684</span>
                    <Badge bg="secondary" style={{ fontSize: '0.65rem' }}>Child Wishes</Badge>
                  </div>
                  <p className="small text-secondary mb-2">
                    Courts must consider repeated, consistent wishes of young children where safe and appropriate to their age and understanding.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-none text-primary small d-inline-flex align-items-center gap-1 align-self-start"
                    onClick={() => insertCitationToNotes('Re H [2018] EWCA Civ 1684', 'Re H (Children\'s Wishes) [2018] EWCA Civ 1684: Courts must consider repeated, consistent wishes of young children where safe.')}
                  >
                    <FaQuoteRight size={10} /> <span>Cite in Notes</span>
                  </Button>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="h-100 border p-2.5 rounded-3 bg-light shadow-2xs">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className="fw-bold text-dark small">2. Re L, V, M & H [2000] 2 FLR 334</span>
                    <Badge bg="danger" style={{ fontSize: '0.65rem' }}>Allegations vs Evidence</Badge>
                  </div>
                  <p className="small text-secondary mb-2">
                    Allegations alone are insufficient to restrict contact. Any assessment of risk must be strictly evidence-based, not speculative.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-none text-primary small d-inline-flex align-items-center gap-1 align-self-start"
                    onClick={() => insertCitationToNotes('Re L [2000] 2 FLR 334', 'Re L, V, M & H (Contact: Allegations) [2000] 2 FLR 334: Allegations alone are insufficient to restrict contact. Risk must be evidence-based.')}
                  >
                    <FaQuoteRight size={10} /> <span>Cite in Notes</span>
                  </Button>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="h-100 border p-2.5 rounded-3 bg-light shadow-2xs">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className="fw-bold text-dark small">3. Re R (A Child) [2021] EWCA Civ 162</span>
                    <Badge bg="warning" text="dark" style={{ fontSize: '0.65rem' }}>Litigation Conduct</Badge>
                  </div>
                  <p className="small text-secondary mb-2">
                    Litigation delays or procedural obstruction by one parent must not prejudice the child or artificially freeze contact.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-none text-primary small d-inline-flex align-items-center gap-1 align-self-start"
                    onClick={() => insertCitationToNotes('Re R [2021] EWCA Civ 162', 'Re R (A Child) (Litigation Conduct) [2021] EWCA Civ 162: Litigation delays or procedural obstruction by one parent must not prejudice the child or freeze contact.')}
                  >
                    <FaQuoteRight size={10} /> <span>Cite in Notes</span>
                  </Button>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="h-100 border p-2.5 rounded-3 bg-light shadow-2xs">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className="fw-bold text-dark small">4. Re M (Interim Contact) [2012] EWCA Civ 520</span>
                    <Badge bg="success" style={{ fontSize: '0.65rem' }}>Interim Presumption</Badge>
                  </div>
                  <p className="small text-secondary mb-2">
                    Interim contact should actively support the parent-child relationship during proceedings unless clear evidence dictates otherwise.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-none text-primary small d-inline-flex align-items-center gap-1 align-self-start"
                    onClick={() => insertCitationToNotes('Re M [2012] EWCA Civ 520', 'Re M (Interim Contact) [2012] EWCA Civ 520: Interim contact should support the parent-child relationship unless clear evidence dictates otherwise.')}
                  >
                    <FaQuoteRight size={10} /> <span>Cite in Notes</span>
                  </Button>
                </Card>
              </Col>

              <Col md={12}>
                <Card className="border p-2.5 rounded-3 bg-light shadow-2xs">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <span className="fw-bold text-dark small">5. Re C (Direct Contact: Suspension) [2011] EWCA Civ 521</span>
                    <Badge bg="danger-subtle" text="danger" style={{ fontSize: '0.65rem' }}>Last Resort</Badge>
                  </div>
                  <p className="small text-secondary mb-2">
                    Restriction or termination of contact is a severe interference with family life and must remain a strict measure of last resort.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-none text-primary small d-inline-flex align-items-center gap-1 align-self-start"
                    onClick={() => insertCitationToNotes('Re C [2011] EWCA Civ 521', 'Re C (Direct Contact: Suspension) [2011] EWCA Civ 521: Restriction of contact must be a last resort, based on evidence, not speculation.')}
                  >
                    <FaQuoteRight size={10} /> <span>Cite in Notes</span>
                  </Button>
                </Card>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* 3. Children Act 1989 Section 1(3) Welfare Checklist */}
        <Accordion.Item eventKey="2" className="border rounded-3 mb-2 overflow-hidden shadow-xs">
          <Accordion.Header>
            <div className="d-flex align-items-center gap-2">
              <span className="p-1.5 rounded bg-info-subtle text-info">
                <FaClipboardList size={14} />
              </span>
              <span className="fw-bold text-dark">
                Children Act 1989 Section 1(3) — Statutory Welfare Checklist
              </span>
            </div>
          </Accordion.Header>
          <Accordion.Body className="bg-white">
            <p className="small text-secondary mb-3">
              The court's paramount consideration is the welfare of the child. Judges, barristers, and supporters must address each of these statutory elements in statements and submissions:
            </p>
            <Row className="g-2 small">
              <Col md={6}>
                <div className="p-2 border rounded bg-light">
                  <strong>(a) Wishes and Feelings:</strong> In light of the child's age and understanding.
                </div>
              </Col>
              <Col md={6}>
                <div className="p-2 border rounded bg-light">
                  <strong>(b) Physical, Emotional & Educational Needs:</strong> Daily stability and care.
                </div>
              </Col>
              <Col md={6}>
                <div className="p-2 border rounded bg-light">
                  <strong>(c) Likely Effect of Any Change:</strong> Impact of disrupting current routine.
                </div>
              </Col>
              <Col md={6}>
                <div className="p-2 border rounded bg-light">
                  <strong>(d) Age, Sex, Background & Characteristics:</strong> Cultural/religious identity.
                </div>
              </Col>
              <Col md={6}>
                <div className="p-2 border rounded bg-light">
                  <strong>(e) Any Harm Suffered or at Risk of Suffering:</strong> Physical or emotional harm.
                </div>
              </Col>
              <Col md={6}>
                <div className="p-2 border rounded bg-light">
                  <strong>(f) Capability of Each Parent:</strong> Meeting the child's needs effectively.
                </div>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* 4. Grounds for Appeal */}
        <Accordion.Item eventKey="3" className="border rounded-3 mb-2 overflow-hidden shadow-xs">
          <Accordion.Header>
            <div className="d-flex align-items-center gap-2">
              <span className="p-1.5 rounded bg-danger-subtle text-danger">
                <FaExclamationCircle size={14} />
              </span>
              <span className="fw-bold text-dark">Grounds for Appeal & Permission Requirements</span>
              <Badge bg="secondary" className="ms-2">Form N161</Badge>
            </div>
          </Accordion.Header>
          <Accordion.Body className="bg-white">
            <Alert variant="warning" className="small py-2 px-3 mb-3 border">
              Appealing a family court decision requires high legal thresholds. Merely disagreeing with the judicial evaluation is insufficient.
            </Alert>
            <h6 className="fw-bold small text-dark mb-2">Valid Grounds for Appeal:</h6>
            <ul className="small text-secondary d-flex flex-column gap-1.5 mb-3">
              <li><strong>Significant Error in Law:</strong> The judge misapplied statutory provisions or binding appellate precedents.</li>
              <li><strong>Misunderstood or Failed to Consider Evidence:</strong> Material documentary evidence was ignored or misconstrued.</li>
              <li><strong>Serious Procedural Irregularity:</strong> The litigant was denied a fair hearing or natural justice.</li>
              <li><strong>Decision Plainly Wrong:</strong> The order was one that no reasonable judge properly directing themselves could have made.</li>
            </ul>
            <div className="p-2.5 bg-light rounded border small">
              <strong>Permission to Appeal & Strict 21-Day Deadline:</strong> Permission is required either from the first-instance judge or the appeal court (CPR Part 52 / FPR Part 30). Form N161 Appellant's Notice must ordinarily be filed within <strong>21 days</strong> of the order date.
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* 5. Hints and Tips for Video Calls */}
        <Accordion.Item eventKey="4" className="border rounded-3 overflow-hidden shadow-xs">
          <Accordion.Header>
            <div className="d-flex align-items-center gap-2">
              <span className="p-1.5 rounded bg-success-subtle text-success">
                <FaVideo size={14} />
              </span>
              <span className="fw-bold text-dark">Practical Guidance: Video Calls with Children</span>
            </div>
          </Accordion.Header>
          <Accordion.Body className="bg-white small text-secondary">
            <p className="mb-2">
              Maintaining meaningful contact via video calls during private law disputes is critical for preservation of attachment. Key practical tips:
            </p>
            <ul className="d-flex flex-column gap-1.5 mb-0">
              <li><strong>Activity-Centric:</strong> Read a book together, play an interactive game, or share drawings rather than expecting sustained conversation.</li>
              <li><strong>Child-Led Duration:</strong> Allow the child to set the pace. A positive 15-minute call is far better than a pressured 45-minute call.</li>
              <li><strong>Neutral Demeanour:</strong> Never question the child about the other parent's home, routine, or court proceedings.</li>
              <li><strong>Predictable Routine:</strong> Agree consistent times and dates so the child feels secure and anticipates the connection.</li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}
