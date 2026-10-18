import { Form } from 'react-bootstrap'
import { FaMagic } from 'react-icons/fa'
import {
  PEER_SUPPORT_NOTE_MAX_LENGTH,
  PEER_SUPPORT_PRESET_TOPICS,
} from '../../utils/peerSupportRequestUtils'

export interface PeerRequestNoteFieldProps {
  label: string
  placeholder: string
  note: string
  onNoteChange: (note: string) => void
  onAddPreset: (presetLabel: string) => void
}

/**
 * "Help needed" note field with clickable preset topic pills and a character counter.
 */
export default function PeerRequestNoteField({
  label,
  placeholder,
  note,
  onNoteChange,
  onAddPreset,
}: PeerRequestNoteFieldProps) {
  return (
    <div className="mb-2">
      <div className="d-flex align-items-center justify-content-between mb-1.5">
        <Form.Label className="fw-semibold text-dark small mb-0 d-inline-flex align-items-center gap-1.5">
          <span>{label}</span>
        </Form.Label>
        <span className="d-inline-flex align-items-center gap-1 text-primary small fw-medium" style={{ fontSize: '0.75rem' }}>
          <FaMagic size={10} />
          <span>Click topic to insert</span>
        </span>
      </div>

      {/* Clickable Preset Pills */}
      <div className="d-flex align-items-center gap-1.5 flex-wrap mb-2">
        {PEER_SUPPORT_PRESET_TOPICS.map((topic) => (
          <button
            key={topic.label}
            type="button"
            className="btn btn-sm btn-outline-secondary py-1 px-2 rounded-pill small d-inline-flex align-items-center gap-1 text-nowrap shadow-none"
            style={{ fontSize: '0.76rem', borderColor: '#e2e8f0' }}
            onClick={() => onAddPreset(topic.label)}
          >
            <span>{topic.icon}</span>
            <span>{topic.label}</span>
          </button>
        ))}
      </div>

      {/* Textarea */}
      <Form.Control
        as="textarea"
        rows={3}
        placeholder={placeholder}
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        maxLength={PEER_SUPPORT_NOTE_MAX_LENGTH}
        className="shadow-xs"
        style={{
          fontSize: '0.88rem',
          borderColor: '#cbd5e1',
          borderRadius: '8px',
          lineHeight: '1.5',
        }}
      />

      <div className="d-flex align-items-center justify-content-between mt-1 text-muted" style={{ fontSize: '0.75rem' }}>
        <span>Be concise. You can share further position statements and court orders once accepted.</span>
        {/* Literal text kept (matches PEER_SUPPORT_NOTE_MAX_LENGTH) to preserve the original text nodes */}
        <span>{note.length} / 1000</span>
      </div>
    </div>
  )
}
