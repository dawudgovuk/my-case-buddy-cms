import { Row, Col, Button } from 'react-bootstrap'
import { FaPlus, FaFolder, FaBalanceScale, FaCalendarAlt, FaChild } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'

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
  const { t } = useTranslation()

  return (
    <div className={`mb-4 ${className}`}>
      {/* Top Header Row */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
            {t('casesList.title')}
          </h2>
          <p className="text-secondary small mb-0">
            {t('casesList.headerCategory')}
          </p>
        </div>

        <Button
          variant="primary"
          className="fw-semibold px-3 py-2 d-inline-flex align-items-center gap-2 shadow-sm rounded-3 flex-shrink-0"
          onClick={onNewCase}
          style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
        >
          <FaPlus size={13} />
          <span>{t('common.newCase')}</span>
        </Button>
      </div>

      {/* 4 Crisp Metric Stat Cards */}
      <Row className="g-2 g-md-3">
        {/* Total Cases */}
        <Col xs={6} md={3}>
          <div className="metric-card d-flex align-items-center gap-2 gap-sm-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40, backgroundColor: '#eff6ff', color: '#2563eb' }}
            >
              <FaFolder size={16} />
            </div>
            <div className="overflow-hidden">
              <div className="text-muted small fw-medium text-truncate" style={{ fontSize: '0.72rem' }}>
                {t('casesList.totalCases')}
              </div>
              <div className="h4 fw-bold text-dark mb-0">{totalCases}</div>
            </div>
          </div>
        </Col>

        {/* Active Proceedings */}
        <Col xs={6} md={3}>
          <div className="metric-card d-flex align-items-center gap-2 gap-sm-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40, backgroundColor: '#f0fdf4', color: '#16a34a' }}
            >
              <FaBalanceScale size={16} />
            </div>
            <div className="overflow-hidden">
              <div className="text-muted small fw-medium text-truncate" style={{ fontSize: '0.72rem' }}>
                {t('casesList.activeCases')}
              </div>
              <div className="h4 fw-bold text-dark mb-0">{openCasesCount}</div>
            </div>
          </div>
        </Col>

        {/* Upcoming Hearings */}
        <Col xs={6} md={3}>
          <div className="metric-card d-flex align-items-center gap-2 gap-sm-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40, backgroundColor: '#fffbeb', color: '#d97706' }}
            >
              <FaCalendarAlt size={16} />
            </div>
            <div className="overflow-hidden">
              <div className="text-muted small fw-medium text-truncate" style={{ fontSize: '0.72rem' }}>
                {t('casesList.upcomingHearings')}
              </div>
              <div className="h4 fw-bold text-dark mb-0">{upcomingHearingsCount}</div>
            </div>
          </div>
        </Col>

        {/* Children Protected */}
        <Col xs={6} md={3}>
          <div className="metric-card d-flex align-items-center gap-2 gap-sm-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40, backgroundColor: '#f5f3ff', color: '#7c3aed' }}
            >
              <FaChild size={16} />
            </div>
            <div className="overflow-hidden">
              <div className="text-muted small fw-medium text-truncate" style={{ fontSize: '0.72rem' }}>
                {t('casesList.protectedChildren')}
              </div>
              <div className="h4 fw-bold text-dark mb-0">{childrenCount}</div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}
