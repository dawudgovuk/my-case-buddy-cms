import { Modal, Form, Button } from 'react-bootstrap';
import type { GuidanceMap } from '../../../types/guidance';

export interface SwitchRoadmapModalProps {
  show: boolean;
  onHide: () => void;
  caseTitle: string;
  maps: GuidanceMap[];
  selectedSlug: string;
  onSelectSlug: (slug: string) => void;
  onConfirm: (slug: string) => void;
  title?: string;
  confirmLabel?: string;
}

export default function SwitchRoadmapModal({
  show,
  onHide,
  caseTitle,
  maps,
  selectedSlug,
  onSelectSlug,
  onConfirm,
  title = 'Switch Attached Roadmap',
  confirmLabel = 'Apply Pathway',
}: SwitchRoadmapModalProps) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5 fw-bold">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-secondary small mb-3">
          Select the procedural pathway for <strong>{caseTitle}</strong>:
        </p>
        <Form.Group>
          <Form.Label className="fw-semibold small">Available Pathways:</Form.Label>
          <Form.Select
            value={selectedSlug}
            onChange={(e) => onSelectSlug(e.target.value)}
          >
            {maps.map((m) => (
              <option key={m.id} value={m.slug}>
                {m.name} ({m.journeys?.length || 0} Phases)
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => onConfirm(selectedSlug)}
          disabled={!selectedSlug}
        >
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
