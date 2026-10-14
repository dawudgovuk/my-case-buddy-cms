import heartLogo from '../../assets/heart-logo.png'

export default function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <img
        src={heartLogo}
        alt="Heart in hand logo"
        style={{ width: 32, height: 32, objectFit: 'contain', display: 'inline-block' }}
      />
      <span style={{ fontWeight: 700, fontSize: 20, color: '#1677ff', letterSpacing: 0.5 }}>
        My Case Buddy
      </span>
    </div>
  )
}
