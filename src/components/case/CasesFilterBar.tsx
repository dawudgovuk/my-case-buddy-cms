import { Form, InputGroup, Button, Badge } from 'react-bootstrap'
import type { CaseStatus } from '../../types/domain'
import { FaSearch, FaTimes, FaList, FaThLarge } from 'react-icons/fa'

export interface CasesFilterBarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  selectedStatus: CaseStatus | 'All'
  onStatusChange: (status: CaseStatus | 'All') => void
  statusCounts: { all: number; open: number; stayed: number; concluded: number }
  selectedCaseType: string
  onCaseTypeChange: (type: string) => void
  caseTypeOptions?: string[]
  sortBy: 'recent' | 'started' | 'title' | 'hearings'
  onSortChange: (sort: 'recent' | 'started' | 'title' | 'hearings') => void
  viewMode: 'list' | 'grid'
  onViewModeChange: (mode: 'list' | 'grid') => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  className?: string
}

export default function CasesFilterBar({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  statusCounts,
  selectedCaseType,
  onCaseTypeChange,
  caseTypeOptions = [],
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  onResetFilters,
  className = '',
}: CasesFilterBarProps) {
  const statuses: Array<{ key: CaseStatus | 'All'; label: string; count: number }> = [
    { key: 'All', label: 'All Cases', count: statusCounts.all },
    { key: 'Open', label: 'Open', count: statusCounts.open },
    { key: 'Stayed', label: 'Stayed', count: statusCounts.stayed },
    { key: 'Concluded', label: 'Concluded', count: statusCounts.concluded },
  ]

  return (
    <div className={`bg-white p-3 rounded-3 border shadow-sm mb-3 ${className}`}>
      <div className="d-flex flex-column flex-lg-row gap-3 align-items-stretch align-items-lg-center justify-content-between">
        {/* Left Side: Search + Status Filter Pills */}
        <div className="d-flex flex-column flex-md-row gap-2 align-items-stretch align-items-md-center flex-grow-1">
          {/* Search Box */}
          <div style={{ minWidth: '260px', maxWidth: '380px' }} className="flex-grow-1">
            <InputGroup size="sm">
              <InputGroup.Text className="bg-light border-end-0 text-muted ps-3">
                <FaSearch size={13} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search cases, references, judges..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="border-start-0 bg-light"
                style={{ fontSize: '0.85rem' }}
              />
              {searchTerm && (
                <Button
                  variant="light"
                  size="sm"
                  className="border border-start-0 text-muted px-2"
                  onClick={() => onSearchChange('')}
                >
                  <FaTimes size={11} />
                </Button>
              )}
            </InputGroup>
          </div>

          {/* Status Segmented Buttons */}
          <div className="d-flex align-items-center gap-1 overflow-auto py-1">
            {statuses.map((st) => {
              const isActive = selectedStatus === st.key
              return (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => onStatusChange(st.key)}
                  className={`btn btn-sm rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1 transition-all ${
                    isActive
                      ? 'btn-primary shadow-xs'
                      : 'btn-outline-secondary bg-white text-secondary border-0 hover-bg-light'
                  }`}
                  style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  <span>{st.label}</span>
                  <Badge
                    bg={isActive ? 'light' : 'secondary'}
                    text={isActive ? 'primary' : 'white'}
                    pill
                    className="font-monospace px-1"
                    style={{ fontSize: '0.68rem' }}
                  >
                    {st.count}
                  </Badge>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Side: Filters, Sorting & View Toggle */}
        <div className="d-flex align-items-center gap-2 justify-content-end flex-shrink-0 flex-wrap">
          {/* Case Type Filter */}
          <Form.Select
            size="sm"
            value={selectedCaseType}
            onChange={(e) => onCaseTypeChange(e.target.value)}
            className="bg-light border-secondary-subtle"
            style={{ width: 'auto', minWidth: '150px', fontSize: '0.8rem' }}
          >
            <option value="">All Case Types</option>
            {caseTypeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Form.Select>

          {/* Sort Dropdown */}
          <Form.Select
            size="sm"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'recent' | 'started' | 'title' | 'hearings')}
            className="bg-light border-secondary-subtle"
            style={{ width: 'auto', minWidth: '140px', fontSize: '0.8rem' }}
          >
            <option value="recent">Recently Updated</option>
            <option value="started">Started Date</option>
            <option value="title">Title (A-Z)</option>
            <option value="hearings">Most Hearings</option>
          </Form.Select>

          {/* View Toggle */}
          <div className="btn-group btn-group-sm shadow-xs">
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              title="List View"
              className="px-2"
            >
              <FaList size={12} />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
              className="px-2"
            >
              <FaThLarge size={12} />
            </Button>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="link"
              size="sm"
              onClick={onResetFilters}
              className="text-danger small p-0 text-decoration-none fw-semibold ms-1"
              style={{ fontSize: '0.78rem' }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
