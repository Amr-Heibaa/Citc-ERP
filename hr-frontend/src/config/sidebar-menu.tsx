import { LayoutDashboard, Users, CalendarCheck, type LucideIcon } from 'lucide-react'

export type MenuItem = {
  label: string
  to: string
  icon: LucideIcon
}

export const sidebarMenu: MenuItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Employees', to: '/employees', icon: Users },
  { label: 'Attendance', to: '/attendance', icon: CalendarCheck },
]