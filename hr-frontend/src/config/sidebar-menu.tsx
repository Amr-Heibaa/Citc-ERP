import {
  LayoutDashboard,
  Bell,
  Copy,
  Users,
  Briefcase,
  BarChart2,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type MenuItem = {
  label: string
  to: string
  icon: LucideIcon
  /** If set, the item only shows when the user has one of these roles. */
  roles?: string[]
}

export const sidebarMenu: MenuItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Requests', to: '/requests', icon: Copy },
  { label: 'HR', to: '/hr/employees', icon: Users, roles: ['SUPER_ADMIN', 'HR_MANAGER'] },
  { label: 'Projects', to: '/projects', icon: Briefcase },
  { label: 'Reports', to: '/reports', icon: BarChart2 },
  { label: 'Settings', to: '/settings', icon: Settings },
]