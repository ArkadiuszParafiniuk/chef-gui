interface Props {
  size?: number
}

export default function SoupBowl({ size = 110 }: Props) {
  return (
    <svg
      viewBox="0 0 120 105"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Saucer */}
      <ellipse cx="60" cy="91" rx="52" ry="9" fill="#7a4010" opacity="0.85" />
      <ellipse cx="60" cy="89" rx="48" ry="7" fill="#9e5518" />

      {/* Bowl body */}
      <path
        d="M 15,52 C 12,89 108,89 105,52 A 45,10 0 0,0 15,52 Z"
        fill="#b8621e"
      />
      {/* Bowl body highlight (right side shading) */}
      <path
        d="M 75,52 C 90,52 105,70 105,52 A 45,10 0 0,0 75,52 Z"
        fill="#a05518"
        opacity="0.4"
      />

      {/* Bowl rim */}
      <ellipse cx="60" cy="52" rx="45" ry="10" fill="#d4783a" />
      <ellipse cx="60" cy="52" rx="45" ry="10" fill="none" stroke="#e8924a" strokeWidth="1.5" />

      {/* Soup surface */}
      <ellipse cx="60" cy="52" rx="38" ry="7" fill="#7a1c00" />
      {/* Soup shimmer */}
      <ellipse cx="46" cy="50" rx="9" ry="2.5" fill="rgba(255,160,60,0.25)" transform="rotate(-12,46,50)" />
      <ellipse cx="70" cy="54" rx="5" ry="1.5" fill="rgba(255,160,60,0.2)" transform="rotate(8,70,54)" />

      {/* Steam — left */}
      <path
        className="soup-steam"
        d="M 40 44 Q 33 35 40 26 Q 47 17 40 8"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
        style={{ animationDelay: '0s' }}
      />
      {/* Steam — center */}
      <path
        className="soup-steam"
        d="M 60 43 Q 53 34 60 25 Q 67 16 60 7"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
        style={{ animationDelay: '0.4s' }}
      />
      {/* Steam — right */}
      <path
        className="soup-steam"
        d="M 80 44 Q 73 35 80 26 Q 87 17 80 8"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
        style={{ animationDelay: '0.8s' }}
      />
    </svg>
  )
}
