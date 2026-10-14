import type { ReactNode } from 'react'

export type ComponentCategory =
  | 'Cases & Progression'
  | 'Case Management & Records'
  | 'Form Inputs & Controls'
  | 'Case Lists & Badges'
  | 'Legal Directory & Safeguarding'
  | 'Buttons & Actions'
  | 'Navigation & Brand'
  | 'Dashboard Widgets'

export interface PropDefinition {
  name: string
  type: string
  required?: boolean
  defaultVal?: string
  description: string
}

export interface ComponentItem {
  id: string
  name: string
  category: ComponentCategory
  filePath: string
  importStatement: string
  description: string
  badges: string[]
  propsDoc: PropDefinition[]
  codeSnippet: string
  renderPreview: (onFeedback: (message: string) => void) => ReactNode
}
