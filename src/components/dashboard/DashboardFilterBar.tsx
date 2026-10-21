import { Form } from 'react-bootstrap'
import { FaSearch, FaTimes, FaThLarge, FaTable } from 'react-icons/fa'
import type { CaseStatus } from '../../types/domain'
import { useTranslation } from '../../hooks/useTranslation'

export type DashboardStatusFilter = CaseStatus | 'All'
export type DashboardViewMode = 'grid' | 'table'

export interface DashboardFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: DashboardStatusFilter
  onStatusChange: (status: DashboardStatusFilter) => void
  statusCounts: Record<DashboardStatusFilter, number>
  viewMode: DashboardViewMode
  onViewModeChange: (mode: DashboardViewMode) => void
  onClearFilters?: () => void
  className?: string
}

export default function DashboardFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusCounts,
  viewMode,
  onViewModeChange,
  onClearFilters,
  className = '',
}: DashboardFilterBarProps) {
  const { t } = useTranslation()
  const hasActiveFilters = Boolean(searchQuery.trim() || statusFilter !== 'All')

  const statusItems: Array<{
    key: DashboardStatusFilter
    label: string
    dotColor?: string
  }> = [
    { key: 'All', label: t('common.all') },
    { key: 'Open', label: t('common.open'), dotColor: '#10b981' },
    { key: 'Stayed', label: t('common.stayed'), dotColor: '#f59e0b' },
    { key: 'Concluded', label: t('common.concluded'), dotColor: '#64748b' },
  ]

  return (
    <div
      className={`dashboard-filter-bar bg-white rounded-4 p-2.5 p-md-3 border mb-4 ${className}`}
    >
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2.5">
        {/* Left Side: Search Box + Status Filter Chips */}
        <div className="d-flex align-items-center gap-2 flex-grow-1 flex-wrap" style={{ minWidth: 260 }}>
          {/* Executive Search Input */}
          <div className="position-relative flex-grow-1 filter-search-wrap">
            <FaSearch
              size={12}
              className="position-absolute text-secondary opacity-75"
              style={{ left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <Form.Control
              type="search"
              placeholder={t('dashboard.searchPlaceholder')}
              size="sm"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="filter-search-input search-with-icon shadow-none"
              aria-label="Search cases"
              style={{ fontSize: '0.9rem' }}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn btn-link position-absolute p-0 text-muted hover-text-dark"
                style={{ right: 10, top: '50%', transform: 'translateY(-50%)' }}
                onClick={() => onSearchChange('')}
                aria-label="Clear Search"
              >
                <FaTimes size={11} />
              </button>
            )}
          </div>

          {/* Premium Status Filter Chips with Counts */}
          <div className="d-flex align-items-center gap-1.5 filter-chip-row">
            {statusItems.map((item) => {
              const isSelected = statusFilter === item.key
              const count = statusCounts[item.key] ?? 0

              return (
                <button
                  key={item.key}
                  type="button"
                  className={`filter-chip-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => onStatusChange(item.key)}
                >
                  {item.dotColor && !isSelected && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: item.dotColor,
                        display: 'inline-block',
                      }}
                    />
                  )}
                  <span>{item.label}</span>
                  <span className="chip-count">
                    {count}
                  </span>
                </button>
              )
            })}

            {hasActiveFilters && onClearFilters && (
              <button
                type="button"
                className="btn btn-link btn-sm text-secondary text-decoration-none px-2 py-1 small hover-text-primary"
                onClick={onClearFilters}
                style={{ fontSize: '0.78rem' }}
              >
                {t('casesList.resetFilters')}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Segmented View Mode Toggle (Cards vs Table) */}
        <div className="view-switcher-track flex-shrink-0">
          <button
            type="button"
            className={`view-switcher-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Card View (with Timeline)"
          >
            <FaThLarge size={11} className={viewMode === 'grid' ? 'text-primary' : 'text-muted'} />
            <span>{t('dashboard.viewCards')}</span>
          </button>

          <button
            type="button"
            className={`view-switcher-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => onViewModeChange('table')}
            title="Table View"
          >
            <FaTable size={11} className={viewMode === 'table' ? 'text-primary' : 'text-muted'} />
            <span>{t('dashboard.viewTable')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
