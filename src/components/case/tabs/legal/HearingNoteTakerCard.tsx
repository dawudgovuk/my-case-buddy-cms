import { useState } from 'react'
import { Card, Badge, Button, Form, Col } from 'react-bootstrap'
import { FaStickyNote, FaCheck } from 'react-icons/fa'
import type { Hearing } from '../../../../types/domain'
import { toast } from '../../../../store/toastStore'
import {
  DEFAULT_SPEAKER_ROLE,
  SPEAKER_ROLE_OPTIONS,
  buildHearingNoteText,
  formatHearingLogEntry,
} from '../../../../utils/mckenzieToolkit'
import { ToolkitCardHeader, ToolkitSavedAlert } from './ToolkitCardParts'

export interface HearingNoteTakerCardProps {
  hearings: Hearing[]
  /** Name recorded as the notetaker. */
  notetaker: string
  /** Persists a note into the case. */
  onSaveNote: (text: string) => void
}

/**
 * Module 2: live hearing attendance note-taker — timestamped, speaker-attributed
 * log entries committed to case notes as one contemporaneous note.
 */
export default function HearingNoteTakerCard({ hearings, notetaker, onSaveNote }: HearingNoteTakerCardProps) {
  const [selectedHearing, setSelectedHearing] = useState(hearings[0]?.id || '')
  const [speakerRole, setSpeakerRole] = useState(DEFAULT_SPEAKER_ROLE)
  const [liveNoteText, setLiveNoteText] = useState('')
  const [hearingNotesLog, setHearingNotesLog] = useState<string[]>([])
  const [hearingNoteSavedSuccess, setHearingNoteSavedSuccess] = useState(false)

  const handleAddLiveLogEntry = () => {
    if (!liveNoteText.trim()) return
    const entry = formatHearingLogEntry(speakerRole, liveNoteText.trim())
    setHearingNotesLog((prev) => [...prev, entry])
    toast.info(`Logged remark for ${speakerRole}.`, 'Remark Logged')
    setLiveNoteText('')
  }

  const handleCommitHearingNote = () => {
    if (hearingNotesLog.length === 0) return
    onSaveNote(buildHearingNoteText(hearings, selectedHearing, notetaker, hearingNotesLog))
    setHearingNotesLog([])
    setHearingNoteSavedSuccess(true)
    toast.success(`Contemporaneous hearing log committed to case notes.`, 'Hearing Notes Saved')
    setTimeout(() => setHearingNoteSavedSuccess(false), 3500)
  }

  return (
    <Card className="h-100 border shadow-xs rounded-3">
      <ToolkitCardHeader
        icon={FaStickyNote}
        title="2. Live Hearing Attendance Note-Taker"
        badge={<Badge bg="success-subtle" text="success" className="border border-success-subtle">Contemporaneous Log</Badge>}
      />
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
                {hearings.map((h) => (
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
                {SPEAKER_ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
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

        {hearingNoteSavedSuccess && <ToolkitSavedAlert>Hearing notes permanently saved to case!</ToolkitSavedAlert>}

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
  )
}
