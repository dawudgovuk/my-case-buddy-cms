import type { ReactNode } from 'react'
import heartLogo from '../../assets/heart-logo.png'

export interface AuthHeroProps {
  /** Main heading text. */
  title: ReactNode
  /** Supporting paragraph below the heading. */
  subtitle: ReactNode
}

/**
 * Branded hero header (logo, heading, intro) shown at the top of auth cards.
 */
export default function AuthHero({ title, subtitle }: AuthHeroProps) {
  return (
    <div className="auth-hero">
      <div className="auth-hero-icon">
        <img src={heartLogo} alt="My Case Buddy" />
      </div>
      <h1 className="h4 fw-bold mb-1 text-white">{title}</h1>
      <p className="auth-hero-subtitle">{subtitle}</p>
    </div>
  )
}
