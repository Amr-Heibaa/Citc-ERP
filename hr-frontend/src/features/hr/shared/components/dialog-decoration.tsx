export function DialogDecoration({ className }: { className?: string }) {
  const rayCount = 36;
  const cx = 300;
  const cy = 195;
  const rInner = 45;
  const rOuter = 170;

  const rays = Array.from({ length: rayCount }, (_, i) => {
    const angle = (i / (rayCount - 1)) * Math.PI * 1.7 - Math.PI * 0.85;

    return {
      x1: cx + Math.cos(angle) * rInner,
      y1: cy + Math.sin(angle) * rInner,
      x2: cx + Math.cos(angle) * rOuter,
      y2: cy + Math.sin(angle) * rOuter,
    };
  });

  return (
    <svg viewBox="0 0 300 400" className={className} aria-hidden="true">
      <g stroke="#c7d2fe" strokeWidth="1" opacity="0.6">
        {rays.map((r, i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
        ))}
      </g>

      <path
        d="M150 80 L172 158 L248 190 L172 222 L150 300 L128 222 L52 190 L128 158 Z"
        fill="#1a2535"
      />

      <path
        d="M108 258 L119 290 L151 301 L119 312 L108 344 L97 312 L65 301 L97 290 Z"
        fill="#5eead4"
      />
    </svg>
  );
}
