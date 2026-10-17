import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getInviteByToken, updateInvite, getCase } from '../services/storage'
import { useCasesStore } from '../store/casesStore'
import { fetchStrapiInviteByToken, acceptStrapiInvite, fetchStrapiCaseById } from '../services/strapi'
import { useTranslation } from './useTranslation'
import type { CaseInvite, FamilyCase, User } from '../types/domain'
import { isUserCaseMember } from '../utils/caseMembership'
import { getInviteValidationIssue, INVITE_ERROR_MESSAGES } from '../utils/inviteUtils'
import { toast } from '../store/toastStore'

export interface UseInviteAcceptanceResult {
  user: User | null
  invite: CaseInvite | null
  caseDetails: FamilyCase | null
  error: string
  success: string
  loading: boolean
  isSubmitting: boolean
  handleAccept: () => Promise<void>
}

/**
 * Loads and validates a case invite by token (local storage first, then Strapi),
 * hydrates the linked case, and exposes the accept action for the signed-in user.
 */
export function useInviteAcceptance(token: string | undefined): UseInviteAcceptanceResult {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addOrUpdate, isStrapiMode, syncWithStrapi } = useCasesStore()
  const { t } = useTranslation()

  const [invite, setInvite] = useState<CaseInvite | null>(null)
  const [caseDetails, setCaseDetails] = useState<FamilyCase | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setError(t(INVITE_ERROR_MESSAGES.invalidLink.key) || INVITE_ERROR_MESSAGES.invalidLink.fallback)
      setLoading(false)
      return
    }

    let isMounted = true

    async function loadData() {
      try {
        let foundInvite: CaseInvite | null | undefined = getInviteByToken(token!)

        if (!foundInvite) {
          foundInvite = await fetchStrapiInviteByToken(token!)
        }

        if (!isMounted) return

        if (!foundInvite) {
          setError(t(INVITE_ERROR_MESSAGES.notFoundOrExpired.key) || INVITE_ERROR_MESSAGES.notFoundOrExpired.fallback)
          setLoading(false)
          return
        }

        const issue = getInviteValidationIssue(foundInvite)
        if (issue) {
          setError(t(INVITE_ERROR_MESSAGES[issue].key) || INVITE_ERROR_MESSAGES[issue].fallback)
          setLoading(false)
          return
        }

        setInvite(foundInvite)

        // Hydrate case details
        if (foundInvite.caseId) {
          let caseObj: FamilyCase | null | undefined = getCase(foundInvite.caseId)
          if (!caseObj && isStrapiMode) {
            caseObj = await fetchStrapiCaseById(foundInvite.caseId)
          }
          if (isMounted && caseObj) {
            setCaseDetails(caseObj)
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load invitation'
          setError(msg)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [token, isStrapiMode, t])

  async function handleAccept() {
    if (!invite || !user) return

    // Role mismatch check
    if (user.role !== invite.role) {
      const err = `Role mismatch: This invitation requires role ${invite.role}, but your account is registered as ${user.role}.`
      setError(err)
      toast.error(err, 'Role Mismatch')
      return
    }

    // Already member check
    if (caseDetails && isUserCaseMember(caseDetails, user)) {
      const msg = 'You are already an authorized collaborator on this case.'
      setError(msg)
      toast.info(msg, 'Already Joined')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      if (isStrapiMode && invite.token) {
        await acceptStrapiInvite(invite.token)
        await syncWithStrapi()
      } else if (caseDetails) {
        const updatedMembers = [
          ...(caseDetails.members || []),
          {
            userId: user.id,
            role: invite.role as 'McKenzieFriend' | 'Solicitor' | 'Barrister',
            invitedAt: new Date().toISOString(),
            invitedBy: invite.createdBy,
          },
        ]
        addOrUpdate({
          ...caseDetails,
          members: updatedMembers,
          seekingPeerSupport: false,
        })
        updateInvite(invite.id, {
          usedAt: new Date().toISOString(),
          usedBy: user.id,
        })
      }

      const successMsg = 'Invitation accepted! You are now connected to this case as an authorized peer supporter.'
      setSuccess(successMsg)
      toast.success(successMsg, 'Welcome to the Team')
      setTimeout(() => {
        navigate('/professional-dashboard')
      }, 1500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept invitation. Please try again.'
      setError(msg)
      toast.error(msg, 'Invitation Failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { user, invite, caseDetails, error, success, loading, isSubmitting, handleAccept }
}
