import { Row, Col } from 'react-bootstrap'
import PeerSupporterCard from '../directory/PeerSupporterCard'

export function PeerSupporterCardPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const sampleSolicitor = {
    id: 'sol-01',
    name: 'Sarah Jenkins',
    role: 'Solicitor' as const,
    firm: 'Jenkins & Partners Family Law',
    registrationNumber: 'SRA-98124',
    bio: 'Specialist in private children law disputes, financial remedies, and domestic abuse injunctions with 12+ years of court representation.',
    isVerified: true,
  }

  const sampleBarrister = {
    id: 'bar-01',
    name: 'David Thorne',
    role: 'Barrister' as const,
    firm: 'Temple Chambers, London',
    registrationNumber: 'BSB-44219',
    bio: 'Experienced family court counsel available for direct access guidance, preliminary hearing advocacy, and skeleton arguments.',
    isVerified: true,
  }

  const sampleMcKenzie = {
    id: 'mck-01',
    name: 'Elena Rostova',
    role: 'McKenzieFriend' as const,
    registrationNumber: 'MF-UK-1092',
    bio: 'Experienced McKenzie Friend helping parents understand court directions, bundle indexing, and court etiquette.',
    isVerified: true,
  }

  return (
    <div>
      <p className="small text-secondary mb-3">
        Interactive cards displaying verified legal professionals with role indicators, verification badge, and peer support request trigger.
      </p>
      <Row className="g-3">
        <Col xs={12} md={4}>
          <PeerSupporterCard
            professional={sampleSolicitor}
            onRequestSupport={(id) => onFeedback(`Requested peer support from Solicitor (${id})`)}
          />
        </Col>
        <Col xs={12} md={4}>
          <PeerSupporterCard
            professional={sampleBarrister}
            onRequestSupport={(id) => onFeedback(`Requested peer support from Barrister (${id})`)}
          />
        </Col>
        <Col xs={12} md={4}>
          <PeerSupporterCard
            professional={sampleMcKenzie}
            onRequestSupport={(id) => onFeedback(`Requested peer support from McKenzie Friend (${id})`)}
          />
        </Col>
      </Row>
    </div>
  )
}
