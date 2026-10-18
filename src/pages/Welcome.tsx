import { Navigate } from 'react-router-dom'
import { useWelcomeVerification } from '../hooks/useWelcomeVerification'
import { getLandingRoute } from '../utils/authConstants'
import WelcomeVerifyCard from '../components/auth/WelcomeVerifyCard'

/**
 * Landing page after registration. Unverified users stay here until they confirm their email;
 * signed-out and already-verified users are sent on to the right place.
 */
export default function Welcome() {
  const welcome = useWelcomeVerification()
  const { user } = welcome

  if (!user || user.isVerified) {
    return <Navigate to={getLandingRoute(user)} replace />
  }

  return (
    <WelcomeVerifyCard
      name={user.name}
      email={user.email}
      role={user.role}
      token={user.verificationToken}
      notice={welcome.notice}
      onDismissNotice={welcome.dismissNotice}
      checking={welcome.checking}
      sending={welcome.sending}
      onCheckVerified={welcome.checkVerified}
      onSendEmail={welcome.sendVerificationEmail}
      onUseDifferentAccount={welcome.switchAccount}
      onOpenVerificationLink={welcome.openVerificationLink}
    />
  )
}
