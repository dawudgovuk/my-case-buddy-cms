import { useState } from 'react'
import { Card, Button, Badge } from 'react-bootstrap'
import type { Party } from '../../types/domain'
import PartyCard from './PartyCard'
import PartyInlineEditor from './PartyInlineEditor'
import { FaUsers, FaChild, FaPlus, FaUserTie, FaUserFriends } from 'react-icons/fa'
import { useTranslation } from '../../hooks/useTranslation'

export interface PartyFormSectionProps {
  parties: Party[]
  onAddParty: (party: Party) => void
  onRemoveParty: (partyId: string) => void
  onUpdateParty?: (party: Party) => void
  isChildSection?: boolean
  className?: string
}

export default function PartyFormSection({
  parties,
  onAddParty,
  onRemoveParty,
  onUpdateParty,
  isChildSection = false,
  className = '',
}: PartyFormSectionProps) {
  const { t } = useTranslation()
  const [isAdding, setIsAdding] = useState(false)
  const [defaultRole, setDefaultRole] = useState<Party['role']>(isChildSection ? 'Child' : 'Applicant')

  const sectionParties = isChildSection
    ? parties.filter((p) => p.role === 'Child')
    : parties.filter((p) => p.role !== 'Child')

  function handleOpenAdd(roleToSet: Party['role']) {
    setDefaultRole(roleToSet)
    setIsAdding(true)
  }

  function handleSaveParty(newParty: Party) {
    onAddParty(newParty)
    setIsAdding(false)
  }

  return (
    <Card className={`border shadow-sm bg-white rounded-3 mb-4 ${className}`}>
      {/* Section Header */}
      <Card.Header className="bg-white border-bottom py-3 px-3 px-md-4 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
        <div className="d-flex align-items-center gap-2">
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center ${
              isChildSection ? 'bg-warning-subtle text-warning-emphasis' : 'bg-primary-subtle text-primary'
            }`}
            style={{ width: 34, height: 34 }}
          >
            {isChildSection ? <FaChild size={16} /> : <FaUsers size={16} />}
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h6 className="fw-bold mb-0 text-dark">
                {isChildSection ? t('caseForm.childrenReviewTitle') : t('caseTabs.partiesTitle')}
              </h6>
              <Badge
                bg={isChildSection ? 'warning' : 'primary'}
                text={isChildSection ? 'dark' : 'white'}
                pill
                className="px-2"
                style={{ fontSize: '0.72rem' }}
              >
                {sectionParties.length}
              </Badge>
            </div>
            <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
              {isChildSection
                ? 'Children for whom orders (arrangements, prohibited steps) are sought'
                : 'Applicants, respondents, guardians, and solicitors involved'}
            </p>
          </div>
        </div>

        {/* Quick Add Action Buttons */}
        {!isAdding && (
          <div className="d-flex flex-wrap gap-1">
            {isChildSection ? (
              <Button
                variant="outline-warning"
                size="sm"
                className="text-dark fw-semibold d-flex align-items-center gap-1 shadow-xs"
                onClick={() => handleOpenAdd('Child')}
              >
                <FaPlus size={11} />
                <span>{t('caseTabs.addChild')}</span>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="fw-semibold d-flex align-items-center gap-1 shadow-xs"
                  onClick={() => handleOpenAdd('Applicant')}
                >
                  <FaPlus size={11} />
                  <span>{t('roles.applicant')}</span>
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="d-flex align-items-center gap-1 shadow-xs"
                  onClick={() => handleOpenAdd('Respondent')}
                >
                  <FaPlus size={11} />
                  <span>{t('roles.respondent')}</span>
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  className="border text-secondary d-flex align-items-center gap-1 shadow-xs"
                  onClick={() => handleOpenAdd('Guardian')}
                >
                  <FaUserFriends size={11} />
                  <span>{t('roles.guardian')}</span>
                </Button>
              </>
            )}
          </div>
        )}
      </Card.Header>

      <Card.Body className="p-3 p-md-4">
        {/* Inline Party Editor when adding */}
        {isAdding && (
          <PartyInlineEditor
            isChild={isChildSection}
            defaultRole={defaultRole}
            onSave={handleSaveParty}
            onCancel={() => setIsAdding(false)}
          />
        )}

        {/* Existing Parties List */}
        {sectionParties.length > 0 ? (
          <div className="d-flex flex-column gap-2">
            {sectionParties.map((p) => (
              <PartyCard
                key={p.id}
                party={p}
                onSave={onUpdateParty}
                onDelete={onRemoveParty}
                readOnly={false}
              />
            ))}
          </div>
        ) : !isAdding ? (
          /* Empty State */
          <div className="text-center py-4 px-3 border border-dashed rounded-3 bg-light">
            <div
              className={`mx-auto rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                isChildSection ? 'bg-warning-subtle text-warning-emphasis' : 'bg-primary-subtle text-primary'
              }`}
              style={{ width: 44, height: 44 }}
            >
              {isChildSection ? <FaChild size={20} /> : <FaUserTie size={20} />}
            </div>
            <h6 className="fw-semibold text-dark mb-1">
              {isChildSection ? t('caseDetails.noChildren') : t('caseDetails.noAdultParties')}
            </h6>
            <p className="text-muted small mb-3" style={{ maxWidth: '420px', margin: '0 auto', fontSize: '0.825rem' }}>
              {isChildSection
                ? 'Register the children involved in these proceedings to ensure court directions and safeguards are aligned.'
                : 'Every family court case requires at least one Applicant and one Respondent to track orders and service.'}
            </p>
            <Button
              variant={isChildSection ? 'warning' : 'primary'}
              size="sm"
              className={`fw-semibold shadow-xs ${isChildSection ? 'text-dark' : ''}`}
              onClick={() => handleOpenAdd(isChildSection ? 'Child' : 'Applicant')}
            >
              <FaPlus className="me-1" size={11} />
              {isChildSection ? t('caseTabs.addChild') : t('caseTabs.addParty')}
            </Button>
          </div>
        ) : null}
      </Card.Body>
    </Card>
  )
}
