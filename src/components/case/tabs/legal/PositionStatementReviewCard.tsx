import { useState } from 'react'
import { Card, Badge, Button, Form, Alert, Row, Col } from 'react-bootstrap'
import { FaClipboardList, FaStickyNote } from 'react-icons/fa'
import { toast } from '../../../../store/toastStore'
import {
  INITIAL_POSITION_REVIEW_CHECKS,
  POSITION_REVIEW_CHECKS,
  buildPositionReviewText,
  type PositionReviewCheckKey,
  type PositionReviewChecks,
} from '../../../../utils/mckenzieToolkit'
import { ToolkitCardHeader } from './ToolkitCardParts'

export interface PositionStatementReviewCardProps {
  /** Prefix for form control ids (from `useId`). */
  idPrefix: string
  /** Name recorded as the reviewer. */
  reviewer: string
  /** Persists a note into the case. */
  onSaveNote: (text: string) => void
}

/**
 * Module 3: lay reviewer checklist for position statements / C100s, with free-text
 * guidance posted to case notes.
 */
export default function PositionStatementReviewCard({ idPrefix, reviewer, onSaveNote }: PositionStatementReviewCardProps) {
  const [checks, setChecks] = useState<PositionReviewChecks>(INITIAL_POSITION_REVIEW_CHECKS)
  const [reviewComments, setReviewComments] = useState('')
  const [reviewPostedSuccess, setReviewPostedSuccess] = useState(false)

  const setCheck = (key: PositionReviewCheckKey, value: boolean) => {
    setChecks((prev) => ({ ...prev, [key]: value }))
  }

  const handleSavePositionReview = () => {
    onSaveNote(buildPositionReviewText(reviewer, checks, reviewComments))
    setReviewPostedSuccess(true)
    setReviewComments('')
    toast.success('Position statement compliance review saved to case notes.', 'Review Saved')
    setTimeout(() => setReviewPostedSuccess(false), 3500)
  }

  return (
    <Card className="border shadow-xs rounded-3">
      <ToolkitCardHeader
        icon={FaClipboardList}
        title="3. Position Statement & C100 Review Tool (Lay Reviewer)"
        badge={<Badge bg="secondary" style={{ fontSize: '0.68rem' }}>Pre-Hearing Review</Badge>}
      />
      <Card.Body className="p-3">
        <Row className="g-3">
          <Col md={5}>
            <div className="p-2.5 bg-light rounded border h-100">
              <h6 className="fw-bold small text-dark mb-2">FPR Position Statement Best Practice:</h6>
              <div className="d-flex flex-column gap-2 small">
                {POSITION_REVIEW_CHECKS.map((check) => (
                  <Form.Check
                    key={check.key}
                    type="checkbox"
                    id={check.id}
                    label={check.label}
                    checked={checks[check.key]}
                    onChange={(e) => setCheck(check.key, e.target.checked)}
                  />
                ))}
              </div>
            </div>
          </Col>

          <Col md={7}>
            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold mb-1" htmlFor={`${idPrefix}-review-comments`}>Lay Supporter Guidance & Feedback</Form.Label>
              <Form.Control
                id={`${idPrefix}-review-comments`}
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
  )
}
