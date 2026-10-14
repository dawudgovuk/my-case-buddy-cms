import { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { FaCalendarPlus, FaClock } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import { useCasesStore } from '../../store/casesStore';
import { useAuthStore } from '../../store/authStore';
import { createDeadline, generateId } from '../../services/storage';
import { createStrapiDeadline } from '../../services/strapi';
import type { DocumentDeadline } from '../../types/domain';

export interface AddDeadlineModalProps {
  show: boolean;
  caseId: string;
  onHide: () => void;
  onDeadlineAdded?: (deadline: DocumentDeadline) => void;
}

const DOCUMENT_TYPES = [
  'Statement',
  'Position Statement',
  'Bundle',
  'Application (C100/C1A)',
  'Medical Report',
  'Expert Assessment',
  'Order Draft',
  'Financial Disclosure (Form E)',
  'Other',
];

export default function AddDeadlineModal({
  show,
  caseId,
  onHide,
  onDeadlineAdded,
}: AddDeadlineModalProps) {
  const { t } = useTranslation();
  const { isStrapiMode } = useCasesStore();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [deadlineDate, setDeadlineDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [documentType, setDocumentType] = useState('Statement');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadlineDate) {
      setError('Please provide both a title and a deadline date.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const deadlineId = generateId('DDL');
    const newDeadline: DocumentDeadline = {
      id: deadlineId,
      caseId,
      title: title.trim(),
      deadlineDate,
      documentType,
      description: description.trim() || undefined,
      status: 'pending',
      assignedTo: user?.id,
    };

    // Save locally
    createDeadline(newDeadline);

    // Save to Strapi if in Strapi mode
    if (isStrapiMode) {
      try {
        const saved = await createStrapiDeadline({
          caseId,
          title: title.trim(),
          deadlineDate,
          documentType,
          description: description.trim() || undefined,
          status: 'pending',
          assignedTo: user?.id,
        });
        if (saved?.id) {
          newDeadline.id = saved.id;
        }
      } catch (err: unknown) {
        console.warn('Could not sync deadline to Strapi:', err);
      }
    }

    setIsSubmitting(false);
    onDeadlineAdded?.(newDeadline);
    setTitle('');
    setDescription('');
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5 d-flex align-items-center gap-2">
          <FaCalendarPlus className="text-primary" />
          <span>Add Filing Deadline</span>
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-3 p-md-4">
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Deadline Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. File Applicant Witness Statement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <div className="row g-2 mb-3">
            <div className="col-12 col-sm-6">
              <Form.Group>
                <Form.Label className="fw-semibold d-flex align-items-center gap-1">
                  <FaClock size={12} className="text-muted" />
                  <span>Due Date</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-12 col-sm-6">
              <Form.Group>
                <Form.Label className="fw-semibold">Document Category</Form.Label>
                <Form.Select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-2">
            <Form.Label className="fw-semibold">Instructions / Notes (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="e.g. Must serve on Respondent solicitor 14 days before PTR hearing..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Create Deadline'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
