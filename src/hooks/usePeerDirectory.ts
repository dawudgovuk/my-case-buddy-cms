import { useState, useMemo, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { useCasesStore } from '../store/casesStore'
import { listUsers } from '../services/auth'
import { fetchStrapiProfessionals } from '../services/strapi'
import type { FamilyCase, User } from '../types/domain'
import { isUserCaseMember } from '../utils/caseMembership'
import {
  countProfessionalsByRole,
  filterProfessionals,
  isVerifiedLegalProfessional,
  type DirectoryCounts,
  type DirectoryRoleFilter,
} from '../utils/directoryUtils'
import { toast } from '../store/toastStore'

export interface UsePeerDirectoryResult {
  user: User | null
  roleFilter: DirectoryRoleFilter
  setRoleFilter: (role: DirectoryRoleFilter) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  requestTargetUser: string | null
  successMessage: string | null
  dismissSuccessMessage: () => void
  isLoadingPros: boolean
  counts: DirectoryCounts
  filtered: User[]
  targetProfessional: User | null
  myCases: FamilyCase[]
  refreshProfessionals: () => void
  handleOpenRequestModal: (professionalId: string) => void
  handleCloseRequestModal: () => void
  handleSendRequest: (caseId: string, note: string) => Promise<void>
  handleClearFilters: () => void
}

/**
 * State and actions for the verified legal professionals directory: loading professionals
 * (Strapi or local), search / role filtering, and sending peer support requests.
 */
export function usePeerDirectory(): UsePeerDirectoryResult {
  const { user } = useAuthStore()
  const { cases, requestPeerSupport, isStrapiMode, syncWithStrapi } = useCasesStore()

  const [roleFilter, setRoleFilter] = useState<DirectoryRoleFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [requestTargetUser, setRequestTargetUser] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [strapiPros, setStrapiPros] = useState<User[]>([])
  const [isLoadingPros, setIsLoadingPros] = useState<boolean>(false)

  const loadProfessionals = useCallback((isUserInitiated = false) => {
    setIsLoadingPros(true)
    if (isUserInitiated) {
      toast.info('Reloading verified legal professionals directory...', 'Refreshing Directory')
    }
    fetchStrapiProfessionals()
      .then((pros) => {
        setStrapiPros(pros || [])
        if (isUserInitiated) {
          toast.success(`Found ${pros?.length || 0} active legal professionals.`, 'Directory Updated')
        }
      })
      .catch((err) => {
        console.warn('Could not fetch Strapi professionals:', err)
        setStrapiPros([])
        if (isUserInitiated) {
          toast.error('Could not refresh legal professionals directory.', 'Directory Sync Error')
        }
      })
      .finally(() => {
        setIsLoadingPros(false)
      })
  }, [])

  useEffect(() => {
    loadProfessionals()
  }, [loadProfessionals])

  useEffect(() => {
    if (isStrapiMode && cases.length === 0) {
      void syncWithStrapi()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStrapiMode])

  // Legal professionals (Solicitor, Barrister, McKenzieFriend) from Strapi or local store
  const professionals = useMemo(() => {
    if (isStrapiMode) {
      return strapiPros
    }
    return listUsers().filter(isVerifiedLegalProfessional)
  }, [isStrapiMode, strapiPros])

  // Dynamic counts for filter chips
  const counts = useMemo(() => countProfessionalsByRole(professionals), [professionals])

  const filtered = useMemo(
    () => filterProfessionals(professionals, roleFilter, searchTerm),
    [professionals, roleFilter, searchTerm]
  )

  const targetProfessional = useMemo(() => {
    if (!requestTargetUser) return null
    return professionals.find((p) => p.id === requestTargetUser) || null
  }, [requestTargetUser, professionals])

  const myCases = useMemo(() => {
    if (!user) return []
    const owned = cases.filter((c) => isUserCaseMember(c, user))
    return owned.length > 0 ? owned : cases
  }, [cases, user])

  function handleOpenRequestModal(professionalId: string) {
    setRequestTargetUser(professionalId)
    setSuccessMessage(null)
  }

  async function handleSendRequest(caseId: string, note: string) {
    if (!targetProfessional) return
    try {
      await requestPeerSupport(caseId, targetProfessional, note)
      setSuccessMessage(
        `Support request sent to ${targetProfessional.name} (${targetProfessional.role}). We've added an audit entry to your case timeline.`
      )
      setRequestTargetUser(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send peer support request'
      throw new Error(msg)
    }
  }

  function handleClearFilters() {
    setSearchTerm('')
    setRoleFilter('all')
    toast.info('Directory search and role filters reset.', 'Filters Reset')
  }

  return {
    user,
    roleFilter,
    setRoleFilter,
    searchTerm,
    setSearchTerm,
    requestTargetUser,
    successMessage,
    dismissSuccessMessage: () => setSuccessMessage(null),
    isLoadingPros,
    counts,
    filtered,
    targetProfessional,
    myCases,
    refreshProfessionals: () => loadProfessionals(true),
    handleOpenRequestModal,
    handleCloseRequestModal: () => setRequestTargetUser(null),
    handleSendRequest,
    handleClearFilters,
  }
}
