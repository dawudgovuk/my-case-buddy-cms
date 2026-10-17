import type { ReactNode } from 'react'
import { Alert, Card } from 'react-bootstrap'
import { FaCheckCircle } from 'react-icons/fa'
import type { IconType } from 'react-icons'

export interface ToolkitCardHeaderProps {
  icon: IconType
  title: string
  /** Badge rendered on the right-hand side of the header. */
  badge: ReactNode
}

/**
 * White card header for McKenzie toolkit modules: green icon, small bold title and a badge.
 */
export function ToolkitCardHeader({ icon: Icon, title, badge }: ToolkitCardHeaderProps) {
  return (
    <Card.Header className="bg-white border-bottom py-2.5 px-3 d-flex justify-content-between align-items-center">
      <span className="fw-bold text-dark d-flex align-items-center gap-2 small">
        <Icon className="text-success" />
        <span>{title}</span>
      </span>
      {badge}
    </Card.Header>
  )
}

export interface ToolkitSavedAlertProps {
  children: ReactNode
}

/**
 * Compact success alert with a check icon, shown after a toolkit module saves to case notes.
 */
export function ToolkitSavedAlert({ children }: ToolkitSavedAlertProps) {
  return (
    <Alert variant="success" className="py-1.5 px-2.5 small mb-2 d-flex align-items-center gap-1.5">
      <FaCheckCircle className="text-success" />
      <span>{children}</span>
    </Alert>
  )
}
