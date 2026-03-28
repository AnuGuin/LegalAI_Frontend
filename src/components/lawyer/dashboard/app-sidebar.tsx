"use client"

import * as React from "react"
import {
  LayoutDashboard,
  FolderOpen,
  Sparkles,
  FileText,
  CalendarClock,
  Users,
  History,
  Plus,
  PanelLeft,
} from "lucide-react"

import { NavMain } from "@/components/lawyer/dashboard/nav-main"
import { NavUser } from "@/components/lawyer/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const data = {
  user: {
    name: "Anubhav Kumar",
    email: "anubhav@legalai.software",
    avatar: "",
  },
  navWorkspace: [
    {
      title: "Dashboard",
      url: "/lawyer/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Assistant",
      url: "/lawyer/dashboard/ai",
      icon: Sparkles,
    },
    {
      title: "All Matters",
      url: "/lawyer/dashboard/matters",
      icon: FolderOpen,
      badge: "12",
      badgeVariant: "default" as const,
    },
    {
      title: "Documents",
      url: "/lawyer/dashboard/documents",
      icon: FileText,
      badge: "3",
      badgeVariant: "amber" as const,
    },
  ],
  navPractice: [
    {
      title: "Deadlines",
      url: "/lawyer/dashboard/deadlines",
      icon: CalendarClock,
      badge: "2",
      badgeVariant: "red" as const,
    },
    {
      title: "Clients",
      url: "/lawyer/dashboard/clients",
      icon: Users,
    },
    {
      title: "Timeline",
      url: "/lawyer/dashboard/timeline",
      icon: History,
    },
  ]
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onCreateMatter?: () => void
}

export function AppSidebar({ onCreateMatter, ...props }: AppSidebarProps) {
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pb-0">
        {/* Logo and Trigger */}
        <div className="flex items-center justify-between py-3 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 overflow-hidden w-full">

          <div className="grid flex-1 overflow-hidden transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-base font-semibold leading-tight text-sidebar-foreground tracking-tight truncate">
              Nyay Mitra
            </span>
            <span className="text-xs text-sidebar-foreground/50 tracking-wide uppercase truncate">
              Legal AI Platform
            </span>
          </div>

          <div
            onClick={toggleSidebar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg cursor-pointer transition-colors duration-300 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
          >
            <PanelLeft className="h-5 w-5" />
          </div>
        </div>

        {/* Create Matter CTA */}
        <div className="px-2 pb-3 flex items-center justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pb-2 overflow-hidden whitespace-nowrap">
          <Button
            onClick={onCreateMatter}
            className="w-full justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-10 font-medium
                       group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center overflow-hidden whitespace-nowrap transition-all duration-300 flex-nowrap"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="truncate whitespace-nowrap transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:hidden">Create new matter</span>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain label="Workspace" items={data.navWorkspace} />
        <NavMain label="Practice" items={data.navPractice} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}