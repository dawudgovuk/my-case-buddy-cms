import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Row, Col } from 'react-bootstrap'
import { useCasesStore } from '../store/casesStore'
import { useAuthStore } from '../store/authStore'
import type { CaseStatus, FamilyCase } from '../types/domain'
import { isUserCaseMember } from '../utils/caseMembership'
import CasesHeader from '../components/case/CasesHeader'
import CasesFilterBar from '../components/case/CasesFilterBar'
import CaseListItemCard from '../components/case/CaseListItemCard'
import CaseCard from '../components/case/CaseCard'
import EmptyCasesState from '../components/case/EmptyCasesState'
import DeleteCaseModal from '../components/case/DeleteCaseModal'
import { CASE_TYPE_OPTIONS } from '../utils/caseConstants'
import { countChildren } from '../utils/partyUtils'

export default function CasesList() {
  const { cases, remove, togglePeerSupport, refresh } = useCasesStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    refresh()
  }, [refresh])

  // Filter & View State
  const [q, setQ] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | 'All'>('All')
  const [selectedCaseType, setSelectedCaseType] = useState<string>('')
  const [sortBy, setSortBy] = useState<'recent' | 'started' | 'title' | 'hearings'>('recent')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [caseToDelete, setCaseToDelete] = useState<FamilyCase | null>(null)

  // Visible user cases based on unified RBAC membership
  const userCases = useMemo(() => {
    if (!user) return []
    return cases.filter((c) => isUserCaseMember(c, user))
  }, [cases, user])

  // Summary Metrics
  const totalCases = userCases.length
  const openCasesCount = userCases.filter((c) => c.status === 'Open').length
  const stayedCasesCount = userCases.filter((c) => c.status === 'Stayed').length
  const concludedCasesCount = userCases.filter((c) => c.status === 'Concluded').length
  const upcomingHearingsCount = userCases.reduce(
    (acc, c) => acc + (c.hearings ? c.hearings.length : 0),
    0
  )
  const childrenCount = userCases.reduce(
    (acc, c) => acc + countChildren(c.parties),
    0
  )

  // Filtered & Sorted Cases
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()

    let result = userCases.filter((c) => {
      // 1. Status Filter
      if (selectedStatus !== 'All' && c.status !== selectedStatus) {
        return false
      }

      // 2. Case Type Filter
      if (selectedCaseType && c.caseType !== selectedCaseType) {
        return false
      }

      // 3. Search Term
      if (term) {
        const matches = [c.id, c.title, c.caseType, c.status, c.allocatedJudge, c.court]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term))
        if (!matches) return false
      }

      return true
    })

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === 'started') {
        return (b.startedAt || '').localeCompare(a.startedAt || '')
      }
      if (sortBy === 'hearings') {
        return (b.hearings?.length || 0) - (a.hearings?.length || 0)
      }
      // 'recent' by default:
      const dateA = a.lastUpdatedAt || a.startedAt || ''
      const dateB = b.lastUpdatedAt || b.startedAt || ''
      return dateB.localeCompare(dateA)
    })

    return result
  }, [userCases, q, selectedStatus, selectedCaseType, sortBy])

  const hasActiveFilters = Boolean(q.trim() || selectedStatus !== 'All' || selectedCaseType)

  function handleResetFilters() {
    setQ('')
    setSelectedStatus('All')
    setSelectedCaseType('')
    setSortBy('recent')
  }

  function handleConfirmDelete() {
    if (caseToDelete) {
      remove(caseToDelete.id)
      setCaseToDelete(null)
    }
  }

  return (
    <div className="py-2" style={{ maxWidth: '1240px', margin: '0 auto' }}>
      {/* Executive Header & Summary Metrics */}
      <CasesHeader
        totalCases={totalCases}
        openCasesCount={openCasesCount}
        upcomingHearingsCount={upcomingHearingsCount}
        childrenCount={childrenCount}
        onNewCase={() => navigate('/cases/new')}
      />

      {/* Filter, Search & View Controls */}
      <CasesFilterBar
        searchTerm={q}
        onSearchChange={setQ}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusCounts={{
          all: totalCases,
          open: openCasesCount,
          stayed: stayedCasesCount,
          concluded: concludedCasesCount,
        }}
        selectedCaseType={selectedCaseType}
        onCaseTypeChange={setSelectedCaseType}
        caseTypeOptions={CASE_TYPE_OPTIONS}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Empty State when no cases match */}
      {filtered.length === 0 ? (
        <EmptyCasesState
          isFiltered={hasActiveFilters || totalCases > 0}
          searchTerm={q}
          onReset={handleResetFilters}
          onNewCase={() => navigate('/cases/new')}
        />
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="d-flex flex-column">
          {filtered.map((c) => (
            <CaseListItemCard
              key={c.id}
              caseData={c}
              onViewCase={(id) => navigate(`/cases/${id}`)}
              onEditCase={(id) => navigate(`/cases/${id}/edit`)}
              onDeleteCase={() => setCaseToDelete(c)}
            />
          ))}
        </div>
      ) : (
        /* Grid View */
        <Row className="g-4">
          {filtered.map((c) => (
            <Col key={c.id} xs={12} md={6} lg={4} className="d-flex">
              <CaseCard
                caseData={c}
                buttonLayout="vertical"
                progressComponent="timeline"
                timelineDefaultExpanded={false}
                onViewDetails={(id) => navigate(`/cases/${id}`)}
                onEdit={(id) => navigate(`/cases/${id}/edit`)}
                onTogglePeerSupport={(id, cur) =>
                  togglePeerSupport(
                    id,
                    !cur,
                    cur ? undefined : 'Seeking peer review from experienced supporters'
                  )
                }
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Delete Confirmation Modal */}
      {caseToDelete && (
        <DeleteCaseModal
          show={Boolean(caseToDelete)}
          caseId={caseToDelete.id}
          caseTitle={caseToDelete.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setCaseToDelete(null)}
        />
      )}
    </div>
  )
}
