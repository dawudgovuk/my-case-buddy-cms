import { Card, Badge, Button } from 'react-bootstrap'
import type { UserRole, User } from '../../types/domain'
import { FaUserCheck, FaBuilding, FaIdCard, FaHandshake } from 'react-icons/fa'

export interface PeerSupporterCardProps {
  professional: Pick<User, 'id' | 'name' | 'role' | 'isVerified'> & {
    firm?: string
    registrationNumber?: string
    bio?: string
  }
  onRequestSupport?: (professionalId: string) => void
  showRequestButton?: boolean
  buttonLabel?: string
  className?: string
}

const roleBadgeColor: Record<UserRole, 'secondary' | 'success' | 'primary' | 'warning'> = {
  LIP: 'secondary',
  McKenzieFriend: 'success',
  Solicitor: 'primary',
  Barrister: 'warning',
}

export default function PeerSupporterCard({
  professional,
  onRequestSupport,
  showRequestButton = true,
  buttonLabel = 'Request Peer Support',
  className = '',
}: PeerSupporterCardProps) {
  const badgeColor = roleBadgeColor[professional.role] || 'primary'

  return (
    <Card className={`h-100 shadow-sm border-0 d-flex flex-column bg-white ${className}`}>
      <Card.Header className="bg-white border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-start">
        <div className="d-flex gap-2 flex-wrap">
          <Badge bg={badgeColor} className={`px-2 py-1 ${professional.role === 'Barrister' ? 'text-dark' : ''}`}>
            {professional.role}
          </Badge>
          {professional.isVerified && (
            <Badge bg="success" className="px-2 py-1 d-inline-flex align-items-center">
              <FaUserCheck className="me-1" />
              Verified by Email
            </Badge>
          )}
        </div>
      </Card.Header>
      <Card.Body className="d-flex flex-column pt-2">
        <h5 className="fw-bold mb-1 text-primary">{professional.name}</h5>
        {professional.firm && (
          <div className="small text-muted mb-1 d-flex align-items-center">
            <FaBuilding className="me-2 text-secondary flex-shrink-0" />
            <span className="text-truncate">{professional.firm}</span>
          </div>
        )}
        {professional.registrationNumber && (
          <div className="small text-muted mb-2 d-flex align-items-center">
            <FaIdCard className="me-2 text-secondary flex-shrink-0" />
            <span>Reg: {professional.registrationNumber}</span>
          </div>
        )}
        <p className="small text-secondary flex-grow-1 mt-2 mb-3">
          {professional.bio || 'Verified legal professional ready to provide peer-to-peer case guidance and document support.'}
        </p>
        {showRequestButton && onRequestSupport && (
          <Button
            variant="outline-primary"
            className="mt-auto w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={() => onRequestSupport(professional.id)}
          >
            <FaHandshake />
            <span>{buttonLabel}</span>
          </Button>
        )}
      </Card.Body>
    </Card>
  )
}
