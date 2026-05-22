"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Search, Trash2 } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DeleteConversationDialog } from "@/components/citizen/chat/delete-conversation-dialog"

import { apiService } from "@/lib/api.service"

function generateBreadcrumbs(pathname: string, matterName: string | null) {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return (
      <BreadcrumbItem>
        <BreadcrumbPage className="text-base font-medium">Home</BreadcrumbPage>
      </BreadcrumbItem>
    )
  }


  const isAssistantMatter = segments.includes('assistant') && segments.includes('matter') && segments.length > segments.indexOf('matter') + 1;
  const isAssistantChat = segments.includes('assistant') && segments.includes('chat') && segments.length > segments.indexOf('chat') + 1;
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
              <BreadcrumbLink href={href} className="text-base">
                {label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="scale-75" />
          </React.Fragment>
        )
      }),
      <React.Fragment key="matters">
        <BreadcrumbItem>
          <BreadcrumbLink href="/matters" className="text-base">
            Matters
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="scale-75" />
      </React.Fragment>,
      <React.Fragment key="case-name">
        <BreadcrumbItem>
          <BreadcrumbPage className="text-base font-medium">
            {matterName || "Loading..."}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </React.Fragment>
    ]
  }

  if (isAssistantChat) {
    const newSegments = segments.slice(0, assistantIndex + 1);
    
    return [
      ...newSegments.map((segment, index) => {
        const href = `/${newSegments.slice(0, index + 1).join('/')}`
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        return (
          <React.Fragment key={href}>
            <BreadcrumbItem>
              <BreadcrumbLink href={href} className="text-base">
                {label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="scale-75" />
          </React.Fragment>
        )
      }),
      <React.Fragment key="chat">
        <BreadcrumbItem>
          <BreadcrumbLink href="/assistant/chat/new" className="text-base">
            Chat
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="scale-75" />
      </React.Fragment>,
      <React.Fragment key="chat-name">
        <BreadcrumbItem>
          <BreadcrumbPage className="text-base font-medium">
            {matterName || "New Conversation"}
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
            <BreadcrumbPage className="text-base font-medium">{label}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href={href} className="text-base">
              {label}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isLast && <BreadcrumbSeparator className="scale-75" />}
      </React.Fragment>
    )
  })
}

const isSpecificPage = (pathname: string) => {
  const chatMatch = pathname.match(/^\/assistant\/chat\/([^/]+)$/)
  const isChat = chatMatch && chatMatch[1] && chatMatch[1] !== 'new'
  const matterMatch = pathname.match(/^\/assistant\/matter\/([^/]+)$/)
  const isMatter = matterMatch && matterMatch[1]
  return !!(isChat || isMatter)
}

export function DashboardHeader({ onCreateMatter }: { onCreateMatter?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [matterName, setMatterName] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const isSpecific = isSpecificPage(pathname)

  const chatMatch = pathname.match(/\/assistant\/chat\/([^/]+)$/)
  const isChat = chatMatch && chatMatch[1] && chatMatch[1] !== 'new'
  const chatId = isChat ? chatMatch[1] : null

  const handleDeleteChat = async () => {
    if (!chatId) return
    setIsDeleting(true)
    try {
      await apiService.deleteLawyerConversation(chatId)
      toast.success("Conversation deleted.")
      router.push("/assistant/chat/new")
    } catch(err) {
      toast.error("Failed to delete conversation.")
    } finally {
      setIsDeleting(false)
    }
  }

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  React.useEffect(() => {
    const matterMatch = pathname.match(/\/assistant\/matter\/([^/]+)$/)

    if (matterMatch && matterMatch[1]) {
      apiService.getMatter(matterMatch[1]).then(m => setMatterName(m.title)).catch(() => {})
    } else if (isChat && chatId) {
      apiService.getLawyerConversation(chatId).then(c => setMatterName(c.title || "Conversation")).catch(() => setMatterName("Conversation"))
    } else {
      setMatterName(null)
    }
  }, [pathname, isChat, chatId])

  return (
    <header className={isSpecific 
      ? `sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 bg-background backdrop-blur px-4 transition-all ${isScrolled ? "border-b border-border/60" : ""}`
      : `sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 bg-transparent backdrop-blur-md px-4 transition-all border-b border-border/10 ${isScrolled ? "border-border/40" : "border-transparent"}`
    }>
      <Breadcrumb>
        <BreadcrumbList>
          {generateBreadcrumbs(pathname, matterName)}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        {isChat && (
          <Button variant="ghost" size="icon" disabled={isDeleting} onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <ThemeToggle />
      </div>
      
      <DeleteConversationDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        onConfirm={handleDeleteChat} 
      />
    </header>
  )
}
