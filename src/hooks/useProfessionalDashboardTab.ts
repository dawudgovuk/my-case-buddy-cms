import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isProfessionalDashboardTab, type ProfessionalDashboardTab } from '../utils/dashboardUtils'

/**
 * Active professional dashboard tab, defaulting to `peer` and synced from the `?tab=` query param.
 */
export function useProfessionalDashboardTab(): [ProfessionalDashboardTab, (tab: ProfessionalDashboardTab) => void] {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<ProfessionalDashboardTab>('peer')

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (isProfessionalDashboardTab(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  return [activeTab, setActiveTab]
}
