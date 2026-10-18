import heartLogo from '../../assets/heart-logo.png'

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="d-inline-flex align-items-center gap-2">
      <img src={heartLogo} alt="" width={size} height={size} style={{ objectFit: 'contain' }} />
      <span className="brand-wordmark">
        My Case <span>Buddy</span>
      </span>
    </span>
  )
}
