/**
 * PolkaHub logo — SVG recreation of the brand asset.
 * "Polka" in white bold + "Hub" on pink→purple gradient badge + chain links.
 */
export default function PolkaHubLogo({ width = 172, showTagline = false }) {
  // viewBox width = 172: ~83px "Polka" + 10px gap + 79px badge
  const scale = width / 172;
  const h = showTagline ? 68 : 48;

  return (
    <svg
      width={width}
      height={h * scale}
      viewBox={`0 0 172 ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#ff2d87" />
          <stop offset="100%" stopColor="#8B00C9" />
        </linearGradient>
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

      {/* ── gap of ~10px then "Hub" badge ── */}
      <rect x="93" y="4" width="74" height="38" rx="8" fill="url(#hubGrad)" />

      {/* "Hub" text centred in badge */}
      <text
        x="130" y="31"
        fontFamily="'Manrope', 'Inter', system-ui, sans-serif"
        fontWeight="800"
        fontSize="30"
        letterSpacing="-1"
        fill="white"
        textAnchor="middle"
      >
        Hub
      </text>

      {/* chain link — top-right corner of badge */}
      <g transform="translate(159, 0) rotate(25)" opacity="0.85">
        <ChainLink size={11} color="#ff89b0" />
      </g>

      {/* chain link — bottom-left of badge (in the gap) */}
      <g transform="translate(89, 32) rotate(-20)" opacity="0.7">
        <ChainLink size={9} color="#cc44ff" />
      </g>

      {/* chain link — floating top-left of badge */}
      <g transform="translate(84, 1) rotate(15)" opacity="0.6">
        <ChainLink size={8} color="#ff89b0" />
      </g>

      {/* ── Tagline ── */}
      {showTagline && (
        <text
          x="86" y="62"
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
