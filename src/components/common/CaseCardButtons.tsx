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
      className={`d-inline-flex align-items-center justify-content-center gap-2 py-2 px-3 fw-semibold rounded-3 shadow-none ${fullWidth ? 'w-100' : ''} ${className}`}
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
    <CaseActionButton
      variant={isSeekingPeerSupport ? 'success' : 'outline-primary'}
      onClick={onToggle}
      disabled={disabled}
      fullWidth={fullWidth}
      className={className}
      icon={<FaHandshake />}
      title={isSeekingPeerSupport ? 'Peer Support is currently active' : 'Request peer assistance from professionals'}
    >
      {isSeekingPeerSupport ? 'Peer Support Active' : 'Request Peer Support'}
    </CaseActionButton>
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
  variant = 'primary',
  size = 'sm',
  label = 'View Details',
}: ViewCaseButtonProps) {
  const handleClick = () => {
    if (onView) onView(caseId)
  }

  return (
    <CaseActionButton
      variant={variant}
      size={size}
      onClick={handleClick}
      fullWidth={fullWidth}
      className={className}
      icon={<FaEye />}
      {...(href ? { as: 'a', href } : {})}
    >
      {label}
    </CaseActionButton>
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
    <CaseActionButton
      variant="outline-primary"
      onClick={handleClick}
      fullWidth={fullWidth}
      className={className}
      icon={<FaEdit />}
      {...(href ? { as: 'a', href } : {})}
    >
      Edit
    </CaseActionButton>
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
