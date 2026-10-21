import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Nav, Button, ProgressBar, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaLink, FaFileAlt, FaExclamationCircle } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import { useGuidanceStore } from '../../store/guidanceStore';
import { useCasesStore } from '../../store/casesStore';
import JourneyStepper from '../../components/guidance/JourneyStepper';
import GuidanceArticleView from '../../components/guidance/GuidanceArticleView';
import type { GuidanceStep } from '../../types/guidance';

export default function GuidanceRoadmapView() {
  const { t } = useTranslation();
  const { mapSlug } = useParams<{ mapSlug: string }>();
  const navigate = useNavigate();

  const {
    activeMap,
    activeJourney,
    activeStep,
    setActiveMapBySlug,
    setActiveJourneyBySlug,
    setActiveStepBySlug,
    isLoading,
    error,
    getProgress,
    linkCaseToMap,
    caseMapLinks,
  } = useGuidanceStore();

  const { cases } = useCasesStore();
  const [showCaseLinkModal, setShowCaseLinkModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');

  useEffect(() => {
    if (mapSlug) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      void setActiveMapBySlug(mapSlug);
    }
  }, [mapSlug, setActiveMapBySlug]);

  const progress = getProgress(activeMap?.slug);

  const handleStepSelect = (step: GuidanceStep) => {
    setActiveStepBySlug(step.slug);
  };

  const handleLinkCase = () => {
    if (selectedCaseId && activeMap) {
      linkCaseToMap(selectedCaseId, activeMap.slug);
      setShowCaseLinkModal(false);
    }
  };

  // Find if any case is linked to this map
  const linkedCases = cases.filter((c) => caseMapLinks[c.id] === activeMap?.slug);

  if (isLoading && !activeMap) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-3">{t.guidance.loadingRoadmaps}</p>
      </Container>
    );
  }

  if (error && !activeMap) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <FaExclamationCircle className="me-2" />
          {error}
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate('/guidance')}>
          {t.guidance.backToRoadmaps}
        </Button>
      </Container>
    );
  }

  if (!activeMap) {
    return (
      <Container className="py-5 text-center">
        <h4>{t.guidance.noReferencesFound}</h4>
        <Button variant="primary" onClick={() => navigate('/guidance')} className="mt-3">
          {t.guidance.backToRoadmaps}
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid="xl" className="py-4">
      {/* Top Navigation & Breadcrumbs */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate('/guidance')}
          className="d-inline-flex align-items-center gap-2"
        >
          <FaArrowLeft size={11} />
          <span>{t.guidance.backToRoadmaps}</span>
        </Button>

        <div className="d-flex align-items-center gap-2">
          {linkedCases.length > 0 ? (
            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1.5 d-inline-flex align-items-center gap-1.5">
              <FaCheckCircle size={11} />
              Attached to {linkedCases.length} Active Case(s)
            </span>
          ) : (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => {
                if (cases.length > 0) {
                  setSelectedCaseId(cases[0].id);
                }
                setShowCaseLinkModal(true);
              }}
              className="d-inline-flex align-items-center gap-1.5"
            >
              <FaLink size={11} />
              <span>Attach Roadmap to My Case</span>
            </Button>
          )}

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate('/guidance/references')}
            className="d-inline-flex align-items-center gap-1.5"
          >
            <FaFileAlt size={11} />
            <span>{t.guidance.officialFormsAndStatutes}</span>
          </Button>
        </div>
      </div>

      {/* Roadmap Title & Overall Progress Header */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
            <div>
              <div
                className="badge border mb-2 px-2.5 py-1.5 fw-semibold"
                style={{
                  backgroundColor: 'var(--mcb-primary-soft)',
                  color: 'var(--mcb-primary)',
                  borderColor: 'var(--mcb-primary-border)',
                }}
              >
                {activeMap.category || 'Family Court Process'}
              </div>
              <h1 className="h3 fw-bold text-dark mb-1">{activeMap.name}</h1>
              <p className="text-secondary small mb-0" style={{ maxWidth: '48rem' }}>
                {activeMap.description}
              </p>
            </div>
            <div className="text-lg-end bg-light p-3 rounded" style={{ minWidth: '220px' }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-muted small fw-semibold">{t.guidance.completedPercent}:</span>
                <span className="fw-bold text-primary">{progress.percentage}%</span>
              </div>
              <ProgressBar
                now={progress.percentage}
                variant={progress.percentage === 100 ? 'success' : 'primary'}
                style={{ height: '8px', borderRadius: '4px' }}
              />
              <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                {progress.completedSteps} of {progress.totalSteps} {t.guidance.doneBadge}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Phase / Journey Selector Tabs */}
      <div className="mb-4">
        <Nav
          variant="pills"
          className="flex-nowrap overflow-auto pb-2 gap-2"
          activeKey={activeJourney?.slug}
        >
          {activeMap.journeys.map((journey, idx) => {
            const isCompleted = journey.steps.every((s) => useGuidanceStore.getState().isStepCompleted(s.slug));
            return (
              <Nav.Item key={journey.id} className="flex-shrink-0">
                <Nav.Link
                  eventKey={journey.slug}
                  onClick={() => setActiveJourneyBySlug(journey.slug)}
                  className="px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 border"
                  style={{
                    borderRadius: '8px',
                    borderColor: activeJourney?.slug === journey.slug ? 'var(--mcb-primary)' : 'var(--mcb-border)',
                  }}
                >
                  <span
                    className={`badge rounded-pill ${
                      activeJourney?.slug === journey.slug
                        ? 'bg-white text-primary'
                        : isCompleted
                        ? 'bg-success text-white'
                        : 'bg-secondary text-white'
                    }`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </span>
                  <span>{journey.name}</span>
                </Nav.Link>
              </Nav.Item>
            );
          })}
        </Nav>
      </div>

      {/* Main Content Area: Stepper on Left, Article on Right */}
      {activeJourney && (
        <Row className="g-4">
          {/* Stepper Column */}
          <Col lg={5} xl={4}>
            <div
              className="sticky-lg-top"
              style={{
                top: '80px',
                zIndex: 10,
                maxHeight: 'calc(100vh - 100px)',
                overflowY: 'auto',
                paddingRight: '6px',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold text-dark small text-uppercase tracking-wider">
                  {t.guidance.checklistTitle}
                </span>
                <span className="text-muted small">Click a step to view guide</span>
              </div>
              <JourneyStepper
                journey={activeJourney}
                activeStep={activeStep}
                onSelectStep={handleStepSelect}
              />
            </div>
          </Col>

          {/* Article & Details Column */}
          <Col lg={7} xl={8}>
            {activeStep?.articles && activeStep.articles.length > 0 ? (
              <GuidanceArticleView article={activeStep.articles[0]} />
            ) : (
              <Card className="border-0 shadow-sm p-5 text-center">
                <Card.Body>
                  <div className="rounded-circle p-3 bg-light text-muted d-inline-flex mb-3">
                    <FaFileAlt size={28} />
                  </div>
                  <h4 className="h5 fw-bold text-dark">Step: {activeStep?.name}</h4>
                  <p className="text-secondary small mb-3" style={{ maxWidth: '32rem', margin: '0 auto' }}>
                    {activeStep?.description || 'Select a step from the checklist to read the full plain-English instructions and download court forms.'}
                  </p>
                  {activeStep?.isConditional && (
                    <Alert variant="warning" className="d-inline-block text-start small mb-0">
                      <strong>⚠️ Conditional Note:</strong> {activeStep.conditionCriteria}
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      )}

      {/* Modal: Attach Roadmap to Case */}
      <Modal show={showCaseLinkModal} onHide={() => setShowCaseLinkModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold">Attach Roadmap to Case</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-secondary small mb-3">
            Link <strong>{activeMap.name}</strong> to one of your active court cases. Your case dashboard will automatically highlight the current phase and next steps.
          </p>
          {cases.length === 0 ? (
            <Alert variant="info" className="small">
              You do not have any active cases yet. Create a case first, then you can link it here.
            </Alert>
          ) : (
            <Form.Group>
              <Form.Label className="fw-semibold small">Select Case:</Form.Label>
              <Form.Select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} — {c.title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowCaseLinkModal(false)}>
            {t.common.cancel}
          </Button>
          <Button variant="primary" onClick={handleLinkCase} disabled={cases.length === 0}>
            {t.common.confirm}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
