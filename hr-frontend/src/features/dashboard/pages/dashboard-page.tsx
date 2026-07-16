import { Bell, Briefcase, FileText, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useGetMyEmployee } from '@/lib/api/generated/ems/employee-controller/employee-controller'
import { useUserStore } from '@/stores/user-store'

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})


const statCards = [
  { id: '1', label: 'Total Requests', value: '769', color: '#f5841f', sub: 'This period', to: '/requests' },
  { id: '2', label: 'Pending Approvals', value: '12', color: '#72cfe9', sub: 'Awaiting action', to: '/requests' },
  { id: '3', label: 'Active Projects', value: '3', color: '#2ecc71', sub: 'In progress', to: '/projects' },
  { id: '4', label: 'Notifications', value: '3', color: '#e74c3c', sub: 'Unread', to: '/notifications' },
]

const quickActions = [
  { id: 'rest', label: 'Request for rest allowance', icon: UserPlus, to: '/requests' },
  { id: 'submitted', label: 'Requests submitted to you', icon: FileText, to: '/requests' },
  { id: 'notifications', label: 'View Notifications', icon: Bell, to: '/notifications' },
  { id: 'projects', label: 'View Projects', icon: Briefcase, to: '/projects' },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const username = useUserStore((s) => s.user?.username)
  const myEmployee = useGetMyEmployee()

  // fall back to the username until the employee record loads
  const displayName = myEmployee.data?.displayName ?? username ?? 'User'
  const department = myEmployee.data?.currentOrgUnitName ?? ''
  const employeeNumber = myEmployee.data?.employeeNumber ?? '—'


  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Welcome banner */}
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
            <p className="absolute inset-0 flex items-center justify-center font-['Inter',sans-serif] text-[14px] font-bold text-white md:text-[16px]">
              {employeeNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <button
            key={card.id}
            onClick={() => navigate(card.to)}
            className="flex cursor-pointer flex-col gap-2 rounded-xl border border-[#e5e7eb] bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#f5841f]/40 hover:shadow-md md:gap-3 md:p-5"
          >
            <div className="size-2.5 rounded-full" style={{ backgroundColor: card.color }} />
            <p className="font-['Inter',sans-serif] text-[22px] font-bold text-[#1a2535] md:text-[28px]">
              {card.value}
            </p>
            <div>
              <p className="font-['Inter',sans-serif] text-[12px] font-semibold text-[#1a2535] md:text-[13px]">
                {card.label}
              </p>
              <p className="font-['Inter',sans-serif] text-[11px] text-[#6b7280] md:text-[12px]">
                {card.sub}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-col gap-5 rounded-xl bg-white p-4 md:gap-8 md:p-6">
        <p className="font-['Inter',sans-serif] text-[16px] font-bold text-[#1a2535] md:text-[18px]">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => navigate(action.to)}
              className="flex h-[130px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-[#e5e7eb] bg-[#f4f6f9] p-4 transition-all hover:-translate-y-0.5 hover:border-[#f5841f]/50 hover:bg-[#f5841f]/5 hover:shadow-sm md:h-[152px]"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm md:size-11">
                <action.icon size={24} className="text-[#1a2535]" />
              </div>
              <p className="text-center font-['Inter',sans-serif] text-[12px] font-semibold leading-tight text-[#1a2535] md:text-[13px]">
                {action.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}