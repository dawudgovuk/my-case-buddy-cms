import { Row, Col } from 'react-bootstrap'
import { FaSearch, FaTimes } from 'react-icons/fa'
import {
  DIRECTORY_ROLE_CHIPS,
  type DirectoryCounts,
  type DirectoryRoleFilter,
} from '../../utils/directoryUtils'

export interface DirectoryFilterBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  searchPlaceholder: string
  roleFilter: DirectoryRoleFilter
  onRoleChange: (role: DirectoryRoleFilter) => void
  counts: DirectoryCounts
}

/**
 * Search input with clear button plus role filter chips for the peer directory.
 */
export default function DirectoryFilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  roleFilter,
  onRoleChange,
  counts,
}: DirectoryFilterBarProps) {
  return (
    <div className="premium-card p-3 mb-4 border-0 shadow-sm">
      <Row className="g-3 align-items-center">
        {/* Search Input with Icon */}
        <Col xs={12} lg={5}>
          <div className="position-relative">
            <FaSearch
              size={13}
              className="position-absolute text-muted"
              style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="form-control search-with-icon"
              aria-label={searchPlaceholder}
            />
            {searchTerm && (
              <button
                type="button"
                className="btn btn-sm text-muted position-absolute p-0 border-0"
                style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>
        </Col>

        {/* Role Filter Chips */}
        <Col xs={12} lg={7}>
          <div className="d-flex align-items-center gap-1.5 justify-content-start justify-content-lg-end flex-wrap">
            {DIRECTORY_ROLE_CHIPS.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className={`filter-chip-btn ${roleFilter === chip.key ? chip.activeClass : ''}`}
                onClick={() => onRoleChange(chip.key)}
              >
                {chip.dotColor && (
                  <span
                    className="chip-dot"
                    style={{ backgroundColor: chip.dotColor }}
                  />
                )}
                <span>{chip.label}</span>
                <span className="chip-count">{counts[chip.countKey]}</span>
              </button>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  )
}
