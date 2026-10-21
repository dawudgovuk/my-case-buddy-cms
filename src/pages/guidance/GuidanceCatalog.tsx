import { useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, ProgressBar, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FaCompass,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationCircle,
  FaFileAlt,
  FaGavel,
} from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import { useGuidanceStore } from '../../store/guidanceStore';

export default function GuidanceCatalog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { maps, loadGuidance, isLoading, error, getProgress } = useGuidanceStore();

  useEffect(() => {
    void loadGuidance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container fluid="xl" className="py-4">
      {/* Hero Header */}
      <div className="mb-5 text-center text-md-start">
        <div
          className="badge border px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-2 mb-3 fw-semibold small"
          style={{
            backgroundColor: 'var(--mcb-primary-soft)',
            color: 'var(--mcb-primary)',
            borderColor: 'var(--mcb-primary-border)',
          }}
        >
          <FaCompass size={13} />
          <span>{t.guidance.gpsBadge}</span>
        </div>
        <h1 className="h2 fw-bold text-dark mb-2">{t.guidance.catalogTitle}</h1>
        <p className="text-secondary mb-0" style={{ maxWidth: '44rem', fontSize: '1.05rem' }}>
          {t.guidance.catalogSubtitle}
        </p>
      </div>

      {isLoading && maps.length === 0 ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">{t.guidance.loadingRoadmaps}</p>
        </div>
      ) : error && maps.length === 0 ? (
        <Alert variant="danger">
          <FaExclamationCircle className="me-2" />
          {error}
        </Alert>
      ) : (
        <>
          {/* Roadmaps Grid */}
          <Row className="g-4 mb-5">
            {maps.map((map) => {
              const progress = getProgress(map.slug);
              const totalJourneys = map.journeys?.length || 0;
              const totalSteps = map.journeys?.flatMap((j) => j.steps).length || 0;

              return (
                <Col key={map.id} lg={6}>
                  <Card className="h-100 shadow-sm border-0 transition-all hover-shadow">
                    <Card.Body className="p-4 d-flex flex-column">
                      <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                        <Badge bg="primary" className="px-2.5 py-1.5 fw-medium">
                          {map.category || t.guidance.familyCourtPathway}
                        </Badge>
                        {progress.completedSteps > 0 && (
                          <span
                            className="badge border d-inline-flex align-items-center gap-1.5 px-2.5 py-1.5 fw-semibold"
                            style={{
                              backgroundColor: 'var(--mcb-success-soft, #ecfdf5)',
                              color: 'var(--mcb-success, #059669)',
                              borderColor: 'var(--mcb-success-border, #a7f3d0)',
                            }}
                          >
                            <FaCheckCircle size={11} />
                            {progress.completedSteps} / {totalSteps} {t.guidance.doneBadge}
                          </span>
                        )}
                      </div>

                      <h2 className="h4 fw-bold text-dark mb-2">{map.name}</h2>
                      <p className="text-secondary small mb-3 flex-grow-1 leading-relaxed">
                        {map.description}
                      </p>

                      {/* Preconditions Notice */}
                      {map.preconditions && (
                        <div
                          className="p-3 rounded mb-3"
                          style={{
                            backgroundColor: 'rgba(239, 246, 255, 0.7)',
                            borderLeft: '3px solid #3b82f6',
                          }}
                        >
                          <div className="fw-semibold text-primary small mb-1">
                            {t.guidance.mandatoryPrecondition}
                          </div>
                          <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                            {map.preconditions}
                          </div>
                        </div>
                      )}

                      {/* Expected Postconditions / Outcomes */}
                      {map.postconditions && (
                        <div
                          className="p-3 rounded mb-4"
                          style={{
                            backgroundColor: 'rgba(240, 253, 244, 0.7)',
                            borderLeft: '3px solid #22c55e',
                          }}
                        >
                          <div className="fw-semibold text-success small mb-1">
                            {t.guidance.finalCourtOutcome}
                          </div>
                          <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                            {map.postconditions}
                          </div>
                        </div>
                      )}

                      {/* Roadmap Milestones Preview */}
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center text-muted small mb-1.5">
                          <span className="fw-semibold text-dark">
                            {totalJourneys} {t.guidance.phasesAndCheckpoints} ({totalSteps})
                          </span>
                          <span>{progress.percentage}% {t.guidance.completedPercent}</span>
                        </div>
                        <ProgressBar
                          now={progress.percentage}
                          variant={progress.percentage === 100 ? 'success' : 'primary'}
                          style={{ height: '6px', borderRadius: '3px' }}
                        />
                      </div>

                      {/* Action Button */}
                      <Button
                        variant="primary"
                        onClick={() => navigate(`/guidance/${map.slug}`)}
                        className="d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold mt-auto"
                      >
                        <span>{t.guidance.openInteractiveRoadmap}</span>
                        <FaArrowRight size={12} />
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* Quick Links Section */}
          <div className="p-4 rounded-3 border bg-light d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle p-3 bg-white shadow-xs text-primary">
                <FaFileAlt size={22} />
              </div>
              <div>
                <h3 className="h6 fw-bold mb-1 text-dark">{t.guidance.officialFormsAndStatutes}</h3>
                <p className="text-muted small mb-0">
                  {t.guidance.officialFormsSubtitle}
                </p>
              </div>
            </div>
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/guidance/references')}
              className="d-inline-flex align-items-center gap-2 flex-shrink-0"
            >
              <FaGavel size={13} />
              <span>{t.guidance.officialFormsAndStatutes}</span>
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}
