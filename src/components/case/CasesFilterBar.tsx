import { Form, InputGroup, Button, Badge } from 'react-bootstrap'
import type { CaseStatus } from '../../types/domain'
import { FaSearch, FaTimes, FaList, FaThLarge } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'

export interface CasesFilterBarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  selectedStatus: CaseStatus | 'All'
  onStatusChange: (status: CaseStatus | 'All') => void
  statusCounts: { all: number; open: number; stayed: number; concluded: number }
  selectedCaseType: string
  onCaseTypeChange: (type: string) => void
  caseTypeOptions?: readonly string[]
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
  const { t } = useTranslation()

  const statuses: Array<{ key: CaseStatus | 'All'; label: string; count: number }> = [
    { key: 'All', label: t('common.all'), count: statusCounts.all },
    { key: 'Open', label: t('common.open'), count: statusCounts.open },
    { key: 'Stayed', label: t('common.stayed'), count: statusCounts.stayed },
    { key: 'Concluded', label: t('common.concluded'), count: statusCounts.concluded },
  ]

  return (
    <div className={`bg-white p-3 rounded-3 border shadow-sm mb-3 ${className}`}>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 gap-lg-3">
        {/* Left Side: Search Box + Status Filter Pills */}
        <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
          {/* Search Box */}
          <div style={{ minWidth: '220px', maxWidth: '340px' }} className="flex-grow-1">
            <InputGroup size="sm">
              <InputGroup.Text className="bg-light border-end-0 text-muted ps-3">
                <FaSearch size={13} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder={t('casesList.searchPlaceholder')}
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

          {/* Status Segmented Buttons (Swipeable on Mobile) */}
          <div className="filter-scroll-wrapper d-flex align-items-center gap-1 py-1">
            {statuses.map((st) => {
              const isActive = selectedStatus === st.key
              return (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => onStatusChange(st.key)}
                  className={`btn btn-sm rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1 transition-all flex-shrink-0 ${
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
        <div className="d-flex align-items-center gap-2 flex-wrap flex-shrink-0 ms-auto">
          {/* Case Type Filter */}
          <Form.Select
            size="sm"
            value={selectedCaseType}
            onChange={(e) => onCaseTypeChange(e.target.value)}
            className="bg-light border-secondary-subtle"
            style={{ width: 'auto', minWidth: '140px', fontSize: '0.8rem' }}
            aria-label="Filter by case type"
          >
            <option value="">{t('common.all')}</option>
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
            aria-label="Sort cases"
          >
            <option value="recent">{t('casesList.sortByRecent')}</option>
            <option value="started">{t('casesList.sortByStarted')}</option>
            <option value="title">{t('casesList.sortByTitle')}</option>
            <option value="hearings">{t('casesList.sortByHearings')}</option>
          </Form.Select>

          {/* View Toggle (List / Grid) */}
          <div className="btn-group btn-group-sm shadow-xs">
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              aria-label={t('casesList.viewList')}
              className="px-2"
            >
              <FaList size={12} />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              aria-label={t('casesList.viewGrid')}
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
              {t('casesList.resetFilters')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
