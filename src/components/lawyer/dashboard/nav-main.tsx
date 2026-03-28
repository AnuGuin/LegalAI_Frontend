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
  default: "bg-[#1A3A5C] text-white",
  amber:   "bg-[#BA7517] text-white",
  red:     "bg-[#A32D2D] text-white",
}

export function NavMain({
  label,
  items,
}: {
  label: string
  items: NavItem[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium tracking-widest uppercase text-sidebar-foreground/40 whitespace-nowrap overflow-hidden transition-all duration-300">
        {label}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const active = item.isActive ?? pathname === item.url
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={active}
                tooltip={item.title}
                className={cn(
                  "text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                )}
              >
                <Link href={item.url} className="flex items-center gap-2.5 group-data-[collapsible=icon]:!gap-0 overflow-hidden whitespace-nowrap">
                  {item.icon && (
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        active ? "opacity-100" : "opacity-60"
                      )}
                    />
                  )}
                  <span className="flex-1 truncate whitespace-nowrap transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:hidden">{item.title}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "ml-auto rounded-full px-2 py-0.5 text-xs font-semibold leading-none whitespace-nowrap transition-all duration-300 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:hidden",
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