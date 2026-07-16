import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  label: string
  value: string
  color: string
  icon: LucideIcon
  subIcon?: LucideIcon
  subText?: string
  subColor?: string
  onClick?: () => void
}

export function StatCard({
  label,
  value,
  color,
  icon: Icon,
  subIcon: SubIcon,
  subText,
  subColor,
  onClick,
}: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col gap-4 rounded-[12px] bg-white p-5 text-left shadow-[0px_4px_6px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* label + icon bubble */}
      <div className="flex w-full items-center justify-between">
        <p className="font-['Inter',sans-serif] text-[14px] font-medium text-[#6b7280]">{label}</p>
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-[20px]"
          style={{ backgroundColor: `${color}21` }}
        >
          <Icon size={20} strokeWidth={2} style={{ color }} />
        </div>
      </div>

      {/* value + optional sub-line */}
      <div className="flex w-full flex-col gap-1">
        <p className="font-['Space_Grotesk',sans-serif] text-[28px] font-bold text-[#1a2535]">
          {value}
        </p>
        {subText && (
          <div className="flex items-center gap-1">
            {SubIcon && <SubIcon size={12} strokeWidth={2} style={{ color: subColor }} />}
            <p
              className="font-['Inter',sans-serif] text-[12px] font-semibold"
              style={{ color: subColor }}
            >
              {subText}
            </p>
          </div>
        )}
      </div>
    </button>
  )
}