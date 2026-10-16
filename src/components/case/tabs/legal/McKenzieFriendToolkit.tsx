import { useState, useId } from 'react'
import { Card, Badge, Button, Form, Alert, Row, Col } from 'react-bootstrap'
import {
  FaUserFriends,
  FaFileContract,
  FaClipboardList,
  FaStickyNote,
  FaCopy,
  FaCheck,
  FaCheckCircle,
} from 'react-icons/fa'
import type { FamilyCase } from '../../../../types/domain'
import { useCasesStore } from '../../../../store/casesStore'
import { useAuthStore } from '../../../../store/authStore'
import { generateId } from '../../../../services/storage'

export interface McKenzieFriendToolkitProps {
  caseData: FamilyCase
}

export default function McKenzieFriendToolkit({ caseData }: McKenzieFriendToolkitProps) {
  const store = useCasesStore()
  const { user } = useAuthStore()
  const uniqueId = useId()

  // State for PD 27A Notice
  const [mckenzieName, setMckenzieName] = useState(user?.name || 'McKenzie Friend')
  const [mckenzieEmail] = useState(user?.email || 'mckenzie@layhelp.uk')
  const [copiedNotice, setCopiedNotice] = useState(false)
  const [noticeSaved, setNoticeSaved] = useState(false)

  // State for Live Hearing Note
  const [selectedHearing, setSelectedHearing] = useState(caseData.hearings[0]?.id || '')
  const [speakerRole, setSpeakerRole] = useState('Judge')
  const [liveNoteText, setLiveNoteText] = useState('')
  const [hearingNotesLog, setHearingNotesLog] = useState<string[]>([])
  const [hearingNoteSavedSuccess, setHearingNoteSavedSuccess] = useState(false)

  // State for Position Statement Review
  const [checkPageLimit, setCheckPageLimit] = useState(true)
  const [checkWelfare, setCheckWelfare] = useState(true)
  const [checkProposals, setCheckProposals] = useState(true)
  const [checkTone, setCheckTone] = useState(true)
  const [reviewComments, setReviewComments] = useState('')
  const [reviewPostedSuccess, setReviewPostedSuccess] = useState(false)

  const applicant = caseData.parties.find((p) => p.role === 'Applicant')
  const litigantName = applicant ? `${applicant.firstName} ${applicant.lastName}` : 'Litigant in Person'

  // Generate formal PD 27A notice text
  const generateDeclarationText = () => {
    return `IN THE FAMILY COURT AT ${caseData.court.toUpperCase()}
CASE NO: ${caseData.caseNumber || caseData.id}

NOTICE OF LAY ASSISTANCE (MCKENZIE FRIEND)
Pursuant to Practice Direction 27A & Practice Guidance: McKenzie Friends (Civil and Family Courts) [2010] 1 FLR 1677

1. CASE TITLE: ${caseData.title || caseData.id}
2. LITIGANT RECEIVING ASSISTANCE: ${litigantName}
3. MCKENZIE FRIEND:
   - Full Name: ${mckenzieName}
   - Contact Email: ${mckenzieEmail}

FORMAL UNDERTAKINGS AND DECLARATION:
1. I have read and agree to strictly abide by Practice Direction 27A and the Practice Guidance on McKenzie Friends.
2. I understand that my role is strictly confined to:
   a. Providing moral support for the litigant;
   b. Taking contemporaneous notes of court proceedings;
   c. Assisting with the organisation of court papers and bundles;
   d. Quietly advising on points of law, procedure, and questions for witnesses.
3. I understand that I do not possess an automatic right of audience or right to conduct litigation, unless exceptional leave is granted by the Judge upon oral application under D v S (Rights of Audience) [1997].
4. I declare that I have no personal, financial, or pecuniary interest in the outcome of these proceedings, nor any conflict of interest with either party.
5. I understand and undertake to maintain strict confidentiality in accordance with Family Procedure Rules 12.73 and Section 12 of the Administration of Justice Act 1960.

Date: ${new Date().toLocaleDateString('en-GB')}
Signature: __________________________ (${mckenzieName})`
  }

  const handleCopyDeclaration = () => {
    navigator.clipboard.writeText(generateDeclarationText())
    setCopiedNotice(true)
    setTimeout(() => setCopiedNotice(false), 2500)
  }

  const handleSaveDeclarationToNotes = () => {
    const text = `[FPR Practice Direction 27A - Lay Supporter Declaration Filed]\n\n${generateDeclarationText()}`
    const updated: FamilyCase = {
      ...caseData,
      notes: [
        ...caseData.notes,
        {
          id: generateId('NOTE'),
          createdAt: new Date().toISOString(),
          author: mckenzieName,
          text,
        },
      ],
    }
    store.addOrUpdate(updated)
    setNoticeSaved(true)
    setTimeout(() => setNoticeSaved(false), 3000)
  }

  const handleAddLiveLogEntry = () => {
    if (!liveNoteText.trim()) return
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const entry = `[${timestamp}] ${speakerRole}: ${liveNoteText.trim()}`
    setHearingNotesLog((prev) => [...prev, entry])
    setLiveNoteText('')
  }

  const handleCommitHearingNote = () => {
    if (hearingNotesLog.length === 0) return
    const hearingObj = caseData.hearings.find((h) => h.id === selectedHearing)
    const hearingTitle = hearingObj ? `${hearingObj.type} Hearing (${hearingObj.date})` : 'Court Hearing'
    const fullText = `[Contemporaneous Hearing Note - McKenzie Friend]\nHearing: ${hearingTitle}\nNotetaker: ${mckenzieName}\n\n${hearingNotesLog.join('\n')}`

    const updated: FamilyCase = {
      ...caseData,
      notes: [
        ...caseData.notes,
        {
          id: generateId('NOTE'),
          createdAt: new Date().toISOString(),
          author: mckenzieName,
          text: fullText,
        },
      ],
    }
    store.addOrUpdate(updated)
    setHearingNotesLog([])
    setHearingNoteSavedSuccess(true)
    setTimeout(() => setHearingNoteSavedSuccess(false), 3500)
  }

  const handleSavePositionReview = () => {
    const checksText = [
      checkPageLimit ? '✓ Length within 2-3 page bundle limit (PD 27A)' : '✗ Exceeds recommended 2-3 page limit',
      checkWelfare ? '✓ Statutory Welfare Checklist addressed (s.1(3) Children Act)' : '✗ Welfare checklist needs strengthening',
      checkProposals ? '✓ Specific Child Arrangements Order proposals included' : '✗ Proposed contact schedule missing or vague',
      checkTone ? '✓ Non-inflammatory, child-focused tone' : '✗ Emotional or combative tone needs revision',
    ].join('\n')

    const reviewText = `[Position Statement Review - McKenzie Friend]\nReviewer: ${mckenzieName}\n\nCompliance Checks:\n${checksText}\n\nSupporter Guidance & Comments:\n${reviewComments || 'No additional comments provided.'}`

    const updated: FamilyCase = {
      ...caseData,
      notes: [
        ...caseData.notes,
        {
          id: generateId('NOTE'),
          createdAt: new Date().toISOString(),
          author: mckenzieName,
          text: reviewText,
        },
      ],
    }
    store.addOrUpdate(updated)
    setReviewPostedSuccess(true)
    setReviewComments('')
    setTimeout(() => setReviewPostedSuccess(false), 3500)
  }

  return (
    <div className="d-flex flex-column gap-3">
      {/* Role Banner */}
      <div className="p-3 rounded-3 bg-success-subtle border border-success-subtle d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
        <div className="d-flex align-items-center gap-2.5">
          <span className="p-2 rounded-circle bg-success text-white shadow-xs">
            <FaUserFriends size={16} />
          </span>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h5 className="fw-bold mb-0 text-dark">McKenzie Friend Lay Support Toolkit</h5>
              <Badge bg="success" className="px-2 py-1">FPR Practice Direction 27A</Badge>
            </div>
            <p className="small text-secondary mb-0">
              Permitted assistance: Quiet guidance, contemporaneous note-taking, bundle organisation, and moral support for {litigantName}.
            </p>
          </div>
        </div>
      </div>

      <Row className="g-3">
        {/* Module 1: PD 27A Court Notice & Declaration */}
        <Col lg={6}>
          <Card className="h-100 border shadow-xs rounded-3">
            <Card.Header className="bg-white border-bottom py-2.5 px-3 d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark d-flex align-items-center gap-2 small">
                <FaFileContract className="text-success" />
                <span>1. Practice Direction 27A Court Notice</span>
              </span>
              <Badge bg="light" text="secondary" className="border">Mandatory for Court</Badge>
            </Card.Header>
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div>
                <p className="small text-secondary mb-3">
                  Under FPR PD 27A, a lay supporter should submit a written declaration of understanding and confidentiality to the court clerk and judge prior to the hearing.
                </p>

                <Form.Group className="mb-2">
                  <Form.Label className="small fw-semibold mb-1" htmlFor={`${uniqueId}-mckenzie-name`}>McKenzie Friend Name</Form.Label>
                  <Form.Control
                    id={`${uniqueId}-mckenzie-name`}
                    size="sm"
                    value={mckenzieName}
                    onChange={(e) => setMckenzieName(e.target.value)}
                  />
                </Form.Group>

                <div className="p-2.5 rounded bg-light border small text-monospace font-monospace mb-3 overflow-auto" style={{ maxHeight: '140px', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                  {generateDeclarationText()}
                </div>
              </div>

              {noticeSaved && (
                <Alert variant="success" className="py-1.5 px-2.5 small mb-2 d-flex align-items-center gap-1.5">
                  <FaCheckCircle className="text-success" />
                  <span>Declaration saved into Case Notes!</span>
                </Alert>
              )}

              <div className="d-flex gap-2">
                <Button
                  variant="outline-success"
                  size="sm"
                  className="w-100 d-inline-flex align-items-center justify-content-center gap-1.5 rounded-pill"
                  onClick={handleCopyDeclaration}
                >
                  {copiedNotice ? <FaCheck size={11} /> : <FaCopy size={11} />}
                  <span>{copiedNotice ? 'Copied Notice' : 'Copy Notice'}</span>
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  className="w-100 d-inline-flex align-items-center justify-content-center gap-1.5 rounded-pill"
                  onClick={handleSaveDeclarationToNotes}
                >
                  <FaStickyNote size={11} />
                  <span>Record in Notes</span>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Module 2: Hearing Attendance Note-Taker */}
        <Col lg={6}>
          <Card className="h-100 border shadow-xs rounded-3">
            <Card.Header className="bg-white border-bottom py-2.5 px-3 d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark d-flex align-items-center gap-2 small">
                <FaStickyNote className="text-success" />
                <span>2. Live Hearing Attendance Note-Taker</span>
              </span>
              <Badge bg="success-subtle" text="success" className="border border-success-subtle">Contemporaneous Log</Badge>
            </Card.Header>
            <Card.Body className="p-3 d-flex flex-column justify-content-between">
              <div>
                <div className="row g-2 mb-2">
                  <Col sm={6}>
                    <Form.Select
                      size="sm"
                      value={selectedHearing}
                      onChange={(e) => setSelectedHearing(e.target.value)}
                    >
                      <option value="">Hearing (General/Upcoming)</option>
                      {caseData.hearings.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.type} ({h.date})
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col sm={6}>
                    <Form.Select
                      size="sm"
                      value={speakerRole}
                      onChange={(e) => setSpeakerRole(e.target.value)}
                    >
                      <option value="Judge">Judge / Magistrates</option>
                      <option value="Opposing Party">Opposing Party / Counsel</option>
                      <option value="Litigant in Person">Litigant (Quiet Advice)</option>
                      <option value="Ruling">Judicial Direction / Ruling</option>
                    </Form.Select>
                  </Col>
                </div>

                <div className="input-group input-group-sm mb-2">
                  <Form.Control
                    placeholder="Enter spoken statement, prompt, or judge question..."
                    value={liveNoteText}
                    onChange={(e) => setLiveNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLiveLogEntry()}
                  />
                  <Button variant="outline-success" onClick={handleAddLiveLogEntry} disabled={!liveNoteText.trim()}>
                    + Log
                  </Button>
                </div>

                {/* Log display */}
                <div
                  className="p-2 rounded bg-light border small text-dark mb-2 overflow-auto"
                  style={{ minHeight: '85px', maxHeight: '110px', fontSize: '0.78rem' }}
                >
                  {hearingNotesLog.length === 0 ? (
                    <span className="text-muted fst-italic">No timestamped entries logged yet. Press Enter or "+ Log" during hearing.</span>
                  ) : (
                    hearingNotesLog.map((entry, idx) => <div key={idx} className="mb-1">{entry}</div>)
                  )}
                </div>
              </div>

              {hearingNoteSavedSuccess && (
                <Alert variant="success" className="py-1.5 px-2.5 small mb-2 d-flex align-items-center gap-1.5">
                  <FaCheckCircle className="text-success" />
                  <span>Hearing notes permanently saved to case!</span>
                </Alert>
              )}

              <Button
                variant="success"
                size="sm"
                className="w-100 d-inline-flex align-items-center justify-content-center gap-1.5 rounded-pill"
                onClick={handleCommitHearingNote}
                disabled={hearingNotesLog.length === 0}
              >
                <FaCheck size={11} />
                <span>Save Full Hearing Note ({hearingNotesLog.length} entries)</span>
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Module 3: Position Statement & Statement of Truth Review */}
        <Col lg={12}>
          <Card className="border shadow-xs rounded-3">
            <Card.Header className="bg-white border-bottom py-2.5 px-3 d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark d-flex align-items-center gap-2 small">
                <FaClipboardList className="text-success" />
                <span>3. Position Statement & C100 Review Tool (Lay Reviewer)</span>
              </span>
              <Badge bg="secondary" style={{ fontSize: '0.68rem' }}>Pre-Hearing Review</Badge>
            </Card.Header>
            <Card.Body className="p-3">
              <Row className="g-3">
                <Col md={5}>
                  <div className="p-2.5 bg-light rounded border h-100">
                    <h6 className="fw-bold small text-dark mb-2">FPR Position Statement Best Practice:</h6>
                    <div className="d-flex flex-column gap-2 small">
                      <Form.Check
                        type="checkbox"
                        id="chk-page"
                        label="Length ≤ 2-3 pages max (PD 27A guidelines)"
                        checked={checkPageLimit}
                        onChange={(e) => setCheckPageLimit(e.target.checked)}
                      />
                      <Form.Check
                        type="checkbox"
                        id="chk-welfare"
                        label="Children Act 1989 s.1(3) Welfare Checklist addressed"
                        checked={checkWelfare}
                        onChange={(e) => setCheckWelfare(e.target.checked)}
                      />
                      <Form.Check
                        type="checkbox"
                        id="chk-proposals"
                        label="Realistic proposed schedule for Child Arrangements Order"
                        checked={checkProposals}
                        onChange={(e) => setCheckProposals(e.target.checked)}
                      />
                      <Form.Check
                        type="checkbox"
                        id="chk-tone"
                        label="Calm, child-focused tone (no unsubstantiated allegations)"
                        checked={checkTone}
                        onChange={(e) => setCheckTone(e.target.checked)}
                      />
                    </div>
                  </div>
                </Col>

                <Col md={7}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-semibold mb-1" htmlFor={`${uniqueId}-review-comments`}>Lay Supporter Guidance & Feedback</Form.Label>
                    <Form.Control
                      id={`${uniqueId}-review-comments`}
                      as="textarea"
                      rows={3}
                      size="sm"
                      placeholder="Add practical suggestions for the Litigant in Person before they file or present their statement..."
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                    />
                  </Form.Group>

                  {reviewPostedSuccess && (
                    <Alert variant="success" className="py-1 px-2 small mb-2">
                      Review feedback posted to case notes!
                    </Alert>
                  )}

                  <div className="d-flex justify-content-end">
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="d-inline-flex align-items-center gap-1.5 rounded-pill px-3"
                      onClick={handleSavePositionReview}
                    >
                      <FaStickyNote size={11} />
                      <span>Post Review to Case Notes</span>
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
