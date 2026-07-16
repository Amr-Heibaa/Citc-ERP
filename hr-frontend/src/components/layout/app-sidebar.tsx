import { LogOut } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router'
import { clearAllQueriesCache } from '@/lib/api/query-client'
import { sidebarMenu } from '@/config/sidebar-menu'
import { useTokenStore } from '@/stores/token-store'
import { useUserStore } from '@/stores/user-store'
import { useUiStore } from '@/stores/ui-store'
import citoLogo from '@/features/dashboard/assets/cito-logo-white.png'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

type SidebarContentProps = {
  onNavigate?: () => void
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const clearToken = useTokenStore((s) => s.clearToken)
  const clearAuth = useUserStore((s) => s.clearAuth)
  const user = useUserStore((s) => s.user)
  const role = useUserStore((s) => s.roles[0])
  const notificationCount = useUiStore((s) => s.notificationCount)

  const displayName = user?.username ?? 'User'
  const roleLabel = role ?? 'Employee'

 function handleLogout() {
    clearToken()
    clearAuth()
    clearAllQueriesCache()
    navigate('/login')
  } 

  return (
   <div className="flex h-full flex-col bg-[#1a2535]">
      {/* Logo */}
      <div className="flex shrink-0 flex-col gap-4 px-6 pb-6 pt-10">
        <img src={citoLogo} alt="CITO" className="h-8 w-auto object-contain object-left" />
        <div className="border-t border-[#f5841f]/60" />
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-3">
        {sidebarMenu.map((item) => {
          const isActive = location.pathname === item.to
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className="relative flex w-full items-center gap-3 px-5 py-3 text-left transition-colors"
            >
              {isActive && (
                <span className="absolute inset-0 border-l-4 border-[#f5841f] bg-[#f5841f]/8" />
              )}
              <span
                className={`relative z-10 transition-colors ${
                  isActive ? 'text-[#f5841f]' : 'text-white'
                }`}
              >
                <item.icon size={20} />
              </span>
              <span
                className={`relative z-10 font-['Space_Grotesk',sans-serif] text-[15px] transition-colors ${
                  isActive ? 'font-medium text-[#f5841f]' : 'font-normal text-white'
                }`}
              >
                {item.label}
              </span>
              {item.to === '/notifications' && notificationCount > 0 && (
                <span className="relative z-10 ml-auto flex size-5 items-center justify-center rounded-full bg-[#e74c3c] text-[11px] font-bold text-white">
                  {notificationCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User */}
      <div className="shrink-0 border-t border-white/13 p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[20px] bg-[#f5841f]">
            <span className="font-['Inter',sans-serif] text-[14px] font-bold text-white">
              {initials(displayName)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-['Inter',sans-serif] text-[14px] font-semibold text-white">
              {displayName}
            </p>
            <p className="truncate font-['Inter',sans-serif] text-[12px] text-[#a4aab6]">
              {roleLabel}
            </p>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className="shrink-0 cursor-pointer opacity-60 transition-opacity hover:opacity-100"
          >
            <LogOut size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}