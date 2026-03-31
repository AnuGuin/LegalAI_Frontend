"use client"

import * as React from "react"
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  CalendarClock,
  Users,
  History,
  Plus,
  PanelLeft,
  FileSignature,
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { NavMain } from "@/components/lawyer/dashboard/nav-main"
import { NavUser } from "@/components/lawyer/dashboard/nav-user"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useUser } from "@/context/user-context"
import { usePathname } from "next/navigation"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onCreateMatter?: () => void
}

export function AppSidebar({ onCreateMatter, ...props }: AppSidebarProps) {
  const { toggleSidebar, open } = useSidebar()
  const { user } = useUser()
  const pathname = usePathname()

  const navWorkspace = [
    { title: "Dashboard",   url: "/dashboard",  icon: LayoutDashboard, isActive: pathname.startsWith("/dashboard") },
    { title: "All Matters", url: "/matters",    icon: FolderOpen, isActive: pathname.startsWith("/matters") },
    { title: "Documents",   url: "/documents",  icon: FileText, isActive: pathname.startsWith("/documents") },
    { title: "History",     url: "/history",    icon: History, isActive: pathname.startsWith("/history") },
  ]

  const navPractice = [
    { title: "Deadlines",          url: "/deadlines",         icon: CalendarClock, isActive: pathname.startsWith("/deadlines") },
    { title: "Clients & Comms",    url: "/clients",           icon: Users, isActive: pathname.startsWith("/clients") },
    { title: "Contract Analyser",  url: "/contract",          icon: FileSignature, isActive: pathname.startsWith("/contract") },
  ]

  const userData = {
    name:   user?.name  ?? "Counsellor",
    email:  user?.email ?? "",
    avatar: (user as any)?.avatar ?? "",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pb-0">
        {/* Logo + collapse toggle */}
        <div className="flex items-center justify-between py-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 overflow-hidden w-full">
          <div className="flex items-center gap-2 flex-1 group-data-[collapsible=icon]:hidden">
            <Logo
              collapsed={!open}
              showText={open}
              variant="sidebar"
              className="flex-shrink-0"
            />
          </div>
          <div
            onClick={toggleSidebar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
          >
            <PanelLeft className="h-5 w-5" />
          </div>
        </div>

        {/* Create matter CTA */}
        <div className="px-2 pb-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pb-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <Button
            onClick={onCreateMatter}
            className="w-full justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-10 font-medium
              group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0
              overflow-hidden whitespace-nowrap transition-all duration-300"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Create new matter</span>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain label="Workspace" items={navWorkspace} />
        <NavMain label="Practice"  items={navPractice} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}