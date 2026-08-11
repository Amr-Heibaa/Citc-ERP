import { useGetMyEmployee } from '@/lib/api/generated/ems/employee-controller/employee-controller'
import { useUserStore } from '@/stores/user-store'

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function EmployeeBanner() {
  const username = useUserStore((s) => s.user?.username)
  const myEmployee = useGetMyEmployee()

  const employee = myEmployee.data
  const displayName = employee?.displayName ?? username ?? 'User'
  const department = employee?.currentOrgUnitName ?? ''
  const employeeNumber = employee?.employeeNumber ?? '—'

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ backgroundImage: 'linear-gradient(174deg, #1a2535 25%, #243347 75%)' }}
    >
      <div className="pointer-events-none absolute -left-12 -top-12 size-[200px] opacity-5">
        <svg viewBox="0 0 200 200" fill="none">
          <path
            d="M10 10 L190 10 M10 50 L190 50 M10 90 L190 90 M10 130 L190 130 M10 170 L190 170 M10 10 L10 190 M50 10 L50 190 M90 10 L90 190 M130 10 L130 190 M170 10 L170 190"
            stroke="#F5841F"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-col items-start justify-between gap-3 px-5 py-5 sm:flex-row sm:items-center md:h-[120px] md:px-8 md:py-0">
        <div className="flex flex-col gap-1">
          <p className="font-['Inter',sans-serif] text-[20px] font-bold text-white md:text-[28px]">
            {displayName}
          </p>
          <p className="font-['Inter',sans-serif] text-[13px] text-[#a4aab6] md:text-[15px]">
            {department}
          </p>
        </div>
        <p className="hidden font-['Inter',sans-serif] text-[13px] text-white md:block md:text-[20px]">
          {today}
        </p>
        <div className="relative hidden sm:block">
          <div className="flex">
            <div className="size-16 rounded-full bg-[#f5841f]/20 md:size-20" />
            <div className="-ml-8 size-16 rounded-full bg-[#2ecc71]/20 md:-ml-10 md:size-20" />
          </div>
          <p className="absolute inset-0 flex items-center justify-center font-['Space_Grotesk',sans-serif] text-[14px] font-bold text-white md:text-[16px]">
            {employeeNumber}
          </p>
        </div>
      </div>
    </div>
  )
}