import { useEffect, useMemo, useState } from 'react'
import type { FamilyCase } from '../types/domain'
import type { DashboardStatusFilter, DashboardViewMode } from '../components/dashboard/DashboardFilterBar'
import {
  LIP_DASHBOARD_VIEW_STORAGE_KEY,
  countCasesByStatus,
  filterCasesBySearchAndStatus,
} from '../utils/dashboardUtils'

export interface UseCaseDashboardFiltersReturn {
  viewMode: DashboardViewMode
  setViewMode: (mode: DashboardViewMode) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: DashboardStatusFilter
  setStatusFilter: (status: DashboardStatusFilter) => void
  clearFilters: () => void
  filteredCases: FamilyCase[]
  statusCounts: Record<DashboardStatusFilter, number>
}

/**
 * Search, status filter and persisted grid/table view mode for a dashboard case list.
 */
export function useCaseDashboardFilters(cases: FamilyCase[]): UseCaseDashboardFiltersReturn {
  // View mode state with local storage persistence
  const [viewMode, setViewMode] = useState<DashboardViewMode>(() => {
    const saved = localStorage.getItem(LIP_DASHBOARD_VIEW_STORAGE_KEY)
    return saved === 'table' ? 'table' : 'grid'
  })

  useEffect(() => {
    localStorage.setItem(LIP_DASHBOARD_VIEW_STORAGE_KEY, viewMode)
  }, [viewMode])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<DashboardStatusFilter>('All')

  const filteredCases = useMemo(
    () => filterCasesBySearchAndStatus(cases, searchQuery, statusFilter),
    [cases, searchQuery, statusFilter]
  )

  // Real-time status counts
  const statusCounts = useMemo(() => countCasesByStatus(cases), [cases])

  function clearFilters() {
    setSearchQuery('')
    setStatusFilter('All')
  }

  return {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    clearFilters,
    filteredCases,
    statusCounts,
  }
}
