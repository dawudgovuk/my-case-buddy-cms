// Removed Material UI imports
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getInviteByToken, updateInvite, getCase } from '../services/storage'
import { useCasesStore } from '../store/casesStore'
import type { CaseInvite } from '../types/domain'

export default function InviteAccept() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const { user } = useAuthStore()
  const { addOrUpdate } = useCasesStore()
  const [invite, setInvite] = useState<CaseInvite | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link')
      setLoading(false)
      return
    }

    const foundInvite = getInviteByToken(token)
    if (!foundInvite) {
      setError('Invite link not found or has expired')
      setLoading(false)
      return
    }

    if (foundInvite.usedAt) {
      setError('This invite link has already been used')
      setLoading(false)
      return
    }

    if (foundInvite.expiresAt && new Date(foundInvite.expiresAt) < new Date()) {
      setError('This invite link has expired')
      setLoading(false)
      return
    }

    setInvite(foundInvite)
    setLoading(false)
  }, [token])

  function handleAccept() {
    if (!invite || !user) return

    // Check if user role matches invite role
    if (user.role !== invite.role) {
      setError(`This invite is for ${invite.role} role, but you are registered as ${user.role}`)
      return
    }

    // Get the case
    const caseData = getCase(invite.caseId)
    if (!caseData) {
      setError('Case not found')
      return
    }

    // Check if user is already a member
    if (caseData.members?.some(m => m.userId === user.id)) {
      setError('You are already a member of this case')
      return
    }

    // Add user as a member
    const updatedCase = {
      ...caseData,
      members: [
        ...(caseData.members || []),
        {
          userId: user.id,
          role: invite.role as 'McKenzieFriend' | 'Solicitor' | 'Barrister',
          invitedAt: new Date().toISOString(),
          invitedBy: invite.createdBy,
        },
      ],
    }

    addOrUpdate(updatedCase)

    // Mark invite as used
    updateInvite(invite.id, {
      usedAt: new Date().toISOString(),
      usedBy: user.id,
    })

    // Navigate to case
    navigate(`/cases/${invite.caseId}`)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0002', padding: 32, maxWidth: 420, width: '100%' }}>
          <div style={{ background: 'var(--danger-color, #ffeaea)', color: '#b00020', borderRadius: 8, padding: 12, marginBottom: 12, textAlign: 'center', fontWeight: 600 }}>Error</div>
          <div style={{ marginBottom: 18, textAlign: 'center' }}>{error}</div>
          <button className="btn" style={{ width: '100%', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontWeight: 600, fontSize: 16 }} onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0002', padding: 32, maxWidth: 420, width: '100%' }}>
          <h4 style={{ color: 'var(--primary-color)', fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Please Log In</h4>
          <div style={{ marginBottom: 18, textAlign: 'center', color: '#444' }}>
            You need to be logged in to accept this invite. If you don't have an account, please register first.
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'center' }}>
            <button className="btn" style={{ flex: 1, background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: 8, padding: 10, fontWeight: 600, fontSize: 15 }} onClick={() => navigate(`/register/${invite?.role}`)}>
              Register as {invite?.role}
            </button>
            <button className="btn" style={{ flex: 1, background: '#fff', color: 'var(--primary-color)', border: '1.5px solid var(--primary-color)', borderRadius: 8, fontWeight: 600, fontSize: 15, padding: 10 }} onClick={() => navigate('/login')}>
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const caseData = invite ? getCase(invite.caseId) : null

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #0002', padding: 32, maxWidth: 420, width: '100%' }}>
        <h4 style={{ color: 'var(--primary-color)', fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Case Invitation</h4>
        <div style={{ marginBottom: 12, textAlign: 'center', color: '#444' }}>
          You have been invited to join a case as a <strong>{invite?.role}</strong>.
        </div>
        {caseData && (
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: 13, marginBottom: 2 }}>Case Details:</div>
            <div style={{ fontWeight: 600 }}>{caseData.id} — {caseData.title}</div>
            <div style={{ color: '#888', fontSize: 13 }}>{caseData.court} • {caseData.caseType}</div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn" style={{ flex: 1, background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontWeight: 600, fontSize: 16 }} onClick={handleAccept}>
            Accept Invitation
          </button>
          <button className="btn" style={{ flex: 1, background: '#fff', color: 'var(--primary-color)', border: '1.5px solid var(--primary-color)', borderRadius: 8, fontWeight: 600, fontSize: 16, padding: 12 }} onClick={() => navigate('/dashboard')}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
