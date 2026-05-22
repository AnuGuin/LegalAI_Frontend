"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  badge?: string
  badgeVariant?: "default" | "amber" | "red"
}

const badgeStyles: Record<string, string> = {
  default: "bg-primary text-primary-foreground",
  amber:   "bg-amber-600 dark:bg-amber-500/20 text-white dark:text-amber-400 border border-transparent dark:border-amber-500/30",
  red:     "bg-destructive text-destructive-foreground",
}

export function NavMain({
  label,
  items,
}:{
  label: string
  items: NavItem[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="py-1">
      <SidebarGroupLabel className="text-[10px] h-6 font-semibold tracking-widest uppercase text-sidebar-foreground/40 whitespace-nowrap overflow-hidden transition-all duration-300">
        {label}
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1.5">
        {items.map((item) => {
          const active = item.isActive ?? pathname === item.url
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={active}
                tooltip={item.title}
                size="sm"
                className={cn(
                  "text-[13px] font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                )}
              >
                <Link href={item.url} className="flex items-center gap-2 group-data-[collapsible=icon]:!gap-0 overflow-hidden whitespace-nowrap">
                  {item.icon && (
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "opacity-100" : "opacity-60"
                      )}
                    />
                  )}
                  <span className="flex-1 truncate whitespace-nowrap transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:hidden">{item.title}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none whitespace-nowrap transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden",
                        badgeStyles[item.badgeVariant ?? "default"]
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}