import { useState, useEffect } from 'react'
import { Modal, Button, Form, Spinner } from 'react-bootstrap'
import { FaTasks, FaCheckCircle, FaFileAlt, FaGavel } from 'react-icons/fa'
import type { FamilyCase } from '../../types/domain'
import { getStagesForCase, getCurrentStageIndex } from '../../utils/caseStages'
import { useCasesStore } from '../../store/casesStore'
import { useCaseConfigStore } from '../../store/caseConfigStore'
import { useAuthStore } from '../../store/authStore'
import { generateId } from '../../services/storage'
import { toast } from '../../store/toastStore'

export interface UpdateCaseStageModalProps {
  show: boolean
  onHide: () => void
  caseData: FamilyCase
  initialStageId?: string
  onSuccess?: (updatedCase: FamilyCase) => void
}

export default function UpdateCaseStageModal({
  show,
  onHide,
  caseData,
  initialStageId,
  onSuccess,
}: UpdateCaseStageModalProps) {
  const store = useCasesStore()
  const caseStagesMap = useCaseConfigStore((state) => state.caseStagesMap)
  const { user } = useAuthStore()

  const stages = getStagesForCase(caseData, caseStagesMap)
  const currentStageIndex = getCurrentStageIndex(caseData, stages)
  const activeStage = stages[currentStageIndex]

  const [selectedStageId, setSelectedStageId] = useState(initialStageId || caseData.currentStage || stages[0]?.id || 'application')
  const [noteText, setNoteText] = useState('')
  const [markConcluded, setMarkConcluded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (show) {
      const defaultStage = initialStageId || caseData.currentStage || stages[0]?.id || 'application'
      setSelectedStageId(defaultStage)
      setNoteText('')
      setMarkConcluded(defaultStage === 'final')
    }
  }, [show, initialStageId, caseData.currentStage, stages])

  const selectedStage = stages.find((s) => s.id === selectedStageId)
  const selectedIndex = stages.findIndex((s) => s.id === selectedStageId)
  const isFinalStage = selectedIndex === stages.length - 1 || selectedStageId === 'final'

  async function handleSave() {
    if (!selectedStage) return
    setIsSubmitting(true)

    try {
      const stageName = selectedStage.name
      const authorName =
        user?.name ||
        (user as { username?: string })?.username ||
        (user?.email ? user.email.split('@')[0] : 'Team Member')

      const roleLabel =
        user?.role === 'McKenzieFriend'
          ? 'McKenzie Friend'
          : user?.role === 'Solicitor'
          ? 'Solicitor'
          : user?.role === 'Barrister'
          ? 'Barrister'
          : user?.role === 'LIP'
          ? 'Litigant in Person'
          : user?.role || 'Team Member'

      const auditNoteText = noteText.trim()
        ? `[Case Progress Updated] Stage moved to Stage ${selectedIndex + 1}: ${stageName}.\n\nNote: ${noteText.trim()}`
        : `[Case Progress Updated] Stage moved to Stage ${selectedIndex + 1}: ${stageName}.`

      const newNote = {
        id: generateId('NOTE'),
        createdAt: new Date().toISOString(),
        author: `${authorName} (${roleLabel})`,
        text: auditNoteText,
      }

      const updatedCase: FamilyCase = {
        ...caseData,
        currentStage: selectedStageId,
        status: markConcluded ? 'Concluded' : caseData.status,
        notes: [newNote, ...(caseData.notes || [])],
        lastUpdatedAt: new Date().toISOString(),
      }

      const saved = await store.addOrUpdate(updatedCase)
      toast.success(`Case progress updated to Stage ${selectedIndex + 1}: ${stageName}.`, 'Stage Updated')
      onSuccess?.(saved || updatedCase)
      onHide()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update case stage'
      toast.error(msg, 'Error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton className="border-bottom pb-3">
        <Modal.Title className="h5 fw-bold d-flex align-items-center gap-2 mb-0">
          <FaTasks className="text-primary" />
          <span>Update Case Procedural Progress</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3 p-md-4">
        {/* Current Stage Indicator */}
        <div className="p-2.5 bg-light rounded-3 border mb-3 d-flex align-items-center justify-content-between">
          <div>
            <span className="text-muted small d-block">Current Court Milestone:</span>
            <span className="fw-bold text-dark small">
              Stage {currentStageIndex + 1} of {stages.length}: {activeStage?.name || 'In Progress'}
            </span>
          </div>
          <span className="badge bg-secondary rounded-pill small">
            {caseData.status}
          </span>
        </div>

        {/* User Role Indicator */}
        <div className="small text-muted mb-3 d-flex align-items-center gap-1">
          <span>Updating as authorized member:</span>
          <strong className="text-dark">
            {user?.name || user?.email} ({user?.role === 'McKenzieFriend' ? 'McKenzie Friend' : user?.role || 'Member'})
          </strong>
        </div>

        {/* Stage Selection */}
        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Select New Procedural Stage</Form.Label>
          <Form.Select
            size="sm"
            value={selectedStageId}
            onChange={(e) => {
              const val = e.target.value
              setSelectedStageId(val)
              if (val === 'final') setMarkConcluded(true)
            }}
            disabled={isSubmitting}
          >
            {stages.map((st, idx) => (
              <option key={st.id} value={st.id}>
                Stage {idx + 1} of {stages.length}: {st.name} {idx === currentStageIndex ? '— (Current Active Stage)' : ''}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Stage Description Preview */}
        {selectedStage && (
          <div className="p-2.5 bg-primary-subtle border border-primary-subtle rounded-3 mb-3">
            <div className="fw-semibold text-primary small d-flex align-items-center gap-1.5 mb-1">
              <FaCheckCircle size={12} />
              <span>{selectedStage.name} (Stage {selectedIndex + 1})</span>
            </div>
            <div className="text-secondary small" style={{ fontSize: '0.82rem' }}>
              {selectedStage.description}
            </div>
          </div>
        )}

        {/* Court Directions / Notes */}
        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">
            Directions, Orders Made, or Attendance Note <span className="text-muted fw-normal">(optional)</span>
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            size="sm"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Record attendance outcomes, orders made, or agreed court directions..."
            disabled={isSubmitting}
          />
          <Form.Text className="text-muted" style={{ fontSize: '0.74rem' }}>
            This note will be automatically added to the case timeline and visible to all case team members.
          </Form.Text>
        </Form.Group>

        {/* Mark Concluded if Final Stage */}
        {isFinalStage && (
          <Form.Check
            type="checkbox"
            id="mark-case-concluded"
            label="Mark overall case proceedings as Concluded"
            checked={markConcluded}
            onChange={(e) => setMarkConcluded(e.target.checked)}
            className="small fw-semibold text-success mb-2"
          />
        )}
      </Modal.Body>

      <Modal.Footer className="border-top pt-2">
        <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => void handleSave()}
          disabled={isSubmitting}
          className="d-inline-flex align-items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Spinner as="span" animation="border" size="sm" />
              <span>Updating Stage...</span>
            </>
          ) : (
            <>
              {isFinalStage ? <FaGavel size={12} /> : <FaFileAlt size={12} />}
              <span>Set Stage: {selectedStage?.name || 'Update'}</span>
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
