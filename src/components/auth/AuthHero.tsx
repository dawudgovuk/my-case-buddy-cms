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
        <img src={heartLogo} alt="" />
      </div>
      <h1 className="h3 fw-bold mb-1">{title}</h1>
      <p>{subtitle}</p>
    </div>
  )
}
