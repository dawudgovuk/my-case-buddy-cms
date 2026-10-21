import { useEffect, useState, useMemo } from 'react';
import { Card, Button, ProgressBar, Offcanvas } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FaCompass,
  FaArrowRight,
  FaBookOpen,
  FaLink,
  FaUnlink,
  FaExchangeAlt,
} from 'react-icons/fa';
import type { FamilyCase } from '../../types/domain';
import type { GuidanceStep } from '../../types/guidance';
import { useGuidanceStore } from '../../store/guidanceStore';
import GuidanceArticleView from '../guidance/GuidanceArticleView';
import TrackerStepItem from './tracker/TrackerStepItem';
import SwitchRoadmapModal from './tracker/SwitchRoadmapModal';

export interface CaseRoadmapTrackerProps {
  caseData: FamilyCase;
}

export default function CaseRoadmapTracker({ caseData }: CaseRoadmapTrackerProps) {
  const navigate = useNavigate();
  const {
    maps,
    loadGuidance,
    isLoading,
    linkCaseToMap,
    unlinkCaseFromMap,
    isStepCompleted,
    toggleStepCompletion,
    getProgress,
    caseMapLinks,
  } = useGuidanceStore();

  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [selectedMapSlug, setSelectedMapSlug] = useState<string>('');
  const [activeStepDrawer, setActiveStepDrawer] = useState<GuidanceStep | null>(null);

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

  // Suggest default roadmap based on case attributes
  const suggestedMap = useMemo(() => {
    const text = `${caseData.title || ''} ${caseData.caseType || ''} ${caseData.court || ''}`.toLowerCase();
    if (text.includes('enforce') || text.includes('c79') || text.includes('breach')) {
      return maps.find((m) => m.slug.includes('enforcement')) || maps[0];
    }
    return maps.find((m) => m.slug.includes('child-arrangements')) || maps[0];
  }, [caseData, maps]);

  // Determine current active phase (first journey with incomplete steps, or the last journey)
  const activePhase = useMemo(() => {
    if (!linkedMap || !linkedMap.journeys || linkedMap.journeys.length === 0) return null;
    const pendingJourney = linkedMap.journeys.find((j) =>
      j.steps.some((s) => !isStepCompleted(s.slug))
    );
    return pendingJourney || linkedMap.journeys[linkedMap.journeys.length - 1];
  }, [linkedMap, isStepCompleted]);

  const progress = getProgress(linkedMap?.slug);

  const handleAttachMap = (slug: string) => {
    linkCaseToMap(caseData.id, slug);
    setShowSwitchModal(false);
  };

  const handleUnlink = () => {
    if (window.confirm('Are you sure you want to detach this roadmap from the case?')) {
      unlinkCaseFromMap(caseData.id);
    }
  };

  // State: Case is NOT linked to a roadmap yet
  if (!linkedMap) {
    return (
      <Card className="border shadow-sm bg-white p-3 p-md-4 rounded-3 mb-3">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-start gap-3">
            <div
              className="p-3 rounded-circle text-primary flex-shrink-0"
              style={{ background: 'var(--mcb-primary-soft, #eff6ff)' }}
            >
              <FaCompass size={22} />
            </div>
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
                  Guidance Integration
                </span>
                <span className="text-muted small">UK Family Court GPS</span>
              </div>
              <h5 className="h6 fw-bold text-dark mb-1">Attach Procedural Legal Roadmap</h5>
              <p className="text-secondary small mb-0" style={{ maxWidth: '44rem' }}>
                Connect a step-by-step court pathway to this case. You will get interactive milestone checklists, statutory MIAM pre-court rules, form downloads (C100, C1A, C79), and hearing preparation guides.
              </p>
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2 align-self-stretch align-self-md-auto flex-shrink-0">
            {suggestedMap && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAttachMap(suggestedMap.slug)}
                className="d-inline-flex align-items-center gap-1.5 fw-semibold"
                disabled={isLoading}
              >
                <FaLink size={11} />
                <span>Attach {suggestedMap.name.split('(')[0].trim()}</span>
              </Button>
            )}

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setSelectedMapSlug(maps[0]?.slug || '');
                setShowSwitchModal(true);
              }}
              className="fw-medium"
              disabled={isLoading || maps.length === 0}
            >
              Choose Pathway…
            </Button>
          </div>
        </div>

        <SwitchRoadmapModal
          show={showSwitchModal}
          onHide={() => setShowSwitchModal(false)}
          caseTitle={caseData.title}
          maps={maps}
          selectedSlug={selectedMapSlug}
          onSelectSlug={setSelectedMapSlug}
          onConfirm={handleAttachMap}
          title="Select Procedural Roadmap"
          confirmLabel="Attach to Case"
        />
      </Card>
    );
  }

  // State: Case IS linked to a roadmap
  return (
    <Card className="border shadow-sm bg-white p-3 p-md-4 rounded-3 mb-3">
      {/* Roadmap Header & Progress */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 mb-3 border-bottom">
        <div>
          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
            <span
              className="badge border px-2.5 py-1 fw-semibold"
              style={{
                backgroundColor: 'var(--mcb-primary-soft)',
                color: 'var(--mcb-primary)',
                borderColor: 'var(--mcb-primary-border)',
              }}
            >
              Active Legal Roadmap
            </span>
            <span className="text-muted small">{linkedMap.category || 'Family Court Pathway'}</span>
          </div>
          <h4 className="h5 fw-bold text-dark mb-0">{linkedMap.name}</h4>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-3">
          <div style={{ minWidth: '180px' }}>
            <div className="d-flex justify-content-between align-items-center small mb-1">
              <span className="fw-semibold text-secondary">Roadmap Progress:</span>
              <span className="fw-bold text-primary">{progress.percentage}%</span>
            </div>
            <ProgressBar
              now={progress.percentage}
              variant={progress.percentage === 100 ? 'success' : 'primary'}
              style={{ height: '7px', borderRadius: '4px' }}
            />
            <div className="text-muted text-end mt-0.5" style={{ fontSize: '0.72rem' }}>
              {progress.completedSteps} of {progress.totalSteps} steps completed
            </div>
          </div>

          <div className="d-flex align-items-center gap-1.5">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate(`/guidance/${linkedMap.slug}`)}
              className="d-inline-flex align-items-center gap-1.5 fw-semibold"
            >
              <span>Full Roadmap</span>
              <FaArrowRight size={10} />
            </Button>

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setSelectedMapSlug(linkedMap.slug);
                setShowSwitchModal(true);
              }}
              title="Change attached roadmap"
              aria-label="Change pathway"
            >
              <FaExchangeAlt size={12} />
            </Button>

            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleUnlink}
              title="Detach roadmap"
              aria-label="Detach roadmap"
            >
              <FaUnlink size={12} />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Phase Details & Steps */}
      {activePhase && (
        <div>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary text-white px-2 py-1 small fw-semibold">
                Current Phase {activePhase.order}
              </span>
              <span className="fw-bold text-dark">{activePhase.name}</span>
            </div>
            <span className="text-muted small">
              {activePhase.steps.filter((s) => isStepCompleted(s.slug)).length} / {activePhase.steps.length} completed
            </span>
          </div>

          {activePhase.description && (
            <p className="text-secondary small mb-3">{activePhase.description}</p>
          )}

          <div className="d-flex flex-column gap-2 mb-2">
            {activePhase.steps.map((step, idx) => (
              <TrackerStepItem
                key={step.id || step.slug}
                step={step}
                index={idx}
                isCompleted={isStepCompleted(step.slug)}
                onToggle={() => toggleStepCompletion(step.slug)}
                onOpenGuide={() => setActiveStepDrawer(step)}
              />
            ))}
          </div>
        </div>
      )}

      <SwitchRoadmapModal
        show={showSwitchModal}
        onHide={() => setShowSwitchModal(false)}
        caseTitle={caseData.title}
        maps={maps}
        selectedSlug={selectedMapSlug}
        onSelectSlug={setSelectedMapSlug}
        onConfirm={handleAttachMap}
      />

      <Offcanvas
        show={Boolean(activeStepDrawer)}
        onHide={() => setActiveStepDrawer(null)}
        placement="end"
        style={{ width: '560px' }}
      >
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="h6 fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <FaBookOpen className="text-primary" />
            <span>Step Guidance & Official Forms</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-3 p-md-4">
          {activeStepDrawer?.articles && activeStepDrawer.articles.length > 0 ? (
            <GuidanceArticleView article={activeStepDrawer.articles[0]} />
          ) : (
            <p className="text-muted small">No detailed article available for this step.</p>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </Card>
  );
}
