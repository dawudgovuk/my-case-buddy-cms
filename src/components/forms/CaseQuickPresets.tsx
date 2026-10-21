import { Card, Badge } from 'react-bootstrap'
import { FaBolt, FaChild, FaShieldAlt, FaBalanceScale, FaFileAlt } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'
import type { CaseType, CourtType } from '../../types/domain'

export interface CasePreset {
  id: string
  label: string
  titleTemplate: string
  caseType: CaseType
  court: CourtType
  icon: typeof FaChild
  description: string
}

export interface CaseQuickPresetsProps {
  onSelectPreset: (preset: { title: string; caseType: CaseType; court: CourtType }) => void
  currentTitle?: string
  className?: string
}

const PRESETS: CasePreset[] = [
  {
    id: 'child-arrangements',
    label: 'Child Arrangements',
    titleTemplate: 'Application for Child Arrangements (Live With / Contact)',
    caseType: 'Private Law (Child Arrangements)',
    court: 'Family Court',
    icon: FaChild,
    description: 'Residence, spend time with & holiday contact',
  },
  {
    id: 'prohibited-steps',
    label: 'Prohibited Steps Order',
    titleTemplate: 'Application for Prohibited Steps / Specific Issue Order',
    caseType: 'Private Law (Child Arrangements)',
    court: 'Family Court',
    icon: FaShieldAlt,
    description: 'Schooling, relocation, or medical decisions',
  },
  {
    id: 'non-molestation',
    label: 'Non-Molestation',
    titleTemplate: 'Application for Non-Molestation & Occupation Order',
    caseType: 'Domestic Abuse (Non-Molestation)',
    court: 'Family Court',
    icon: FaShieldAlt,
    description: 'Protection from domestic abuse and harassment',
  },
  {
    id: 'financial-remedy',
    label: 'Financial Remedies',
    titleTemplate: 'Financial Remedy Proceedings (Form A / Consent)',
    caseType: 'Financial Remedies',
    court: 'Family Court',
    icon: FaBalanceScale,
    description: 'Maintenance, property adjustment & pensions',
  },
  {
    id: 'care-proceedings',
    label: 'Care / Supervision',
    titleTemplate: 'Public Law Proceedings under Section 31 Children Act',
    caseType: 'Public Law (Care Proceedings)',
    court: 'Family Court',
    icon: FaFileAlt,
    description: 'Local authority care or supervision orders',
  },
]

export default function CaseQuickPresets({
  onSelectPreset,
  currentTitle = '',
  className = '',
}: CaseQuickPresetsProps) {
  const { t } = useTranslation()

  return (
    <Card className={`p-3 mb-4 ${className}`} style={{ background: 'linear-gradient(135deg, #f3f6ff 0%, #ffffff 70%)', borderColor: 'var(--mcb-primary-border)' }}>
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-1 mb-2">
        <div className="d-flex align-items-center gap-2">
          <Badge bg="primary" className="d-inline-flex align-items-center gap-1">
            <FaBolt size={10} />
            <span>{t('caseForm.quickPresetsTitle')}</span>
          </Badge>
          <span className="small fw-bold text-dark">{t('caseForm.quickPresetsDesc')}</span>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 pt-1">
        {PRESETS.map((p) => {
          const Icon = p.icon
          const isSelected = currentTitle.trim() === p.titleTemplate.trim()

          return (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                onSelectPreset({
                  title: p.titleTemplate,
                  caseType: p.caseType,
                  court: p.court,
                })
              }
              className={`btn btn-sm d-flex align-items-center gap-2 rounded-pill px-3 ${
                isSelected ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              style={{ fontSize: '0.85rem' }}
              aria-pressed={isSelected}
              title={p.description}
            >
              <Icon size={12} className={isSelected ? 'text-white' : 'text-primary'} />
              <span>{p.label}</span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
