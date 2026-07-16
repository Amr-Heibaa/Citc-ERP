import {
  LayoutDashboard,
  Bell,
  Copy,
  Briefcase,
  BarChart2,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type MenuItem = {
  label: string
  to: string
  icon: LucideIcon
}

export const sidebarMenu: MenuItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Requests', to: '/requests', icon: Copy },
  { label: 'Projects', to: '/projects', icon: Briefcase },
  { label: 'Reports', to: '/reports', icon: BarChart2 },
  { label: 'Settings', to: '/settings', icon: Settings },
]