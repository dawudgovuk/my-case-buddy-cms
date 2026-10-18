import { Fragment } from 'react'
import type { LabelledPoint, RichText } from '../../../../utils/legalKnowledgeBase'

export interface RichTextContentProps {
  text: RichText
}

/**
 * Renders plain text or inline segments, wrapping `{ em }` segments in `<em>`.
 */
export function RichTextContent({ text }: RichTextContentProps) {
  if (typeof text === 'string') return <>{text}</>
  return (
    <>
      {text.map((segment, idx) =>
        typeof segment === 'string' ? (
          <Fragment key={idx}>{segment}</Fragment>
        ) : (
          <em key={idx}>{segment.em}</em>
        )
      )}
    </>
  )
}

export interface LabelledPointTextProps {
  point: LabelledPoint
}

/**
 * Renders a bold label followed by a space and its explanatory text.
 */
export default function LabelledPointText({ point }: LabelledPointTextProps) {
  return (
    <>
      <strong>{point.label}</strong> <RichTextContent text={point.text} />
    </>
  )
}
