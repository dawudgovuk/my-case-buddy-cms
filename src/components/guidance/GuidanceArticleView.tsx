import { Card, Badge, Alert } from 'react-bootstrap';
import { FaBookOpen, FaDownload } from 'react-icons/fa';
import type { GuidanceArticle } from '../../types/guidance';
import ReferenceCard from './ReferenceCard';

interface GuidanceArticleViewProps {
  article: GuidanceArticle;
}

export default function GuidanceArticleView({ article }: GuidanceArticleViewProps) {
  // Simple renderer to format basic markdown-style blocks (###, ####, - bullets, bold)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="my-2" />;
      }
      if (trimmed.startsWith('#### ')) {
        return (
          <h5 key={idx} className="fw-semibold text-dark mt-3 mb-2" style={{ fontSize: '1.05rem' }}>
            {trimmed.replace('#### ', '')}
          </h5>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="fw-bold text-dark mt-4 mb-2 pb-1 border-bottom" style={{ fontSize: '1.25rem' }}>
            {trimmed.replace('### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemText = trimmed.slice(2);
        const parts = itemText.split(/(\*\*.*?\*\*)/g);
        return (
          <li key={idx} className="text-secondary mb-1.5 ms-3">
            {parts.map((p, i) =>
              p.startsWith('**') && p.endsWith('**') ? (
                <strong key={i} className="text-dark">
                  {p.slice(2, -2)}
                </strong>
              ) : (
                p
              )
            )}
          </li>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const parts = trimmed.replace(/^\d+\.\s/, '').split(/(\*\*.*?\*\*)/g);
        return (
          <div key={idx} className="d-flex align-items-start gap-2 mb-2 text-secondary">
            <span className="badge bg-light text-primary border fw-semibold flex-shrink-0 mt-0.5">
              {trimmed.match(/^\d+/)?.[0]}
            </span>
            <div>
              {parts.map((p, i) =>
                p.startsWith('**') && p.endsWith('**') ? (
                  <strong key={i} className="text-dark">
                    {p.slice(2, -2)}
                  </strong>
                ) : (
                  p
                )
              )}
            </div>
          </div>
        );
      }
      return (
        <p key={idx} className="text-secondary mb-2 leading-relaxed">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="guidance-article-view">
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4 p-md-5">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1.5">
              <FaBookOpen className="me-1.5" />
              {article.category || 'Official Guidance'}
            </Badge>
            {article.keywords && (
              <span className="text-muted small">
                Tags: {article.keywords.split(',').slice(0, 3).join(', ')}
              </span>
            )}
          </div>

          <h2 className="h3 fw-bold text-dark mb-4">{article.title}</h2>

          <div className="article-body mb-5">{renderFormattedContent(article.content)}</div>

          {/* Attached Official References */}
          {article.references && article.references.length > 0 && (
            <div className="mt-4 pt-4 border-top">
              <div className="d-flex align-items-center gap-2 mb-3">
                <FaDownload className="text-primary" />
                <h5 className="h6 fw-bold mb-0 text-dark">Official Forms & Verified Resources for this Step</h5>
              </div>
              <div className="row g-3">
                {article.references.map((ref) => (
                  <div key={ref.id} className="col-md-6">
                    <ReferenceCard reference={ref} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert variant="info" className="mt-4 mb-0 d-flex align-items-center gap-2 py-2.5 small">
            <span>
              ℹ️ <strong>Legal Notice:</strong> This procedural guidance provides general court navigation assistance for Litigants in Person in England & Wales under the Family Procedure Rules. It does not constitute formal legal representation.
            </span>
          </Alert>
        </Card.Body>
      </Card>
    </div>
  );
}
