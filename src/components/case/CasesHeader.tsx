import { Row, Col, Button } from 'react-bootstrap'
import { FaPlus, FaFolder, FaBalanceScale, FaCalendarAlt, FaChild } from 'react-icons/fa'

export interface CasesHeaderProps {
  totalCases: number
  openCasesCount: number
  upcomingHearingsCount: number
  childrenCount: number
  onNewCase: () => void
  className?: string
}

export default function CasesHeader({
  totalCases,
  openCasesCount,
  upcomingHearingsCount,
  childrenCount,
  onNewCase,
  className = '',
}: CasesHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {/* Top Header Row */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
            Cases & Proceedings
          </h2>
          <p className="text-secondary small mb-0">
            Track, manage, and coordinate your family court proceedings, hearings, and child safeguards.
          </p>
        </div>

        <Button
          variant="primary"
          className="fw-semibold px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm rounded-3 flex-shrink-0"
          onClick={onNewCase}
          style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
        >
          <FaPlus size={13} />
          <span>New Case</span>
        </Button>
      </div>

      {/* 4 Crisp Metric Stat Cards */}
      <Row className="g-3">
        {/* Total Cases */}
        <Col xs={6} lg={3}>
          <div className="metric-card d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 44, height: 44, backgroundColor: '#eff6ff', color: '#2563eb' }}
            >
              <FaFolder size={18} />
            </div>
            <div className="overflow-hidden">
              <div className="text-muted small fw-medium" style={{ fontSize: '0.75rem' }}>
                Total Cases
              </div>
              <div className="h4 fw-bold text-dark mb-0">{totalCases}</div>
            </div>
          </div>
        </Col>

        {/* Active Proceedings */}
        <Col xs={6} lg={3}>
          <div className="metric-card d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 44, height: 44, backgroundColor: '#f0fdf4', color: '#16a34a' }}
            >
              <FaBalanceScale size={18} />
            </div>
            <div className="overflow-hidden">
              <div className="text-muted small fw-medium" style={{ fontSize: '0.75rem' }}>
                Active (Open)
              </div>
              <div className="h4 fw-bold text-dark mb-0">{openCasesCount}</div>
            </div>
          </div>
        </Col>

        {/* Upcoming Hearings */}
        <Col xs={6} lg={3}>
          <div className="metric-card d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 44, height: 44, backgroundColor: '#fffbeb', color: '#d97706' }}
            >
              <FaCalendarAlt size={18} />
            </div>
            <div className="overflow-hidden">
              <div className="text-muted small fw-medium" style={{ fontSize: '0.75rem' }}>
                Upcoming Hearings
              </div>
              <div className="h4 fw-bold text-dark mb-0">{upcomingHearingsCount}</div>
            </div>
          </div>
        </Col>

        {/* Children Protected */}
        <Col xs={6} lg={3}>
          <div className="metric-card d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 44, height: 44, backgroundColor: '#f5f3ff', color: '#7c3aed' }}
            >
              <FaChild size={18} />
            </div>
            <div className="overflow-hidden">
              <div className="text-muted small fw-medium" style={{ fontSize: '0.75rem' }}>
                Children Protected
              </div>
              <div className="h4 fw-bold text-dark mb-0">{childrenCount}</div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}
