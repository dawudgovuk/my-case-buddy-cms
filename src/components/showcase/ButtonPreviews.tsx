import { useState } from 'react'
import { Card } from 'react-bootstrap'
import {
  CaseActionButton,
  PeerSupportButton,
  ViewCaseButton,
  EditCaseButton,
  DeleteCaseButton,
  CaseCardActions,
} from '../common/CaseCardButtons'
import { FaBookmark, FaShareAlt, FaDownload } from 'react-icons/fa'

export function ButtonsPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [seeking, setSeeking] = useState(false)
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('horizontal')

  return (
    <div>
      <div className="mb-4">
        <div className="small fw-semibold text-secondary mb-2">Specialized Case Buttons</div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <PeerSupportButton
            isSeekingPeerSupport={seeking}
            onToggle={() => {
              const next = !seeking
              setSeeking(next)
              onFeedback(`Peer support: ${next ? 'Active (Open)' : 'Disabled'}`)
            }}
            fullWidth={false}
          />
          <ViewCaseButton
            caseId="FC-23-00035"
            onView={(id) => onFeedback(`ViewCaseButton clicked: ${id}`)}
            fullWidth={false}
          />
          <EditCaseButton
            caseId="FC-23-00035"
            onEdit={(id) => onFeedback(`EditCaseButton clicked: ${id}`)}
            fullWidth={false}
          />
          <DeleteCaseButton
            caseId="FC-23-00035"
            onDelete={(id) => onFeedback(`DeleteCaseButton clicked: ${id}`)}
            fullWidth={false}
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="small fw-semibold text-secondary mb-2">Generic CaseActionButton Variants</div>
        <div className="d-flex flex-wrap gap-2">
          <CaseActionButton variant="primary" icon={<FaBookmark />} onClick={() => onFeedback('Bookmark clicked')}>
            Bookmark
          </CaseActionButton>
          <CaseActionButton variant="outline-primary" icon={<FaShareAlt />} onClick={() => onFeedback('Share clicked')}>
            Share Case
          </CaseActionButton>
          <CaseActionButton variant="success" icon={<FaDownload />} onClick={() => onFeedback('Download clicked')}>
            Download Bundle
          </CaseActionButton>
          <CaseActionButton variant="outline-danger" onClick={() => onFeedback('Danger clicked')}>
            Archive
          </CaseActionButton>
        </div>
      </div>

      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="small fw-semibold text-secondary">CaseCardActions Layout Container</span>
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className={`btn ${layout === 'horizontal' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setLayout('horizontal')}
            >
              Horizontal
            </button>
            <button
              type="button"
              className={`btn ${layout === 'vertical' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setLayout('vertical')}
            >
              Vertical
            </button>
          </div>
        </div>
        <Card className="p-3 bg-white border">
          <CaseCardActions layout={layout}>
            <ViewCaseButton caseId="FC-23-00035" fullWidth={layout === 'vertical'} onView={(id) => onFeedback(`View ${id}`)} />
            <EditCaseButton caseId="FC-23-00035" fullWidth={layout === 'vertical'} onEdit={(id) => onFeedback(`Edit ${id}`)} />
          </CaseCardActions>
        </Card>
      </div>
    </div>
  )
}
