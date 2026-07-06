import { Building2, LogOut } from 'lucide-react'
import { NavLink, useNavigate, useLocation } from 'react-router'

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useTokenStore } from '@/stores/token-store'
import { sidebarMenu } from '@/config/sidebar-menu'

export function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const clearToken = useTokenStore((s) => s.clearToken)

  function handleLogout() {
    clearToken()
    navigate('/login')
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#193764]">
            <Building2 className="size-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#193764]">CITEC HR</span>
            <span className="text-xs text-muted-foreground">Attendance system</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarMenu.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.to}>
                    <NavLink to={item.to}>
                      <item.icon />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="size-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}