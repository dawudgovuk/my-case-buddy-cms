import { Card, Row, Col, Button, Badge } from 'react-bootstrap'
import {
  FaInfoCircle,
  FaTimes,
  FaUserShield,
  FaShieldAlt,
  FaFolderOpen,
  FaCheckCircle,
  FaQuestionCircle,
  FaArrowRight,
} from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'

export interface SystemQuickGuideProps {
  isOpen: boolean
  onClose: () => void
  isVerified: boolean
  onVerifyClick?: () => void
  onViewAssignedClick?: () => void
  onOpenFaq?: () => void
  assignedCasesCount?: number
}

export default function SystemQuickGuide({
  isOpen,
  onClose,
  isVerified,
  onVerifyClick,
  onViewAssignedClick,
  onOpenFaq,
  assignedCasesCount = 0,
}: SystemQuickGuideProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <Card className="system-quick-guide border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
      <Card.Body className="p-4 bg-gradient-guide">
        <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
          <div className="d-flex align-items-center gap-2">
            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
              <FaInfoCircle size={16} />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-dark">{t('professional.quickGuideTitle')}</h5>
              <p className="text-secondary small mb-0">
                {t('professional.quickGuideSubtitle')}
              </p>
            </div>
          </div>
          <Button
            variant="outline-secondary"
            size="sm"
            className="rounded-circle p-1 border-0"
            style={{ width: 30, height: 30 }}
            onClick={onClose}
            aria-label="Dismiss guide"
          >
            <FaTimes />
          </Button>
        </div>

        <Row className="g-3 my-1">
          {/* Step 1: Your Role */}
          <Col xs={12} md={4}>
            <div className="guide-step-card p-3 rounded-3 bg-white border h-100 shadow-xs">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge-step-number bg-primary-subtle text-primary fw-bold">1</span>
                <FaUserShield className="text-primary" />
                <h6 className="fw-bold mb-0 text-dark">{t('professional.yourRole')}</h6>
              </div>
              <p className="text-muted small mb-0">
                {t('professional.yourRoleDesc')}
              </p>
            </div>
          </Col>

          {/* Step 2: Safeguarding & Verification */}
          <Col xs={12} md={4}>
            <div className="guide-step-card p-3 rounded-3 bg-white border h-100 shadow-xs">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge-step-number bg-warning-subtle text-warning fw-bold">2</span>
                <FaShieldAlt className="text-warning" />
                <h6 className="fw-bold mb-0 text-dark">{t('professional.safeguardingTitle')}</h6>
              </div>
              <p className="text-muted small mb-0">
                {t('professional.safeguardingDesc')}
              </p>
            </div>
          </Col>

          {/* Step 3: Collaboration */}
          <Col xs={12} md={4}>
            <div className="guide-step-card p-3 rounded-3 bg-white border h-100 shadow-xs">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge-step-number bg-success-subtle text-success fw-bold">3</span>
                <FaFolderOpen className="text-success" />
                <h6 className="fw-bold mb-0 text-dark">{t('professional.assignedVsPeerTitle')}</h6>
              </div>
              <p className="text-muted small mb-0">
                {t('professional.assignedVsPeerDesc')}
              </p>
            </div>
          </Col>
        </Row>

        <div className="d-flex flex-wrap align-items-center justify-content-between pt-3 mt-3 border-top gap-2">
          <div className="d-flex align-items-center gap-2 small text-secondary">
            {isVerified ? (
              <Badge bg="success" className="d-flex align-items-center gap-1">
                <FaCheckCircle />
                <span>{t('professional.verifiedBadge')}</span>
              </Badge>
            ) : (
              <Badge bg="warning" text="dark" className="d-flex align-items-center gap-1">
                <FaShieldAlt />
                <span>{t('professional.verificationPendingNotice')}</span>
              </Badge>
            )}
            <span>• {assignedCasesCount} {assignedCasesCount === 1 ? t('dashboard.caseSingular') : t('dashboard.casePlural')}</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            {onOpenFaq && (
              <Button variant="outline-primary" size="sm" onClick={onOpenFaq} className="d-flex align-items-center gap-1">
                <FaQuestionCircle />
                <span>{t('professional.fullSystemFaq')}</span>
              </Button>
            )}
            {!isVerified && onVerifyClick && (
              <Button variant="primary" size="sm" onClick={onVerifyClick} className="d-flex align-items-center gap-1 shadow-sm">
                <FaCheckCircle />
                <span>{t('professional.verifyNow1Click')}</span>
              </Button>
            )}
            {assignedCasesCount > 0 && onViewAssignedClick && (
              <Button variant="outline-secondary" size="sm" onClick={onViewAssignedClick} className="d-flex align-items-center gap-1">
                <span>{t('professional.viewAssignedCases')}</span>
                <FaArrowRight size={11} />
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}
