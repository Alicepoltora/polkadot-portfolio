/**
 * PolkaHub logo — SVG recreation of the brand asset.
 * "Polka" in white bold + "Hub" on pink→purple gradient badge + chain links.
 */
export default function PolkaHubLogo({ width = 160, showTagline = false }) {
  const scale = width / 160;
  const h = showTagline ? 68 : 48;

  return (
    <svg
      width={width}
      height={h * scale}
      viewBox={`0 0 160 ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Pink → Purple gradient for the Hub badge */}
        <linearGradient id="hubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#ff2d87" />
          <stop offset="100%" stopColor="#8B00C9" />
        </linearGradient>

        {/* Subtle glow filter */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── "Polka" text ── */}
      <text
        x="0" y="36"
        fontFamily="'Manrope', 'Inter', system-ui, sans-serif"
        fontWeight="800"
        fontSize="34"
        letterSpacing="-1"
        fill="white"
      >
        Polka
      </text>

      {/* ── "Hub" badge (rounded rect) ── */}
      <rect x="83" y="4" width="72" height="38" rx="8" fill="url(#hubGrad)" />

      {/* "Hub" text inside badge */}
      <text
        x="119" y="31"
        fontFamily="'Manrope', 'Inter', system-ui, sans-serif"
        fontWeight="800"
        fontSize="30"
        letterSpacing="-1"
        fill="white"
        textAnchor="middle"
      >
        Hub
      </text>

      {/* ── Chain link — top right of badge ── */}
      <g transform="translate(148, 0) rotate(25)" opacity="0.85">
        <ChainLink size={11} color="#ff89b0" />
      </g>

      {/* ── Chain link — bottom left of badge ── */}
      <g transform="translate(80, 32) rotate(-20)" opacity="0.7">
        <ChainLink size={9} color="#cc44ff" />
      </g>

      {/* ── Chain link — top left floating ── */}
      <g transform="translate(74, 2) rotate(15)" opacity="0.6">
        <ChainLink size={8} color="#ff89b0" />
      </g>

      {/* ── Tagline ── */}
      {showTagline && (
        <text
          x="80" y="62"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="700"
          fontSize="9"
          letterSpacing="2.5"
          fill="rgba(255,255,255,0.45)"
          textAnchor="middle"
        >
          GLOBAL ECOSYSTEM RESEARCH
        </text>
      )}
    </svg>
  );
}

/** Small chain-link SVG shape */
function ChainLink({ size = 10, color = '#ff89b0' }) {
  const s = size;
  const sw = s * 0.28;
  return (
    <g>
      {/* Top oval */}
      <ellipse cx={s * 0.5} cy={s * 0.3}  rx={s * 0.28} ry={s * 0.38}
        fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      {/* Bottom oval */}
      <ellipse cx={s * 0.5} cy={s * 0.72} rx={s * 0.28} ry={s * 0.38}
        fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </g>
  );
}
