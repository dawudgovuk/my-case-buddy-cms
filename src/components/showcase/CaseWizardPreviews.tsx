import { useState } from 'react'
import CaseCreationStepper from '../forms/CaseCreationStepper'
import CaseQuickPresets from '../forms/CaseQuickPresets'
import CaseReviewSummary from '../forms/CaseReviewSummary'
import CaseReadinessChecklist from '../forms/CaseReadinessChecklist'
import PartyInlineEditor from '../case/PartyInlineEditor'
import type { FamilyCase } from '../../types/domain'

export function CaseCreationStepperPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div>
      <CaseCreationStepper
        currentStep={currentStep}
        onSelectStep={(step) => {
          setCurrentStep(step)
          onFeedback(`Selected Step: ${step + 1}`)
        }}
        status={{
          detailsValid: true,
          partiesCount: 2,
          childrenCount: 1,
        }}
      />
    </div>
  )
}

export function CaseQuickPresetsPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const [title, setTitle] = useState('')

  return (
    <div>
      <CaseQuickPresets
        currentTitle={title}
        onSelectPreset={(p) => {
          setTitle(p.title)
          onFeedback(`Selected preset: ${p.title} (${p.caseType})`)
        }}
      />
      {title && (
        <div className="small text-muted mt-2">
          Current Title: <strong>{title}</strong>
        </div>
      )}
    </div>
  )
}

export function PartyInlineEditorPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  return (
    <div className="d-flex flex-column gap-3">
      <PartyInlineEditor
        isChild={false}
        defaultRole="Applicant"
        onSave={(p) => onFeedback(`Saved Party: ${p.role} - ${p.firstName} ${p.lastName}`)}
        onCancel={() => onFeedback('Cancelled party creation')}
      />
      <PartyInlineEditor
        isChild={true}
        onSave={(c) => onFeedback(`Saved Child: ${c.firstName} ${c.lastName}`)}
        onCancel={() => onFeedback('Cancelled child registration')}
      />
    </div>
  )
}

export function CaseReadinessChecklistPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  return (
    <div onClick={() => onFeedback('Checklist viewed')}>
      <CaseReadinessChecklist
        hasTitle={true}
        court="Family Court"
        applicantsCount={1}
        respondentsCount={1}
      />
    </div>
  )
}

export function CaseReviewSummaryPreview({ onFeedback }: { onFeedback: (msg: string) => void }) {
  const sampleCase: FamilyCase = {
    id: '1792 1487 9533 6269',
    title: 'Application for Child Arrangements (Live With / Contact)',
    court: 'Family Court',
    caseType: 'Private Law (Child Arrangements)',
    status: 'Open',
    startedAt: '2026-10-14',
    allocatedJudge: 'District Judge Henderson',
    parties: [
      {
        id: 'p1',
        role: 'Applicant',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        address: '14 High Street, Manchester',
        contactEmail: 'sarah.j@example.com',
      },
      {
        id: 'p2',
        role: 'Respondent',
        firstName: 'Mark',
        lastName: 'Jenkins',
        address: '8 Kingsway, Manchester',
      },
      {
        id: 'c1',
        role: 'Child',
        firstName: 'Leo',
        lastName: 'Jenkins',
        dateOfBirth: '2018-05-12',
      },
    ],
    hearings: [],
    orders: [],
    documents: [],
    notes: [],
    lastUpdatedAt: new Date().toISOString(),
  }

  return (
    <CaseReviewSummary
      caseData={sampleCase}
      onEditStep={(step) => onFeedback(`Jump to edit step: ${step}`)}
      isEditMode={false}
      onSubmit={() => onFeedback('Submitted case creation')}
      onCancel={() => onFeedback('Cancelled creation')}
    />
  )
}
