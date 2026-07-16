import { useEffect } from 'react'
import { Bell, ChevronLeft, Menu, Moon, Search, X } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { SidebarContent } from '@/components/layout/app-sidebar'
import { useUiStore } from '@/stores/ui-store'
import { useUserStore } from '@/stores/user-store'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/notifications': 'Notifications',
  '/requests': 'Requests',
  '/requests/new': 'New Request',
  '/projects': 'Projects',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function NotificationDot() {
  const count = useUiStore((s) => s.notificationCount)
  if (count === 0) return null
  return <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#e74c3c]" />
}

export function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)
  const user = useUserStore((s) => s.user)

  // Close the mobile drawer once the viewport is desktop-sized
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setSidebarOpen])

  const title = pageTitles[location.pathname] ?? ''
  // a sub-page is any route nested deeper than one level (e.g. /requests/new)
  const isSubPage = location.pathname.split('/').filter(Boolean).length > 1

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f6f9]">
      {/* Desktop sidebar */}
      <aside className="hidden h-full w-[240px] shrink-0 flex-col md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />
          <aside className="fixed left-0 top-0 z-50 h-full w-[240px] md:hidden">
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="absolute right-[-40px] top-4 rounded-full bg-white p-1.5 shadow-lg"
            >
              <X size={18} className="text-[#1a2535]" />
            </button>
          </aside>
        </>
      )}

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#e5e7eb] bg-white px-4 md:h-16 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="shrink-0 cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-[#f4f6f9] md:hidden"
            >
              <Menu size={20} className="text-[#1a2535]" />
            </button>

            {isSubPage && (
              <button
                onClick={() => navigate(-1)}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[#6b7280] transition-colors hover:text-[#1a2535]"
              >
                <ChevronLeft size={18} />
                <span className="hidden font-['Inter',sans-serif] text-[14px] sm:inline">Back</span>
              </button>
            )}

            <p className="truncate font-['Inter',sans-serif] text-[15px] font-bold text-[#1a2535] md:text-[18px]">
              {title}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 md:gap-5">
            {/* Search — desktop */}
            <div className="hidden w-[240px] items-center gap-2 rounded-lg bg-[#f4f6f9] px-3 py-2 lg:flex xl:w-[300px]">
              <Search size={16} className="shrink-0 text-[#6b7280]" />
              <input
                placeholder="Search modules, projects..."
                className="w-full bg-transparent font-['Inter',sans-serif] text-[14px] text-[#6b7280] outline-none"
              />
            </div>
            {/* Search — compact */}
            <button
              aria-label="Search"
              className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-[#f4f6f9] lg:hidden"
            >
              <Search size={18} className="text-[#6b7280]" />
            </button>

            <button
              aria-label="Toggle theme"
              className="hidden cursor-pointer transition-opacity hover:opacity-70 sm:block"
            >
              <Moon size={22} className="text-[#292929]" />
            </button>

            <button
              onClick={() => navigate('/notifications')}
              aria-label="Notifications"
              className="relative cursor-pointer"
            >
              <Bell size={20} className="text-[#1a2535]" />
              <NotificationDot />
            </button>

            <div className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#f5841f] md:size-9">
              <span className="font-['Inter',sans-serif] text-[12px] font-bold text-white">
                {initials(user?.username ?? 'User')}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}