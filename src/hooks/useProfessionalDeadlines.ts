import { useEffect, useMemo, useState } from 'react'
import { getDeadlinesForUser, updateDeadline } from '../services/storage'
import { fetchStrapiDeadlines, updateStrapiDeadlineStatus } from '../services/strapi'
import type { DocumentDeadline, User } from '../types/domain'
import { toast } from '../store/toastStore'
import { countPendingDeadlines } from '../utils/dashboardUtils'

export interface UseProfessionalDeadlinesOptions {
  user: User | null
  isStrapiMode: boolean
  syncWithStrapi: () => Promise<void>
}

export interface UseProfessionalDeadlinesReturn {
  deadlines: DocumentDeadline[]
  pendingDeadlinesCount: number
  toggleDeadline: (deadlineId: string, currentStatus: DocumentDeadline['status']) => void
}

/**
 * Loads the user's document deadlines (local, then Strapi when enabled) and toggles their submission status.
 * Also triggers a Strapi case sync when the user or Strapi mode changes.
 */
export function useProfessionalDeadlines({
  user,
  isStrapiMode,
  syncWithStrapi,
}: UseProfessionalDeadlinesOptions): UseProfessionalDeadlinesReturn {
  const [deadlines, setDeadlines] = useState<DocumentDeadline[]>([])

  useEffect(() => {
    if (!user) return
    const userDeadlines = getDeadlinesForUser(user.id)
    setDeadlines(userDeadlines)

    if (isStrapiMode) {
      void syncWithStrapi()
      fetchStrapiDeadlines()
        .then((strapiDeadlines) => {
          if (strapiDeadlines && strapiDeadlines.length > 0) {
            setDeadlines(strapiDeadlines)
          }
        })
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isStrapiMode])

  const pendingDeadlinesCount = useMemo(() => countPendingDeadlines(deadlines), [deadlines])

  function toggleDeadline(deadlineId: string, currentStatus: DocumentDeadline['status']) {
    const newStatus = currentStatus === 'submitted' ? 'pending' : 'submitted'
    const dl = deadlines.find((d) => d.id === deadlineId)
    updateDeadline(deadlineId, {
      status: newStatus,
      submittedAt: newStatus === 'submitted' ? new Date().toISOString() : undefined,
    })
    setDeadlines((prev) =>
      prev.map((d) =>
        d.id === deadlineId
          ? { ...d, status: newStatus, submittedAt: newStatus === 'submitted' ? new Date().toISOString() : undefined }
          : d
      )
    )

    if (newStatus === 'submitted') {
      toast.success(`Marked deadline "${dl?.title || 'item'}" as submitted.`, 'Deadline Completed')
    } else {
      toast.info(`Reopened deadline "${dl?.title || 'item'}".`, 'Deadline Pending')
    }

    if (isStrapiMode) {
      updateStrapiDeadlineStatus(deadlineId, newStatus).catch(() => {
        // Fallback without disruption
      })
    }
  }

  return { deadlines, pendingDeadlinesCount, toggleDeadline }
}
