"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Scale,
  MessageSquare,
  Clock,
  Folder,
  FolderOpen,
  CheckCircle2,
  Archive,
  Search,
  ChevronRight,
  Bot,
  MessageSquareMore,
  MessageSquareShare
} from "lucide-react"
import { cn } from "@/lib/utils"
import { apiService, type Matter } from "@/lib/api.service"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

//  Types 
interface LawyerConversation {
  id: string
  title: string
  lastMessage: string
  createdAt: string
  updatedAt: string
  matterId?: string
  matterTitle?: string
}

//  Helpers 
const stageMeta: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  ACTIVE: {
    label: "Active",
    icon: FolderOpen,
    className: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  CLOSED: {
    label: "Closed",
    icon: CheckCircle2,
    className: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  ARCHIVED: {
    label: "Archived",
    icon: Archive,
    className: "bg-muted text-muted-foreground border-border",
  },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

//  Matter History Tab 
function MatterHistoryTab() {
  const router = useRouter()
  const [matters, setMatters] = React.useState<Matter[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [stageFilter, setStageFilter] = React.useState<string>("ALL")

  React.useEffect(() => {
    apiService.getMatters().then(setMatters).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = (Array.isArray(matters) ? matters : []).filter((m) => {
    const matchesSearch = !search || m.title?.toLowerCase().includes(search.toLowerCase()) || (m.caseNumber ?? "").toLowerCase().includes(search.toLowerCase())
    const matchesStage = stageFilter === "ALL" || (m.status ?? "ACTIVE") === stageFilter
    return matchesSearch && matchesStage
  })

  if (loading) {
    return (
      <div className="space-y-3 p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/80 bg-white/90 dark:bg-zinc-900/90 shadow-sm">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search matters or case numbers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white dark:bg-zinc-900/95 border-border/80 shadow-sm"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          {["ALL", "ACTIVE", "CLOSED", "ARCHIVED"].map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => setStageFilter(stage)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors shadow-sm",
                stageFilter === stage
                  ? "bg-foreground text-background border-foreground"
                  : "bg-white dark:bg-zinc-900/90 text-muted-foreground border-border hover:bg-zinc-50 dark:hover:bg-zinc-800"
              )}
            >
              {stage === "ALL" ? "All" : stageMeta[stage]?.label ?? stage}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="No matters found"
          description={search ? "Try a different search term." : "Create your first matter to get started."}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((matter) => {
            const meta = stageMeta[matter.status ?? "ACTIVE"] ?? stageMeta.ACTIVE
            const StageIcon = meta.icon
            return (
              <button
                key={matter.id}
                type="button"
                onClick={() => router.push(`/assistant/matter/${matter.id}`)}
                className="group w-full flex items-start gap-4 p-4 rounded-xl border border-border/80 bg-white/95 dark:bg-zinc-900/95 hover:bg-white dark:hover:bg-zinc-900 hover:border-primary/30 hover:shadow-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-200 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Scale className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground truncate">{matter.title}</p>
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 shrink-0 border", meta.className)}>
                      <StageIcon className="h-2.5 w-2.5 mr-1" />
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {matter.caseNumber && (
                      <span className="text-xs text-muted-foreground font-mono">#{matter.caseNumber}</span>
                    )}
                    {matter.practiceArea && (
                      <span className="text-xs text-muted-foreground">{matter.practiceArea}</span>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(matter.createdAt)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-3" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

//  Chat History Tab 
function ChatHistoryTab() {
  const router = useRouter()
  const [conversations, setConversations] = React.useState<LawyerConversation[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    if (!token) { setLoading(false); return }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lawyer/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setConversations(json.data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = conversations.filter((c) =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.lastMessage ?? "").toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-3 p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/80 bg-white/90 dark:bg-zinc-900/90 shadow-sm">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 bg-white dark:bg-zinc-900/95 border-border/80 shadow-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Start a chat from any matter workspace to see history here."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => router.push(`/assistant/chat/${conv.id}`)}
              className="group w-full flex items-start gap-4 p-4 rounded-xl border border-border/80 bg-white/95 dark:bg-zinc-900/95 hover:bg-white dark:hover:bg-zinc-900 hover:border-primary/30 hover:shadow-md shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-200 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {conv.matterId ? <MessageSquareShare className="h-5 w-5" /> : <MessageSquareMore className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{conv.title || "Untitled conversation"}</p>
                {conv.matterTitle && (
                  <p className="text-xs text-primary/70 mt-0.5 truncate flex items-center gap-1">
                    <Scale className="h-3 w-3" />
                    {conv.matterTitle}
                  </p>
                )}
                {conv.lastMessage && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{conv.lastMessage}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(conv.updatedAt ?? conv.createdAt)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

//  Empty State 
function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-border bg-white/50 dark:bg-zinc-900/40 backdrop-blur-sm shadow-sm">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
    </div>
  )
}

//  Page 
export default function HistoryPage() {
  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6 pb-20">

        {/* Tab view */}
        <Tabs defaultValue="matters" className="space-y-4">
          <TabsList className="bg-zinc-100/90 dark:bg-zinc-950/90 border border-zinc-200/80 dark:border-zinc-800/80 p-1 rounded-xl h-11 shadow-sm backdrop-blur-md">
            <TabsTrigger
              value="matters"
              className="rounded-lg text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all px-4 py-1.5"
            >
              <Scale className="h-4 w-4 mr-2" />
              Matter History
            </TabsTrigger>
            <TabsTrigger
              value="chats"
              className="rounded-lg text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all px-4 py-1.5"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matters" className="mt-0">
            <MatterHistoryTab />
          </TabsContent>

          <TabsContent value="chats" className="mt-0">
            <ChatHistoryTab />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}