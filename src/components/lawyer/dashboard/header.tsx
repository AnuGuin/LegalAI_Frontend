"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Search } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ThemeToggle } from "@/components/ui/theme-toggle"

import { apiService } from "@/lib/api.service"

function generateBreadcrumbs(pathname: string, matterName: string | null) {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return (
      <BreadcrumbItem>
        <BreadcrumbPage className="text-xs font-medium">Home</BreadcrumbPage>
      </BreadcrumbItem>
    )
  }

  // Custom logic for Assistant > [id]
  const isAssistantMatter = segments.includes('assistant') && segments.length > segments.indexOf('assistant') + 1;
  const assistantIndex = segments.indexOf('assistant');

  if (isAssistantMatter) {
    const newSegments = segments.slice(0, assistantIndex + 1);
    
    return [
      ...newSegments.map((segment, index) => {
        const href = `/${newSegments.slice(0, index + 1).join('/')}`
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        return (
          <React.Fragment key={href}>
            <BreadcrumbItem>
              <BreadcrumbLink href={href} className="text-xs">
                {label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="scale-75" />
          </React.Fragment>
        )
      }),
      <React.Fragment key="matters">
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard" className="text-xs">
            Matters
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="scale-75" />
      </React.Fragment>,
      <React.Fragment key="case-name">
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xs font-medium">
            {matterName || "Loading..."}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </React.Fragment>
    ]
  }

  return segments.map((segment, index) => {
    const isLast = index === segments.length - 1
    const href = `/${segments.slice(0, index + 1).join('/')}`
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

    return (
      <React.Fragment key={href}>
        <BreadcrumbItem>
          {isLast ? (
            <BreadcrumbPage className="text-xs font-medium">{label}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href={href} className="text-xs">
              {label}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isLast && <BreadcrumbSeparator className="scale-75" />}
      </React.Fragment>
    )
  })
}

export function DashboardHeader({ onCreateMatter }: { onCreateMatter?: () => void }) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [matterName, setMatterName] = React.useState<string | null>(null)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  React.useEffect(() => {
    const match = pathname.match(/assistant\/([^/]+)$/)
    if (match && match[1]) {
      apiService.getMatter(match[1]).then(m => setMatterName(m.title)).catch(() => {})
    } else {
      setMatterName(null)
    }
  }, [pathname])

  return (
    <header className={`sticky top-0 z-50 flex h-12 shrink-0 items-center gap-2 bg-background backdrop-blur px-4 transition-all ${isScrolled ? "border-b border-border/60" : ""}`}>
      <Breadcrumb>
        <BreadcrumbList>
          {generateBreadcrumbs(pathname, matterName)}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground w-52 cursor-text hover:border-border transition-colors">
          <Search className="h-3 w-3 shrink-0" />
          <span>Search matters…</span>
          <kbd className="ml-auto text-[10px] bg-background border border-border rounded px-1 py-px">⌘K</kbd>
        </div>

        <ThemeToggle />
      </div>
    </header>
  )
}
