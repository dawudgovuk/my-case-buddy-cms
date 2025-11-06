import { FaGavel, FaBalanceScale } from 'react-icons/fa'

export default function Logo() {
  return (
    <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #F9C74F 0%, #F8961E 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          border: '3px solid #276A7B',
        }}
      >
        <FaBalanceScale size={24} color="#276A7B" />
      </div>
      <div className="d-flex flex-column">
        <span
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#276A7B',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          MyCase
        </span>
        <span
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#276A7B',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          Buddy
        </span>
      </div>
    </div>
  )
}
