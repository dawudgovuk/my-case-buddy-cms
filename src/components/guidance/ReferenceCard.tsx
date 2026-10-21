import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FaFilePdf, FaExternalLinkAlt, FaVideo, FaBook, FaGlobe } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import type { GuidanceReference, ReferenceType } from '../../types/guidance';

interface ReferenceCardProps {
  reference: GuidanceReference;
  compact?: boolean;
}

const typeIcon: Record<ReferenceType, React.ReactElement> = {
  Form: <FaFilePdf className="text-danger" />,
  Document: <FaBook className="text-primary" />,
  Web: <FaGlobe className="text-info" />,
  Video: <FaVideo className="text-warning" />,
  Case: <FaBook className="text-secondary" />,
};

const typeBadgeVariant: Record<ReferenceType, string> = {
  Form: 'danger',
  Document: 'primary',
  Web: 'info',
  Video: 'warning',
  Case: 'secondary',
};

export default function ReferenceCard({ reference, compact = false }: ReferenceCardProps) {
  const { t } = useTranslation();
  const isExternal = reference.url.startsWith('http');

  if (compact) {
    return (
      <a
        href={reference.url}
        target="_blank"
        rel="noopener noreferrer"
        className="d-flex align-items-center justify-content-between p-2.5 mb-2 rounded border text-decoration-none bg-white text-dark hover-shadow-xs"
        style={{ borderColor: 'var(--mcb-border)' }}
      >
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <span className="flex-shrink-0 fs-5">{typeIcon[reference.type] || <FaFilePdf />}</span>
          <div className="text-truncate">
            <div className="fw-medium text-truncate small">{reference.name}</div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{reference.type}</div>
          </div>
        </div>
        <FaExternalLinkAlt size={12} className="text-muted flex-shrink-0 ms-2" />
      </a>
    );
  }

  return (
    <Card className="h-100 shadow-xs border-0" style={{ border: '1px solid var(--mcb-border)' }}>
      <Card.Body className="d-flex flex-column p-3">
        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
          <Badge bg={typeBadgeVariant[reference.type] || 'secondary'} className="fw-medium">
            {reference.type}
          </Badge>
          <span className="fs-5">{typeIcon[reference.type] || <FaFilePdf />}</span>
        </div>
        <Card.Title className="h6 mb-2 text-dark">{reference.name}</Card.Title>
        {reference.keywords && (
          <Card.Text className="text-muted small mb-3 flex-grow-1" style={{ fontSize: '0.8rem' }}>
            Tags: {reference.keywords}
          </Card.Text>
        )}
        <Button
          variant="outline-primary"
          size="sm"
          href={reference.url}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="d-inline-flex align-items-center justify-content-center gap-2 mt-auto fw-medium"
        >
          <span>{reference.type === 'Form' ? t.guidance.downloadForm : t.guidance.officialGovLink}</span>
          {isExternal && <FaExternalLinkAlt size={11} />}
        </Button>
      </Card.Body>
    </Card>
  );
}
