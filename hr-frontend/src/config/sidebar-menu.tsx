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
  /** i18n key for the label, resolved via t() where the menu is rendered. */
  labelKey: string
  to: string
  icon: LucideIcon
  /** If set, the item only shows when the user has one of these roles. */
  roles?: string[]
}

export const sidebarMenu: MenuItem[] = [
  { labelKey: 'sidebar.dashboard', to: '/', icon: LayoutDashboard },
  { labelKey: 'sidebar.notifications', to: '/notifications', icon: Bell },
  { labelKey: 'sidebar.requests', to: '/requests', icon: Copy },
  { labelKey: 'sidebar.hr', to: '/hr', icon: Users },
  { labelKey: 'sidebar.projects', to: '/projects', icon: Briefcase },
  { labelKey: 'sidebar.reports', to: '/reports', icon: BarChart2 },
  { labelKey: 'sidebar.settings', to: '/settings', icon: Settings },
]