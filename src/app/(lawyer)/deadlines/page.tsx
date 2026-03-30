"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Scale,
  Search,
  ChevronRight,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"


interface UpcomingDeadline {
  id: string
  matterId: string
  matterTitle: string
  title: string
  notes?: string
  eventDate: string
  daysRemaining: number | null
  isUrgent: boolean
  status: "PENDING" | "COMPLETED" | "MISSED"
  isDeadline: boolean
}

function urgencyMeta(d: UpcomingDeadline): {
  className: string
  badgeClass: string
  label: string
} {
  if (d.status === "COMPLETED")
    return {
      className: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10",
      badgeClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200",
      label: "Done",
    }
  if (d.isUrgent || (d.daysRemaining !== null && d.daysRemaining <= 3))
    return {
      className: "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10",
      badgeClass: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200",
      label: "Urgent",
    }
  if (d.daysRemaining !== null && d.daysRemaining <= 7)
    return {
      className: "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10",
      badgeClass: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200",
      label: "Soon",
    }
  return {
    className: "border-border/60",
    badgeClass: "bg-muted text-muted-foreground border-border",
    label: d.daysRemaining !== null ? `${d.daysRemaining}d` : "Upcoming",
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
}


function DeadlineSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-card">
          <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  )
}


function StatPill({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-xl border px-4 py-3 bg-card", className)}>
      <span className="text-2xl font-bold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground leading-tight">{label}</span>
    </div>
  )
}


export default function DeadlinesPage() {
  const router = useRouter()
  const [deadlines, setDeadlines] = React.useState<UpcomingDeadline[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [daysAhead, setDaysAhead] = React.useState(30)
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "PENDING" | "COMPLETED">("ALL")

  const load = React.useCallback(() => {
    setLoading(true)
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    if (!token) { setLoading(false); return }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lawyer/deadlines?daysAhead=${daysAhead}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setDeadlines(json.data)
        }
      })
      .catch(() => toast.error("Failed to load deadlines"))
      .finally(() => setLoading(false))
  }, [daysAhead])

  React.useEffect(() => { load() }, [load])

  const filtered = React.useMemo(() => {
    return deadlines.filter((d) => {
      const matchesSearch =
        !search ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.matterTitle.toLowerCase().includes(search.toLowerCase())
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PENDING" && d.status === "PENDING") ||
        (statusFilter === "COMPLETED" && d.status === "COMPLETED")
      return matchesSearch && matchesStatus
    })
  }, [deadlines, search, statusFilter])

  const urgent = deadlines.filter((d) => d.status === "PENDING" && (d.isUrgent || (d.daysRemaining !== null && d.daysRemaining <= 3))).length
  const pending = deadlines.filter((d) => d.status === "PENDING").length
  const completed = deadlines.filter((d) => d.status === "COMPLETED").length

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatPill label="Pending" value={pending} className="border-border/60" />
          <StatPill label="Urgent" value={urgent} className="border-red-200 dark:border-red-800" />
          <StatPill label="Completed" value={completed} className="border-emerald-200 dark:border-emerald-800" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deadlines or matter names…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            {(["ALL", "PENDING", "COMPLETED"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                  statusFilter === s
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                )}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
            <select
              value={daysAhead}
              onChange={(e) => setDaysAhead(Number(e.target.value))}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value={7}>Next 7 days</option>
              <option value={14}>Next 14 days</option>
              <option value={30}>Next 30 days</option>
              <option value={60}>Next 60 days</option>
              <option value={90}>Next 90 days</option>
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <DeadlineSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-dashed border-border/60 bg-muted/10">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No deadlines found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {search ? "Try a different search." : `No deadlines in the next ${daysAhead} days.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((d) => {
              const meta = urgencyMeta(d)
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => router.push(`/assistant/${d.matterId}`)}
                  className={cn(
                    "group w-full flex items-start sm:items-center gap-4 p-4 rounded-xl border bg-card transition-all duration-200 text-left hover:shadow-sm",
                    meta.className
                  )}
                >
                  {/* Date chip */}
                  <div className={cn(
                    "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border font-semibold",
                    d.status === "COMPLETED"
                      ? "border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                      : d.isUrgent || (d.daysRemaining !== null && d.daysRemaining <= 3)
                      ? "border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                      : "border-border/60 bg-muted text-foreground"
                  )}>
                    <span className="text-lg leading-none tabular-nums">
                      {new Date(d.eventDate).getDate().toString().padStart(2, "0")}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider mt-0.5 opacity-80">
                      {new Date(d.eventDate).toLocaleString("en", { month: "short" })}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-semibold leading-tight",
                      d.status === "COMPLETED" ? "line-through text-muted-foreground" : "text-foreground"
                    )}>
                      {d.title}
                    </p>
                    <p className="text-xs text-primary/70 mt-0.5 flex items-center gap-1 truncate">
                      <Scale className="h-3 w-3 shrink-0" />
                      {d.matterTitle}
                    </p>
                    {d.notes && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{d.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(d.eventDate)}
                    </p>
                  </div>

                  {/* Badge */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 border font-semibold", meta.badgeClass)}>
                      {d.status === "COMPLETED" ? (
                        <><CheckCircle2 className="h-2.5 w-2.5 mr-1" />Done</>
                      ) : d.isUrgent ? (
                        <><AlertCircle className="h-2.5 w-2.5 mr-1" />Urgent</>
                      ) : meta.label}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}