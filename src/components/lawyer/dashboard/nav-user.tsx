"use client"

import { useRouter } from "next/navigation"
import { useUser } from "@/context/user-context"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  UserCircle,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const router = useRouter()
  const { logout } = useUser()
  const { isMobile, state } = useSidebar()

  const handleLogout = () => {
    logout()
    router.push("/")
  }
  const isCollapsed = state === "collapsed"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!gap-0"
            >
              <Avatar className="h-8 w-8 rounded-md shrink-0">
                <AvatarFallback className="rounded-md bg-[#1A3A5C] text-white text-[10px] font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight overflow-hidden transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:hidden">
                <span className="truncate text-xs font-semibold">{user.name}</span>
                <span className="truncate text-[10px] text-sidebar-foreground/50">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto h-3.5 w-3.5 opacity-50 shrink-0 transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="z-50 w-(--radix-dropdown-menu-trigger-width) min-w-56 p-2 backdrop-blur-sm border border-border/60 rounded-2xl shadow-[4px_8px_12px_2px_rgba(0,0,0,0.1)] dark:shadow-[4px_8px_12px_2px_rgba(0,0,0,0.2)] bg-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            side={isMobile ? "bottom" : isCollapsed ? "right" : "bottom"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2">
                <Avatar className="h-8 w-8 rounded-md">
                  <AvatarFallback className="rounded-md bg-[#1A3A5C] text-white text-xs font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuGroup className="space-y-1 py-1">
              <DropdownMenuItem className="flex items-center p-2 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent hover:bg-accent hover:border-border/50 hover:shadow-sm focus:bg-accent focus:text-accent-foreground w-full">
                <Sparkles className="mr-2 h-4 w-4 text-foreground" />
                <span className="text-sm font-medium text-foreground tracking-tight leading-tight">Upgrade to Pro</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup className="space-y-1 py-1">
              <DropdownMenuItem className="flex items-center p-2 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent hover:bg-accent hover:border-border/50 hover:shadow-sm focus:bg-accent focus:text-accent-foreground w-full">
                <UserCircle className="mr-2 h-4 w-4 text-foreground" />
                <span className="text-sm font-medium text-foreground tracking-tight leading-tight">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center p-2 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent hover:bg-accent hover:border-border/50 hover:shadow-sm focus:bg-accent focus:text-accent-foreground w-full">
                <BadgeCheck className="mr-2 h-4 w-4 text-foreground" />
                <span className="text-sm font-medium text-foreground tracking-tight leading-tight">Bar Verification</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center p-2 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent hover:bg-accent hover:border-border/50 hover:shadow-sm focus:bg-accent focus:text-accent-foreground w-full">
                <CreditCard className="mr-2 h-4 w-4 text-foreground" />
                <span className="text-sm font-medium text-foreground tracking-tight leading-tight">Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center p-2 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent hover:bg-accent hover:border-border/50 hover:shadow-sm focus:bg-accent focus:text-accent-foreground w-full">
                <Bell className="mr-2 h-4 w-4 text-foreground" />
                <span className="text-sm font-medium text-foreground tracking-tight leading-tight">Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <div className="py-1">
              <DropdownMenuItem 
                onClick={handleLogout}
                className="flex items-center p-2 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent hover:bg-destructive/10 hover:border-destructive/30 hover:shadow-sm focus:bg-destructive/10 focus:text-destructive w-full text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium tracking-tight leading-tight">Log out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}