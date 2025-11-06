import { Box } from '@mui/material'

export default function Logo() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
      }}
    >
      {/* Character Icon */}
      <Box
        sx={{
          width: 48,
          height: 48,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          style={{ display: 'block' }}
        >
          {/* Head */}
          <circle
            cx="24"
            cy="18"
            r="12"
            fill="#F9C74F"
            stroke="#276A7B"
            strokeWidth="2.5"
          />
          {/* Eyes */}
          <circle cx="20" cy="16" r="1.5" fill="#276A7B" />
          <circle cx="28" cy="16" r="1.5" fill="#276A7B" />
          {/* Smile */}
          <path
            d="M 18 20 Q 24 22 30 20"
            stroke="#276A7B"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Hair tuft */}
          <path
            d="M 18 8 Q 24 4 30 8 Q 28 10 24 10 Q 20 10 18 8"
            fill="#F9C74F"
            stroke="#276A7B"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Body/Neck */}
          <rect
            x="22"
            y="28"
            width="4"
            height="8"
            fill="#F9C74F"
            stroke="#276A7B"
            strokeWidth="2.5"
          />
        </svg>
      </Box>

      {/* Text */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          lineHeight: 1.2,
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#276A7B',
            letterSpacing: '-0.02em',
          }}
        >
          MyCase
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#276A7B',
            letterSpacing: '-0.02em',
          }}
        >
          Buddy
        </Box>
      </Box>
    </Box>
  )
}

