import { useState } from 'react'
import CasesHeader from '../case/CasesHeader'
import CasesFilterBar from '../case/CasesFilterBar'
import EmptyCasesState from '../case/EmptyCasesState'
import DeleteCaseModal from '../case/DeleteCaseModal'
import type { CaseStatus } from '../../types/domain'

export function CasesHeaderPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  return (
    <CasesHeader
      totalCases={4}
      openCasesCount={3}
      upcomingHearingsCount={2}
      childrenCount={3}
      onNewCase={() => onFeedback('Header: + Create New Case clicked')}
    />
  )
}

export function CasesFilterBarPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<CaseStatus | 'All'>('All')
  const [caseType, setCaseType] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'started' | 'title' | 'hearings'>('recent')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  return (
    <CasesFilterBar
      searchTerm={q}
      onSearchChange={(val) => {
        setQ(val)
        onFeedback(`Search changed: ${val}`)
      }}
      selectedStatus={status}
      onStatusChange={(st) => {
        setStatus(st)
        onFeedback(`Status filter: ${st}`)
      }}
      statusCounts={{ all: 4, open: 3, stayed: 1, concluded: 0 }}
      selectedCaseType={caseType}
      onCaseTypeChange={(ct) => {
        setCaseType(ct)
        onFeedback(`Case type filter: ${ct}`)
      }}
      caseTypeOptions={[
        'Private Law (Child Arrangements)',
        'Public Law (Care Proceedings)',
        'Financial Remedies',
      ]}
      sortBy={sortBy}
      onSortChange={(sb) => {
        setSortBy(sb)
        onFeedback(`Sort by: ${sb}`)
      }}
      viewMode={viewMode}
      onViewModeChange={(vm) => {
        setViewMode(vm)
        onFeedback(`View mode: ${vm}`)
      }}
      hasActiveFilters={Boolean(q || status !== 'All' || caseType)}
      onResetFilters={() => {
        setQ('')
        setStatus('All')
        setCaseType('')
        onFeedback('Reset all filters')
      }}
    />
  )
}

export function EmptyCasesStatePreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  return (
    <div className="d-flex flex-column gap-3">
      <div className="small fw-bold text-muted">1. Search / Filter Empty State:</div>
      <EmptyCasesState
        isFiltered={true}
        searchTerm="FC-999"
        onReset={() => onFeedback('Reset filters from empty state')}
      />

      <div className="small fw-bold text-muted mt-3">2. Initial Empty Repository State:</div>
      <EmptyCasesState
        isFiltered={false}
        onNewCase={() => onFeedback('Create new case from empty state')}
      />
    </div>
  )
}

export function DeleteCaseModalPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [show, setShow] = useState(false)

  return (
    <div>
      <button className="btn btn-outline-danger btn-sm" onClick={() => setShow(true)}>
        Open Delete Case Confirmation Modal Demo
      </button>

      <DeleteCaseModal
        show={show}
        caseId="FC-23-000035"
        caseTitle="Domestic abuse proceedings — Non-Molestation Order"
        onConfirm={() => {
          setShow(false)
          onFeedback('Confirmed case deletion')
        }}
        onCancel={() => {
          setShow(false)
          onFeedback('Cancelled case deletion')
        }}
      />
    </div>
  )
}
