import type { UserRole } from '../../types/domain'
import { useRegistrationEmailPreview } from '../../hooks/useRegistrationEmailPreview'
import { getRoleDisplayName } from '../../utils/authConstants'
import RegistrationEmailTabs from './RegistrationEmailTabs'
import ConfirmationEmailPanel from './ConfirmationEmailPanel'
import VerificationEmailPanel from './VerificationEmailPanel'

export interface RegistrationEmailPreviewProps {
  name: string
  email: string
  token: string
  role: UserRole
  referenceId?: string
  /** Opens the verification link (same as selecting it in the email). */
  onVerify: (token: string) => void
}

/**
 * In-app copy of the two registration emails (confirmation and verification),
 * shown in tabs with the verification email first.
 */
export default function RegistrationEmailPreview({
  name,
  email,
  token,
  role,
  referenceId = 'REG-001',
  onVerify,
}: RegistrationEmailPreviewProps) {
  const isLIP = role === 'LIP'
  const roleDisplay = getRoleDisplayName(role)
  const { activeTab, setActiveTab, copied, confirmationEmail, verificationEmail, verificationUrl, handleCopy } =
    useRegistrationEmailPreview({ name, email, token, role, referenceId, initialTab: 'verification' })

  return (
    <div>
      <RegistrationEmailTabs activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === 'confirmation' ? (
        <ConfirmationEmailPanel
          email={confirmationEmail}
          recipientName={name}
          recipientEmail={email}
          roleDisplay={roleDisplay}
          isLIP={isLIP}
          onViewVerification={() => setActiveTab('verification')}
        />
      ) : (
        <VerificationEmailPanel
          email={verificationEmail}
          recipientName={name}
          recipientEmail={email}
          roleDisplay={roleDisplay}
          isLIP={isLIP}
          verificationUrl={verificationUrl}
          copied={copied}
          onCopy={handleCopy}
          onVerify={() => onVerify(token)}
        />
      )}
    </div>
  )
}
