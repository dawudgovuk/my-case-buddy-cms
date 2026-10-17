import { useMemo } from 'react'
import { FaHandshake, FaGavel, FaCalendarAlt, FaLock } from 'react-icons/fa'
import type { TabItem } from '../components/common/TabNav'
import type { ProfessionalDashboardTab } from '../utils/dashboardUtils'
import { useTranslation } from './useTranslation'

export interface ProfessionalDashboardTabCounts {
  isVerified: boolean | undefined
  peerSupportCasesCount: number
  assignedCasesCount: number
  upcomingHearingsCount: number
  pendingDeadlinesCount: number
}

/**
 * Builds the professional dashboard tab definitions (labels, icons, badge counts) for TabNav.
 */
export function useProfessionalDashboardTabs({
  isVerified,
  peerSupportCasesCount,
  assignedCasesCount,
  upcomingHearingsCount,
  pendingDeadlinesCount,
}: ProfessionalDashboardTabCounts): TabItem<ProfessionalDashboardTab>[] {
  const { t } = useTranslation()

  return useMemo<TabItem<ProfessionalDashboardTab>[]>(
    () => [
      {
        key: 'peer',
        label: isVerified
          ? t('professionalDashboard.peerSupportTab')
          : t('professionalDashboard.peerSupportRequestsTab'),
        count: peerSupportCasesCount,
        badgeVariant: isVerified ? 'primary' : 'warning',
        icon: isVerified ? <FaHandshake /> : <FaLock className="text-warning" />,
      },
      {
        key: 'assigned',
        label: t('professionalDashboard.assignedCasesTab'),
        count: assignedCasesCount,
        badgeVariant: 'secondary',
        icon: <FaGavel />,
      },
      {
        key: 'schedule',
        label: t('professionalDashboard.scheduleTab'),
        count: upcomingHearingsCount + pendingDeadlinesCount,
        badgeVariant: 'info',
        icon: <FaCalendarAlt />,
      },
    ],
    [peerSupportCasesCount, assignedCasesCount, isVerified, upcomingHearingsCount, pendingDeadlinesCount, t]
  )
}
