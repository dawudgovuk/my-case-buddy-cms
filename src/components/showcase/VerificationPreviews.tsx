import VerificationGateCard from '../verification/VerificationGateCard'
import CaseStatusBadge from '../common/CaseStatusBadge'

export function VerificationGateCardPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  return (
    <div>
      <VerificationGateCard
        userEmail="barrister.thorne@temple-chambers.co.uk"
        verificationToken="token_preview_sample_123"
        onVerifyClick={(token) => onFeedback(`Verification simulated with token: ${token}`)}
        assignedCasesCount={2}
        onSwitchToAssigned={() => onFeedback('Switched to assigned cases tab')}
        onResendEmail={() => onFeedback('Resend verification email clicked')}
      />
    </div>
  )
}

export function CaseStatusBadgePreview() {
  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <div className="small fw-semibold text-secondary mb-2">Standard Sizes</div>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <CaseStatusBadge status="Open" size="sm" />
          <CaseStatusBadge status="Open" size="md" />
          <CaseStatusBadge status="Open" size="lg" />
        </div>
      </div>

      <div>
        <div className="small fw-semibold text-secondary mb-2">Semantic Case Statuses</div>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <CaseStatusBadge status="Open" />
          <CaseStatusBadge status="Stayed" />
          <CaseStatusBadge status="Concluded" />
          <CaseStatusBadge status="Adjourned" />
        </div>
      </div>

      <div>
        <div className="small fw-semibold text-secondary mb-2">Without Status Icon</div>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <CaseStatusBadge status="Open" showIcon={false} />
          <CaseStatusBadge status="Stayed" showIcon={false} />
          <CaseStatusBadge status="Concluded" showIcon={false} />
        </div>
      </div>
    </div>
  )
}
