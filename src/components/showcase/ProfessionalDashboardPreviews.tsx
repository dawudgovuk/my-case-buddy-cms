import { useState } from 'react'
import { Button } from 'react-bootstrap'
import ProfessionalHeader from '../dashboard/ProfessionalHeader'
import SystemQuickGuide from '../dashboard/SystemQuickGuide'
import ProfessionalFaqModal from '../dashboard/ProfessionalFaqModal'
import type { User } from '../../types/domain'

const mockVerifiedUser: User = {
  id: 'user-prof-1',
  name: 'Kevin Allen',
  email: 'kevin.allen@chambers.co.uk',
  role: 'McKenzieFriend',
  firm: 'London Family Court Support Network',
  isVerified: true,
}

const mockUnverifiedUser: User = {
  id: 'user-prof-2',
  name: 'Sarah Jenkins',
  email: 'mf.sarah.jenkins@example.com',
  role: 'McKenzieFriend',
  isVerified: false,
  verificationToken: 'preview_token_123',
}

export function ProfessionalHeaderPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [isVerified, setIsVerified] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(true)
  const [showFaq, setShowFaq] = useState(false)

  const activeUser = isVerified ? mockVerifiedUser : mockUnverifiedUser

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex gap-2 align-items-center">
        <Button
          size="sm"
          variant={isVerified ? 'success' : 'outline-warning'}
          onClick={() => {
            setIsVerified(!isVerified)
            onFeedback(`Toggled preview user verification to: ${!isVerified}`)
          }}
        >
          Toggle Verification ({isVerified ? 'Verified' : 'Unverified'})
        </Button>
      </div>

      <ProfessionalHeader
        user={activeUser}
        assignedCasesCount={2}
        peerSupportCasesCount={4}
        upcomingHearingsCount={3}
        pendingDeadlinesCount={1}
        isGuideOpen={isGuideOpen}
        onToggleGuide={() => {
          setIsGuideOpen(!isGuideOpen)
          onFeedback(`Guide toggled: ${!isGuideOpen}`)
        }}
        onOpenFaq={() => {
          setShowFaq(true)
          onFeedback('FAQ Modal opened')
        }}
        onVerifyClick={() => onFeedback('One-click verify triggered')}
        onSelectTab={(tab) => onFeedback(`Tab clicked: ${tab}`)}
      />

      <ProfessionalFaqModal show={showFaq} onHide={() => setShowFaq(false)} />
    </div>
  )
}

export function SystemQuickGuidePreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isVerified, setIsVerified] = useState(false)

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex gap-2">
        <Button size="sm" variant="outline-primary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Close Guide' : 'Open Guide'}
        </Button>
        <Button size="sm" variant="outline-secondary" onClick={() => setIsVerified(!isVerified)}>
          Toggle Status ({isVerified ? 'Verified' : 'Pending'})
        </Button>
      </div>

      <SystemQuickGuide
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          onFeedback('Guide dismissed')
        }}
        isVerified={isVerified}
        onVerifyClick={() => onFeedback('Verify clicked')}
        onViewAssignedClick={() => onFeedback('View assigned clicked')}
        onOpenFaq={() => onFeedback('Open FAQ clicked')}
        assignedCasesCount={2}
      />
    </div>
  )
}

export function ProfessionalFaqModalPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [show, setShow] = useState(false)

  return (
    <div>
      <Button
        variant="primary"
        onClick={() => {
          setShow(true)
          onFeedback('Opened System FAQ Modal')
        }}
      >
        Open Role & System FAQ Modal
      </Button>
      <ProfessionalFaqModal show={show} onHide={() => setShow(false)} />
    </div>
  )
}
