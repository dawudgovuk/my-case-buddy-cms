import type { ReactNode } from 'react'
import { Button } from 'react-bootstrap'
import { FaHandshake, FaEye, FaEdit, FaTrash } from 'react-icons/fa'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'light'
  | 'dark'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-success'
  | 'outline-warning'
  | 'outline-danger'
  | 'outline-info'

export interface CaseActionButtonProps {
  onClick?: () => void
  disabled?: boolean
  variant?: ButtonVariant
  size?: 'sm' | 'lg'
  fullWidth?: boolean
  className?: string
  children: ReactNode
  icon?: ReactNode
  title?: string
}

export function CaseActionButton({
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'sm',
  fullWidth = false,
  className = '',
  children,
  icon,
  title,
}: CaseActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`d-inline-flex align-items-center justify-content-center text-center gap-2 py-2 px-3 fw-semibold rounded-3 shadow-none ${fullWidth ? 'w-100' : ''} ${className}`}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span>{children}</span>
    </Button>
  )
}

export interface PeerSupportButtonProps {
  isSeekingPeerSupport: boolean
  onToggle: () => void
  disabled?: boolean
  fullWidth?: boolean
  className?: string
}

export function PeerSupportButton({
  isSeekingPeerSupport,
  onToggle,
  disabled = false,
  fullWidth = false,
  className = '',
}: PeerSupportButtonProps) {
  return (
    <Button
      variant={isSeekingPeerSupport ? 'success' : 'light'}
      size="sm"
      disabled={disabled}
      onClick={onToggle}
      title={isSeekingPeerSupport ? 'Peer Support is currently active. Click to toggle.' : 'Request peer review assistance'}
      className={`d-inline-flex align-items-center justify-content-center text-center gap-2 py-2 px-3 rounded-3 shadow-none ${
        isSeekingPeerSupport ? 'btn-peer-active text-white' : 'btn-peer-inactive'
      } ${fullWidth ? 'w-100' : ''} ${className}`}
      style={{ fontSize: '0.86rem', fontWeight: 600 }}
    >
      <FaHandshake size={15} className={isSeekingPeerSupport ? 'text-white flex-shrink-0' : 'text-muted flex-shrink-0'} />
      <span className="text-center">{isSeekingPeerSupport ? 'Peer Support Active' : 'Request Peer Support'}</span>
    </Button>
  )
}

export interface ViewCaseButtonProps {
  caseId: string
  onView?: (caseId: string) => void
  href?: string
  fullWidth?: boolean
  className?: string
  variant?: ButtonVariant
  size?: 'sm' | 'lg'
  label?: string
}

export function ViewCaseButton({
  caseId,
  onView,
  href,
  fullWidth = false,
  className = '',
  size = 'sm',
  label = 'View Details',
}: ViewCaseButtonProps) {
  const handleClick = () => {
    if (onView) onView(caseId)
  }

  return (
    <Button
      variant="primary"
      size={size}
      onClick={handleClick}
      className={`btn-case-view d-inline-flex align-items-center justify-content-center text-center gap-2 py-2 px-3 fw-semibold rounded-3 ${fullWidth ? 'w-100' : ''} ${className}`}
      style={{ fontSize: '0.86rem' }}
      {...(href ? { as: 'a', href } : {})}
    >
      <FaEye size={14} className="text-white flex-shrink-0" />
      <span className="text-center">{label}</span>
    </Button>
  )
}

export interface EditCaseButtonProps {
  caseId: string
  onEdit?: (caseId: string) => void
  href?: string
  fullWidth?: boolean
  className?: string
}

export function EditCaseButton({
  caseId,
  onEdit,
  href,
  fullWidth = false,
  className = '',
}: EditCaseButtonProps) {
  const handleClick = () => {
    if (onEdit) onEdit(caseId)
  }

  return (
    <Button
      variant="outline-primary"
      size="sm"
      onClick={handleClick}
      className={`btn-case-edit d-inline-flex align-items-center justify-content-center text-center gap-2 py-2 px-3 fw-semibold rounded-3 ${fullWidth ? 'w-100' : ''} ${className}`}
      style={{ fontSize: '0.86rem' }}
      {...(href ? { as: 'a', href } : {})}
    >
      <FaEdit size={14} className="flex-shrink-0" />
      <span className="text-center">Edit</span>
    </Button>
  )
}

export interface DeleteCaseButtonProps {
  caseId: string
  onDelete: (caseId: string) => void
  confirmMessage?: string
  fullWidth?: boolean
  className?: string
}

export function DeleteCaseButton({
  caseId,
  onDelete,
  confirmMessage = 'Are you sure you want to delete this case?',
  fullWidth = false,
  className = '',
}: DeleteCaseButtonProps) {
  const handleClick = () => {
    if (window.confirm(confirmMessage)) {
      onDelete(caseId)
    }
  }

  return (
    <CaseActionButton
      variant="outline-danger"
      onClick={handleClick}
      fullWidth={fullWidth}
      className={className}
      icon={<FaTrash />}
    >
      Delete
    </CaseActionButton>
  )
}

export interface CaseCardActionsProps {
  children: ReactNode
  layout?: 'vertical' | 'horizontal'
  className?: string
}

export function CaseCardActions({
  children,
  layout = 'vertical',
  className = '',
}: CaseCardActionsProps) {
  return (
    <div
      className={`d-flex ${layout === 'vertical' ? 'flex-column' : 'flex-row flex-wrap'} gap-2 ${className}`}
    >
      {children}
    </div>
  )
}
