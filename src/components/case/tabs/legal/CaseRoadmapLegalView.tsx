import { useState, useMemo, useEffect } from 'react';
import { Card, Nav, Row, Col, Alert, Button, Spinner, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FaCompass,
  FaFileAlt,
  FaExternalLinkAlt,
  FaLink,
} from 'react-icons/fa';
import type { FamilyCase } from '../../../../types/domain';
import type { GuidanceStep } from '../../../../types/guidance';
import { useGuidanceStore } from '../../../../store/guidanceStore';
import JourneyStepper from '../../../guidance/JourneyStepper';
import GuidanceArticleView from '../../../guidance/GuidanceArticleView';

export interface CaseRoadmapLegalViewProps {
  caseData: FamilyCase;
}

export default function CaseRoadmapLegalView({ caseData }: CaseRoadmapLegalViewProps) {
  const navigate = useNavigate();
  const {
    maps,
    loadGuidance,
    linkCaseToMap,
    caseMapLinks,
    getProgress,
  } = useGuidanceStore();

  const [activeJourneySlug, setActiveJourneySlug] = useState<string>('');
  const [activeStep, setActiveStep] = useState<GuidanceStep | null>(null);

  useEffect(() => {
    if (maps.length === 0) {
      void loadGuidance();
    }
  }, [maps.length, loadGuidance]);

  const linkedMapSlug = caseMapLinks[caseData.id];
  const linkedMap = useMemo(
    () => maps.find((m) => m.slug === linkedMapSlug),
    [maps, linkedMapSlug]
  );

  // Set default active journey and step
  useEffect(() => {
    if (linkedMap && linkedMap.journeys.length > 0) {
      if (!activeJourneySlug || !linkedMap.journeys.some((j) => j.slug === activeJourneySlug)) {
        const firstJourney = linkedMap.journeys[0];
        setActiveJourneySlug(firstJourney.slug);
        if (firstJourney.steps.length > 0) {
          setActiveStep(firstJourney.steps[0]);
        }
      }
    }
  }, [linkedMap, activeJourneySlug]);

  const activeJourney = useMemo(() => {
    if (!linkedMap) return null;
    return linkedMap.journeys.find((j) => j.slug === activeJourneySlug) || linkedMap.journeys[0] || null;
  }, [linkedMap, activeJourneySlug]);

  const progress = getProgress(linkedMap?.slug);

  const handleSelectJourney = (journeySlug: string) => {
    setActiveJourneySlug(journeySlug);
    const j = linkedMap?.journeys.find((item) => item.slug === journeySlug);
    if (j && j.steps.length > 0) {
      setActiveStep(j.steps[0]);
    } else {
      setActiveStep(null);
    }
  };

  // State: Case is not linked to any roadmap yet
  if (!linkedMap) {
    const suggestedMap = maps[0];
    return (
      <Card className="border shadow-none bg-white p-4 text-center rounded-3">
        <div
          className="p-3 rounded-circle text-primary mx-auto mb-3"
          style={{ width: '56px', height: '56px', background: 'var(--mcb-primary-soft, #eff6ff)' }}
        >
          <FaCompass size={28} />
        </div>
        <h5 className="fw-bold text-dark mb-1">No Procedural Roadmap Attached</h5>
        <p className="text-secondary small mb-4" style={{ maxWidth: '36rem', margin: '0 auto' }}>
          Connect an interactive statutory roadmap to <strong>{caseData.title}</strong> to view phase checklists, plain-English guidance, and official court forms directly in this tab.
        </p>

        <div className="d-flex justify-content-center gap-2">
          {suggestedMap && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => linkCaseToMap(caseData.id, suggestedMap.slug)}
              className="d-inline-flex align-items-center gap-1.5 fw-semibold"
            >
              <FaLink size={12} />
              <span>Attach {suggestedMap.name}</span>
            </Button>
          )}

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate('/guidance')}
            className="d-inline-flex align-items-center gap-1.5"
          >
            <span>Browse All Roadmaps</span>
            <FaExternalLinkAlt size={10} />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {/* Top Header Card */}
      <Card className="border shadow-none bg-white p-3 rounded-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge border px-2.5 py-1 fw-semibold"
                style={{
                  backgroundColor: 'var(--mcb-primary-soft)',
                  color: 'var(--mcb-primary)',
                  borderColor: 'var(--mcb-primary-border)',
                }}
              >
                Case Procedural GPS
              </span>
              <span className="text-muted small">{linkedMap.category}</span>
            </div>
            <h5 className="fw-bold text-dark mb-0">{linkedMap.name}</h5>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-md-end">
              <div className="small fw-semibold text-primary mb-1">
                {progress.percentage}% Completed ({progress.completedSteps}/{progress.totalSteps} steps)
              </div>
              <ProgressBar
                now={progress.percentage}
                variant={progress.percentage === 100 ? 'success' : 'primary'}
                style={{ width: '160px', height: '6px', borderRadius: '3px' }}
              />
            </div>

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate(`/guidance/${linkedMap.slug}`)}
              className="d-inline-flex align-items-center gap-1.5 flex-shrink-0"
            >
              <span>Full Screen</span>
              <FaExternalLinkAlt size={10} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Phase Pills Navigation */}
      <div className="overflow-auto pb-1">
        <Nav
          variant="pills"
          className="flex-nowrap gap-2"
          activeKey={activeJourney?.slug}
        >
          {linkedMap.journeys.map((journey, idx) => {
            const isCompleted = journey.steps.every((s) => useGuidanceStore.getState().isStepCompleted(s.slug));
            return (
              <Nav.Item key={journey.id} className="flex-shrink-0">
                <Nav.Link
                  eventKey={journey.slug}
                  onClick={() => handleSelectJourney(journey.slug)}
                  className={`py-1.5 px-3 rounded-pill fw-medium border ${
                    activeJourney?.slug === journey.slug
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : isCompleted
                      ? 'bg-light text-success border-success border-opacity-25'
                      : 'bg-white text-secondary'
                  }`}
                  style={{ fontSize: '0.85rem' }}
                >
                  <span className="me-1.5 fw-bold">{isCompleted ? '✓' : `Phase ${idx + 1}:`}</span>
                  <span>{journey.name}</span>
                </Nav.Link>
              </Nav.Item>
            );
          })}
        </Nav>
      </div>

      {/* Main Content: Stepper & Step Reader */}
      {activeJourney ? (
        <Row className="g-3">
          <Col lg={5}>
            <JourneyStepper
              journey={activeJourney}
              activeStep={activeStep}
              onSelectStep={(step) => setActiveStep(step)}
            />
          </Col>

          <Col lg={7}>
            {activeStep?.articles && activeStep.articles.length > 0 ? (
              <GuidanceArticleView article={activeStep.articles[0]} />
            ) : (
              <Card className="border shadow-none bg-white p-4 text-center rounded-3">
                <div className="p-3 rounded-circle text-muted mx-auto mb-2 bg-light d-inline-flex">
                  <FaFileAlt size={22} />
                </div>
                <h6 className="fw-bold text-dark mb-1">{activeStep?.name || 'Select a Step'}</h6>
                <p className="text-secondary small mb-0" style={{ maxWidth: '28rem', margin: '0 auto' }}>
                  {activeStep?.description || 'Click on any step from the left checklist to view full guidance instructions and download verified court forms.'}
                </p>
                {activeStep?.isConditional && (
                  <Alert variant="warning" className="small mt-3 mb-0 text-start">
                    <strong>⚠️ Conditional Criteria:</strong> {activeStep.conditionCriteria}
                  </Alert>
                )}
              </Card>
            )}
          </Col>
        </Row>
      ) : (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" size="sm" />
        </div>
      )}
    </div>
  );
}
