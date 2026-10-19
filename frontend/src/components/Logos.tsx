export function UpshiftIcon({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="upGradLeft" x1="20" y1="40" x2="90" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B1D4F" />
          <stop offset="60%" stopColor="#123B8A" />
          <stop offset="100%" stopColor="#1E65D0" />
        </linearGradient>
        <linearGradient id="upGradRight" x1="80" y1="180" x2="165" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1948B8" />
          <stop offset="45%" stopColor="#583CB8" />
          <stop offset="75%" stopColor="#DE5724" />
          <stop offset="100%" stopColor="#F59325" />
        </linearGradient>
        <radialGradient id="globeGlow" cx="60" cy="130" r="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#41B2FF" stopOpacity="0.85" />
          <stop offset="65%" stopColor="#1750B8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#091B47" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="starGold" x1="160" y1="10" x2="185" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#F2822B" />
        </linearGradient>
        <filter id="starGlow" x="140" y="0" width="60" height="60" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Left arm of the U with globe interior */}
      <path
        d="M24 46C24 40.5 28.5 36 34 36H66C71.5 36 76 40.5 76 46V108C76 132 94 150 118 150C132 150 144 143 151 133C142 148 126 160 106 160C62 160 24 125 24 82V46Z"
        fill="url(#upGradLeft)"
      />

      {/* Embedded glowing globe & dots in left bowl */}
      <circle cx="56" cy="122" r="32" fill="url(#globeGlow)" />
      <ellipse cx="56" cy="122" rx="30" ry="12" stroke="#68C7FF" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.75" />
      <ellipse cx="56" cy="122" rx="14" ry="30" stroke="#68C7FF" strokeWidth="1.2" strokeDasharray="2 3" opacity="0.75" />
      <path d="M34 116C42 110 52 112 58 119C64 125 74 124 80 120" stroke="#8FE0FF" strokeWidth="1.6" fill="none" opacity="0.9" />

      {/* Sparkles on the left */}
      <path d="M72 58L73.5 62.5L78 64L73.5 65.5L72 70L70.5 65.5L66 64L70.5 62.5L72 58Z" fill="#FFFFFF" opacity="0.95" />
      <path d="M60 76L61 79L64 80L61 81L60 84L59 81L56 80L59 79L60 76Z" fill="#D2E8FF" opacity="0.8" />
      <path d="M78 94L79 97L82 98L79 99L78 102L77 99L74 98L77 97L78 94Z" fill="#D2E8FF" opacity="0.8" />

      {/* Right swoop forming person reaching upwards */}
      <path
        d="M62 144C82 162 115 162 136 142C150 128 158 105 162 82C165 62 166 42 166 38C162 52 153 82 140 100C128 116 112 125 94 129C82 131 71 137 62 144Z"
        fill="url(#upGradRight)"
      />

      {/* Leaping learner body and arm reaching for star */}
      <path
        d="M106 112C122 92 136 68 143 45C144 42 147 43 148 46C153 66 144 94 128 114C118 126 102 132 86 135C93 126 100 119 106 112Z"
        fill="url(#upGradRight)"
      />
      {/* Head */}
      <circle cx="138" cy="62" r="11" fill="#0B2361" />

      {/* Star at top right */}
      <g filter="url(#starGlow)">
        <path
          d="M174 12C174.8 21 179 25.2 188 26C179 26.8 174.8 31 174 40C173.2 31 169 26.8 160 26C169 25.2 173.2 21 174 12Z"
          fill="url(#starGold)"
        />
        <circle cx="174" cy="26" r="2.5" fill="#FFFCE6" />
      </g>
    </svg>
  );
}

export function QualityThoughtLogo({ className = 'h-14 w-auto' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Quality Thought Logo"
    >
      <defs>
        <linearGradient id="qtOrangeGrad" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF5722" />
          <stop offset="100%" stopColor="#E63908" />
        </linearGradient>
        <linearGradient id="qtStemGrad" x1="45" y1="105" x2="115" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D83002" />
          <stop offset="70%" stopColor="#EB4410" />
          <stop offset="100%" stopColor="#FF5A26" />
        </linearGradient>
      </defs>

      {/* Left Emblem: Quality Thought Circle with Inner Up-Right Arrow */}
      <g id="qt-emblem">
        <circle cx="80" cy="80" r="68" fill="url(#qtOrangeGrad)" />
        <circle cx="80" cy="80" r="36" fill="#FFFFFF" />

        {/* Up-Right 45-degree arrow inside the ring */}
        <rect x="52" y="74" width="34" height="48" rx="17" transform="rotate(-45 52 74)" fill="url(#qtStemGrad)" />
        <rect x="76" y="32" width="70" height="34" rx="17" fill="url(#qtOrangeGrad)" />
        <rect x="112" y="32" width="34" height="70" rx="17" fill="url(#qtOrangeGrad)" />
        <rect x="94" y="32" width="38" height="38" rx="8" fill="url(#qtOrangeGrad)" />
      </g>

      {/* Right Typography: Exact "Quality Thought" lettering */}
      <g id="qt-text">
        <text
          x="178"
          y="68"
          fontFamily="'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="64"
          letterSpacing="-1.8"
          fill="#0B1A48"
        >
          Qualıty
        </text>

        <circle cx="363" cy="24" r="8" fill="url(#qtOrangeGrad)" />

        <text
          x="178"
          y="136"
          fontFamily="'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="64"
          letterSpacing="-1.8"
          fill="#0B1A48"
        >
          Thought
        </text>
      </g>
    </svg>
  );
}
