import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, ButtonGroup, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaFileAlt,
  FaArrowLeft,
  FaFilePdf,
  FaGlobe,
  FaBook,
} from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import type { GuidanceReference, ReferenceType } from '../../types/guidance';
import { fetchGuidanceReferences } from '../../services/strapi';
import ReferenceCard from '../../components/guidance/ReferenceCard';

export default function GuidanceReferencesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [references, setReferences] = useState<GuidanceReference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ReferenceType | 'ALL'>('ALL');

  useEffect(() => {
    async function loadRefs() {
      setIsLoading(true);
      try {
        const data = await fetchGuidanceReferences();
        setReferences(data);
      } catch (err) {
        console.error('Failed to load references:', err);
      } finally {
        setIsLoading(false);
      }
    }
    void loadRefs();
  }, []);

  const filteredReferences = references.filter((ref) => {
    const matchesType = selectedType === 'ALL' || ref.type === selectedType;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      ref.name.toLowerCase().includes(term) ||
      (ref.keywords && ref.keywords.toLowerCase().includes(term));
    return matchesType && matchesSearch;
  });

  return (
    <Container fluid="xl" className="py-4">
      {/* Top Navigation */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => navigate('/guidance')}
          className="d-inline-flex align-items-center gap-2"
        >
          <FaArrowLeft size={11} />
          <span>{t.guidance.backToRoadmaps}</span>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-4">
        <div
          className="badge border px-3 py-1.5 rounded-pill d-inline-flex align-items-center gap-2 mb-2 fw-semibold small"
          style={{
            backgroundColor: 'var(--mcb-primary-soft)',
            color: 'var(--mcb-primary)',
            borderColor: 'var(--mcb-primary-border)',
          }}
        >
          <FaFileAlt size={12} />
          <span>{t.guidance.officialFormsAndStatutes}</span>
        </div>
        <h1 className="h3 fw-bold text-dark mb-1">{t.guidance.officialFormsAndStatutes}</h1>
        <p className="text-secondary small mb-0" style={{ maxWidth: '40rem' }}>
          {t.guidance.officialFormsSubtitle}
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-3 bg-white rounded border shadow-xs mb-4">
        <Row className="g-3 align-items-center">
          <Col md={6} lg={5}>
            <InputGroup>
              <InputGroup.Text className="bg-light border-end-0 text-muted">
                <FaSearch size={14} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder={t.guidance.searchReferencesPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0 ps-0"
              />
            </InputGroup>
          </Col>

          <Col md={6} lg={7} className="d-flex justify-content-md-end">
            <ButtonGroup className="flex-wrap">
              <Button
                variant={selectedType === 'ALL' ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => setSelectedType('ALL')}
                className="fw-medium"
              >
                {t.common.all} ({references.length})
              </Button>
              <Button
                variant={selectedType === 'Form' ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => setSelectedType('Form')}
                className="d-inline-flex align-items-center gap-1 fw-medium"
              >
                <FaFilePdf size={11} />
                <span>{t.guidance.courtForm}</span>
              </Button>
              <Button
                variant={selectedType === 'Document' ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => setSelectedType('Document')}
                className="d-inline-flex align-items-center gap-1 fw-medium"
              >
                <FaBook size={11} />
                <span>Guidance</span>
              </Button>
              <Button
                variant={selectedType === 'Web' ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => setSelectedType('Web')}
                className="d-inline-flex align-items-center gap-1 fw-medium"
              >
                <FaGlobe size={11} />
                <span>Web</span>
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">{t.guidance.loadingRoadmaps}</p>
        </div>
      ) : filteredReferences.length === 0 ? (
        <Alert variant="info" className="text-center py-4">
          <p className="mb-0">{t.guidance.noReferencesFound}</p>
          <Button variant="link" size="sm" onClick={() => { setSearchTerm(''); setSelectedType('ALL'); }}>
            {t.common.reset}
          </Button>
        </Alert>
      ) : (
        <Row className="g-3">
          {filteredReferences.map((ref) => (
            <Col key={ref.id} sm={6} md={4} lg={3}>
              <ReferenceCard reference={ref} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
