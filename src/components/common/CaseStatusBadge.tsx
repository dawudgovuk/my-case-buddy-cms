import { Badge } from 'react-bootstrap'
import { FaCircle, FaCheckCircle, FaPauseCircle } from 'react-icons/fa'

export interface CaseStatusBadgeProps {
  status: string
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function CaseStatusBadge({
  status,
  className = '',
  showIcon = true,
  size = 'md',
}: CaseStatusBadgeProps) {
  const normalized = status.toLowerCase()

  let bgVariant: 'success' | 'warning' | 'secondary' | 'info' | 'primary' = 'primary'
  let icon = <FaCircle size={8} className="me-1" />

  if (normalized === 'open' || normalized === 'active') {
    bgVariant = 'success'
    icon = <FaCircle size={8} className="me-1 text-light" />
  } else if (normalized === 'stayed' || normalized === 'pending') {
    bgVariant = 'warning'
    icon = <FaPauseCircle size={10} className="me-1" />
  } else if (normalized === 'concluded' || normalized === 'closed') {
    bgVariant = 'secondary'
    icon = <FaCheckCircle size={10} className="me-1" />
  }

  const paddingClass = size === 'sm' ? 'px-2 py-1 small' : size === 'lg' ? 'px-3 py-2 fs-6' : 'px-3 py-2'

  return (
    <Badge
      bg={bgVariant}
      className={`fw-semibold d-inline-flex align-items-center ${bgVariant === 'warning' ? 'text-dark' : 'text-white'} ${paddingClass} ${className}`}
    >
      {showIcon && icon}
      <span>{status}</span>
    </Badge>
  )
}
