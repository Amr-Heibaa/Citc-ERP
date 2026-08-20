export function WizardDesignArt() {
  return (
    <div className="relative hidden w-[390px] shrink-0 overflow-hidden md:block">
      <svg viewBox="0 0 390 470" className="size-full" aria-hidden="true">
        <g stroke="#182536" strokeWidth="1" opacity="0.28">
          {Array.from({ length: 20 }, (_, index) => (
            <line
              key={index}
              x1="390"
              y1={index * 24 - 20}
              x2={150 + index * 7}
              y2="235"
            />
          ))}
        </g>

        <path
          d="M210 120 C250 170 285 180 335 205 C280 225 250 260 225 315 C200 265 165 235 120 210 C170 185 195 160 210 120Z"
          fill="#05070b"
        />

        <rect
          x="102"
          y="310"
          width="48"
          height="48"
          transform="rotate(45 126 334)"
          fill="#52d9e9"
        />

        <path
          d="M260 160 C274 180 287 190 310 202 C285 213 273 227 260 250 C249 226 236 213 215 203 C238 190 250 178 260 160Z"
          fill="#111827"
        />
      </svg>
    </div>
  );
}
