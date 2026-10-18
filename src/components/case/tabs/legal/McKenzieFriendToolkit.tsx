import { useState, useId } from 'react'
import { Badge, Row, Col } from 'react-bootstrap'
import { FaUserFriends } from 'react-icons/fa'
import type { FamilyCase } from '../../../../types/domain'
import { useCasesStore } from '../../../../store/casesStore'
import { useAuthStore } from '../../../../store/authStore'
import { withAppendedNote } from '../../../../utils/caseNotes'
import {
  DEFAULT_MCKENZIE_EMAIL,
  DEFAULT_MCKENZIE_NAME,
  buildDeclarationText,
  getLitigantName,
} from '../../../../utils/mckenzieToolkit'
import PracticeDirectionNoticeCard from './PracticeDirectionNoticeCard'
import HearingNoteTakerCard from './HearingNoteTakerCard'
import PositionStatementReviewCard from './PositionStatementReviewCard'

export interface McKenzieFriendToolkitProps {
  caseData: FamilyCase
}

export default function McKenzieFriendToolkit({ caseData }: McKenzieFriendToolkitProps) {
  const store = useCasesStore()
  const { user } = useAuthStore()
  const uniqueId = useId()

  // State for PD 27A Notice
  const [mckenzieName, setMckenzieName] = useState(user?.name || DEFAULT_MCKENZIE_NAME)
  const [mckenzieEmail] = useState(user?.email || DEFAULT_MCKENZIE_EMAIL)

  const litigantName = getLitigantName(caseData)

  // Generate formal PD 27A notice text
  const generateDeclarationText = () =>
    buildDeclarationText({ caseData, litigantName, mckenzieName, mckenzieEmail })

  /** Appends a note authored by the McKenzie Friend to the case. */
  const saveNote = (text: string) => {
    store.addOrUpdate(withAppendedNote(caseData, mckenzieName, text))
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
          <PracticeDirectionNoticeCard
            idPrefix={uniqueId}
            mckenzieName={mckenzieName}
            onMckenzieNameChange={setMckenzieName}
            getDeclarationText={generateDeclarationText}
            onSaveNote={saveNote}
          />
        </Col>

        {/* Module 2: Hearing Attendance Note-Taker */}
        <Col lg={6}>
          <HearingNoteTakerCard hearings={caseData.hearings} notetaker={mckenzieName} onSaveNote={saveNote} />
        </Col>

        {/* Module 3: Position Statement & Statement of Truth Review */}
        <Col lg={12}>
          <PositionStatementReviewCard idPrefix={uniqueId} reviewer={mckenzieName} onSaveNote={saveNote} />
        </Col>
      </Row>
    </div>
  )
}
