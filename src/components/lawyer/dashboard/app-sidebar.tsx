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
import { cn } from "@/lib/utils"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onCreateMatter?: () => void
}

const isSpecificPage = (pathname: string) => {
  const chatMatch = pathname.match(/^\/assistant\/chat\/([^/]+)$/)
  const isChat = chatMatch && chatMatch[1] && chatMatch[1] !== 'new'
  const matterMatch = pathname.match(/^\/assistant\/matter\/([^/]+)$/)
  const isMatter = matterMatch && matterMatch[1]
  return !!(isChat || isMatter)
}

export function AppSidebar({ onCreateMatter, ...props }: AppSidebarProps) {
  const { toggleSidebar, open } = useSidebar()
  const { user } = useUser()
  const pathname = usePathname()
  const isSpecific = isSpecificPage(pathname)

  const navWorkspace = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, isActive: pathname.startsWith("/dashboard") },
    { title: "All Matters", url: "/matters", icon: FolderOpen, isActive: pathname.startsWith("/matters") },
    { title: "Documents", url: "/documents", icon: FileText, isActive: pathname.startsWith("/documents") },
    { title: "History", url: "/history", icon: History, isActive: pathname.startsWith("/history") },
  ]

  const navPractice = [
    { title: "Deadlines", url: "/deadlines", icon: CalendarClock, isActive: pathname.startsWith("/deadlines") },
    { title: "Clients & Comms", url: "/clients", icon: Users, isActive: pathname.startsWith("/clients") },
    { title: "Contract Analyser", url: "/contract", icon: FileSignature, isActive: pathname.startsWith("/contract") },
  ]

  const userData = {
    name: user?.name ?? "Counsellor",
    email: user?.email ?? "",
    avatar: (user as any)?.avatar ?? "",
  }

  return (
    <Sidebar collapsible="icon" className={cn("border-none border-r-0 transition-colors duration-300", (isSpecific || open) ? "bg-sidebar" : "bg-transparent")} {...props}>
      <SidebarHeader className="pb-0">
        {/* Logo + collapse toggle */}
        <div className="flex items-center justify-between py-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 overflow-hidden w-full h-14">
          {open ? (
            <>
              <div className="flex items-center gap-2 flex-1">
                <Logo
                  collapsed={false}
                  showText={true}
                  variant="sidebar"
                  className="flex-shrink-0"
                />
              </div>
              <button
                onClick={toggleSidebar}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
              >
                <PanelLeft className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              className="relative group/logo-toggle flex h-8 w-8 shrink-0 items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-sidebar-accent text-sidebar-foreground"
              title="Expand sidebar"
            >
              {/* Legal AI Logo (Visible by default, fades out on hover) */}
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-100 scale-100 group-hover/logo-toggle:opacity-0 group-hover/logo-toggle:scale-75 pointer-events-none">
                <Logo
                  collapsed={true}
                  showText={false}
                  variant="sidebar"
                  className="h-6 w-6 flex-shrink-0"
                />
              </div>

              {/* Sidebar toggle icon (Hidden by default, fades in on hover) */}
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-0 scale-75 group-hover/logo-toggle:opacity-100 group-hover/logo-toggle:scale-100 pointer-events-none">
                <PanelLeft className="h-4 w-4" />
              </div>
            </button>
          )}
        </div>

        {/* Create matter CTA */}
        <div className="px-2 pb-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pb-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <Button
            onClick={onCreateMatter}
            className="w-full justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-10 font-medium
              group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0
              overflow-hidden whitespace-nowrap transition-all duration-300"
          >
            <Plus className="h-2 w-2 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Create new matter</span>
          </Button>
        </div>

      </SidebarHeader>

      <SidebarContent className="group-data-[collapsible=icon]:pt-6">
        <NavMain label="Workspace" items={navWorkspace} />
        <NavMain label="Practice" items={navPractice} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}