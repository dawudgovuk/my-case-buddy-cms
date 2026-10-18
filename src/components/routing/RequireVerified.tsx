import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { WELCOME_ROUTE } from '../../utils/authConstants'

export interface RequireVerifiedProps {
  children: ReactNode
}

/**
 * Route guard for the signed-in app: visitors who are signed out go to the sign-in page,
 * and accounts whose email is not yet verified go to the welcome / verify-email page.
 */
export default function RequireVerified({ children }: RequireVerifiedProps) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (!user.isVerified) {
    return <Navigate to={WELCOME_ROUTE} replace />
  }
  return <>{children}</>
}
