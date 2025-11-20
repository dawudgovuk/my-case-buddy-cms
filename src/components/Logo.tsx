
import heartLogo from '../assets/heart-logo.png'

export default function Logo() {


  return (
    <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
      <img
        src={heartLogo}
        alt="MyCourtBuddy Heart Logo"
        width={40}
        height={40}
        style={{ borderRadius: 12, background: '#fff' }}
      />
      <span
        style={{
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontWeight: 800,
          fontSize: '1.5rem',
          letterSpacing: '-0.01em',
          lineHeight: 1.1,
          textTransform: 'none',
        }}
      >
      MyCourt<span style={{ color: 'hsl(348, 83%, 47%)' }}>Buddy</span>
      </span>
    </div>
  )
}

