import { useState } from 'react'
import { Nav, Card } from 'react-bootstrap'
import { FaUserFriends, FaBook, FaCompass } from 'react-icons/fa'
import { useTranslation } from '../../../hooks/useTranslation'
import type { FamilyCase } from '../../../types/domain'
import { useAuthStore } from '../../../store/authStore'
import McKenzieFriendToolkit from './legal/McKenzieFriendToolkit'
import FamilyLawKnowledgeBase from './legal/FamilyLawKnowledgeBase'
import CaseRoadmapLegalView from './legal/CaseRoadmapLegalView'

export interface LegalHubTabProps {
  caseData: FamilyCase
}

export type LegalHubSubView = 'roadmap' | 'knowledge' | 'mckenzie'

export default function LegalHubTab({ caseData }: LegalHubTabProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const isMcKenzie = user?.role === 'McKenzieFriend'
  const [activeView, setActiveView] = useState<LegalHubSubView>(isMcKenzie ? 'mckenzie' : 'roadmap')

  return (
    <div className="d-flex flex-column gap-3">
      {/* Sub-navigation pills */}
      <Card className="border shadow-none bg-light p-2">
        <Nav
          variant="pills"
          className="gap-2 flex-wrap"
          activeKey={activeView}
          onSelect={(k) => k && setActiveView(k as LegalHubSubView)}
        >
          <Nav.Item>
            <Nav.Link
              eventKey="roadmap"
              className={`d-flex align-items-center gap-2 py-2 px-3 fw-medium ${
                activeView === 'roadmap' ? 'bg-primary text-white shadow-xs' : 'text-secondary bg-white border'
              }`}
            >
              <FaCompass size={14} />
              <span>{t.caseTabs.legalHubRoadmap}</span>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              eventKey="knowledge"
              className={`d-flex align-items-center gap-2 py-2 px-3 fw-medium ${
                activeView === 'knowledge' ? 'bg-primary text-white shadow-xs' : 'text-secondary bg-white border'
              }`}
            >
              <FaBook size={14} />
              <span>{t.caseTabs.legalHubKnowledge}</span>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link
              eventKey="mckenzie"
              className={`d-flex align-items-center gap-2 py-2 px-3 fw-medium ${
                activeView === 'mckenzie' ? 'bg-success text-white shadow-xs' : 'text-secondary bg-white border'
              }`}
            >
              <FaUserFriends size={14} />
              <span>{t.caseTabs.legalHubMckenzie}</span>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Card>

      {/* Render active sub-view */}
      {activeView === 'roadmap' ? (
        <CaseRoadmapLegalView caseData={caseData} />
      ) : activeView === 'knowledge' ? (
        <FamilyLawKnowledgeBase caseData={caseData} />
      ) : (
        <McKenzieFriendToolkit caseData={caseData} />
      )}
    </div>
  )
}
