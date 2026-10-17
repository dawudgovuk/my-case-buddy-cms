import { useNavigate, useParams } from 'react-router-dom'
import { useInviteAcceptance } from '../hooks/useInviteAcceptance'
import { getInviteRoleLabel, getInviteRoleTheme } from '../utils/inviteUtils'
import InviteLoadingState from '../components/invite/InviteLoadingState'
import InviteErrorCard from '../components/invite/InviteErrorCard'
import InviteSignInPrompt from '../components/invite/InviteSignInPrompt'
import InviteAcceptPanel from '../components/invite/InviteAcceptPanel'
import InviteCaseSnapshot from '../components/invite/InviteCaseSnapshot'

export default function InviteAccept() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const { user, invite, caseDetails, error, success, loading, isSubmitting, handleAccept } =
    useInviteAcceptance(token)

  if (loading) {
    return <InviteLoadingState />
  }

  if (error) {
    return (
      <InviteErrorCard
        error={error}
        onSignIn={() => navigate('/login')}
        onGoToDashboard={() => navigate('/professional-dashboard')}
      />
    )
  }

  if (!user) {
    return (
      <InviteSignInPrompt
        roleLabel={getInviteRoleLabel(invite?.role)}
        onSignIn={() => navigate('/login')}
        onRegister={() => navigate(`/register/${invite?.role || 'McKenzieFriend'}`)}
      />
    )
  }

  return (
    <InviteAcceptPanel
      user={user}
      roleTheme={getInviteRoleTheme(invite?.role)}
      success={success}
      isSubmitting={isSubmitting}
      caseSnapshot={<InviteCaseSnapshot caseDetails={caseDetails} caseId={invite?.caseId} />}
      onAccept={handleAccept}
      onDecline={() => navigate('/professional-dashboard')}
    />
  )
}
