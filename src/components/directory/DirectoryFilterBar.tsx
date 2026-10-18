import { Row, Col, Form } from 'react-bootstrap'
import { FaSearch, FaTimes, FaGraduationCap } from 'react-icons/fa'
import {
  DIRECTORY_ROLE_CHIPS,
  FAMILY_COURT_SPECIALISMS,
  type DirectoryCounts,
  type DirectoryRoleFilter,
} from '../../utils/directoryUtils'

export interface DirectoryFilterBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  searchPlaceholder: string
  roleFilter: DirectoryRoleFilter
  onRoleChange: (role: DirectoryRoleFilter) => void
  specialismFilter?: string
  onSpecialismChange?: (spec: string) => void
  counts: DirectoryCounts
}

/**
 * Search input with clear button, role filter chips, and specialism selector for the peer directory.
 */
export default function DirectoryFilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  roleFilter,
  onRoleChange,
  specialismFilter = 'ALL',
  onSpecialismChange,
  counts,
}: DirectoryFilterBarProps) {
  return (
    <div className="premium-card p-3 mb-4 border-0 shadow-sm bg-white rounded-3">
      <Row className="g-3 align-items-center">
        {/* Search Input with Icon */}
        <Col xs={12} md={5} lg={4}>
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

        {/* Specialism Selector Dropdown */}
        {onSpecialismChange && (
          <Col xs={12} md={7} lg={3}>
            <div className="d-flex align-items-center gap-1.5">
              <span className="text-secondary small d-none d-sm-inline-flex align-items-center gap-1 flex-shrink-0">
                <FaGraduationCap size={12} className="text-primary" />
              </span>
              <Form.Select
                size="sm"
                value={specialismFilter}
                onChange={(e) => onSpecialismChange(e.target.value)}
                className="form-select-sm"
              >
                <option value="ALL">All Specialisms</option>
                {FAMILY_COURT_SPECIALISMS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </Form.Select>
            </div>
          </Col>
        )}

        {/* Role Filter Chips */}
        <Col xs={12} lg={onSpecialismChange ? 5 : 7}>
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
