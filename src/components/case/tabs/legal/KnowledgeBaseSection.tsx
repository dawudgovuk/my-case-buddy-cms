import type { ReactNode } from 'react'
import { Accordion, Badge } from 'react-bootstrap'
import type { IconType } from 'react-icons'

export interface KnowledgeBaseSectionBadge {
  label: string
  bg: string
  text?: string
  className: string
}

export interface KnowledgeBaseSectionProps {
  eventKey: string
  icon: IconType
  /** Classes for the coloured icon chip (e.g. `bg-info-subtle text-info`). */
  iconClassName: string
  title: string
  badge?: KnowledgeBaseSectionBadge
  /** Adds bottom spacing between stacked accordion items. */
  spaced?: boolean
  bodyClassName?: string
  children: ReactNode
}

/**
 * Accordion item shell used by the Family Law Knowledge Base:
 * icon chip, bold title, optional badge, and a white body.
 */
export default function KnowledgeBaseSection({
  eventKey,
  icon: Icon,
  iconClassName,
  title,
  badge,
  spaced = true,
  bodyClassName = 'bg-white',
  children,
}: KnowledgeBaseSectionProps) {
  return (
    <Accordion.Item
      eventKey={eventKey}
      className={spaced ? 'border rounded-3 mb-2 overflow-hidden shadow-xs' : 'border rounded-3 overflow-hidden shadow-xs'}
    >
      <Accordion.Header>
        <div className="d-flex align-items-center gap-2">
          <span className={`p-1.5 rounded ${iconClassName}`}>
            <Icon size={14} />
          </span>
          <span className="fw-bold text-dark">{title}</span>
          {badge && (
            <Badge bg={badge.bg} text={badge.text} className={badge.className}>
              {badge.label}
            </Badge>
          )}
        </div>
      </Accordion.Header>
      <Accordion.Body className={bodyClassName}>{children}</Accordion.Body>
    </Accordion.Item>
  )
}
