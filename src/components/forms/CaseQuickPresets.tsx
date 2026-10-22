import { Card, Badge } from 'react-bootstrap'
import { FaBolt, FaChild, FaShieldAlt, FaBalanceScale, FaFileAlt } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'
import { useCaseConfigStore } from '../../store/caseConfigStore'
import type { CaseType, CourtType } from '../../types/domain'

export interface CaseQuickPresetsProps {
  onSelectPreset: (preset: { title: string; caseType: CaseType; court: CourtType }) => void
  currentTitle?: string
  className?: string
}

function getPresetIcon(iconStr?: string) {
  switch (iconStr) {
    case 'shield':
      return FaShieldAlt
    case 'balance':
      return FaBalanceScale
    case 'file':
      return FaFileAlt
    case 'child':
    default:
      return FaChild
  }
}

export default function CaseQuickPresets({
  onSelectPreset,
  currentTitle = '',
  className = '',
}: CaseQuickPresetsProps) {
  const { t } = useTranslation()
  const { casePresets } = useCaseConfigStore()

  const activePresets = casePresets.filter((p) => p.isActive !== false)

  return (
    <Card
      className={`p-3 mb-4 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #f3f6ff 0%, #ffffff 70%)',
        borderColor: 'var(--mcb-primary-border)',
      }}
    >
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
        {activePresets.map((p) => {
          const Icon = getPresetIcon(p.icon)
          const isSelected = currentTitle.trim() === p.titleTemplate.trim()
          const label = p.label || p.presetKey

          return (
            <button
              key={p.presetKey || p.id}
              type="button"
              onClick={() =>
                onSelectPreset({
                  title: p.titleTemplate,
                  caseType: p.caseType as CaseType,
                  court: p.court as CourtType,
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
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
